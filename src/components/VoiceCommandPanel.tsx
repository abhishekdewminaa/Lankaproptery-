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

const SoundWaveRings = () => (
  <div style={{
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '60px',
    height: '60px',
    zIndex: 9998,
    pointerEvents: 'none'
  }}>
    {[1, 2, 3].map(i => (
      <div
        key={i}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: '2px solid #CC2222',
          animation: `ringExpand 1.5s ease-out infinite`,
          animationDelay: `${i * 0.4}s`,
          opacity: 0
        }}
      />
    ))}
  </div>
);

const ListeningOverlay = ({ transcript }: { transcript: string }) => (
  <div style={{
    position: 'fixed',
    bottom: '110px',
    right: '20px',
    background: 'rgba(0,0,0,0.92)',
    backdropFilter: 'blur(12px)',
    borderRadius: '20px',
    padding: '24px',
    width: '300px',
    zIndex: 9998,
    animation: 'slideUpFade 0.3s ease'
  }}>
    {/* TOP - Status */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '16px'
    }}>
      <div style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: '#CC2222',
        animation: 'blink 1s infinite'
      }} />
      <span style={{ 
        color: 'white', 
        fontWeight: '600',
        fontSize: '14px'
      }}>
        Listening...
      </span>
    </div>

    {/* MIDDLE - Sound bars animation */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      height: '50px',
      marginBottom: '16px'
    }}>
      {[1,2,3,4,5,6,7,8,9,10].map(i => (
        <div
          key={i}
          style={{
            width: '4px',
            borderRadius: '2px',
            background: '#00FF87',
            animation: `soundBar 0.8s ease infinite alternate`,
            animationDelay: `${i * 0.08}s`
          }}
        />
      ))}
    </div>

    {/* BOTTOM - Live transcript */}
    <div style={{
      background: 'rgba(255,255,255,0.08)',
      borderRadius: '12px',
      padding: '12px',
      minHeight: '50px'
    }}>
      {transcript ? (
        <p style={{ 
          color: '#00FF87',
          fontSize: '14px',
          margin: 0,
          fontWeight: 'bold'
        }}>
          "{transcript}"
        </p>
      ) : (
        <p style={{ 
          color: '#6B7280',
          fontSize: '13px',
          margin: 0
        }}>
          Say a command...
        </p>
      )}
    </div>

    <p style={{
      color: '#6B7280',
      fontSize: '11px',
      marginTop: '12px',
      marginBottom: 0,
      textAlign: 'center'
    }}>
      Tap mic again to stop
    </p>
  </div>
);

const TopListeningBar = ({ isListening }: { isListening: boolean }) => (
  isListening ? (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: 'linear-gradient(90deg, #004F31, #CC2222, #004F31)',
      backgroundSize: '200% 100%',
      animation: 'scanLine 1.5s linear infinite',
      zIndex: 99999
    }} />
  ) : null
);

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
    
    const showSuccess = (action: string) => {
      setLastAction(action);
      // Success animation: Flash green border around whole page
      const originalBoxShadow = document.body.style.boxShadow;
      document.body.style.boxShadow = 'inset 0 0 0 5px #004F31';
      setTimeout(() => {
        document.body.style.boxShadow = originalBoxShadow;
      }, 600);
    };

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
      showSuccess(`🔍 Searching${filters.category ? ' for ' + filters.category : ''}${filters.district ? ' in ' + filters.district : ''}`);
      return;
    }

    // ── NAVIGATION COMMANDS ───────────────
    if (command.includes('go to home') || command.includes('homepage') || command.includes('ප්‍රධාන පිටුව')) {
      onNavigateHome();
      showSuccess('🏠 Going home');
      return;
    }

    if (command.includes('find agent') || command.includes('show agents') || command.includes('නියෝජිතයන්')) {
      onNavigate({ type: 'agents' });
      showSuccess('👤 Opening agents page');
      return;
    }

    if (command.includes('open admin') || command.includes('admin panel') || command.includes('ඇඩ්මින්')) {
      onNavigate({ type: 'secret_login' });
      showSuccess('🔐 Opening admin');
      return;
    }

    if (command.includes('post ad') || command.includes('add property') || command.includes('new listing') || command.includes('දැන්වීමක්')) {
      onNavigate({ type: 'publish' });
      showSuccess('📝 Opening publish form');
      return;
    }

    // ── FILTER COMMANDS ───────────────────
    const bedroomMatch = command.match(/(\d+) bedroom/);
    if (bedroomMatch) {
      // Assuming App.tsx can handle this via some global filter state or by navigating with filters
      onSearch({ bedrooms: parseInt(bedroomMatch[1]) });
      showSuccess(`🛏️ ${bedroomMatch[1]} bedrooms`);
      return;
    }

    if (command.includes('clear') || command.includes('reset') || command.includes('අයින් කරන්න')) {
      onClearFilters();
      showSuccess('✅ Filters cleared');
      return;
    }

    // ── CALCULATOR COMMANDS ───────────────
    if (command.includes('calculate') || command.includes('price estimate') || command.includes('ගණනය')) {
      const el = document.getElementById('price-calculator');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else onNavigateHome(); // Ensure we are on home where calculator is
      showSuccess('🧮 Opening calculator');
      return;
    }

    // ── DARK MODE ─────────────────────────
    if (command.includes('dark mode') || command.includes('night mode') || command.includes('කළු')) {
      document.documentElement.classList.add('dark');
      onToggleDarkMode();
      showSuccess('🌙 Dark mode on');
      return;
    }

    if (command.includes('light mode') || command.includes('එළිය')) {
      document.documentElement.classList.remove('dark');
      onToggleDarkMode();
      showSuccess('☀️ Light mode on');
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
      showSuccess('📞 Scrolling to contact');
      return;
    }

    // Unknown command
    setLastAction(`❓ Not recognized: "${command}"`);
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <>
      <TopListeningBar isListening={isListening} />
      {isListening && <SoundWaveRings />}
      
      <div className="fixed bottom-24 right-8 z-[200] flex flex-col items-end gap-4">
        {/* Voice Feedback Overlay */}
        <AnimatePresence>
          {isListening && (
            <ListeningOverlay transcript={transcript} />
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
              onClick={handleMicClick}
              onContextMenu={(e) => {
                e.preventDefault();
                setShowHelp(true);
              }}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-95 z-[201] relative ${
                !isSupported || isPreviewEnv ? 'bg-gray-200 cursor-not-allowed' :
                isListening ? 'bg-[#CC2222] animate-[micPulse_1s_ease_infinite] shadow-[#CC2222]/30' : 'bg-brand-green hover:bg-brand-green-medium'
              }`}
            >
              <Mic size={28} className="text-white" />
            </button>
            
            {/* Tooltip */}
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-dark-navy text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
              {isPreviewEnv ? 'Voice commands work on live site (lankaproperty.lk)' : (isSupported ? 'Click for Voice / Right-click for Help' : 'Voice not supported in this browser')}
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
    </>
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
