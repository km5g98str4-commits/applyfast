import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Server-side file size validation (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate by MIME type first, then fall back to extension
    const fileType = file.type || "";
    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    // Determine file type: prefer MIME, fall back to extension
    let fileKind: "pdf" | "docx" | "txt" | null = null;
    if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
      fileKind = "pdf";
    } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || fileName.endsWith(".docx")) {
      fileKind = "docx";
    } else if (fileType === "text/plain" || fileName.endsWith(".txt")) {
      fileKind = "txt";
    }

    // Block files where MIME and extension both fail
    const mimeAllowed = allowedMimeTypes.includes(fileType);
    const extAllowed = fileName.endsWith(".pdf") || fileName.endsWith(".docx") || fileName.endsWith(".txt");
    if (!mimeAllowed && !extAllowed) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF, DOCX, or TXT file." },
        { status: 400 }
      );
    }

    let text: string;

    if (fileKind === "pdf") {
      try {
        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse({ data: buffer });
        const data = await parser.getText();
        if (!data?.text?.trim()) {
          return NextResponse.json({ error: "No extractable text found in PDF. The file may be scanned or image-based." }, { status: 400 });
        }
        text = data.text;
      } catch (pdfErr: any) {
        console.error("PDF parsing error:", pdfErr?.message);
        return NextResponse.json({ error: "Failed to parse PDF. The file may be corrupted or password-protected." }, { status: 400 });
      }
    } else if (fileKind === "docx") {
      try {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } catch (docxErr: any) {
        console.error("DOCX parsing error:", docxErr?.message);
        return NextResponse.json({ error: "Failed to parse DOCX file." }, { status: 400 });
      }
    } else if (fileKind === "txt") {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF, DOCX, or TXT file." },
        { status: 400 }
      );
    }

    // Clean up the text
    const cleaned = text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n{4,}/g, "\n\n\n") // collapse excessive newlines
      .trim();

    return NextResponse.json({ text: cleaned, filename: file.name });
  } catch (error: any) {
    console.error("File extraction error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to extract text from file" },
      { status: 500 }
    );
  }
}
