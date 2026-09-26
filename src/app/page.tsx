'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Scale, 
  FileSearch, 
  ChevronDown, 
  Globe, 
  ShieldCheck, 
  Play 
} from 'lucide-react';
import { DepthImage } from '@/components/DepthImage';

interface LandingTranslations {
  navAnalyze: string;
  navServices: string;
  headline1: string;
  headline2: string;
  headline3: string;
  subtitle: string;
  loginBtn: string;
  demoBtn: string;
  servicesTitle: string;
  service1Title: string;
  service1Desc: string;
  service2Title: string;
  service2Desc: string;
  service3Title: string;
  service3Desc: string;
  service4Title: string;
  service4Desc: string;
}

const TRANSLATIONS: Record<string, LandingTranslations> = {
  English: {
    navAnalyze: 'Analyze',
    navServices: 'Services',
    headline1: 'SOLVING LEGAL',
    headline2: 'MATTERS WITH',
    headline3: 'CONFIDENCE',
    subtitle: 'A Dedicated Legal Intelligence Suite Committed to Protecting Your Rights and Securing Your Future with AI Precision.',
    loginBtn: 'Login',
    demoBtn: 'Demo Video',
    servicesTitle: 'Legal Lens Capabilities',
    service1Title: 'Contract Audit',
    service1Desc: 'Deep AI clause risk & loophole detection',
    service2Title: 'Neutral Diff',
    service2Desc: 'Side-by-side agreement change comparison',
    service3Title: 'Lawyer Briefs',
    service3Desc: 'Executive counsel-ready case summaries',
    service4Title: 'Multilingual Voice',
    service4Desc: 'Audio Read Aloud across 8 Indian languages',
  },
  'Hindi (हिंदी)': {
    navAnalyze: 'विश्लेषण (Analyze)',
    navServices: 'सेवाएं (Services)',
    headline1: 'कानूनी मामलों का',
    headline2: 'समाधान पूरे',
    headline3: 'आत्मविश्वास के साथ',
    subtitle: 'आपके अधिकारों की रक्षा और एआई सटीकता के साथ आपके भविष्य को सुरक्षित करने के लिए समर्पित कानूनी इंटेलिजेंस सूट।',
    loginBtn: 'लॉगिन करें',
    demoBtn: 'डेमो वीडियो',
    servicesTitle: 'लीगल लेंस की प्रमुख सेवाएं',
    service1Title: 'अनुबंध ऑडिट',
    service1Desc: 'क्लॉज जोखिम और छिपे हुए खतरों की सटीक पहचान',
    service2Title: 'तटस्थ तुलना (Diff)',
    service2Desc: 'दो अनुबंधों के बीच बदलावों की तुलना',
    service3Title: 'वकील सारांश',
    service3Desc: 'परामर्श हेतु तैयार संक्षिप्त कानूनी रिपोर्ट',
    service4Title: 'बहुभाषी आवाज (Read Aloud)',
    service4Desc: 'भारतीय भाषाओं में बोलकर समझाने की सुविधा',
  },
  'Marathi (मराठी)': {
    navAnalyze: 'विश्लेषण (Analyze)',
    navServices: 'सेवा (Services)',
    headline1: 'कायदेशीर बाबींचे',
    headline2: 'निराकरण पूर्ण',
    headline3: 'आत्मविश्वासाने',
    subtitle: 'तुमच्या हक्कांचे रक्षण करण्यासाठी आणि एआय अचूकतेने तुमचे भविष्य सुरक्षित करण्यासाठी समर्पित कायदेशीर इंटेलिजेंस सूट.',
    loginBtn: 'लॉगिन करा',
    demoBtn: 'डेमो व्हिडिओ',
    servicesTitle: 'लीगल लेन्सच्या सेवा',
    service1Title: 'करार ऑडिट',
    service1Desc: 'कलमांमधील धोके आणि अटींचे विश्लेषण',
    service2Title: 'तटस्थ तुलना (Diff)',
    service2Desc: 'दोन करारांमधील बदलांची पडताळणी',
    service3Title: 'वकील सारांश',
    service3Desc: 'सल्ल्यासाठी तयार कायदेशीर अहवाल',
    service4Title: 'बहुभाषिक वाचन (Read Aloud)',
    service4Desc: 'मराठी व इतर भाषांमध्ये ऑडिओ वाचन',
  },
  'Tamil (தமிழ்)': {
    navAnalyze: 'பகுப்பாய்வு (Analyze)',
    navServices: 'சேவைகள் (Services)',
    headline1: 'சட்ட விவகாரங்களை',
    headline2: 'முழு',
    headline3: 'நம்பிக்கையுடன் தீர்க்கவும்',
    subtitle: 'உங்கள் உரிமைகளைப் பாதுகாக்கவும், ஏஐ துல்லியத்துடன் எதிர்காலத்தைப் பாதுகாக்கவும் அர்ப்பணிக்கப்பட்ட சட்ட நுண்ணறிவு தளம்.',
    loginBtn: 'உள்நுழைக',
    demoBtn: 'டெமோ வீடியோ',
    servicesTitle: 'லீகல் லென்ஸ் சேவைகள்',
    service1Title: 'ஒப்பந்த தணிக்கை',
    service1Desc: 'ஆபத்தான ஷரத்துக்கள் மற்றும் சிக்கல்களைக் கண்டறிதல்',
    service2Title: 'ஒப்பீட்டு ஆய்வு (Diff)',
    service2Desc: 'இரண்டு ஒப்பந்தங்களுக்கு இடையிலான ஒப்பீடு',
    service3Title: 'வழக்கறிஞர் சுருக்கம்',
    service3Desc: 'ஆலோசனைக்குத் தயாரான சட்ட சுருக்கங்கள்',
    service4Title: 'குரல் வாசிப்பு (Read Aloud)',
    service4Desc: 'இந்திய மொழிகளில் குரல்வழி விளக்கம்',
  },
  'Telugu (తెలుగు)': {
    navAnalyze: 'విశ్లేషణ (Analyze)',
    navServices: 'సేవలు (Services)',
    headline1: 'చట్టపరమైన అంశాలను',
    headline2: 'పూర్తి',
    headline3: 'ఆత్మవిశ్వాసంతో పరిష్కరించండి',
    subtitle: 'మీ హక్కులను కాపాడటానికి మరియు ఏఐ ఖచ్చితత్వంతో మీ భవిష్యత్తును సురక్షితం చేయడానికి రూపొందించిన లీగల్ ఇంటెలిజెన్స్ సూట్.',
    loginBtn: 'లాగిన్',
    demoBtn: 'డెమో వీడియో',
    servicesTitle: 'లీగల్ లెన్స్ సేవలు',
    service1Title: 'ఒప్పంద ఆడిట్',
    service1Desc: 'ప్రమాదకర క్లాజ్‌ల గుర్తింపు',
    service2Title: 'పోలిక పరిశీలన (Diff)',
    service2Desc: 'రెండు అగ్రిమెంట్ల మధ్య తేడాల విశ్లేషణ',
    service3Title: 'న్యాయవాది సారాంశం',
    service3Desc: 'కౌన్సెల్ కోసం సిద్ధంగా ఉన్న నివేదికలు',
    service4Title: 'వాయిస్ రీడ్ అలౌడ్',
    service4Desc: 'భారతీయ భాషలలో ఆడియో విశ్లేషణ',
  },
  'Kannada (ಕನ್ನಡ)': {
    navAnalyze: 'ವಿಶ್ಲೇಷಣೆ (Analyze)',
    navServices: 'ಸೇವೆಗಳು (Services)',
    headline1: 'ಕಾನೂನು ವಿಷಯಗಳನ್ನು',
    headline2: 'ಸಂಪೂರ್ಣ',
    headline3: 'ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ಬಗೆಹರಿಸಿ',
    subtitle: 'ನಿಮ್ಮ ಹಕ್ಕುಗಳನ್ನು ರಕ್ಷಿಸಲು ಮತ್ತು ಎಐ ನಿಖರತೆಯೊಂದಿಗೆ ನಿಮ್ಮ ಭವಿಷ್ಯವನ್ನು ಸುರಕ್ಷಿತಗೊಳಿಸಲು ಕಾನೂನು ಬುದ್ಧಿಮತ್ತೆ ವೇದಿಕೆ.',
    loginBtn: 'ಲಾಗಿನ್',
    demoBtn: 'ಡೆಮೊ ವೀಡಿಯೊ',
    servicesTitle: 'ಲೀಗಲ್ ಲೆನ್ಸ್ ಸೇವೆಗಳು',
    service1Title: 'ಒಪ್ಪಂದ ತಪಾಸಣೆ',
    service1Desc: 'ಅಪಾಯಕಾರಿ ಷರತ್ತುಗಳ ಪತ್ತೆ',
    service2Title: 'ಹೋಲಿಕೆ ವಿಶ್ಲೇಷಣೆ (Diff)',
    service2Desc: 'ಎರಡು ಕರಾರುಗಳ ನಡುವಿನ ಬದಲಾವಣೆ',
    service3Title: 'ವಕೀಲರ ಸಾರಾಂಶ',
    service3Desc: 'ಸಮಾಲೋಚನೆಗಾಗಿ ಸಿದ್ಧವಾದ ವರದಿ',
    service4Title: 'ಧ್ವನಿ ವಾಚನ (Read Aloud)',
    service4Desc: 'ಪ್ರಾದೇಶಿಕ ಭಾಷೆಗಳಲ್ಲಿ ಆಡಿಯೊ ವಾಚನ',
  },
  'Bengali (বাংলা)': {
    navAnalyze: 'বিশ্লেষণ (Analyze)',
    navServices: 'পরিষেবা (Services)',
    headline1: 'আইনি বিষয়গুলির সমাধান',
    headline2: 'করুন সম্পূর্ণ',
    headline3: 'আত্মবিশ্বাসের সাথে',
    subtitle: 'আপনার অধিকার রক্ষা এবং এআই নির্ভুলতার সাথে আপনার ভবিষ্যৎ সুরক্ষিত করতে নিবেদিত আইনি বুদ্ধিমত্তা স্যুট।',
    loginBtn: 'লগইন',
    demoBtn: 'ডেমো ভিডিও',
    servicesTitle: 'লিগ্যাল লেন্স পরিষেবা',
    service1Title: 'চুক্তি অডিট',
    service1Desc: 'ঝুঁকিপূর্ণ ধারা এবং ত্রুটি সনাক্তকরণ',
    service2Title: 'নিরপেক্ষ তুলনা (Diff)',
    service2Desc: 'দুটি চুক্তির পরিবর্তনের তুলনা',
    service3Title: 'আইনজীবী ব্রিফ',
    service3Desc: 'পরামর্শের জন্য প্রস্তুত আইনি সারাংশ',
    service4Title: 'ভয়েস রিড আউট',
    service4Desc: 'ভারতীয় ভাষায় অডিও বিশ্লেষণ',
  },
  'Gujarati (ગુજરાતી)': {
    navAnalyze: 'વિશ્લેષણ (Analyze)',
    navServices: 'સેવાઓ (Services)',
    headline1: 'કાનૂની બાબતોનું',
    headline2: 'નિરાકરણ સંપૂર્ણ',
    headline3: 'આત્મવિશ્વાસ સાથે',
    subtitle: 'તમારા અધિકારોનું રક્ષણ કરવા અને AI ચોકસાઈ સાથે તમારું ભવિષ્ય સુરક્ષિત કરવા માટે સમર્પિત કાનૂની ઇન્ટેલિજન્સ સ્યુટ.',
    loginBtn: 'લૉગિન',
    demoBtn: 'ડેમો વિડિઓ',
    servicesTitle: 'લીગલ લેન્સ સેવાઓ',
    service1Title: 'કરાર ઓડિટ',
    service1Desc: 'જોખમી કલમો અને ક્ષતિઓની ઓળખ',
    service2Title: 'તટસ્થ સરખામણી (Diff)',
    service2Desc: 'બે કરારો વચ્ચેના ફેરફારોની સરખામણી',
    service3Title: 'વકીલ સારાંશ',
    service3Desc: 'કાનૂની સલાહ માટે તૈયાર રિપોર્ટ',
    service4Title: 'ઓડિયો વાચન (Read Aloud)',
    service4Desc: 'પ્રાદેશિક ભાષાઓમાં ઓડિયો વિશ્લેષણ',
  },
};

export default function HomePage() {
  const router = useRouter();
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [selectedLangKey, setSelectedLangKey] = useState('English');
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const fallbackT = TRANSLATIONS['English'] as LandingTranslations;
  const t: LandingTranslations = TRANSLATIONS[selectedLangKey] ?? fallbackT;

  const loadSampleDocAndEnter = (sampleType: 'rental' | 'employment') => {
    const sampleText = sampleType === 'rental' 
      ? `RESIDENTIAL LEASE AGREEMENT\nThis Lease Agreement is made on 1st October 2024 between Mr. Rajesh Sharma (Landlord) and Priya Verma (Tenant).\n1. PREMISES & TERM: Apartment 402, Green Valley Apartments, Pune for a period of 11 months.\n2. RENT & ESCALATION: Monthly rent of ₹25,000 payable by the 5th of each month. Rent shall automatically increase by 15% upon renewal.\n3. SECURITY DEPOSIT: Tenant shall deposit ₹1,50,000. Landlord reserves unilateral right to deduct for arbitrary repainting.\n4. TERMINATION & LOCK-IN: Mandatory 11-month lock-in period. Early exit requires payment of entire term's rent.`
      : `EMPLOYMENT OFFER & APPOINTMENT LETTER\nDear Ankit Patel,\nWe are pleased to offer you the position of Senior Full-Stack Engineer at Apex Global Tech India Pvt Ltd.\n1. COMPENSATION: Total Annual CTC of ₹18,00,000.\n2. PROBATION & NOTICE PERIOD: 6 months probation. During probation, notice period is 90 days or salary in lieu solely at employer's discretion.\n3. NON-COMPETE RESTRICTION: Employee shall not join, advise, or invest in any competing software enterprise anywhere in India for a period of 24 months post termination.\n4. INTELLECTUAL PROPERTY: All inventions, designs, and code developed by Employee during and after hours belong exclusively to the Company.`;

    sessionStorage.setItem('legal_lens_quick_doc', sampleText);
    sessionStorage.setItem('legal_lens_quick_filename', `${sampleType === 'rental' ? 'Residential Lease Agreement' : 'Employment Offer Letter'}.txt`);
    sessionStorage.setItem('legal_lens_quick_doctype', sampleType);
    router.push('/analyze');
  };

  return (
    <div className="relative h-screen max-h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white flex flex-col justify-between transition-colors">
      {/* Fullscreen 3D Depth Image Background with Pointer-Driven Light Raking (React Bits Pro) */}
      <div className="fixed inset-0 w-screen h-screen min-w-full min-h-full pointer-events-auto z-0 overflow-hidden">
        <DepthImage
          image="/images/statue-sculpture.png"
          fit="cover"
          depthFromLight={0.5}
          depthSmoothing={7}
          depthContrast={1.2}
          invertDepth={false}
          displacement={1.5}
          normalStrength={1.5}
          detail={0.8}
          shadowIntensity={0.7}
          shadowSoftness={0.1}
          lightColor="#ffffff"
          lightIntensity={6}
          falloff={2.5}
          elevation={1.2}
          ambient={0.03}
          ambientColor="#ffffff"
          colorPreserve={0}
          follow={0.12}
          autoOrbit={true}
          orbitRadius={0.6}
          orbitDuration={10}
          view="lit"
          backgroundColor="#000000"
          fallbackColor="#171717"
          dpr={1.5}
          className="w-full h-full min-w-full min-h-full"
        />
        {/* Soft right vignette to ensure text contrast on right side while keeping sculpture clear on left */}
        <div className="absolute inset-0 bg-gradient-to-l from-slate-950/85 via-slate-950/40 to-transparent pointer-events-none" />
      </div>

      {/* Ambient Lighting Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-1">
        <div className="absolute top-[-10%] right-[15%] w-[600px] h-[600px] rounded-full bg-orange-500/10 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[140px]" />
      </div>

      {/* Top Floating Navigation Bar */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-6 sm:px-10 pt-6 pb-2">
        <div className="flex items-center justify-between">
          {/* Brand Logo - Legal Lens */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-orange-500/40 bg-slate-900 shadow-md shadow-orange-500/20 group-hover:scale-105 group-hover:border-orange-400 transition-all duration-200">
              <Image
                src="/images/mascot.png"
                alt="Legal Lens Mascot"
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Legal <span className="text-orange-400 font-semibold">Lens</span>
              </span>
            </div>
          </Link>

          {/* Floating Pill Capsule Menu: Analyze, Services, and Language */}
          <nav className="flex items-center gap-7 px-7 py-2.5 rounded-full bg-slate-900/80 backdrop-blur-xl border border-white/15 shadow-sm text-[13px] font-medium text-slate-300">
            {/* Analyze Link (Replaced Home as requested) */}
            <Link 
              href="/analyze" 
              className="text-white font-semibold hover:text-orange-400 transition-colors flex items-center gap-1.5"
            >
              <span>{t.navAnalyze}</span>
            </Link>
            
            {/* Clickable Services Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                onBlur={() => setTimeout(() => setServicesDropdownOpen(false), 250)}
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              >
                <span>{t.navServices}</span>
                <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${servicesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {servicesDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-1.5">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-orange-400 uppercase tracking-wider border-b border-slate-800">
                    {t.servicesTitle}
                  </div>
                  
                  {/* Service 1: Contract Audit */}
                  <Link 
                    href="/analyze" 
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-800/90 text-slate-200 transition-colors group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/20 transition-colors mt-0.5">
                      <FileSearch className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-white group-hover:text-orange-400 transition-colors">
                        {t.service1Title}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                        {t.service1Desc}
                      </div>
                    </div>
                  </Link>

                  {/* Service 2: Neutral Diff */}
                  <Link 
                    href="/compare" 
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-800/90 text-slate-200 transition-colors group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors mt-0.5">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-white group-hover:text-blue-400 transition-colors">
                        {t.service2Title}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                        {t.service2Desc}
                      </div>
                    </div>
                  </Link>

                  {/* Service 3: Lawyer Briefs */}
                  <Link 
                    href="/dashboard" 
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-800/90 text-slate-200 transition-colors group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-colors mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-white group-hover:text-emerald-400 transition-colors">
                        {t.service3Title}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                        {t.service3Desc}
                      </div>
                    </div>
                  </Link>

                  {/* Service 4: Multilingual Voice Audio */}
                  <Link 
                    href="/analyze" 
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-800/90 text-slate-200 transition-colors group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/20 transition-colors mt-0.5">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-white group-hover:text-purple-400 transition-colors">
                        {t.service4Title}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-tight mt-0.5">
                        {t.service4Desc}
                      </div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Language Selection with Instant Dynamic Translation */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                onBlur={() => setTimeout(() => setLangDropdownOpen(false), 250)}
                className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-orange-400">{selectedLangKey.split(' ')[0]}</span>
                <ChevronDown className={`w-3 h-3 opacity-70 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {langDropdownOpen && (
                <div className="absolute top-full right-0 mt-3 w-44 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-72 overflow-y-auto">
                  {Object.keys(TRANSLATIONS).map((langKey) => (
                    <button
                      key={langKey}
                      type="button"
                      onClick={() => {
                        setSelectedLangKey(langKey);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-between ${
                        selectedLangKey === langKey
                          ? 'bg-orange-500/20 text-orange-400 font-bold'
                          : 'hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <span>{langKey}</span>
                      {selectedLangKey === langKey && <span className="text-orange-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right Header Area */}
          <div className="w-24 hidden sm:block" />
        </div>
      </header>

      {/* Main Single-Screen Hero (Right-Aligned Multilingual Content) */}
      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-6 sm:px-12 lg:pr-16 flex-1 flex items-center justify-end">
        <div className="w-full max-w-xl lg:max-w-[560px] flex flex-col justify-center items-start ml-auto mr-0 z-20">
          {/* Bold Uppercase Multilingual Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-extrabold tracking-tight text-white uppercase leading-[1.06] drop-shadow-md">
            {t.headline1} <br />
            {t.headline2} <br />
            <span className="text-slate-300">{t.headline3}</span>
          </h1>

          {/* Multilingual Subtitle */}
          <p className="mt-6 text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed font-normal drop-shadow-xs">
            {t.subtitle}
          </p>

          {/* Action Buttons: Login & Demo Video */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#FF5500] hover:bg-[#E54D00] text-white text-sm font-semibold tracking-wide shadow-lg shadow-orange-500/25 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>{t.loginBtn}</span>
              <span className="text-base leading-none">→</span>
            </Link>

            <button
              type="button"
              onClick={() => setDemoModalOpen(true)}
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-sm font-semibold tracking-wide shadow-xs transition-all duration-200 hover:shadow-sm cursor-pointer"
            >
              <Play className="w-4 h-4 text-orange-400 fill-orange-400" />
              <span>{t.demoBtn}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Floating Social Pill */}
      <footer className="relative z-20 pb-6 flex justify-center">
        <div className="flex items-center gap-5 px-6 py-2 rounded-full bg-white/75 dark:bg-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-300">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-orange-500 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.6 5H18V0h-3.8C10.5 0 9 1.6 9 4.6V8z" />
            </svg>
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (formerly Twitter)"
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </footer>

      {/* Interactive Demo Video Walkthrough Modal */}
      {demoModalOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Legal Lens Walkthrough</h3>
                  <p className="text-[11px] text-slate-400">See how AI audits contracts and spots high risks in seconds</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDemoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Video Player / Walkthrough Showcase */}
            <div className="p-6 flex flex-col gap-5">
              <div className="relative aspect-video rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 flex flex-col items-center justify-center text-center p-6 text-white overflow-hidden shadow-inner border border-slate-700/50">
                <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-xs" />
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-orange-500/90 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 ring-4 ring-white/20 animate-pulse">
                    <Play className="w-8 h-8 fill-current translate-x-0.5" />
                  </div>
                  <div className="text-base font-bold">Interactive Product Demo</div>
                  <p className="text-xs text-slate-300 max-w-sm">
                    Watch the 90-second walkthrough showing clause risk scoring, neutral diffing, and lawyer-ready briefs.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Powered by Gemini Multimodal Legal Intelligence</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDemoModalOpen(false);
                      loadSampleDocAndEnter('rental');
                    }}
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Try Live Sample →
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


