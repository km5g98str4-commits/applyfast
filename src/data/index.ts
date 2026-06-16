import type { SectorKnowledge } from "./sectors/tech";
import techSector from "./sectors/tech";
import hrSector from "./sectors/hr";
import marketingSector from "./sectors/marketing";
import financeSector from "./sectors/finance";
import adminSector from "./sectors/admin";

export type { SectorKnowledge } from "./sectors/tech";

const sectors: Record<string, SectorKnowledge> = {
  tech: techSector,
  hr: hrSector,
  marketing: marketingSector,
  finance: financeSector,
  admin: adminSector,
};

export function getSectorKnowledge(sectorId: string): SectorKnowledge | null {
  return sectors[sectorId] || null;
}

export function getAllSectors(): SectorKnowledge[] {
  return Object.values(sectors);
}

export function getSectorIds(): string[] {
  return Object.keys(sectors);
}

export function searchJobTitles(query: string, locale: "en" | "ar" = "en"): Array<{ en: string; ar: string; sectorId: string }> {
  const q = query.toLowerCase();
  const results: Array<{ en: string; ar: string; sectorId: string }> = [];
  for (const [sectorId, sector] of Object.entries(sectors)) {
    for (const title of sector.jobTitles) {
      if (locale === "ar" ? title.ar.includes(q) : title.en.toLowerCase().includes(q)) {
        results.push({ ...title, sectorId });
      }
    }
  }
  return results;
}

export function getKeywordsForSector(sectorId: string): Array<{ en: string; ar: string }> {
  return sectors[sectorId]?.keywords || [];
}

export function getCertificationsForSector(sectorId: string): string[] {
  return sectors[sectorId]?.commonCertifications || [];
}

export function getToolsForSector(sectorId: string): string[] {
  return sectors[sectorId]?.commonTools || [];
}

export default sectors;
