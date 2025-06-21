import React, { useState, useEffect } from 'react';
import { Camera, Upload, MessageCircle, Star, BarChart3, Heart, Mail, User, LogOut, Settings, Moon, Sun, Globe, Award, Zap, Target, Maximize, Minimize, Home } from 'lucide-react';
import { VisionAnalysis } from './components/VisionAnalysis';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { FoodCheckLogo } from './components/FoodCheckLogo';
import { useAuth } from './hooks/useAuth';
import { sendMessageToGroq, ChatMessage } from './services/groqService';
import { NutritionAnalysis } from './services/visionService';
import { emailService } from './services/emailService';

type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'hi';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  title: {
    en: 'FoodCheck',
    es: 'FoodCheck',
    fr: 'FoodCheck',
    de: 'FoodCheck',
    zh: '食品检查',
    ja: 'フードチェック',
    hi: 'फूडचेक'
  },
  subtitle: {
    en: 'Analyze. Understand. Choose Better.',
    es: 'Analizar. Entender. Elegir Mejor.',
    fr: 'Analyser. Comprendre. Choisir Mieux.',
    de: 'Analysieren. Verstehen. Besser Wählen.',
    zh: '分析。理解。更好选择。',
    ja: '分析。理解。より良い選択。',
    hi: 'विश्लेषण। समझें। बेहतर चुनें।'
  },
  heroTitle: {
    en: 'Analyze Your Food with',
    es: 'Analiza Tu Comida con',
    fr: 'Analysez Votre Nourriture avec',
    de: 'Analysieren Sie Ihr Essen mit',
    zh: '用AI精准分析',
    ja: 'AI精密分析で',
    hi: 'AI की शक्ति से'
  },
  heroSubtitle: {
    en: 'AI-Powered Precision',
    es: 'Precisión Impulsada por IA',
    fr: 'Précision Alimentée par IA',
    de: 'KI-gesteuerte Präzision',
    zh: '您的食物',
    ja: '食品を分析',
    hi: 'अपने भोजन का विश्लेषण करें'
  },
  heroDescription: {
    en: 'Get comprehensive nutrition analysis, health warnings, and taste evaluations for any packaged food. Make informed choices with our revolutionary Vish Score system.',
    es: 'Obtenga análisis nutricional integral, advertencias de salud y evaluaciones de sabor para cualquier alimento empaquetado. Tome decisiones informadas con nuestro revolucionario sistema Vish Score.',
    fr: 'Obtenez une analyse nutritionnelle complète, des avertissements de santé et des évaluations de goût pour tout aliment emballé. Prenez des décisions éclairées avec notre système révolutionnaire Vish Score.',
    de: 'Erhalten Sie umfassende Nährwertanalysen, Gesundheitswarnungen und Geschmacksbewertungen für jedes verpackte Lebensmittel. Treffen Sie informierte Entscheidungen mit unserem revolutionären Vish Score System.',
    zh: '获得任何包装食品的全面营养分析、健康警告和口味评估。使用我们革命性的Vish Score系统做出明智选择。',
    ja: 'あらゆる包装食品の包括的な栄養分析、健康警告、味覚評価を取得。革新的なVish Scoreシステムで情報に基づいた選択を。',
    hi: 'किसी भी पैकेज्ड फूड के लिए व्यापक पोषण विश्लेषण, स्वास्थ्य चेतावनी और स्वाद मूल्यांकन प्राप्त करें। हमारी क्रांतिकारी Vish Score प्रणाली के साथ सूचित विकल्प बनाएं।'
  },
  startAnalysis: {
    en: 'Start AI Analysis',
    es: 'Iniciar Análisis IA',
    fr: 'Commencer l\'Analyse IA',
    de: 'KI-Analyse Starten',
    zh: '开始AI分析',
    ja: 'AI分析を開始',
    hi: 'AI विश्लेषण शुरू करें'
  },
  emailAnalysisText: {
    en: 'Or email your nutrition labels to:',
    es: 'O envía tus etiquetas nutricionales a:',
    fr: 'Ou envoyez vos étiquettes nutritionnelles à:',
    de: 'Oder senden Sie Ihre Nährwertetiketten an:',
    zh: '或将您的营养标签发送至：',
    ja: '栄養ラベルをメールで送信：',
    hi: 'या अपने पोषण लेबल ईमेल करें:'
  },
  aiAnalysis: {
    en: 'AI Analysis',
    es: 'Análisis IA',
    fr: 'Analyse IA',
    de: 'KI-Analyse',
    zh: 'AI分析',
    ja: 'AI分析',
    hi: 'AI विश्लेषण'
  },
  chatAssistant: {
    en: 'Chat Assistant',
    es: 'Asistente de Chat',
    fr: 'Assistant de Chat',
    de: 'Chat-Assistent',
    zh: '聊天助手',
    ja: 'チャットアシスタント',
    hi: 'चैट सहायक'
  },
  emailAnalysis: {
    en: 'Email Analysis',
    es: 'Análisis por Email',
    fr: 'Analyse par Email',
    de: 'E-Mail-Analyse',
    zh: '邮件分析',
    ja: 'メール分析',
    hi: 'ईमेल विश्लेषण'
  },
  signIn: {
    en: 'Sign In',
    es: 'Iniciar Sesión',
    fr: 'Se Connecter',
    de: 'Anmelden',
    zh: '登录',
    ja: 'サインイン',
    hi: 'साइन इन'
  },
  signUp: {
    en: 'Sign Up',
    es: 'Registrarse',
    fr: 'S\'inscrire',
    de: 'Registrieren',
    zh: '注册',
    ja: 'サインアップ',
    hi: 'साइन अप'
  },
  welcomeBack: {
    en: 'Welcome back!',
    es: '¡Bienvenido de vuelta!',
    fr: 'Bon retour!',
    de: 'Willkommen zurück!',
    zh: '欢迎回来！',
    ja: 'おかえりなさい！',
    hi: 'वापसी पर स्वागत है!'
  },
  aiVisionTitle: {
    en: 'AI Vision Analysis',
    es: 'Análisis de Visión IA',
    fr: 'Analyse de Vision IA',
    de: 'KI-Vision-Analyse',
    zh: 'AI视觉分析',
    ja: 'AIビジョン分析',
    hi: 'AI विज़न विश्लेषण'
  },
  aiVisionDesc: {
    en: 'Upload a photo of any nutrition label and get instant, comprehensive analysis powered by advanced AI vision technology.',
    es: 'Sube una foto de cualquier etiqueta nutricional y obtén análisis instantáneo y completo impulsado por tecnología avanzada de visión IA.',
    fr: 'Téléchargez une photo de n\'importe quelle étiquette nutritionnelle et obtenez une analyse instantanée et complète alimentée par une technologie de vision IA avancée.',
    de: 'Laden Sie ein Foto eines beliebigen Nährwertetiketts hoch und erhalten Sie sofortige, umfassende Analysen mit fortschrittlicher KI-Vision-Technologie.',
    zh: '上传任何营养标签的照片，获得由先进AI视觉技术驱动的即时、全面分析。',
    ja: '栄養ラベルの写真をアップロードして、高度なAIビジョン技術による即座で包括的な分析を取得。',
    hi: 'किसी भी पोषण लेबल की फोटो अपलोड करें और उन्नत AI विज़न तकनीक द्वारा संचालित तत्काल, व्यापक विश्लेषण प्राप्त करें।'
  },
  emailAnalysisTitle: {
    en: 'Email Analysis',
    es: 'Análisis por Email',
    fr: 'Analyse par Email',
    de: 'E-Mail-Analyse',
    zh: '邮件分析',
    ja: 'メール分析',
    hi: 'ईमेल विश्लेषण'
  },
  emailAnalysisDesc: {
    en: 'Send nutrition label photos via email and receive detailed analysis reports within 1-20 minutes. Perfect for detailed reviews.',
    es: 'Envía fotos de etiquetas nutricionales por email y recibe informes de análisis detallados en 1-20 minutos. Perfecto para revisiones detalladas.',
    fr: 'Envoyez des photos d\'étiquettes nutritionnelles par email et recevez des rapports d\'analyse détaillés en 1-20 minutes. Parfait pour des examens détaillés.',
    de: 'Senden Sie Fotos von Nährwertetiketten per E-Mail und erhalten Sie detaillierte Analyseberichte innerhalb von 1-20 Minuten. Perfekt für detaillierte Bewertungen.',
    zh: '通过电子邮件发送营养标签照片，在1-20分钟内收到详细的分析报告。非常适合详细审查。',
    ja: '栄养ラベルの写真をメールで送信し、1-20分以内に詳細な分析レポートを受け取ります。詳細なレビューに最適。',
    hi: 'ईमेल के माध्यम से पोषण लेबल की फोटो भेजें और 1-20 मिनट के भीतर विस्तृत विश्लेषण रिपोर्ट प्राप्त करें। विस्तृत समीक्षा के लिए बिल्कुल सही।'
  },
  chatAssistantTitle: {
    en: 'AI Chat Assistant',
    es: 'Asistente de Chat IA',
    fr: 'Assistant de Chat IA',
    de: 'KI-Chat-Assistent',
    zh: 'AI聊天助手',
    ja: 'AIチャットアシスタント',
    hi: 'AI चैट सहायक'
  },
  chatAssistantDesc: {
    en: 'Ask questions about nutrition, health conditions, and food choices. Get personalized advice from our AI nutritionist.',
    es: 'Haz preguntas sobre nutrición, condiciones de salud y opciones alimentarias. Obtén consejos personalizados de nuestro nutricionista IA.',
    fr: 'Posez des questions sur la nutrition, les conditions de santé et les choix alimentaires. Obtenez des conseils personnalisés de notre nutritionniste IA.',
    de: 'Stellen Sie Fragen zu Ernährung, Gesundheitszuständen und Lebensmittelwahlen. Erhalten Sie personalisierte Beratung von unserem KI-Ernährungsberater.',
    zh: '询问有关营养、健康状况和食物选择的问题。从我们的AI营养师那里获得个性化建议。',
    ja: '栄養、健康状態、食品選択について質問してください。AIの栄養士から個人的なアドバイスを受けましょう。',
    hi: 'पोषण, स्वास्थ्य स्थितियों और भोजन विकल्पों के बारे में प्रश्न पूछें। हमारे AI पोषण विशेषज्ञ से व्यक्तिगत सलाह प्राप्त करें।'
  },
  tryAiAnalysis: {
    en: 'Try AI Analysis',
    es: 'Probar Análisis IA',
    fr: 'Essayer l\'Analyse IA',
    de: 'KI-Analyse Testen',
    zh: '尝试AI分析',
    ja: 'AI分析を試す',
    hi: 'AI विश्लेषण आज़माएं'
  },
  startChatting: {
    en: 'Start Chatting',
    es: 'Comenzar a Chatear',
    fr: 'Commencer à Chatter',
    de: 'Chat Starten',
    zh: '开始聊天',
    ja: 'チャット開始',
    hi: 'चैट शुरू करें'
  },
  startFullscreenChat: {
    en: 'Full Screen Chat',
    es: 'Chat Pantalla Completa',
    fr: 'Chat Plein Écran',
    de: 'Vollbild-Chat',
    zh: '全屏聊天',
    ja: 'フルスクリーンチャット',
    hi: 'फुल स्क्रीन चैट'
  },
  backToHome: {
    en: 'Back to Home',
    es: 'Volver al Inicio',
    fr: 'Retour à l\'Accueil',
    de: 'Zurück zur Startseite',
    zh: '返回首页',
    ja: 'ホームに戻る',
    hi: 'होम पर वापस जाएं'
  },
  vishScoreTitle: {
    en: 'Introducing Vish Score',
    es: 'Presentamos Vish Score',
    fr: 'Présentation du Vish Score',
    de: 'Einführung des Vish Score',
    zh: '介绍Vish Score',
    ja: 'Vish Scoreのご紹介',
    hi: 'Vish Score का परिचय'
  },
  vishScoreSubtitle: {
    en: 'The world\'s first comprehensive scoring system that evaluates both nutrition AND taste quality in one revolutionary score.',
    es: 'El primer sistema de puntuación integral del mundo que evalúa tanto la nutrición COMO la calidad del sabor en una puntuación revolucionaria.',
    fr: 'Le premier système de notation complet au monde qui évalue à la fois la nutrition ET la qualité gustative en un score révolutionnaire.',
    de: 'Das weltweit erste umfassende Bewertungssystem, das sowohl Ernährung ALS AUCH Geschmacksqualität in einem revolutionären Score bewertet.',
    zh: '世界上第一个综合评分系统，在一个革命性的分数中同时评估营养和口味质量。',
    ja: '栄養と味の品質の両方を一つの革新的なスコアで評価する世界初の包括的スコアリングシステム。',
    hi: 'दुनिया की पहली व्यापक स्कोरिंग प्रणाली जो एक क्रांतिकारी स्कोर में पोषण और स्वाद की गुणवत्ता दोनों का मूल्यांकन करती है।'
  },
  nutritionAnalysisTitle: {
    en: 'Nutrition Analysis',
    es: 'Análisis Nutricional',
    fr: 'Analyse Nutritionnelle',
    de: 'Ernährungsanalyse',
    zh: '营养分析',
    ja: '栄養分析',
    hi: 'पोषण विश्लेषण'
  },
  nutritionAnalysisDesc: {
    en: 'Complete health impact assessment with personalized warnings',
    es: 'Evaluación completa del impacto en la salud con advertencias personalizadas',
    fr: 'Évaluation complète de l\'impact sur la santé avec des avertissements personnalisés',
    de: 'Vollständige Gesundheitsauswirkungsbewertung mit personalisierten Warnungen',
    zh: '完整的健康影响评估和个性化警告',
    ja: '個人化された警告を含む完全な健康影響評価',
    hi: 'व्यक्तिगत चेतावनियों के साथ पूर्ण स्वास्थ्य प्रभाव मूल्यांकन'
  },
  tasteEvaluationTitle: {
    en: 'Taste Evaluation',
    es: 'Evaluación del Sabor',
    fr: 'Évaluation du Goût',
    de: 'Geschmacksbewertung',
    zh: '口味评估',
    ja: '味覚評価',
    hi: 'स्वाद मूल्यांकन'
  },
  tasteEvaluationDesc: {
    en: 'Advanced flavor profiling and sensory analysis',
    es: 'Perfilado avanzado de sabores y análisis sensorial',
    fr: 'Profilage de saveur avancé et analyse sensorielle',
    de: 'Erweiterte Geschmacksprofilierung und Sensorikanalyse',
    zh: '先进的风味分析和感官分析',
    ja: '高度な風味プロファイリングと感覚分析',
    hi: 'उन्नत स्वाद प्रोफाइलिंग और संवेदी विश्लेषण'
  },
  howItWorks: {
    en: 'How FoodCheck Works',
    es: 'Cómo Funciona FoodCheck',
    fr: 'Comment FoodCheck Fonctionne',
    de: 'Wie FoodCheck Funktioniert',
    zh: 'FoodCheck如何工作',
    ja: 'FoodCheckの仕組み',
    hi: 'FoodCheck कैसे काम करता है'
  },
  step1Title: {
    en: 'Upload or Email',
    es: 'Subir o Enviar Email',
    fr: 'Télécharger ou Envoyer Email',
    de: 'Hochladen oder E-Mail',
    zh: '上传或发邮件',
    ja: 'アップロードまたはメール',
    hi: 'अपलोड या ईमेल'
  },
  step1Desc: {
    en: 'Take a photo of the nutrition label or send it via email',
    es: 'Toma una foto de la etiqueta nutricional o envíala por email',
    fr: 'Prenez une photo de l\'étiquette nutritionnelle ou envoyez-la par email',
    de: 'Machen Sie ein Foto des Nährwertetiketts oder senden Sie es per E-Mail',
    zh: '拍摄营养标签照片或通过电子邮件发送',
    ja: '栄養ラベルの写真を撮るかメールで送信',
    hi: 'पोषण लेबल की फोटो लें या ईमेल के माध्यम से भेजें'
  },
  step2Title: {
    en: 'AI Analysis',
    es: 'Análisis IA',
    fr: 'Analyse IA',
    de: 'KI-Analyse',
    zh: 'AI分析',
    ja: 'AI分析',
    hi: 'AI विश्लेषण'
  },
  step2Desc: {
    en: 'Our advanced AI analyzes nutrition, health impact, and taste',
    es: 'Nuestra IA avanzada analiza nutrición, impacto en la salud y sabor',
    fr: 'Notre IA avancée analyse la nutrition, l\'impact sur la santé et le goût',
    de: 'Unsere fortschrittliche KI analysiert Ernährung, Gesundheitsauswirkungen und Geschmack',
    zh: '我们的先进AI分析营养、健康影响和口味',
    ja: '高度なAIが栄養、健康への影響、味を分析',
    hi: 'हमारी उन्नत AI पोषण, स्वास्थ्य प्रभाव और स्वाद का विश्लेषण करती है'
  },
  step3Title: {
    en: 'Get Results',
    es: 'Obtener Resultados',
    fr: 'Obtenir les Résultats',
    de: 'Ergebnisse Erhalten',
    zh: '获得结果',
    ja: '結果を取得',
    hi: 'परिणाम प्राप्त करें'
  },
  step3Desc: {
    en: 'Receive comprehensive analysis with personalized recommendations',
    es: 'Recibe análisis completo con recomendaciones personalizadas',
    fr: 'Recevez une analyse complète avec des recommandations personnalisées',
    de: 'Erhalten Sie umfassende Analysen mit personalisierten Empfehlungen',
    zh: '获得包含个性化建议的综合分析',
    ja: '個人的な推奨事項を含む包括的な分析を受け取る',
    hi: 'व्यक्तिगत सिफारिशों के साथ व्यापक विश्लेषण प्राप्त करें'
  },
  contactUs: {
    en: 'Contact Us',
    es: 'Contáctanos',
    fr: 'Nous Contacter',
    de: 'Kontaktieren Sie Uns',
    zh: '联系我们',
    ja: 'お問い合わせ',
    hi: 'संपर्क करें'
  },
  footerDesc: {
    en: 'Empowering better food choices through comprehensive AI analysis',
    es: 'Empoderando mejores decisiones alimentarias a través de análisis integral de IA',
    fr: 'Autonomiser de meilleurs choix alimentaires grâce à une analyse IA complète',
    de: 'Bessere Lebensmittelentscheidungen durch umfassende KI-Analyse ermöglichen',
    zh: '通过全面的AI分析赋能更好的食物选择',
    ja: '包括的なAI分析を通じてより良い食品選択を支援',
    hi: 'व्यापक AI विश्लेषण के माध्यम से बेहतर भोजन विकल्पों को सशक्त बनाना'
  },
  nonProfit: {
    en: 'Non-profit initiative',
    es: 'Iniciativa sin fines de lucro',
    fr: 'Initiative à but non lucratif',
    de: 'Gemeinnützige Initiative',
    zh: '非营利倡议',
    ja: '非営利イニシアチブ',
    hi: 'गैर-लाभकारी पहल'
  },
  madeWithLove: {
    en: 'Made with ❤️ for healthier eating',
    es: 'Hecho con ❤️ para una alimentación más saludable',
    fr: 'Fait avec ❤️ pour une alimentation plus saine',
    de: 'Mit ❤️ für gesündere Ernährung gemacht',
    zh: '用❤️为更健康的饮食而制作',
    ja: 'より健康的な食事のために❤️で作られました',
    hi: 'स्वस्थ भोजन के लिए ❤️ से बनाया गया'
  }
};

function App() {
  const [showVisionAnalysis, setShowVisionAnalysis] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showChatbot, setShowChatbot] = useState(false);
  const [isFullscreenChat, setIsFullscreenChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  const { user, isAuthenticated, login, logout } = useAuth();

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('foodcheck_dark_mode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
    }

    // Initialize language from localStorage
    const savedLanguage = localStorage.getItem('foodcheck_language') as Language;
    if (savedLanguage && ['en', 'es', 'fr', 'de', 'zh', 'ja', 'hi'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('foodcheck_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('foodcheck_language', language);
  }, [language]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  };

  const languages = [
    { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
    { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
    { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
    { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
    { code: 'zh' as Language, name: '中文', flag: '🇨🇳' },
    { code: 'ja' as Language, name: '日本語', flag: '🇯🇵' },
    { code: 'hi' as Language, name: 'हिन्दी', flag: '🇮🇳' }
  ];

  const handleAuthSuccess = async (userData: { email: string; name: string }) => {
    login(userData);
    
    // Register user in email service for admin panel
    try {
      await emailService.registerUser(userData.name, userData.email);
    } catch (error) {
      // User might already be registered, that's okay
      console.log('User registration note:', error);
    }
  };

  const handleCameraAnalysis = (analysis: NutritionAnalysis) => {
    // Add analysis result to chat
    const analysisMessage = `🎉 **Analysis Complete!**

**Overall Grade: ${analysis.overall.grade}**
${analysis.overall.summary}

**Nutrition Score: ${analysis.health.score}/100**
**Taste Score: ${analysis.taste.score}/100**

${analysis.health.warnings.length > 0 ? `⚠️ **Health Warnings:**\n${analysis.health.warnings.map(w => `• ${w}`).join('\n')}\n\n` : ''}

${analysis.health.recommendations.length > 0 ? `💡 **Recommendations:**\n${analysis.health.recommendations.map(r => `• ${r}`).join('\n')}\n\n` : ''}

**Taste Profile:** ${analysis.taste.description}

Want to analyze another food or have questions about these results?`;

    setChatMessages(prev => [...prev, { type: 'bot', message: analysisMessage }]);
    setShowChatbot(true);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage('');
    
    // Add user message to chat
    const newMessages = [...chatMessages, { type: 'user' as const, message: userMessage }];
    setChatMessages(newMessages);
    setIsTyping(true);

    try {
      const response = await sendMessageToGroq(chatMessages, userMessage);
      setChatMessages(prev => [...prev, { type: 'bot', message: response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { 
        type: 'bot', 
        message: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment, or feel free to email us directly at Vrishankjo@gmail.com for food analysis.' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openRegularChat = () => {
    setIsFullscreenChat(false);
    setShowChatbot(true);
  };

  const openFullscreenChat = () => {
    setIsFullscreenChat(true);
    setShowChatbot(true);
  };

  const closeChatbot = () => {
    setShowChatbot(false);
    setIsFullscreenChat(false);
  };

  const backToHome = () => {
    setShowChatbot(false);
    setIsFullscreenChat(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-green-50 via-blue-50 to-purple-50'}`}>
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <FoodCheckLogo className="h-10 w-10" />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
                    {t('title')}
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
                </div>
              </div>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600" />
                )}
              </button>

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-1"
                  title="Change Language"
                >
                  <Globe className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {languages.find(l => l.code === language)?.flag}
                  </span>
                </button>

                {showLanguageMenu && (
                  <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-2 min-w-[150px] z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 ${
                          language === lang.code ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span className="text-sm">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => setShowVisionAnalysis(true)}
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
              >
                {t('aiAnalysis')}
              </button>
              <button 
                onClick={openRegularChat}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                {t('chatAssistant')}
              </button>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('welcomeBack')}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{user?.name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowAdminPanel(true)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Admin Panel"
                    >
                      <Settings className="h-5 w-5" />
                    </button>
                    <button
                      onClick={logout}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Logout"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                    className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
                  >
                    {t('signIn')}
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuthModal(true);
                    }}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-medium"
                  >
                    {t('signUp')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            {t('heroTitle')}
            <span className="bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent block">
              {t('heroSubtitle')}
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t('heroDescription')}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              onClick={() => setShowVisionAnalysis(true)}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center"
            >
              <Camera className="h-6 w-6 mr-3" />
              {t('startAnalysis')}
            </button>
          </div>

          {/* Email Information */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-2xl mb-12 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('emailAnalysisText')}</h3>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg inline-block border-2 border-blue-300 dark:border-blue-600">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">vrishankjo@gmail.com</p>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
              Send clear photos of nutrition labels and receive comprehensive Vish Score analysis within 1-20 minutes. Include any health conditions for personalized recommendations.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              <span>AI-Powered Analysis</span>
            </div>
            <div className="flex items-center">
              <Heart className="h-5 w-5 text-red-500 mr-2" />
              <span>Health-Focused</span>
            </div>
            <div className="flex items-center">
              <Award className="h-5 w-5 text-purple-500 mr-2" />
              <span>Vish Score System</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* AI Vision Analysis */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full w-16 h-16 mb-6 flex items-center justify-center">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('aiVisionTitle')}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {t('aiVisionDesc')}
            </p>
            <button
              onClick={() => setShowVisionAnalysis(true)}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 w-full"
            >
              {t('tryAiAnalysis')}
            </button>
          </div>

          {/* Chat Assistant */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full w-16 h-16 mb-6 flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('chatAssistantTitle')}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {t('chatAssistantDesc')}
            </p>
            
            {/* Chat Buttons */}
            <div className="space-y-3">
              <button
                onClick={openRegularChat}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 w-full flex items-center justify-center"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                {t('startChatting')}
              </button>
              
              <button
                onClick={openFullscreenChat}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 w-full flex items-center justify-center"
              >
                <Maximize className="h-5 w-5 mr-2" />
                {t('startFullscreenChat')}
              </button>
            </div>
          </div>
        </div>

        {/* Vish Score Section */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-8 md:p-12 text-white mb-16 shadow-2xl">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Award className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-4xl md:text-5xl font-bold mb-6">{t('vishScoreTitle')}</h3>
            <p className="text-xl md:text-2xl mb-8 leading-relaxed opacity-95">
              {t('vishScoreSubtitle')}
            </p>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                <BarChart3 className="h-8 w-8 mb-4 mx-auto" />
                <h4 className="text-xl font-bold mb-2">{t('nutritionAnalysisTitle')}</h4>
                <p className="opacity-90">{t('nutritionAnalysisDesc')}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
                <Heart className="h-8 w-8 mb-4 mx-auto" />
                <h4 className="text-xl font-bold mb-2">{t('tasteEvaluationTitle')}</h4>
                <p className="opacity-90">{t('tasteEvaluationDesc')}</p>
              </div>
            </div>

            {/* Vish Score Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <Zap className="h-6 w-6 mb-2 mx-auto" />
                <h5 className="font-bold mb-1">Instant Analysis</h5>
                <p className="text-sm opacity-90">Results in 1-20 minutes</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <Target className="h-6 w-6 mb-2 mx-auto" />
                <h5 className="font-bold mb-1">Dual Scoring</h5>
                <p className="text-sm opacity-90">Nutrition + Taste combined</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                <Star className="h-6 w-6 mb-2 mx-auto" />
                <h5 className="font-bold mb-1">Personalized</h5>
                <p className="text-sm opacity-90">Based on your health needs</p>
              </div>
            </div>

            <p className="text-lg opacity-90 mb-6">
              Send your nutrition label photos to <strong>vrishankjo@gmail.com</strong> to experience the revolutionary Vish Score analysis!
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-12">{t('howItWorks')}</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('step1Title')}</h4>
              <p className="text-gray-600 dark:text-gray-300">{t('step1Desc')}</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('step2Title')}</h4>
              <p className="text-gray-600 dark:text-gray-300">{t('step2Desc')}</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('step3Title')}</h4>
              <p className="text-gray-600 dark:text-gray-300">{t('step3Desc')}</p>
            </div>
          </div>
        </div>

        {/* What Makes Vish Score Special */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 mb-16 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">What Makes Vish Score Revolutionary?</h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Unlike traditional nutrition apps that only focus on calories and macros, Vish Score provides a holistic view of your food.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl">
              <div className="bg-green-500 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Nutrition Deep Dive</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Complete macro and micronutrient analysis with health impact assessment</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
              <div className="bg-purple-500 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Taste Science</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Advanced flavor profiling using sensory analysis and consumer preference data</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl">
              <div className="bg-yellow-500 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Personalized Warnings</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Custom health alerts based on your specific conditions and dietary needs</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
              <div className="bg-blue-500 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">Unified Score</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Single comprehensive rating that balances health benefits with taste satisfaction</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              Ready to experience the future of food analysis? Send your nutrition label photos to:
            </p>
            <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg inline-block">
              <p className="text-xl font-bold text-gray-900 dark:text-white">vrishankjo@gmail.com</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <FoodCheckLogo className="h-8 w-8" />
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
                {t('title')}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('footerDesc')}
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <a href="mailto:vrishankjo@gmail.com" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
                {t('contactUs')}
              </a>
              <span>•</span>
              <span>{t('nonProfit')}</span>
              <span>•</span>
              <span>{t('madeWithLove')}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showVisionAnalysis && (
        <VisionAnalysis 
          onClose={() => setShowVisionAnalysis(false)}
          onCameraAnalysis={handleCameraAnalysis}
        />
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {showAdminPanel && (
        <AdminPanel
          isOpen={showAdminPanel}
          onClose={() => setShowAdminPanel(false)}
        />
      )}

      {/* Chatbot */}
      {showChatbot && (
        <div className={`fixed ${isFullscreenChat ? 'inset-0' : 'inset-0 flex items-center justify-center p-4'} bg-black bg-opacity-50 z-50`}>
          <div className={`bg-white dark:bg-gray-800 ${isFullscreenChat ? 'w-full h-full' : 'rounded-2xl max-w-2xl w-full max-h-[80vh]'} flex flex-col transition-colors duration-300`}>
            {/* Chat Header */}
            <div className={`bg-gradient-to-r from-blue-500 to-purple-500 p-6 ${isFullscreenChat ? '' : 'rounded-t-2xl'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-full">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">AI Nutrition Assistant</h3>
                    <p className="text-blue-100">Ask me anything about food, nutrition, and Vish Score!</p>
                  </div>
                </div>
                
                {/* Header Controls */}
                <div className="flex items-center space-x-2">
                  {/* Back to Home button (only in fullscreen) - CENTERED */}
                  {isFullscreenChat && (
                    <div className="absolute left-1/2 transform -translate-x-1/2">
                      <button 
                        onClick={backToHome}
                        className="text-white hover:text-gray-200 transition-colors p-3 rounded-lg hover:bg-white/10 flex items-center space-x-2 bg-white/5 border border-white/20"
                        title={t('backToHome')}
                      >
                        <Home className="h-5 w-5" />
                        <span className="text-sm font-medium">{t('backToHome')}</span>
                      </button>
                    </div>
                  )}
                  
                  {/* Toggle fullscreen button */}
                  <button 
                    onClick={() => setIsFullscreenChat(!isFullscreenChat)}
                    className="text-white hover:text-gray-200 transition-colors p-1"
                    title={isFullscreenChat ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  >
                    {isFullscreenChat ? (
                      <Minimize className="h-5 w-5" />
                    ) : (
                      <Maximize className="h-5 w-5" />
                    )}
                  </button>
                  
                  {/* Close button */}
                  <button 
                    onClick={closeChatbot}
                    className="text-white hover:text-gray-200 transition-colors text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Welcome to FoodCheck AI!</p>
                  <p className="text-sm">Ask me about nutrition, health conditions, or our revolutionary Vish Score system.</p>
                  <div className="mt-4 space-y-2 text-xs">
                    <p className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg inline-block">
                      "What is the Vish Score?"
                    </p>
                    <p className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg inline-block">
                      "How does taste analysis work?"
                    </p>
                    <p className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg inline-block">
                      "Analyze food for diabetes"
                    </p>
                  </div>
                </div>
              )}
              
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    msg.type === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-600">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about nutrition, health, Vish Score, or food analysis..."
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors duration-300"
                  disabled={isTyping}
                />
                <button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close language menu */}
      {showLanguageMenu && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowLanguageMenu(false)}
        />
      )}
    </div>
  );
}

export default App;