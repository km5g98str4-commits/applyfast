"use client";

export type Locale = "en" | "ar";

export interface Translations {
  // Header
  appTitle: string;
  appSubtitle: string;
  appBadge: string;
  // Navigation
  navHome: string;
  navPricing: string;
  navFAQ: string;
  // License
  licenseLabel: string;
  licensePlaceholder: string;
  licenseValid: string;
  licenseInvalid: string;
  licenseChecking: string;
  licenseHelp: string;
  // CV input
  cvLabel: string;
  cvPlaceholder: string;
  cvUploadHint: string;
  cvFileExtracting: string;
  cvFileExtracted: string;
  cvFileError: string;
  cvFileSizeError: string;
  // Job input
  jobUrlLabel: string;
  jobUrlPlaceholder: string;
  jobUrlFetching: string;
  jobUrlFetched: string;
  jobUrlError: string;
  jobDescriptionLabel: string;
  jobDescriptionPlaceholder: string;
  jobDescriptionHint: string;
  // Buttons
  generate: string;
  generating: string;
  loadDemo: string;
  saveProfile: string;
  profileSaved: string;
  clearProfile: string;
  copyAll: string;
  copied: string;
  // Results
  resultsTitle: string;
  resultsSubtitle: string;
  basicInfo: string;
  qualifications: string;
  whyThisRole: string;
  whyThisRoleAr: string;
  coverLetter: string;
  coverLetterAr: string;
  strengths: string;
  strengthsAr: string;
  sniperBullets: string;
  quantifiedAchievements: string;
  experienceMapping: string;
  skillGaps: string;
  interviewPrep: string;
  customQuestions: string;
  starStories: string;
  companyDeepDive: string;
  followUpEmail: string;
  atsAnalysis: string;
  saudiMarket: string;
  matchScore: string;
  matchedKeywords: string;
  missingKeywords: string;
  jobAnalysis: string;
  // Saudi ATS labels
  nitaqatCompatible: string;
  saudization: string;
  localCertifications: string;
  vision2030Alignment: string;
  // Remaining
  remainingCredits: string;
  freeGenerationsLeft: string;
  upgradePrompt: string;
  // FAQ
  faqTitle: string;
  faqQ1: string;
  faqA1: string;
  faqQ2: string;
  faqA2: string;
  faqQ3: string;
  faqA3: string;
  faqQ4: string;
  faqA4: string;
  faqQ5: string;
  faqA5: string;
  // How it works
  howItWorksTitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  // Footer
  footerBuiltWith: string;
  footerGccMarket: string;
  // Misc
  backToTop: string;
  switchToArabic: string;
  switchToEnglish: string;
  loading: string;
  errorGeneric: string;
  aiCompared: string;
  aiComparedText: string;
}

const en: Translations = {
  appTitle: "ApplyFast",
  appSubtitle: "AI-powered job application assistant for the Gulf market",
  appBadge: "🇸🇦 Made for Saudi & Gulf job seekers",
  navHome: "Home",
  navPricing: "Pricing",
  navFAQ: "FAQ",
  licenseLabel: "License Key",
  licensePlaceholder: "Enter your license key...",
  licenseValid: "License valid",
  licenseInvalid: "Invalid license",
  licenseChecking: "Checking...",
  licenseHelp: "Get a license key to unlock unlimited generations",
  cvLabel: "Your CV / Resume",
  cvPlaceholder: "Paste your full CV here, or upload a PDF/DOCX file...",
  cvUploadHint: "or drop a PDF/DOCX file",
  cvFileExtracting: "Extracting text...",
  cvFileExtracted: "Extracted {chars} characters from {file}",
  cvFileError: "Failed to extract text. Try pasting manually.",
  cvFileSizeError: "File is too large (max 10MB)",
  jobUrlLabel: "Job Posting URL",
  jobUrlPlaceholder: "Paste job posting link...",
  jobUrlFetching: "Fetching job description...",
  jobUrlFetched: "Fetched {chars} characters from {title}",
  jobUrlError: "Could not fetch job description. Paste it manually below.",
  jobDescriptionLabel: "Job Description",
  jobDescriptionPlaceholder: "Paste the full job description...",
  jobDescriptionHint: "Paste the job description, or use the URL above",
  generate: "Generate Application",
  generating: "Generating...",
  loadDemo: "Load Demo",
  saveProfile: "Save Profile",
  profileSaved: "Profile saved locally",
  clearProfile: "Clear saved profile",
  copyAll: "Copy All",
  copied: "Copied!",
  resultsTitle: "Your Generated Application",
  resultsSubtitle: "Everything you need to apply — generated from your CV and the job description",
  basicInfo: "Basic Info",
  qualifications: "Qualifications",
  whyThisRole: "Why This Role",
  whyThisRoleAr: "لماذا هذا الدور",
  coverLetter: "Cover Letter",
  coverLetterAr: "خطاب التقديم",
  strengths: "Strengths",
  strengthsAr: "نقاط القوة",
  sniperBullets: "Sniper Bullets",
  quantifiedAchievements: "Quantified Achievements",
  experienceMapping: "Experience Mapping",
  skillGaps: "Skill Gaps",
  interviewPrep: "Interview Prep",
  customQuestions: "Custom Questions",
  starStories: "STAR Stories",
  companyDeepDive: "Company Deep Dive",
  followUpEmail: "Follow-Up Email",
  atsAnalysis: "ATS Analysis",
  saudiMarket: "Saudi Market",
  matchScore: "Match Score",
  matchedKeywords: "Matched Keywords",
  missingKeywords: "Missing Keywords",
  jobAnalysis: "Job Analysis",
  nitaqatCompatible: "Nitaqat Compatible",
  saudization: "Saudization Level",
  localCertifications: "Local Certifications",
  vision2030Alignment: "Vision 2030 Alignment",
  remainingCredits: "Remaining",
  freeGenerationsLeft: "{n} free generations left today",
  upgradePrompt: "Upgrade for unlimited",
  faqTitle: "Frequently Asked Questions",
  faqQ1: "How is this different from ChatGPT?",
  faqA1: "ChatGPT gives you generic text. ApplyFast is purpose-built — it extracts ATS keywords, scores your match, maps your experience to each job requirement, and gives you interview prep. It's a specialized tool, not a general chatbot.",
  faqQ2: "What data do you store?",
  faqA2: "Nothing. Your CV and job descriptions are processed in real-time and discarded immediately. We do not store, share, or train on your application data.",
  faqQ3: "Which ATS systems does this work with?",
  faqA3: "ApplyFast is optimized for Gulf-region ATS systems including Bayt.com, Naukri Gulf, Mihnati, and Saudi government platforms like Jadarat and Tawteen. Our keyword extraction covers both English and Arabic.",
  faqQ4: "Does it work in Arabic?",
  faqA4: "Yes! ApplyFast is bilingual — Arabic and English. We generate professional Gulf Arabic output (not Google Translate), and our ATS analysis knows Saudi-specific keywords and certifications.",
  faqQ5: "How do license keys work?",
  faqA5: "Purchase a license key to unlock unlimited generations. Keys are validated server-side and cannot be shared or copied. Free tier: 3 generations per day.",
  howItWorksTitle: "How It Works",
  step1Title: "1. Paste Your CV",
  step1Desc: "Copy-paste your CV or upload a PDF/DOCX file",
  step2Title: "2. Add the Job",
  step2Desc: "Paste the job link or description",
  step3Title: "3. Generate",
  step3Desc: "AI builds your full application in seconds",
  step4Title: "4. Apply Faster",
  step4Desc: "Copy each field into any job portal",
  footerBuiltWith: "Built for the Gulf job market",
  footerGccMarket: "Optimized for Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, Oman",
  backToTop: "Back to top",
  switchToArabic: "العربية",
  switchToEnglish: "English",
  loading: "Loading...",
  errorGeneric: "Something went wrong. Please try again.",
  aiCompared: "vs ChatGPT",
  aiComparedText: "ChatGPT gives generic text. We give you ATS-scored, Arabic-native, Saudi-market-ready applications.",
};

const ar: Translations = {
  appTitle: "ApplyFast",
  appSubtitle: "مساعد التقديم على الوظائف بالذكاء الاصطناعي لسوق الخليج",
  appBadge: "🇸🇦 مصمم خصيصاً للباحثين عن عمل في السعودية والخليج",
  navHome: "الرئيسية",
  navPricing: "الأسعار",
  navFAQ: "الأسئلة الشائعة",
  licenseLabel: "مفتاح الترخيص",
  licensePlaceholder: "أدخل مفتاح الترخيص...",
  licenseValid: "الترخيص ساري",
  licenseInvalid: "ترخيص غير صالح",
  licenseChecking: "جارٍ التحقق...",
  licenseHelp: "احصل على مفتاح ترخيص لفتح عدد غير محدود من التوليد",
  cvLabel: "السيرة الذاتية",
  cvPlaceholder: "الصق سيرتك الذاتية هنا، أو ارفع ملف PDF/DOCX...",
  cvUploadHint: "أو اسحب ملف PDF/DOCX",
  cvFileExtracting: "جارٍ استخراج النص...",
  cvFileExtracted: "تم استخراج {chars} حرف من {file}",
  cvFileError: "فشل في استخراج النص. حاول اللصق يدوياً.",
  cvFileSizeError: "حجم الملف كبير جداً (الحد 10 ميجابايت)",
  jobUrlLabel: "رابط الوظيفة",
  jobUrlPlaceholder: "الصق رابط الوظيفة...",
  jobUrlFetching: "جارٍ جلب الوصف الوظيفي...",
  jobUrlFetched: "تم جلب {chars} حرف من {title}",
  jobUrlError: "تعذر جلب الوصف الوظيفي. الصقه يدوياً أدناه.",
  jobDescriptionLabel: "الوصف الوظيفي",
  jobDescriptionPlaceholder: "الصق الوصف الوظيفي كاملاً...",
  jobDescriptionHint: "الصق الوصف الوظيفي، أو استخدم الرابط أعلاه",
  generate: "توليد الطلب",
  generating: "جارٍ التوليد...",
  loadDemo: "تحميل تجريبي",
  saveProfile: "حفظ الملف",
  profileSaved: "تم حفظ الملف محلياً",
  clearProfile: "مسح الملف المحفوظ",
  copyAll: "نسخ الكل",
  copied: "تم النسخ!",
  resultsTitle: "طلب التقديم المُنتَج",
  resultsSubtitle: "كل ما تحتاجه للتقديم — مُنتَج من سيرتك الذاتية والوصف الوظيفي",
  basicInfo: "المعلومات الأساسية",
  qualifications: "المؤهلات",
  whyThisRole: "لماذا هذا الدور",
  whyThisRoleAr: "Why This Role",
  coverLetter: "خطاب التقديم",
  coverLetterAr: "Cover Letter",
  strengths: "نقاط القوة",
  strengthsAr: "Strengths",
  sniperBullets: "نقاط القناص",
  quantifiedAchievements: "الإنجازات الكمية",
  experienceMapping: "مطابقة الخبرات",
  skillGaps: "فجوات المهارات",
  interviewPrep: "التحضير للمقابلة",
  customQuestions: "أسئلة مخصصة",
  starStories: "قصص STAR",
  companyDeepDive: "نظرة على الشركة",
  followUpEmail: "بريد المتابعة",
  atsAnalysis: "تحليل ATS",
  saudiMarket: "السوق السعودي",
  matchScore: "درجة التطابق",
  matchedKeywords: "الكلمات المفتاحية المتطابقة",
  missingKeywords: "الكلمات المفتاحية الناقصة",
  jobAnalysis: "تحليل الوظيفة",
  nitaqatCompatible: "متوافق مع نطاقات",
  saudization: "مستوى السعودة",
  localCertifications: "الشهادات المحلية",
  vision2030Alignment: "التوافق مع رؤية 2030",
  remainingCredits: "متبقي",
  freeGenerationsLeft: "{n} توليد مجاني متبقي اليوم",
  upgradePrompt: "ترقية للتوليد غير المحدود",
  faqTitle: "الأسئلة الشائعة",
  faqQ1: "كيف يختلف هذا عن ChatGPT؟",
  faqA1: "ChatGPT يعطيك نصوصاً عامة. ApplyFast مبني لغرض محدد — يستخرج كلمات ATS المفتاحية، يقيم درجة تطابقك، يطابق خبراتك مع متطلبات الوظيفة، ويعطيك تحضيراً للمقابلة. إنه أداة متخصصة، ليس روبوت محادثة عام.",
  faqQ2: "ما هي البيانات التي تخزنها؟",
  faqA2: "لا شيء. سيرتك الذاتية والوصف الوظيفي تتم معالجتها فوراً وتُحذف مباشرة. نحن لا نخزن أو نشارك أو نتدرب على بيانات التقديم الخاصة بك.",
  faqQ3: "مع أي أنظمة ATS يعمل هذا؟",
  faqA3: "ApplyFast محسّن لأنظمة التوظيف في منطقة الخليج بما فيها بيت.كوم، Naukri Gulf، مهنتي، ومنصات حكومية سعودية مثل جدارات وتوطين. استخراج الكلمات المفتاحية يغطي الإنجليزية والعربية.",
  faqQ4: "هل يعمل بالعربية؟",
  faqA4: "نعم! ApplyFast ثنائي اللغة — العربية والإنجليزية. ننتج عربية خليجية احترافية (ليست ترجمة قوقل)، وتحليل ATS يعرف الكلمات المفتاحية والشهادات الخاصة بالسعودية.",
  faqQ5: "كيف تعمل مفاتيح الترخيص؟",
  faqA5: "اشترِ مفتاح ترخيص لفتح عدد غير محدود من التوليد. المفاتيح تُحقّق من الخادم ولا يمكن مشاركتها. المستوى المجاني: 3 توليدات يومياً.",
  howItWorksTitle: "كيف يعمل",
  step1Title: "١. الصق سيرتك الذاتية",
  step1Desc: "انسخ والصق سيرتك الذاتية أو ارفع ملف PDF/DOCX",
  step2Title: "٢. أضف الوظيفة",
  step2Desc: "الصق رابط الوظيفة أو وصفها",
  step3Title: "٣. توليد",
  step3Desc: "الذكاء الاصطناعي يبني طلبك الكامل في ثوانٍ",
  step4Title: "٤. قدّم أسرع",
  step4Desc: "انسخ كل حقل إلى أي بوابة توظيف",
  footerBuiltWith: "مبني لسوق العمل الخليجي",
  footerGccMarket: "محسّن للسعودية، الإمارات، قطر، الكويت، البحرين، عُمان",
  backToTop: "العودة للأعلى",
  switchToArabic: "العربية",
  switchToEnglish: "English",
  loading: "جارٍ التحميل...",
  errorGeneric: "حدث خطأ. يرجى المحاولة مرة أخرى.",
  aiCompared: "مقارنة مع ChatGPT",
  aiComparedText: "ChatGPT يعطيك نصوصاً عامة. نحن نعطيك طلبات مُقيّمة بمعايير ATS، عربية احترافية، وجاهزة لسوق العمل السعودي.",
};

const translations: Record<Locale, Translations> = { en, ar };

export function getLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("applyfast_locale") as Locale | null;
  if (stored === "ar" || stored === "en") return stored;
  // Detect from browser
  const navLang = navigator.language?.toLowerCase() || "";
  if (navLang.startsWith("ar")) return "ar";
  return "en";
}

export function setLocale(locale: Locale) {
  if (typeof window !== "undefined") {
    localStorage.setItem("applyfast_locale", locale);
    // Set dir on html element for RTL
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }
}

export function t(): Translations {
  return translations[getLocale()];
}

export { translations };
