import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X, HelpCircle, CheckCircle, Search, Home, User, PlusCircle, Trash2, Moon, Sun, Calculator, ArrowDown, ArrowUp, Phone } from 'lucide-react';

interface VoiceCommandPanelProps {
  onCommandReached: (command: string) => void;
  onNavigateHome: () => void;
  onNavigate: (view: any) => void;
  onSearch: (filters: any) => void;
  onClearFilters: () => void;
  onToggleDarkMode: () => void;
}

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 
  'Moneragala', 'Ratnapura', 'Kegalle'
];

export const VoiceCommandPanel: React.FC<VoiceCommandPanelProps> = ({
  onNavigateHome,
  onNavigate,
  onSearch,
  onClearFilters,
  onToggleDarkMode
}) => {
  const [isListening, setIsListening] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showMicInstructions, setShowMicInstructions] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en-US' | 'si-LK'>('en-US');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);
  const longPressTimerRef = useRef<any>(null);

  const isPreviewEnv = 
    !window.location.hostname.includes('lankaproperty.lk') &&
    !window.location.hostname.includes('localhost');

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setLastAction(null);
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const result = event.results[current][0].transcript;
      setTranscript(result);

      if (event.results[current].isFinal) {
        processCommand(result.toLowerCase());
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        console.log('Mic not allowed - preview env');
        return;
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [language]);

  const startListening = async () => {
    if (!isSupported || isPreviewEnv) return;
    
    // Check permission first
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const permission = await navigator.permissions.query({ name: 'microphone' as any });
        if (permission.state === 'denied') {
          setShowMicInstructions(true);
          return;
        }
      }
      
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Permission granted, start recognition
      recognitionRef.current.start();
    } catch (err) {
      console.error('Failed to start recognition', err);
      setShowMicInstructions(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const processCommand = (command: string) => {
    console.log('Processing voice command:', command);
    
    // ── SEARCH COMMANDS ──────────────────
    if (command.includes('show') || command.includes('search') || command.includes('find') || command.includes('සොයන්න') || command.includes('පෙන්වන්න')) {
      const filters: any = {};
      
      // Property Type
      if (command.includes('house') || command.includes('ගෙවල්')) filters.category = 'House';
      if (command.includes('land') || command.includes('ඉඩම්')) filters.category = 'Land';
      if (command.includes('apartment') || command.includes('ඇපාර්ට්මන්ට්')) filters.category = 'Apartment';
      if (command.includes('villa') || command.includes('විලා')) filters.category = 'Villa';
      
      // District
      DISTRICTS.forEach(district => {
        if (command.includes(district.toLowerCase())) {
          filters.district = district;
        }
      });

      // Special check for Sinhala districts if needed, but usually transcript gives English names for locations even in Sinhala mode sometimes, or we can add Sinhala names
      const sinhalaDistricts: {[key: string]: string} = {
        'කොළඹ': 'Colombo',
        'ගම්පහ': 'Gampaha',
        'මහනුවර': 'Kandy',
        'ගාල්ල': 'Galle'
      };
      Object.entries(sinhalaDistricts).forEach(([sin, eng]) => {
        if (command.includes(sin)) filters.district = eng;
      });
      
      // Listing Type
      if (command.includes('rent') || command.includes('කුලියට')) filters.mode = 'rent';
      if (command.includes('sale') || command.includes('buy') || command.includes('විකුණන්න')) filters.mode = 'buy';
      
      // Price
      const priceMatch = command.match(/under (\d+) million/) || command.match(/මිලියන (\d+)/);
      if (priceMatch) {
        filters.maxPrice = parseInt(priceMatch[1]) * 1000000;
      }
      
      onSearch(filters);
      setLastAction(`🔍 Searching${filters.category ? ' for ' + filters.category : ''}${filters.district ? ' in ' + filters.district : ''}`);
      return;
    }

    // ── NAVIGATION COMMANDS ───────────────
    if (command.includes('go to home') || command.includes('homepage') || command.includes('ප්‍රධාන පිටුව')) {
      onNavigateHome();
      setLastAction('🏠 Going home');
      return;
    }

    if (command.includes('find agent') || command.includes('show agents') || command.includes('නියෝජිතයන්')) {
      onNavigate({ type: 'agents' });
      setLastAction('👤 Opening agents page');
      return;
    }

    if (command.includes('open admin') || command.includes('admin panel') || command.includes('ඇඩ්මින්')) {
      onNavigate({ type: 'secret_login' });
      setLastAction('🔐 Opening admin');
      return;
    }

    if (command.includes('post ad') || command.includes('add property') || command.includes('new listing') || command.includes('දැන්වීමක්')) {
      onNavigate({ type: 'publish' });
      setLastAction('📝 Opening publish form');
      return;
    }

    // ── FILTER COMMANDS ───────────────────
    const bedroomMatch = command.match(/(\d+) bedroom/);
    if (bedroomMatch) {
      // Assuming App.tsx can handle this via some global filter state or by navigating with filters
      onSearch({ bedrooms: parseInt(bedroomMatch[1]) });
      setLastAction(`🛏️ ${bedroomMatch[1]} bedrooms`);
      return;
    }

    if (command.includes('clear') || command.includes('reset') || command.includes('අයින් කරන්න')) {
      onClearFilters();
      setLastAction('✅ Filters cleared');
      return;
    }

    // ── CALCULATOR COMMANDS ───────────────
    if (command.includes('calculate') || command.includes('price estimate') || command.includes('ගණනය')) {
      const el = document.getElementById('price-calculator');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else onNavigateHome(); // Ensure we are on home where calculator is
      setLastAction('🧮 Opening calculator');
      return;
    }

    // ── DARK MODE ─────────────────────────
    if (command.includes('dark mode') || command.includes('night mode') || command.includes('කළු')) {
      document.documentElement.classList.add('dark');
      onToggleDarkMode();
      setLastAction('🌙 Dark mode on');
      return;
    }

    if (command.includes('light mode') || command.includes('එළිය')) {
      document.documentElement.classList.remove('dark');
      onToggleDarkMode();
      setLastAction('☀️ Light mode on');
      return;
    }

    // ── SCROLL COMMANDS ───────────────────
    if (command.includes('scroll down') || command.includes('පහළට')) {
      window.scrollBy({ top: 500, behavior: 'smooth' });
      return;
    }

    if (command.includes('scroll up') || command.includes('go to top') || command.includes('ඉහළට')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // ── CONTACT COMMANDS ──────────────────
    if (command.includes('contact agent') || command.includes('call agent') || command.includes('ඇමතීමට')) {
      const el = document.getElementById('agent-card');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      setLastAction('📞 Scrolling to contact');
      return;
    }

    // Unknown command
    setLastAction(`❓ Not recognized: "${command}"`);
  };

  const handleMouseDown = () => {
    longPressTimerRef.current = setTimeout(() => {
      setShowHelp(true);
    }, 600);
  };

  const handleMouseUp = () => {
    clearTimeout(longPressTimerRef.current);
    if (!showHelp && !isListening) {
      startListening();
    } else if (isListening) {
      stopListening();
    }
  };

  return (
    <div className="fixed bottom-24 right-8 z-[200] flex flex-col items-end gap-4">
      {/* Voice Feedback Popup */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="bg-white rounded-[24px] shadow-2xl p-6 border border-gray-100 w-64 mb-2 overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-green/10" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                <Mic size={16} className="text-white" />
              </div>
              <span className="text-sm font-black text-dark-navy uppercase tracking-widest">Listening...</span>
            </div>
            
            <div className="min-h-[40px] mb-4">
              <p className="text-sm font-medium text-gray-500 italic">
                {transcript || '"Show houses in Colombo"'}
              </p>
            </div>

            <div className="flex gap-2 items-center overflow-hidden h-6">
              {[...Array(6)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ 
                    height: [8, Math.random() * 20 + 4, 8],
                  }}
                  transition={{ 
                    duration: 0.5, 
                    repeat: Infinity,
                    delay: i * 0.1
                  }}
                  className="w-1 bg-brand-green rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Success Feedback */}
      <AnimatePresence>
        {lastAction && !isListening && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-brand-navy text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl border border-white/10"
          >
            <CheckCircle size={12} className="text-brand-green" />
            {lastAction}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center gap-3">
        {/* Language Switch */}
        <div className="bg-white p-1 rounded-full shadow-lg border border-gray-100 flex gap-1">
          <button 
            onClick={() => setLanguage('en-US')}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${language === 'en-US' ? 'bg-brand-navy text-white' : 'text-gray-400 hover:text-dark-navy'}`}
          >
            EN
          </button>
          <button 
            onClick={() => setLanguage('si-LK')}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${language === 'si-LK' ? 'bg-brand-navy text-white' : 'text-gray-400 hover:text-dark-navy'}`}
          >
            සිං
          </button>
        </div>

        {/* Main Mic Button */}
        <div className="relative group">
          <button
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-90 ${
              !isSupported ? 'bg-gray-200 cursor-not-allowed' :
              isListening ? 'bg-red-500 scale-110 shadow-red-500/30' : 'bg-brand-green hover:bg-brand-green-medium'
            }`}
          >
            {isListening ? <Mic size={28} className="text-white" /> : <Mic size={28} className="text-white" />}
            
            {/* Pulsing ring when listening */}
            {isListening && (
              <span className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75" />
            )}
          </button>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-dark-navy text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
            {isPreviewEnv ? 'Voice commands work on live site (lankaproperty.lk)' : (isSupported ? 'Hold for help / Click for Voice' : 'Voice not supported in this browser')}
          </div>
        </div>
      </div>

      {/* Mic Instructions Card */}
      <AnimatePresence>
        {showMicInstructions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            className="fixed bottom-[100px] right-8 bg-white rounded-[32px] shadow-2xl p-8 border border-gray-100 max-w-[320px] z-[300]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center">
                <Mic className="text-brand-green" size={20} />
              </div>
              <h4 className="text-lg font-black text-dark-navy">Enable Microphone</h4>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-6">
              To use voice commands, please allow microphone access:
            </p>
            <ol className="space-y-4 mb-8">
              {[
                'Click the 🔒 lock icon in browser address bar',
                'Find "Microphone" setting',
                'Change to "Allow"',
                'Refresh the page'
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-xs font-bold text-gray-700">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            <button 
              onClick={() => setShowMicInstructions(false)}
              className="w-full py-4 bg-brand-green text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-xl shadow-brand-green/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Got it ✓
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark-navy/60 backdrop-blur-md z-[300] flex items-center justify-center p-6"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-brand-green p-8 text-white relative">
                <button 
                  onClick={() => setShowHelp(false)}
                  className="absolute top-8 right-8 text-white/60 hover:text-white"
                >
                  <X size={24} />
                </button>
                <div className="flex items-center gap-4 mb-2">
                  <Mic className="text-yellow-400" size={32} />
                  <h2 className="text-3xl font-black tracking-tight">Voice Commands</h2>
                </div>
                <p className="text-white/60 font-medium">Control LankaProperty using your voice</p>
              </div>

              <div className="p-8 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <HelpSection 
                    title="Search" 
                    icon={<Search size={18} />}
                    commands={['"Show houses in Colombo"', '"Search apartments for rent"', '"Find land under 10 million"']} 
                  />
                  <HelpSection 
                    title="Navigate" 
                    icon={<PlusCircle size={18} />}
                    commands={['"Go to home"', '"Find agent"', '"Post free ad"']} 
                  />
                  <HelpSection 
                    title="Filters" 
                    icon={<ArrowDown size={18} />}
                    commands={['"3 bedrooms"', '"Clear filters"', '"Sort by price"']} 
                  />
                  <HelpSection 
                    title="Other" 
                    icon={<Moon size={18} />}
                    commands={['"Dark mode"', '"Scroll down"', '"Calculate price"']} 
                  />
                </div>
                
                <div className="mt-12 bg-gray-50 p-6 rounded-[24px]">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CheckCircle size={14} className="text-brand-green" /> Sinhala Support
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-dark-navy">"ගෙවල් පෙන්වන්න" (Show houses)</p>
                    <p className="text-sm font-bold text-dark-navy">"කොළඹ දිස්ත්‍රික්කය" (District Colombo)</p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-center">
                <button 
                  onClick={() => setShowHelp(false)}
                  className="px-12 py-4 bg-dark-navy text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HelpSection = ({ title, icon, commands }: { title: string, icon: React.ReactNode, commands: string[] }) => (
  <div className="space-y-4">
    <h3 className="text-xs font-black text-brand-green uppercase tracking-widest flex items-center gap-2">
      {icon} {title}
    </h3>
    <div className="space-y-3">
      {commands.map((cmd, i) => (
        <p key={i} className="text-sm font-bold text-dark-navy hover:text-brand-green transition-colors cursor-pointer">
          {cmd}
        </p>
      ))}
    </div>
  </div>
);
