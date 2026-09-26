export interface GuideKnowledgeEntry {
  topics: string[];
  reply: string;
  route?: '/' | '/analyze' | '/compare' | '/dashboard';
  routeLabel?: string;
  chips?: string[];
}

export const GUIDE_STATIC_KNOWLEDGE: GuideKnowledgeEntry[] = [
  {
    topics: ['upload', 'analyze', 'pdf', 'image', 'document', 'start', 'how to analyze'],
    reply:
      'You can analyze any legal document by going to the Analyze Document page. We accept PDF, TXT, PNG, JPG, and WebP files up to 4 MB, or you can paste the text directly.',
    route: '/analyze',
    routeLabel: 'Go to Analyze Document',
    chips: ['What file formats are supported?', 'Is my data private?', 'Can I compare contracts?'],
  },
  {
    topics: ['compare', 'difference', 'two documents', 'versions'],
    reply:
      'The Compare tool lets you put two contracts side by side to see clause differences, risk changes, and missing terms.',
    route: '/compare',
    routeLabel: 'Open Compare Tool',
    chips: ['How do I analyze a PDF?', 'Where is my history saved?'],
  },
  {
    topics: ['privacy', 'save', 'store', 'security', 'confidential', 'database'],
    reply:
      'Legal Lens has a strict privacy-first architecture: your raw document text is NEVER stored on our servers or databases. Analysis is processed in transient memory, and history is saved only in your local browser storage.',
    route: '/dashboard',
    routeLabel: 'View Local Dashboard',
    chips: ['How do I clear my history?', 'How do I analyze a PDF?'],
  },
  {
    topics: ['history', 'saved', 'dashboard', 'profile', 'stats'],
    reply:
      'Your Dashboard stores up to 20 recent analyses in your browser storage. You can view past risk summaries, re-open analyses without using API credits, and manage your profile.',
    route: '/dashboard',
    routeLabel: 'Open Dashboard',
    chips: ['Can I export my brief?', 'Is my data private?'],
  },
  {
    topics: ['languages', 'hindi', 'marathi', 'translation', 'bilingual'],
    reply:
      'Legal Lens supports English, Hindi (हिन्दी), and Marathi (मराठी). You can switch UI language in the top navigation or choose your preferred analysis output language.',
    chips: ['How do I analyze a PDF?', 'Can I use read aloud?'],
  },
  {
    topics: ['audio', 'speech', 'read aloud', 'voice', 'listen'],
    reply:
      'You can click the 🔊 Read button on any clause, brief, or Q&A answer to listen with native browser text-to-speech in English, Hindi, or Marathi.',
    chips: ['How do I analyze a PDF?', 'Where is my history saved?'],
  },
];

export const GUIDE_DEFAULT_CHIPS = [
  'How do I analyze a contract?',
  'Can I compare two documents?',
  'Is my document data private?',
  'What languages are supported?',
];
