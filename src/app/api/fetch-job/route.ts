import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body?.url;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Only allow http/https
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "Only HTTP and HTTPS URLs are allowed" }, { status: 400 });
    }

    // Block SSRF: check hostname directly against private/loopback ranges
    const hostname = parsed.hostname.toLowerCase();
    if (isPrivateOrLoopbackIP(hostname)) {
      return NextResponse.json({ error: "URL not allowed" }, { status: 400 });
    }

    // Fetch the page
    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(15000),
      });
    } catch (fetchError: any) {
      return NextResponse.json(
        {
          error: `Failed to fetch URL: ${fetchError?.message || "Network error"}. The site may block automated access.`,
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: HTTP ${response.status} ${response.statusText}` },
        { status: 502 }
      );
    }

    const html = await response.text();

    // Extract text from HTML - remove scripts, styles, and extract meaningful content
    const text = extractText(html);

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: "Could not extract meaningful content from this URL. Try pasting the job description directly." },
        { status: 422 }
      );
    }

    // Return first 15000 chars to keep it manageable
    const trimmed = text.substring(0, 15000).trim();

    return NextResponse.json({
      text: trimmed,
      url,
      title: extractTitle(html),
    });
  } catch (error: any) {
    console.error("Job fetch error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to fetch job description" },
      { status: 500 }
    );
  }
}

/**
 * Simple HTML text extraction: strip tags, remove scripts/styles, get body content.
 */
function extractText(html: string): string {
  // Remove script and style elements
  let cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "");

  // Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");

  // Replace common block elements with newlines
  cleaned = cleaned
    .replace(/<\/?(div|p|h[1-6]|li|tr|br|section|article|main|aside|blockquote|pre|table|ul|ol|dl|dt|dd|figure|figcaption|details|summary|hr)[^>]*>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n");

  // Remove remaining HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, "");

  // Decode HTML entities
  cleaned = cleaned
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x2F;/g, "/")
    .replace(/&#(\d+);/g, (_match, dec) => String.fromCharCode(Number(dec)));

  // Clean up whitespace
  cleaned = cleaned
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n")
    .replace(/\n{4,}/g, "\n\n\n");

  return cleaned.trim();
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : "";
}

/**
 * Check if an IP address is private, loopback, or otherwise internal.
 * Handles IPv4, IPv6 (including mapped IPv4), and hostnames.
 */
function isPrivateOrLoopbackIP(ip: string): boolean {
  // Normalize: strip brackets and whitespace
  const normalized = ip.replace(/^\[|\]$/g, "").trim();

  // Block known internal hostnames
  const blockedHostnames = new Set([
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "::1",
    "::",
    "metadata.google.internal",
    "169.254.169.254",
  ]);
  if (blockedHostnames.has(normalized)) return true;

  // IPv4 check
  const ipv4Match = normalized.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4Match) {
    const a = parseInt(ipv4Match[1], 10);
    const b = parseInt(ipv4Match[2], 10);
    if (
      a === 10 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 100 && b >= 64 && b <= 127) || // CGNAT
      (a === 0) // 0.0.0.0/8
    ) {
      return true;
    }
  }

  // IPv6 loopback, link-local, unique-local, multicast, and mapped IPv4
  try {
    // Simple IPv6 detection
    if (normalized.includes(":")) {
      const lower = normalized.toLowerCase();
      // ::1 loopback
      if (lower === "::1" || lower === "0:0:0:0:0:0:0:1") return true;
      // :: unspecified
      if (lower === "::" || lower === "0:0:0:0:0:0:0:0") return true;
      // IPv6-mapped IPv4: ::ffff:a.b.c.d or ::ffff:0:a.b.c.d or ::ffff:7f00:1 (hex)
      const mappedMatch = lower.match(/^::ffff:(?:0:)?(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
      if (mappedMatch) {
        return isPrivateOrLoopbackIP(
          `${mappedMatch[1]}.${mappedMatch[2]}.${mappedMatch[3]}.${mappedMatch[4]}`
        );
      }
      // IPv6-mapped IPv4 in hex form: ::ffff:HEX:HEX or ::ffff:HEXHEX
      const hexMapped = lower.match(/^::ffff:([0-9a-f]{1,4})(?::([0-9a-f]{1,4}))?$/);
      if (hexMapped) {
        const hi = parseInt(hexMapped[1], 16);
        const lo = hexMapped[2] ? parseInt(hexMapped[2], 16) : 0;
        const ipv4 = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
        return isPrivateOrLoopbackIP(ipv4);
      }
      // Any IPv4-compatible IPv6 in hex
      const compatMatch = lower.match(/^::([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
      if (compatMatch && compatMatch[1] === "0000") {
        const lo = parseInt(compatMatch[2], 16);
        const ipv4 = `${(lo >> 8) & 0xff}.${lo & 0xff}.0.0`;
        // Only flag if it resolves to loopback/private
        if (lo === 0x7f00 || lo === 0x0a00 || (lo & 0xff00) === 0xac00 || (lo & 0xff00) === 0xc000) {
          return true;
        }
      }
      // IPv6 link-local fe80::/10
      if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) {
        return true;
      }
      // IPv6 unique-local fc00::/7, fd00::/8
      if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    }
  } catch {
    // If parsing fails, block it
    return true;
  }

  return false;
}
