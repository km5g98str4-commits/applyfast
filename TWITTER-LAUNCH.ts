// Twitter/X Launch Queue
// Posts ready to go — schedule or post manually

export const tweets = [
  {
    text: "Spent the night building ApplyFast AI — paste your CV + a job link, and it fills every application field for you.\n\nWorkday. Greenhouse. Lever. All ATS.\n\n3 free per day. No signup.\n\nhttps://applyfast-chi.vercel.app",
    hook: "Builder story + direct benefit",
  },
  {
    text: "Job applications are broken.\n\nUpload resume, re-type everything, write \"why do you want to work here?\"… repeat 50x.\n\nBuilt ApplyFast to kill this pain: paste CV + job link → every field auto-filled by AI.\n\nFree 3/day. $3 each after.\n\nhttps://applyfast-chi.vercel.app",
    hook: "Pain point + solution",
  },
  {
    text: "Applying to jobs in 2026 be like:\n- Find job\n- Upload resume\n- Re-type your resume into their form\n- Write cover letter\n- \"Why this company?\" essay\n- 30 mins later… submit\n\nApplyFast AI does all that in 30 seconds.\n\nhttps://applyfast-chi.vercel.app",
    hook: "Relatable humor + speed",
  },
  {
    text: "Built this for myself. Sharing it here.\n\nApplyFast: AI that fills job applications from your CV.\n\n👉 3 free / day\n👉 No account needed\n👉 Works on all ATS (Workday, Lever, Greenhouse)\n\nhttps://applyfast-chi.vercel.app",
    hook: "Authentic builder post",
  },
  {
    text: "The average job seeker applies to 100+ positions.\n\nIf each application takes 30 mins → 50 hours of copy-pasting.\n\nApplyFast AI: paste CV + job link → get every field filled instantly.\n\nSave 49 hours of your life.\n\nhttps://applyfast-chi.vercel.app",
    hook: "Data-driven + pain relief",
  },
];

// Posting order: spread across different times
export const schedule = [
  { tweet: 0, delay: "+1 hour", note: "Saturday morning - organic builder story" },
  { tweet: 1, delay: "+3 hours", note: "Mid-day - pain point angle" },
  { tweet: 2, delay: "+6 hours", note: "Afternoon - humor + relatability" },
  { tweet: 3, delay: "+24 hours", note: "Sunday morning - authentic" },
  { tweet: 4, delay: "+30 hours", note: "Sunday afternoon - data angle" },
];
