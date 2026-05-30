// localStorage utilities for ApplyFast AI
// Multi-CV Manager (#18) + Application Tracker (#20)

const CVS_KEY = "applyfast_cvs";
const APPS_KEY = "applyfast_applications";

export interface SavedCV {
  id: string;
  name: string;
  content: string;
  createdAt: number;
}

export interface TrackedApplication {
  id: string;
  company: string;
  role: string;
  dateApplied: string;
  status: "applied" | "screening" | "interview" | "offer" | "rejected" | "ghosted";
  notes?: string;
}

// === Multi-CV Manager (#18) ===
export function getSavedCVs(): SavedCV[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CVS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCV(cv: Omit<SavedCV, "id" | "createdAt">): SavedCV {
  const cvs = getSavedCVs();
  if (cvs.length >= 3) {
    throw new Error("Maximum 3 CVs allowed. Delete one first.");
  }
  const newCv: SavedCV = {
    ...cv,
    id: `cv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  };
  cvs.push(newCv);
  localStorage.setItem(CVS_KEY, JSON.stringify(cvs));
  return newCv;
}

export function updateCV(id: string, updates: Partial<Omit<SavedCV, "id" | "createdAt">>): SavedCV | null {
  const cvs = getSavedCVs();
  const idx = cvs.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  cvs[idx] = { ...cvs[idx], ...updates };
  localStorage.setItem(CVS_KEY, JSON.stringify(cvs));
  return cvs[idx];
}

export function deleteCV(id: string): boolean {
  const cvs = getSavedCVs();
  const filtered = cvs.filter((c) => c.id !== id);
  if (filtered.length === cvs.length) return false;
  localStorage.setItem(CVS_KEY, JSON.stringify(filtered));
  return true;
}

export function getCVCount(): number {
  return getSavedCVs().length;
}

// === Application Tracker (#20) ===
export function getApplications(): TrackedApplication[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(APPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addApplication(app: Omit<TrackedApplication, "id" | "dateApplied">): TrackedApplication {
  const apps = getApplications();
  const newApp: TrackedApplication = {
    ...app,
    id: `app_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    dateApplied: new Date().toISOString().split("T")[0],
  };
  apps.unshift(newApp);
  localStorage.setItem(APPS_KEY, JSON.stringify(apps));
  return newApp;
}

export function updateApplicationStatus(id: string, status: TrackedApplication["status"]): TrackedApplication | null {
  const apps = getApplications();
  const idx = apps.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  apps[idx] = { ...apps[idx], status };
  localStorage.setItem(APPS_KEY, JSON.stringify(apps));
  return apps[idx];
}

export function deleteApplication(id: string): boolean {
  const apps = getApplications();
  const filtered = apps.filter((a) => a.id !== id);
  if (filtered.length === apps.length) return false;
  localStorage.setItem(APPS_KEY, JSON.stringify(filtered));
  return true;
}

export function getApplicationCount(): number {
  return getApplications().length;
}

export function getStatusColor(status: TrackedApplication["status"]): string {
  const map: Record<string, string> = {
    applied: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    screening: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    interview: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    offer: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    ghosted: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };
  return map[status] || map.applied;
}
