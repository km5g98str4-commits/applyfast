export interface SectorTemplate {
  id: string;
  nameAr: string;
  nameEn: string;
  keywordsAr: string[];
  keywordsEn: string[];
  commonCertifications: string[];
  commonTools: string[];
  industryPhrases: string[];
}

export const SECTOR_TEMPLATES: Record<string, SectorTemplate> = {
  oil_gas: {
    id: "oil_gas",
    nameAr: "النفط والغاز",
    nameEn: "Oil & Gas",
    keywordsAr: [
      "حفر", "إنتاج", "مصافي", "أرامكو", "هندسة بترول", "سلامة",
      "خزان", "غاز طبيعي", "بتروكيماويات", "منصات بحرية", "سبارك",
      "هندسة مكامن", "حفر آبار", "صيانة", "تشغيل", "سابك",
      "أدنوك", "قطر للطاقة", "الخليج", "المنطقة الشرقية",
    ],
    keywordsEn: [
      "drilling", "production", "refining", "Aramco", "petroleum engineering", "HSE",
      "reservoir", "LNG", "petrochemicals", "offshore", "SPARK",
      "well completion", "maintenance", "operations", "SABIC",
      "ADNOC", "QatarEnergy", "upstream", "downstream", "Eastern Province",
    ],
    commonCertifications: ["IWCF", "NEBOSH", "API", "IOSH", "OPITO", "BOSIET"],
    commonTools: ["Petrel", "Eclipse", "PIPESIM", "OLGA", "AutoCAD", "SAP"],
    industryPhrases: [
      "downstream operations", "upstream exploration", "well completion",
      "enhanced oil recovery", "gas processing", "refinery turnaround",
      "offshore drilling", "subsurface modeling", "HSE compliance",
    ],
  },

  healthcare: {
    id: "healthcare",
    nameAr: "الرعاية الصحية",
    nameEn: "Healthcare",
    keywordsAr: [
      "طبيب", "تمريض", "مستشفى", "عيادة", "صيدلي", "أشعة",
      "مختبر", "جراحة", "طب أسرة", "رعاية أولية", "تأمين صحي",
      "هيئة التخصصات الصحية", "وزارة الصحة", "الحرس الوطني",
      "مدينة الملك فهد", "جامعة الملك سعود الطبية", "صحة",
    ],
    keywordsEn: [
      "physician", "nursing", "hospital", "clinic", "pharmacy", "radiology",
      "laboratory", "surgery", "family medicine", "primary care", "health insurance",
      "SCFHS", "MOH", "CCDS", "CPD", "patient care",
      "clinical", "public health", "NPHIES", "Seha Virtual Hospital",
    ],
    commonCertifications: [
      "SCFHS License", "BLS", "ACLS", "PALS", "CIC",
      "CPHQ", "MRCP", "Arab Board", "Saudi Board",
    ],
    commonTools: ["Cerner", "EPIC", "Medisys", "PACS", "RIS", "Excelicare"],
    industryPhrases: [
      "patient-centered care", "clinical governance", "infection control",
      "evidence-based practice", "quality improvement", "medical audit",
      "health informatics", "value-based healthcare", "JCI accreditation",
    ],
  },

  finance_banking: {
    id: "finance_banking",
    nameAr: "المالية والمصرفية",
    nameEn: "Finance & Banking",
    keywordsAr: [
      "مصرف", "بنك", "محاسبة", "تدقيق", "امتثال", "إدارة مخاطر",
      "تمويل", "استثمار", "أسهم", "تداول", "زكاة", "صيرفة إسلامية",
      "ساما", "هيئة السوق المالية", "البنك المركزي", "مرابحة",
      "تمويل عقاري", "فنتك", "مكافحة غسل أموال",
    ],
    keywordsEn: [
      "banking", "accounting", "audit", "compliance", "risk management",
      "finance", "investment", "equities", "trading", "IFRS", "Islamic banking",
      "SAMA", "CMA", "Saudi Central Bank", "fintech", "murabaha",
      "mortgage", "KYC", "AML", "Basel", "Sukuk",
    ],
    commonCertifications: [
      "SOCPA", "CFA", "FRM", "CIA", "ACCA",
      "CMA", "CAMS", "CFE", "CPA", "CISI",
    ],
    commonTools: ["SAP", "Oracle Financials", "Bloomberg Terminal", "Reuters Eikon", "Temenos"],
    industryPhrases: [
      "regulatory compliance", "credit risk", "asset management",
      "wealth management", "corporate banking", "retail banking",
      "treasury operations", "Sharia compliance", "open banking",
    ],
  },

  tech_it: {
    id: "tech_it",
    nameAr: "التقنية وتكنولوجيا المعلومات",
    nameEn: "Technology & IT",
    keywordsAr: [
      "برمجة", "تطوير", "حوسبة سحابية", "أمن سيبراني", "بيانات",
      "ذكاء اصطناعي", "تحول رقمي", "هيئة البيانات والذكاء الاصطناعي",
      "سدايا", "الهيئة الوطنية للأمن السيبراني", "طويق", "إدارة مشاريع",
      "شبكات", "دعم فني", "بنية تحتية", "منصات رقمية",
    ],
    keywordsEn: [
      "software", "development", "cloud", "cybersecurity", "data",
      "AI", "digital transformation", "SDAIA", "NCA", "Tuwaiq Academy",
      "DevOps", "networking", "IT support", "infrastructure",
      "API", "microservices", "NIST", "ISO 27001", "agile",
    ],
    commonCertifications: [
      "CISSP", "CCNA", "AWS Certified", "Azure AZ-900",
      "PMP", "ITIL", "CEH", "CompTIA Security+", "Google Cloud",
    ],
    commonTools: [
      "AWS", "Azure", "Docker", "Kubernetes", "Git", "Jenkins",
      "Terraform", "Python", "React", "Node.js", "Jira",
    ],
    industryPhrases: [
      "digital transformation", "cloud migration", "DevSecOps",
      "zero trust architecture", "data governance", "agile methodology",
      "continuous integration", "microservices architecture",
    ],
  },

  construction: {
    id: "construction",
    nameAr: "البناء والتشييد",
    nameEn: "Construction",
    keywordsAr: [
      "مقاولات", "إنشاءات", "مشاريع", "هندسة مدنية", "بنية تحتية",
      "طرق", "جسور", "مباني", "سلامة مهنية", "إدارة مشاريع",
      "نيوم", "القدية", "البحر الأحمر", "روشن", "رؤية 2030",
      "مخطط معتمد", "كود البناء السعودي", "أمانة",
    ],
    keywordsEn: [
      "contracting", "construction", "civil engineering", "infrastructure",
      "roads", "bridges", "buildings", "occupational safety", "project management",
      "NEOM", "Qiddiya", "Red Sea", "Roshn", "Vision 2030",
      "Saudi Building Code", "BIM", "MEP", "quantity surveying",
    ],
    commonCertifications: [
      "PMP", "SCE", "NEBOSH", "LEED", "PRINCE2",
      "RICS", "OSHA", "BIM Certification",
    ],
    commonTools: ["Primavera P6", "AutoCAD", "Revit", "Navisworks", "MS Project"],
    industryPhrases: [
      "mega projects", "giga projects", "project lifecycle",
      "quality assurance", "safety compliance", "tendering process",
      "value engineering", "design-build", "EPC contracting",
    ],
  },

  government_public: {
    id: "government_public",
    nameAr: "القطاع الحكومي والعام",
    nameEn: "Government & Public Sector",
    keywordsAr: [
      "حكومة", "وزارة", "هيئة", "موارد بشرية", "سياسات",
      "إدارة عامة", "خدمة مدنية", "تنظيم", "تشريع", "مناقصات",
      "رؤية 2030", "تحول وطني", "جدارة", "منصة مسار",
      "التحول الرقمي الحكومي", "كفاءة إنفاق", "ميزانية",
    ],
    keywordsEn: [
      "government", "ministry", "authority", "human resources", "policy",
      "public administration", "civil service", "regulation", "legislation",
      "Vision 2030", "national transformation", "Jadarat", "Masar",
      "government digital transformation", "spending efficiency", "budget",
    ],
    commonCertifications: [
      "PMP", "CIPD", "SHRM", "CFE", "Strategic Planning",
      "Public Policy Certification", "GRC",
    ],
    commonTools: ["Oracle EBS", "SAP", "Microsoft Dynamics", "Etimad", "Absher Business"],
    industryPhrases: [
      "national transformation program", "government excellence",
      "public-private partnership", "strategic planning",
      "performance management", "e-government services",
    ],
  },

  education: {
    id: "education",
    nameAr: "التعليم",
    nameEn: "Education",
    keywordsAr: [
      "تعليم", "مدرسة", "جامعة", "تدريس", "مناهج", "تدريب",
      "تطوير مهني", "تعليم إلكتروني", "قياس", "تقويم",
      "وزارة التعليم", "جامعة الملك سعود", "أكاديمية",
      "معلم", "محاضر", "بحث علمي", "موهبة", "أكاديمي",
    ],
    keywordsEn: [
      "education", "school", "university", "teaching", "curriculum", "training",
      "professional development", "e-learning", "Qiyas", "assessment",
      "MOE", "academic", "lecturer", "research", "Mawhiba",
      "learning outcomes", "accreditation", "NCAAA",
    ],
    commonCertifications: [
      "CELTA", "TESOL", "SHRM-CP", "ATD",
      "IB Certificate", "Microsoft Certified Educator",
    ],
    commonTools: ["Blackboard", "Moodle", "Canvas", "Microsoft Teams", "Zoom"],
    industryPhrases: [
      "curriculum development", "student-centered learning",
      "blended learning", "quality assurance in education",
      "educational technology", "lifelong learning",
    ],
  },

  retail_ecommerce: {
    id: "retail_ecommerce",
    nameAr: "التجزئة والتجارة الإلكترونية",
    nameEn: "Retail & E-Commerce",
    keywordsAr: [
      "تجزئة", "متجر", "مبيعات", "تجارة إلكترونية", "تسويق",
      "خدمة عملاء", "مخزون", "سلسلة إمداد", "علامة تجارية",
      "منصة", "نون", "أمازون", "سلة", "زاد", "متجر",
      "تجربة عميل", "دفع إلكتروني", "توصيل",
    ],
    keywordsEn: [
      "retail", "store", "sales", "e-commerce", "marketing",
      "customer service", "inventory", "supply chain", "brand",
      "platform", "Noon", "Amazon.sa", "Salla", "Zid",
      "customer experience", "digital payment", "delivery",
    ],
    commonCertifications: [
      "Google Analytics", "Meta Certified", "HubSpot",
      "CIM", "CSCP", "PMP",
    ],
    commonTools: ["Shopify", "Magento", "Salesforce", "Google Analytics", "Meta Ads Manager"],
    industryPhrases: [
      "omnichannel retail", "customer journey", "conversion rate optimization",
      "last-mile delivery", "inventory turnover", "customer lifetime value",
    ],
  },

  telecom: {
    id: "telecom",
    nameAr: "الاتصالات وتقنية المعلومات",
    nameEn: "Telecommunications",
    keywordsAr: [
      "اتصالات", "شبكات", "جوال", "إنترنت", "ألياف بصرية",
      "5G", "بنية تحتية", "هيئة الاتصالات", "stc", "موبايلي",
      "زين", "سلام", "تقنية", "دعم فني", "خدمة عملاء",
    ],
    keywordsEn: [
      "telecom", "networks", "mobile", "internet", "fiber optics",
      "5G", "infrastructure", "CST", "STC", "Mobily",
      "Zain", "Salam", "ICT", "technical support", "customer service",
    ],
    commonCertifications: [
      "CCNA", "CCNP", "ITIL", "TM Forum",
      "5G Certification", "PMP",
    ],
    commonTools: ["Huawei OSS", "Ericsson ENM", "Netcool", "SolarWinds", "Ciena"],
    industryPhrases: [
      "network operations center", "service assurance",
      "fiber deployment", "spectrum management",
      "quality of service", "digital enablement",
    ],
  },

  logistics_supplychain: {
    id: "logistics_supplychain",
    nameAr: "الخدمات اللوجستية وسلسلة الإمداد",
    nameEn: "Logistics & Supply Chain",
    keywordsAr: [
      "لوجستي", "سلسلة إمداد", "مخازن", "شحن", "نقل",
      "موانئ", "جمارك", "تخليص", "إدارة مخزون", "توزيع",
      "ميناء الملك عبدالله", "ساري", "فسح", "هيئة الزكاة والجمارك",
      "المنصة اللوجستية", "خدمات لوجستية", "سلاسل إمداد",
    ],
    keywordsEn: [
      "logistics", "supply chain", "warehousing", "shipping", "transport",
      "ports", "customs", "clearance", "inventory management", "distribution",
      "King Abdullah Port", "SARI", "Fasah", "ZATCA",
      "logistics platform", "freight", "procurement",
    ],
    commonCertifications: [
      "CSCP", "CPIM", "CSCM", "Six Sigma",
      "CILT", "CLTD", "PMP",
    ],
    commonTools: ["SAP TM", "Oracle SCM", "Blue Yonder", "Manhattan Associates", "WMS"],
    industryPhrases: [
      "end-to-end supply chain", "cold chain logistics",
      "last-mile optimization", "cross-docking",
      "demand planning", "vendor-managed inventory",
    ],
  },
};

/**
 * Get sector template by ID. Returns null if not found.
 */
export function getSectorTemplate(sectorId: string): SectorTemplate | null {
  return SECTOR_TEMPLATES[sectorId] ?? null;
}

/**
 * List all available sectors with names in both languages.
 */
export function getAllSectors(): Array<{ id: string; nameAr: string; nameEn: string }> {
  return Object.values(SECTOR_TEMPLATES).map(({ id, nameAr, nameEn }) => ({
    id,
    nameAr,
    nameEn,
  }));
}

/**
 * Map old sector slugs (from UI) to sector template IDs.
 */
export const SECTOR_SLUG_MAP: Record<string, string> = {
  "oil-and-gas": "oil_gas",
  "oil-gas": "oil_gas",
  oil: "oil_gas",
  healthcare: "healthcare",
  "finance-banking": "finance_banking",
  "finance-and-banking": "finance_banking",
  finance: "finance_banking",
  banking: "finance_banking",
  "tech-it": "tech_it",
  "tech-and-it": "tech_it",
  tech: "tech_it",
  construction: "construction",
  "government-public": "government_public",
  government: "government_public",
  education: "education",
  "retail-ecommerce": "retail_ecommerce",
  retail: "retail_ecommerce",
  "e-commerce": "retail_ecommerce",
  telecom: "telecom",
  "logistics-supplychain": "logistics_supplychain",
  logistics: "logistics_supplychain",
  "supply-chain": "logistics_supplychain",
};
