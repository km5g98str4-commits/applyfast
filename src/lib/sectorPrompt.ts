import { getSectorTemplate, SECTOR_SLUG_MAP, type SectorTemplate } from "./sectorTemplates";

/**
 * Generate a prompt snippet tailored to a specific Gulf sector.
 * Injected into the main generate prompt to add sector-specific ATS keywords
 * and culturally-aware generation guidance.
 *
 * @param sectorId - Raw sector identifier (slug or template ID)
 * @returns Prompt string to append, or empty string if sector not found
 */
export function getSectorPrompt(sectorId: string): string {
  const resolvedId = SECTOR_SLUG_MAP[sectorId] || sectorId;
  const t = getSectorTemplate(resolvedId);

  if (!t) return "";

  return `
--- SAUDI/GULF SECTOR CONTEXT: ${t.nameEn} (${t.nameAr}) ---

When generating content for this application, prioritize these sector-specific ATS keywords:

English keywords (weight heavily — Gulf ATS rank these):
${t.keywordsEn.map((k) => `  • ${k}`).join("\n")}

Arabic keywords (must appear in Arabic fields naturally):
${t.keywordsAr.map((k) => `  • ${k}`).join("\n")}

Common certifications in this sector — highlight if present in CV:
${t.commonCertifications.map((c) => `  • ${c}`).join("\n")}

Common tools/software — mention in skills where relevant:
${t.commonTools.map((tool) => `  • ${tool}`).join("\n")}

Industry phrases to naturally incorporate:
${t.industryPhrases.map((p) => `  • ${p}`).join("\n")}

GULF CONTEXT:
• Saudi/Gulf employers value Vision 2030 alignment — weave in where relevant
• The Saudi job market rewards bilingual capability (English + Arabic)
• Local certifications (SCE, SCFHS, SOCPA, etc.) carry significant ATS weight
• Nitaqat/Saudization classifications may affect keyword priority
• Gulf ATS platforms (Bayt.com, Mihnati, Naukri Gulf) often run keyword searches in BOTH Arabic and English independently

When generating the whyThisRole, coverLetterSnippet, and customQuestions:
• Use the company's local market context (Saudi Vision 2030 projects, Gulf economic diversification)
• Reference sector-specific regulatory bodies where relevant
• Arabic text must use professional Gulf Arabic, not literal translation
`;
}

/**
 * Get a compact sector keyword list for lightweight ATS matching
 * without a full LLM call. Returns combined English + Arabic keywords.
 */
export function getSectorKeywords(sectorId: string): {
  english: string[];
  arabic: string[];
  certifications: string[];
  tools: string[];
} {
  const resolvedId = SECTOR_SLUG_MAP[sectorId] || sectorId;
  const t = getSectorTemplate(resolvedId);

  if (!t) {
    return { english: [], arabic: [], certifications: [], tools: [] };
  }

  return {
    english: t.keywordsEn,
    arabic: t.keywordsAr,
    certifications: t.commonCertifications,
    tools: t.commonTools,
  };
}

/**
 * Run a lightweight keyword match between CV text and sector keywords.
 * Used for quick ATS compatibility estimates without an LLM call.
 */
export function quickKeywordMatch(
  cvText: string,
  sectorId: string
): {
  matchedEn: string[];
  matchedAr: string[];
  matchRate: number;
} {
  const { english, arabic } = getSectorKeywords(sectorId);
  const cvLower = cvText.toLowerCase();

  const matchedEn = english.filter((kw) => cvLower.includes(kw.toLowerCase()));
  const matchedAr = arabic.filter((kw) => cvLower.includes(kw));

  const totalKeywords = english.length + arabic.length || 1;
  const matchRate = Math.round(((matchedEn.length + matchedAr.length) / totalKeywords) * 100);

  return { matchedEn, matchedAr, matchRate };
}
