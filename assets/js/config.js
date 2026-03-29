/* =============================================
   CONFIG.JS — CERT CATALOG + USER SETTINGS
   Single source of truth for all certifications,
   their domains, time estimates, and quiz IDs.
   ============================================= */

const CERT_CATALOG = {

  cism: {
    id: 'cism',
    name: 'CISM',
    fullName: 'Certified Information Security Manager',
    issuer: 'ISACA',
    color: 'var(--cism)',
    colorHex: '#58a6ff',
    estimateWeeks: 8,
    dailyHours: 2,
    indexPath: 'cism/',
    domains: [
      {
        id: 'cism_d1',
        name: 'Information Security Governance',
        shortName: 'Governance',
        path: 'cism/domain1/',
        quizId: 'cism_d1_quiz',
        flashcardsPath: 'cism/domain1/flashcards',
        quizPath: 'cism/domain1/quiz',
        estimateMins: 360,
        weight: '17%',
      },
      {
        id: 'cism_d2',
        name: 'Information Risk Management',
        shortName: 'Risk Management',
        path: 'cism/domain2/',
        quizId: 'cism_d2_quiz',
        flashcardsPath: 'cism/domain2/flashcards',
        quizPath: 'cism/domain2/quiz',
        estimateMins: 420,
        weight: '20%',
      },
      {
        id: 'cism_d3',
        name: 'Security Program Development',
        shortName: 'Security Program',
        path: 'cism/domain3/',
        quizId: 'cism_d3_quiz',
        flashcardsPath: 'cism/domain3/flashcards',
        quizPath: 'cism/domain3/quiz',
        estimateMins: 480,
        weight: '33%',
      },
      {
        id: 'cism_d4',
        name: 'Incident Management',
        shortName: 'Incident Management',
        path: 'cism/domain4/',
        quizId: 'cism_d4_quiz',
        flashcardsPath: 'cism/domain4/flashcards',
        quizPath: 'cism/domain4/quiz',
        estimateMins: 420,
        weight: '30%',
      },
    ],
  },

  ccsk: {
    id: 'ccsk',
    name: 'CCSK',
    fullName: 'Certificate of Cloud Security Knowledge',
    issuer: 'CSA',
    color: 'var(--ccsk)',
    colorHex: '#3fb950',
    estimateWeeks: 3,
    dailyHours: 2,
    indexPath: 'ccsk/',
    domains: [
      {
        id: 'ccsk_d1',
        name: 'Cloud Concepts and Architecture',
        shortName: 'Cloud Concepts',
        path: 'ccsk/01-cloud-concepts',
        quizId: 'ccsk_d1_quiz',
        estimateMins: 150,
      },
      {
        id: 'ccsk_d5',
        name: 'Identity and Access Management',
        shortName: 'IAM',
        path: 'ccsk/05-iam',
        quizId: 'ccsk_d5_quiz',
        estimateMins: 150,
      },
      {
        id: 'ccsk_d9',
        name: 'Data Security and Encryption',
        shortName: 'Data Security',
        path: 'ccsk/09-data-security',
        quizId: 'ccsk_d9_quiz',
        estimateMins: 150,
      },
      {
        id: 'ccsk_full',
        name: 'Full Domain Review (all 12)',
        shortName: 'Full Review',
        path: 'ccsk/',
        quizId: 'ccsk_full_quiz',
        estimateMins: 180,
      },
    ],
  },

  cobit: {
    id: 'cobit',
    name: 'COBIT',
    fullName: 'COBIT 2019 Foundation',
    issuer: 'ISACA',
    color: 'var(--cobit)',
    colorHex: '#d29922',
    estimateWeeks: 3,
    dailyHours: 2,
    indexPath: 'cobit/',
    domains: [
      {
        id: 'cobit_d1',
        name: 'Framework Introduction',
        shortName: 'Introduction',
        path: 'cobit/01-framework-intro',
        quizId: 'cobit_d1_quiz',
        estimateMins: 120,
      },
      {
        id: 'cobit_d2',
        name: 'The Six Principles',
        shortName: 'Principles',
        path: 'cobit/02-principles',
        quizId: 'cobit_d2_quiz',
        estimateMins: 120,
      },
      {
        id: 'cobit_full',
        name: 'Full Framework Review',
        shortName: 'Full Review',
        path: 'cobit/',
        quizId: 'cobit_full_quiz',
        estimateMins: 180,
      },
    ],
  },

  cissp: {
    id: 'cissp',
    name: 'CISSP',
    fullName: 'Certified Information Systems Security Professional',
    issuer: 'ISC²',
    color: 'var(--cissp)',
    colorHex: '#bc8cff',
    estimateWeeks: 10,
    dailyHours: 2,
    indexPath: 'cissp/',
    domains: [
      {
        id: 'cissp_d1',
        name: 'Security and Risk Management',
        shortName: 'Risk Management',
        path: 'cissp/#d1',
        quizId: 'cissp_d1_quiz',
        estimateMins: 300,
        weight: '16%',
      },
      {
        id: 'cissp_d2',
        name: 'Asset Security',
        shortName: 'Asset Security',
        path: 'cissp/#d2',
        quizId: 'cissp_d2_quiz',
        estimateMins: 180,
        weight: '10%',
      },
      {
        id: 'cissp_d3',
        name: 'Security Architecture and Engineering',
        shortName: 'Architecture',
        path: 'cissp/#d3',
        quizId: 'cissp_d3_quiz',
        estimateMins: 300,
        weight: '13%',
      },
      {
        id: 'cissp_d4',
        name: 'Communication and Network Security',
        shortName: 'Network Security',
        path: 'cissp/#d4',
        quizId: 'cissp_d4_quiz',
        estimateMins: 240,
        weight: '13%',
      },
      {
        id: 'cissp_full',
        name: 'All 8 Domains + Mock Exam',
        shortName: 'Full Review',
        path: 'cissp/',
        quizId: 'cissp_full_quiz',
        estimateMins: 480,
      },
    ],
  },

  aws: {
    id: 'aws',
    name: 'AWS Security',
    fullName: 'AWS Security Specialty (SCS-C02)',
    issuer: 'AWS',
    color: '#ff9900',
    colorHex: '#ff9900',
    estimateWeeks: 4,
    dailyHours: 2,
    indexPath: 'aws-security/',
    domains: [
      {
        id: 'aws_d1',
        name: 'Threat Detection and Incident Response',
        shortName: 'Threat Detection',
        path: 'aws-security/#d1',
        quizId: 'aws_d1_quiz',
        estimateMins: 240,
        weight: '14%',
      },
      {
        id: 'aws_d2',
        name: 'Security Logging and Monitoring',
        shortName: 'Logging',
        path: 'aws-security/#d2',
        quizId: 'aws_d2_quiz',
        estimateMins: 180,
        weight: '18%',
      },
      {
        id: 'aws_d3',
        name: 'Infrastructure Security',
        shortName: 'Infrastructure',
        path: 'aws-security/#d3',
        quizId: 'aws_d3_quiz',
        estimateMins: 240,
        weight: '20%',
      },
      {
        id: 'aws_d4',
        name: 'Identity and Access Management',
        shortName: 'IAM',
        path: 'aws-security/#d4',
        quizId: 'aws_d4_quiz',
        estimateMins: 240,
        weight: '16%',
      },
      {
        id: 'aws_d5',
        name: 'Data Protection',
        shortName: 'Data Protection',
        path: 'aws-security/#d5',
        quizId: 'aws_d5_quiz',
        estimateMins: 240,
        weight: '18%',
      },
      {
        id: 'aws_d6',
        name: 'Management and Security Governance',
        shortName: 'Governance',
        path: 'aws-security/#d6',
        quizId: 'aws_d6_quiz',
        estimateMins: 180,
        weight: '14%',
      },
    ],
  },

  azure: {
    id: 'azure',
    name: 'AZ-500',
    fullName: 'Microsoft Azure Security Technologies',
    issuer: 'Microsoft',
    color: '#0078d4',
    colorHex: '#0078d4',
    estimateWeeks: 4,
    dailyHours: 2,
    indexPath: 'azure-security/',
    domains: [
      {
        id: 'azure_d1',
        name: 'Manage Identity and Access',
        shortName: 'Identity and Access',
        path: 'azure-security/#d1',
        quizId: 'azure_d1_quiz',
        estimateMins: 300,
        weight: '25-30%',
      },
      {
        id: 'azure_d2',
        name: 'Secure Networking',
        shortName: 'Networking',
        path: 'azure-security/#d2',
        quizId: 'azure_d2_quiz',
        estimateMins: 240,
        weight: '20-25%',
      },
      {
        id: 'azure_d3',
        name: 'Secure Compute, Storage, and Databases',
        shortName: 'Compute and Data',
        path: 'azure-security/#d3',
        quizId: 'azure_d3_quiz',
        estimateMins: 240,
        weight: '20-25%',
      },
      {
        id: 'azure_d4',
        name: 'Manage Security Operations',
        shortName: 'Security Operations',
        path: 'azure-security/#d4',
        quizId: 'azure_d4_quiz',
        estimateMins: 240,
        weight: '25-30%',
      },
    ],
  },

  gcp: {
    id: 'gcp',
    name: 'GCP Security',
    fullName: 'GCP Professional Cloud Security Engineer',
    issuer: 'Google',
    color: '#4285f4',
    colorHex: '#4285f4',
    estimateWeeks: 4,
    dailyHours: 2,
    indexPath: 'gcp-security/',
    domains: [
      {
        id: 'gcp_d1',
        name: 'Configuring Access',
        shortName: 'Access Config',
        path: 'gcp-security/#d1',
        quizId: 'gcp_d1_quiz',
        estimateMins: 240,
        weight: '27%',
      },
      {
        id: 'gcp_d2',
        name: 'Configuring Network Security',
        shortName: 'Network Security',
        path: 'gcp-security/#d2',
        quizId: 'gcp_d2_quiz',
        estimateMins: 240,
        weight: '23%',
      },
      {
        id: 'gcp_d3',
        name: 'Ensuring Data Protection',
        shortName: 'Data Protection',
        path: 'gcp-security/#d3',
        quizId: 'gcp_d3_quiz',
        estimateMins: 180,
        weight: '20%',
      },
      {
        id: 'gcp_d4',
        name: 'Managing Operations',
        shortName: 'Operations',
        path: 'gcp-security/#d4',
        quizId: 'gcp_d4_quiz',
        estimateMins: 180,
        weight: '17%',
      },
      {
        id: 'gcp_d5',
        name: 'Compliance and Regulatory Concerns',
        shortName: 'Compliance',
        path: 'gcp-security/#d5',
        quizId: 'gcp_d5_quiz',
        estimateMins: 120,
        weight: '13%',
      },
    ],
  },

};

/* Default config — what a new user gets */
const DEFAULT_CONFIG = {
  selectedCerts: ['cism', 'ccsk', 'cobit', 'cissp'],
  certOrder: ['cism', 'ccsk', 'cobit', 'cissp'],
  lockChapters: true,
  passMark: 80,
  startDate: '2026-03-28',
  dailyMinutes: 120,
};

/* ── CONFIG HELPERS ──────────────────────── */
const CertConfig = {
  async load() {
    const saved = await CertDB.getSetting('userConfig');
    return Object.assign({}, DEFAULT_CONFIG, saved || {});
  },

  async save(cfg) {
    await CertDB.setSetting('userConfig', cfg);
  },

  /* Build ordered list of domains for selected certs */
  getStudyPlan(cfg) {
    const plan = [];
    const order = cfg.certOrder || cfg.selectedCerts;
    for (const certId of order) {
      if (!cfg.selectedCerts.includes(certId)) continue;
      const cert = CERT_CATALOG[certId];
      if (!cert) continue;
      for (const domain of cert.domains) {
        plan.push({ cert, domain });
      }
    }
    return plan;
  },

  /* Generate day-by-day schedule from plan */
  generateSchedule(cfg) {
    const plan = this.getStudyPlan(cfg);
    const dailyMins = cfg.dailyMinutes || 120;
    const startDate = new Date(cfg.startDate || '2026-03-28');
    const schedule = [];

    let dayNum = 1;
    let currentDate = new Date(startDate);
    let bucketMins = 0;
    let dayItems = [];

    function pushDay() {
      if (dayItems.length === 0) return;
      schedule.push({ day: dayNum, date: new Date(currentDate), items: dayItems.slice() });
      dayNum++;
      currentDate.setDate(currentDate.getDate() + 1);
      dayItems = [];
      bucketMins = 0;
    }

    for (const { cert, domain } of plan) {
      let remaining = domain.estimateMins;
      while (remaining > 0) {
        const fit = Math.min(remaining, dailyMins - bucketMins);
        if (fit <= 0) { pushDay(); continue; }
        dayItems.push({ cert, domain, mins: fit, partial: fit < domain.estimateMins });
        bucketMins += fit;
        remaining -= fit;
        if (bucketMins >= dailyMins) pushDay();
      }
    }

    if (dayItems.length > 0) pushDay();
    return schedule;
  },

  /* Check if a domain is locked given current quiz scores */
  async isDomainLocked(certId, domainIndex, cfg) {
    if (!cfg.lockChapters) return false;
    if (domainIndex === 0) return false; // first domain always unlocked

    const cert = CERT_CATALOG[certId];
    if (!cert) return false;

    // Check if previous domain passed
    const prevDomain = cert.domains[domainIndex - 1];
    if (!prevDomain.quizId) return false;

    const score = await CertDB.getQuizScore(prevDomain.quizId);
    const passed = score && score.best >= (cfg.passMark || 80);
    return !passed;
  },
};
