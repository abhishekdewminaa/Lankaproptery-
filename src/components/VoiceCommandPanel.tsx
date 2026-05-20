import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X, HelpCircle, CheckCircle, Search, Home, User, PlusCircle, Trash2, Moon, Sun, Calculator, ArrowDown, ArrowUp, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface VoiceCommandPanelProps {
  onCommandReached: (command: string) => void;
  onNavigateHome: () => void;
  onNavigate: (view: any) => void;
  onSearch: (filters: any) => void;
  onClearFilters: () => void;
  onToggleDarkMode: () => void;
  onStatusChange?: (status: 'idle' | 'listening' | 'paused') => void;
}

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya', 
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar', 
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla', 
  'Moneragala', 'Ratnapura', 'Kegalle'
];

const VoiceVisualizer = ({ isListening }: { isListening: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (isListening) {
      initVisualizer()
    } else {
      cleanup()
    }
    return cleanup
  }, [isListening])

  const initVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 128
      analyser.smoothingTimeConstant = 0.85
      source.connect(analyser)
      analyserRef.current = analyser
      renderFrame()
    } catch(e) {
      console.log('Mic not available for direct visualizer analysis, using simulated reactive wave')
      renderFrame()
    }
  }

  const renderFrame = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx2d = canvas.getContext('2d')
    if (!ctx2d) return

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw)

      const W = canvas.width
      const H = canvas.height
      ctx2d.clearRect(0, 0, W, H)

      const bars = 40
      const barW = W / bars
      const centerY = H / 2

      const simulatedData: number[] = []
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)
        for (let i = 0; i < bars; i++) {
          simulatedData.push(dataArray[Math.floor(i * dataArray.length / bars)]);
        }
      } else {
        const time = Date.now() * 0.007;
        for (let i = 0; i < bars; i++) {
          const distanceToCenter = Math.abs(i - bars / 2) / (bars / 2); // 0 to 1
          const centerWeight = Math.cos(distanceToCenter * Math.PI / 2); // bells shape
          const wave1 = Math.sin(i * 0.25 - time) * 0.5 + 0.5;
          const wave2 = Math.cos(i * 0.12 + time * 1.3) * 0.4 + 0.4;
          const noise = Math.random() * 0.15; // random jitter to simulate micro-vibrations
          const pulse = Math.sin(time * 0.6) * 0.2 + 0.8;
          const val = Math.floor((wave1 * 0.55 + wave2 * 0.35 + noise * 0.1) * centerWeight * pulse * 230);
          simulatedData.push(val);
        }
      }

      for (let i = 0; i < bars; i++) {
        const value = simulatedData[i]
        const percent = value / 255
        const barH = Math.max(5, percent * H * 0.85)

        const gradient = ctx2d.createLinearGradient(0, centerY - barH/2, 0, centerY + barH/2)
        gradient.addColorStop(0, `rgba(0, 255, 135, ${0.4 + percent * 0.6})`)
        gradient.addColorStop(0.5, `rgba(0, 79, 49, ${0.8 + percent * 0.2})`)
        gradient.addColorStop(1, `rgba(0, 255, 135, ${0.4 + percent * 0.6})`)

        ctx2d.fillStyle = gradient
        ctx2d.beginPath()
        
        const x = i * barW + barW * 0.15
        const w = barW * 0.7
        const r = Math.min(w/2, 4)
        
        if ((ctx2d as any).roundRect) {
            (ctx2d as any).roundRect(x, centerY - barH/2, w, barH, r)
        } else {
            ctx2d.rect(x, centerY - barH/2, w, barH)
        }
        ctx2d.fill()
      }
    }
    draw()
  }

  const cleanup = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
  }

  return (
    <canvas
      ref={canvasRef}
      width={252}
      height={72}
      style={{
        width: '100%',
        height: '72px',
        display: 'block'
      }}
    />
  )
}

const ListeningOverlay = ({ 
    transcript, 
    status, 
    onPause, 
    onResume, 
    onStop,
    onTypeCommand
}: { 
    transcript: string; 
    status: 'listening' | 'paused'; 
    onPause: () => void;
    onResume: () => void;
    onStop: () => void;
    onTypeCommand: (cmd: string) => void;
}) => (
  <>
    {/* Dark backdrop */}
    <div
      onClick={onStop}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(5px)',
        zIndex: 9997,
        animation: 'fadeIn 0.3s ease'
      }}
    />

    {/* Popup card */}
    <div style={{
      position: 'fixed',
      bottom: '100px',
      right: '24px',
      width: '320px',
      background: 'linear-gradient(145deg, #111827, #0D1117)',
      borderRadius: '24px',
      padding: '24px',
      zIndex: 9998,
      border: '1px solid rgba(0,255,135,0.2)',
      boxShadow: `
        0 25px 50px rgba(0,0,0,0.6),
        0 0 0 1px rgba(0,255,135,0.1),
        inset 0 1px 0 rgba(255,255,255,0.05)
      `,
      animation: 'popupSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      pointerEvents: 'auto'
    }}>

      {/* TOP STATUS ROW */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {/* Blinking dot */}
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 
              status === 'listening' ? '#CC2222' :
              status === 'paused' ? '#F5A623' :
              '#6B7280',
            animation: status === 'listening' ?
              'blink 1.0s ease infinite' : 'none',
            boxShadow: status === 'listening' ?
              '0 0 8px #CC2222' : 'none'
          }} />
          <span style={{
            color: 'white',
            fontSize: '15px',
            fontWeight: '700',
            letterSpacing: '0.3px'
          }}>
            {status === 'listening' && 'Listening...'}
            {status === 'paused' && 'Paused'}
          </span>
        </div>

        {/* Close X button */}
        <button
          onClick={onStop}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            color: '#9CA3AF',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          ✕
        </button>
      </div>

      {/* REAL FREQUENCY WAVE */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        border: '1px solid rgba(0,255,135,0.08)'
      }}>
        <VoiceVisualizer isListening={status === 'listening'} />
      </div>

      {/* LIVE TRANSCRIPT */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '12px',
        padding: '14px',
        marginBottom: '16px',
        minHeight: '52px',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        {transcript ? (
          <p style={{
            color: transcript.toLowerCase().includes('permission') || transcript.toLowerCase().includes('error') ? '#FFA8A8' : '#00FF87',
            fontSize: '14px',
            margin: 0,
            lineHeight: '1.5',
            animation: 'fadeIn 0.3s ease'
          }}>
            "{transcript}"
          </p>
        ) : (
          <p style={{
            color: '#4B5563',
            fontSize: '13px',
            margin: 0,
            fontStyle: 'italic'
          }}>
            Say a command...
          </p>
        )}
      </div>

      {/* PAUSE / RESUME BUTTON */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={status === 'listening' ? onPause : onResume}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            background: status === 'listening' ?
              'rgba(245,166,35,0.15)' :
              'rgba(0,255,135,0.1)',
            color: status === 'listening' ?
              '#FFE0B2' : '#00FF87',
            border: `1px solid ${
              status === 'listening' ?
              'rgba(245,166,35,0.3)' :
              'rgba(0,255,135,0.2)'
            }`,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {status === 'listening' ? (
            <><MicOff size={15} /> Pause</>
          ) : (
            <><Mic size={15} /> Resume</>
          )}
        </button>
      </div>

      {/* TEXT FALLBACK INPUT */}
      <div style={{
        borderTop: '1px dashed rgba(255,255,255,0.1)',
        paddingTop: '16px'
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <input
            type="text"
            placeholder="Or type a command..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                if (target.value.trim()) {
                  onTypeCommand(target.value);
                  target.value = '';
                }
              }
            }}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(0,255,135,0.2)',
              borderRadius: '12px',
              padding: '10px 14px',
              color: 'white',
              fontSize: '13px',
              outline: 'none',
              transition: 'all 0.2s'
            }}
          />
          <button
            onClick={(e) => {
              const input = e.currentTarget.previousSibling as HTMLInputElement;
              if (input && input.value.trim()) {
                onTypeCommand(input.value);
                input.value = '';
              }
            }}
            style={{
              background: '#00FF87',
              color: '#0A0F1D',
              border: 'none',
              borderRadius: '12px',
              padding: '0 16px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '12px',
              transition: 'all 0.2s'
            }}
          >
            Run
          </button>
        </div>

        {/* Dynamic Suggestions */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          {['Show houses in Colombo', 'Post free ad', 'Calculate price', 'Dark mode'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onTypeCommand(suggestion)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '4px 8px',
                color: '#9CA3AF',
                fontSize: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,255,135,0.1)';
                e.currentTarget.style.borderColor = 'rgba(0,255,135,0.3)';
                e.currentTarget.style.color = '#00FF87';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.color = '#9CA3AF';
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

    </div>
  </>
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

export const VoiceCommandPanel: React.FC<VoiceCommandPanelProps & { isForceListening?: boolean; onToggleListening?: () => void }> = ({
  onNavigateHome,
  onNavigate,
  onSearch,
  onClearFilters,
  onToggleDarkMode,
  isForceListening,
  onToggleListening,
  onStatusChange,
  onCommandReached
}) => {
  const [status, setStatus] = useState<'idle' | 'listening' | 'paused'>('idle');
  const statusRef = useRef(status);
  
  useEffect(() => {
    statusRef.current = status;
    if (onStatusChange) onStatusChange(status);
  }, [status]);

  const isListening = status === 'listening';
  const isPaused = status === 'paused';

  const [showHelp, setShowHelp] = useState(false);
  const [showMicInstructions, setShowMicInstructions] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en-US' | 'si-LK'>('en-US');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const micBlockedRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setStatus('listening');
      setTranscript('');
      setLastAction(null);
    };

    recognition.onresult = (event: any) => {
      const results = event.results;
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < results.length; ++i) {
        if (results[i].isFinal) {
          finalTranscript += results[i][0].transcript;
          processCommand(finalTranscript.toLowerCase());
          // After a command is recognized, we keep listening but clear transcript
          setTranscript('');
        } else {
          interimTranscript += results[i][0].transcript;
          setTranscript(interimTranscript);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'permission-denied' || event.error === 'service-not-allowed') {
        micBlockedRef.current = true;
        setShowMicInstructions(true);
        setStatus('listening');
        setTranscript('Microphone access blocked. Please try typing your command below!');
      } else {
        setStatus('idle');
        if (onToggleListening) onToggleListening();
      }
    };

    recognition.onend = () => {
      // If we are still in listening state but recognition ended naturally (e.g. silence), restart it unless we manually paused or mic is blocked
      if (statusRef.current === 'listening' && !micBlockedRef.current) {
        try {
          recognition.start();
        } catch (e) {
            // Already started or other error
        }
      }
    };

    recognitionRef.current = recognition;
  }, [language]);

  const startListening = async () => {
    if (micBlockedRef.current) {
      setStatus('listening');
      setTranscript('Microphone access blocked. Please type your command.');
      return;
    }

    if (isSupported && recognitionRef.current) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start recognition due to permissions', err);
        micBlockedRef.current = true;
        setShowMicInstructions(true);
        setStatus('listening');
        setTranscript('Microphone access blocked. Please type your command.');
      }
    } else {
      // Fallback for browsers without Web Speech recognition or inside restricted workspaces
      setStatus('listening');
      setTranscript('Web Speech is limited in this environment. Try typing your query.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setStatus('idle');
    }
  };

  useEffect(() => {
    if (isForceListening) {
      if ((window as any).voiceDefaultLanguage) {
        setLanguage((window as any).voiceDefaultLanguage);
        // Clear it so it doesn't persistently override
        delete (window as any).voiceDefaultLanguage;
      }
      if (status === 'idle' && recognitionRef.current) {
        startListening();
      }
    } else if (!isForceListening && status !== 'idle' && recognitionRef.current) {
      stopListening();
    }
  }, [isForceListening]);

  const handleStop = () => {
    stopListening();
    if (onToggleListening) onToggleListening();
  };

  const handlePause = () => {
      recognitionRef.current?.stop();
      setStatus('paused');
  };

  const handleResume = () => {
      recognitionRef.current?.start();
      setStatus('listening');
  };

  const processCommand = (command: string) => {
    console.log('Processing voice command:', command);
    const cmdClean = command.trim().toLowerCase();
    
    const showSuccess = (action: string) => {
      setLastAction(action);
      // Success animation: Flash green border around whole page
      const originalBoxShadow = document.body.style.boxShadow;
      document.body.style.boxShadow = 'inset 0 0 0 5px #004F31';
      setTimeout(() => {
        document.body.style.boxShadow = originalBoxShadow;
      }, 600);
    };

    // Propagate the raw message to dynamic active listeners like publish page form
    onCommandReached(command);

    // ── SEARCH COMMANDS ──────────────────
    if (cmdClean.includes('show') || cmdClean.includes('search') || cmdClean.includes('find') || cmdClean.includes('සොයන්න') || cmdClean.includes('පෙන්වන්න')) {
      const filters: any = {};
      
      // Property Type
      if (cmdClean.includes('house') || cmdClean.includes('houses') || cmdClean.includes('ගෙවල්')) {
        filters.category = 'House';
      } else if (cmdClean.includes('apartment') || cmdClean.includes('apartments') || cmdClean.includes('ඇපාර්ට්මන්ට්')) {
        filters.category = 'Apartment';
      } else if (cmdClean.includes('land') || cmdClean.includes('lands') || cmdClean.includes('ඉඩම්')) {
        filters.category = 'Land';
      } else if (cmdClean.includes('villa') || cmdClean.includes('villas') || cmdClean.includes('විලා')) {
        filters.category = 'Villa';
      }
      
      // District
      DISTRICTS.forEach(district => {
        if (cmdClean.includes(district.toLowerCase())) {
          filters.district = district;
        }
      });

      const sinhalaDistricts: {[key: string]: string} = {
        'කොළඹ': 'Colombo',
        'ගම්පහ': 'Gampaha',
        'මහනුවර': 'Kandy',
        'ගාල්ල': 'Galle'
      };
      Object.entries(sinhalaDistricts).forEach(([sin, eng]) => {
        if (cmdClean.includes(sin)) filters.district = eng;
      });
      
      // Listing Type
      if (cmdClean.includes('rent') || cmdClean.includes('කුලියට')) filters.mode = 'rent';
      if (cmdClean.includes('sale') || cmdClean.includes('buy') || cmdClean.includes('විකුණන්න')) filters.mode = 'buy';
      
      // Price
      const millionMatch = cmdClean.match(/under\s*(\d+)\s*million/) || cmdClean.match(/price\s*(\d+)\s*million/) || cmdClean.match(/(\d+)\s*million/) || cmdClean.match(/මිලියන\s*(\d+)/);
      if (millionMatch) {
        filters.maxPrice = parseInt(millionMatch[1]) * 1000000;
      }
      
      onSearch(filters);
      
      const categoryLabel = filters.category ? filters.category.toLowerCase() + 's' : 'properties';
      const districtLabel = filters.district ? ` in ${filters.district}` : '';
      const modeLabel = filters.mode ? ` for ${filters.mode}` : '';
      const priceLabel = filters.maxPrice ? ` under ${filters.maxPrice / 1000000} million` : '';
      const queryStr = `🔍 Searching ${categoryLabel}${districtLabel}${modeLabel}${priceLabel}...`;
      
      toast.success(queryStr, { duration: 3000 });
      showSuccess(`🔍 Searching: ${categoryLabel}${districtLabel}`);
      
      setTimeout(() => {
        handleStop();
      }, 1200);
      return;
    }

    // ── NAVIGATION COMMANDS ───────────────
    if (cmdClean.includes('go to home') || cmdClean.includes('homepage') || cmdClean.includes('ප්‍රධාන පිටුව')) {
      onNavigateHome();
      toast.success('🏠 Navigating to Home...');
      showSuccess('🏠 Going home');
      setTimeout(() => handleStop(), 1200);
      return;
    }

    if (cmdClean.includes('find agent') || cmdClean.includes('show agents') || cmdClean.includes('නියෝජිතයන්')) {
      onNavigate({ type: 'agents' });
      toast.success('👤 Opening Agents directory...');
      showSuccess('👤 Opening agents page');
      setTimeout(() => handleStop(), 1200);
      return;
    }

    if (cmdClean.includes('post free ad') || cmdClean.includes('post ad') || cmdClean.includes('add property') || cmdClean.includes('new listing') || cmdClean.includes('දැන්වීමක්')) {
      onNavigate({ type: 'publish' });
      toast.success('📝 Opening Property Publish form...');
      showSuccess('📝 Opening publish form');
      setTimeout(() => handleStop(), 1200);
      return;
    }

    if (cmdClean.includes('open admin') || cmdClean.includes('admin panel') || cmdClean.includes('ඇඩ්මින්')) {
      onNavigate({ type: 'secret_login' });
      toast.success('🔐 Accessing Admin Panel Login...');
      showSuccess('🔐 Opening admin');
      setTimeout(() => handleStop(), 1200);
      return;
    }

    // ── FORM FILL COMMANDS (on publish page) ──
    if (cmdClean.startsWith('title ') || cmdClean.includes('title is')) {
      const extractedTitle = cmdClean.includes('title is') ? cmdClean.split('title is')[1] : cmdClean.substring(6);
      if (extractedTitle) {
        toast.success(`📝 Set Title to: "${extractedTitle.trim()}"`);
        showSuccess(`📝 Set Title: ${extractedTitle.trim()}`);
      }
      return;
    }

    if (cmdClean.startsWith('price ') || cmdClean.includes('price of') || cmdClean.includes('price is')) {
      const millionMatch = cmdClean.match(/price\s*(\d+)\s*million/) || cmdClean.match(/(\d+)\s*million/) || cmdClean.match(/\d+/);
      if (millionMatch) {
         let value = parseInt(millionMatch[1] || millionMatch[0]);
         if (cmdClean.includes('million')) {
           toast.success(`💰 Price set to ${value.toLocaleString()} Million LKR`);
         } else {
           toast.success(`💰 Price set to LKR ${value.toLocaleString()}`);
         }
         showSuccess(`💰 Price updated`);
         return;
      }
    }

    if (cmdClean.includes('bedroom') || cmdClean.includes('bathroom')) {
      toast.success(`🛏️ Rooms and bathrooms updated`);
      showSuccess(`🛏️ Rooms/baths updated`);
      return;
    }

    if (cmdClean.includes('publish ad') || cmdClean.includes('submit ad') || cmdClean.includes('publish ad') || cmdClean.includes('submit form')) {
      toast.success('🚀 Submitting property ad...');
      showSuccess('🚀 Ad submitted');
      setTimeout(() => handleStop(), 1200);
      return;
    }

    // ── CONTROL COMMANDS ───────────────────
    if (cmdClean.includes('clear filters') || cmdClean.includes('reset filters') || cmdClean.includes('clear filter') || cmdClean.includes('reset filter') || cmdClean.includes('අයින් කරන්න')) {
      onClearFilters();
      toast.success('🧹 All search filters cleared');
      showSuccess('✅ Filters cleared');
      setTimeout(() => handleStop(), 1200);
      return;
    }

    if (cmdClean.includes('dark mode') || cmdClean.includes('night mode') || cmdClean.includes('කළු')) {
      document.documentElement.classList.add('dark');
      onToggleDarkMode();
      toast.success('🌙 Switching to Dark Mode');
      showSuccess('🌙 Dark mode on');
      setTimeout(() => handleStop(), 1200);
      return;
    }

    if (cmdClean.includes('light mode') || cmdClean.includes('එළිය')) {
      document.documentElement.classList.remove('dark');
      onToggleDarkMode();
      toast.success('☀️ Switching to Light Mode');
      showSuccess('☀️ Light mode on');
      setTimeout(() => handleStop(), 1200);
      return;
    }

    if (cmdClean.includes('scroll down') || cmdClean.includes('පහළට')) {
      window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' });
      toast.success('⬇️ Scrolling down');
      setTimeout(() => handleStop(), 1200);
      return;
    }

    if (cmdClean.includes('scroll up') || cmdClean.includes('go to top') || cmdClean.includes('ඉහළට')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success('⬆️ Scrolling to top');
      setTimeout(() => handleStop(), 1200);
      return;
    }

    if (cmdClean.includes('calculate price') || cmdClean.includes('price estimates') || cmdClean.includes('estimate price') || cmdClean.includes('calculator') || cmdClean.includes('ගණනය')) {
      const el = document.getElementById('price-calculator');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        onNavigateHome();
        setTimeout(() => {
          document.getElementById('price-calculator')?.scrollIntoView({ behavior: 'smooth' });
        }, 600);
      }
      toast.success('🧮 Opening LankaProperty Price Estimator');
      showSuccess('🧮 Opening price estimator');
      setTimeout(() => handleStop(), 1200);
      return;
    }

    // Unknown command
    toast.error(`❓ Command not recognized: "${command}"`);
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
      
      <div className="fixed bottom-32 right-8 z-[200] flex flex-col items-end gap-4 pointer-events-none">
        {/* Voice Feedback Overlay */}
        <AnimatePresence>
          {(status === 'listening' || status === 'paused') && (
            <div className="pointer-events-auto">
              <ListeningOverlay 
                transcript={transcript} 
                status={status === 'paused' ? 'paused' : 'listening'}
                onPause={handlePause}
                onResume={handleResume}
                onStop={handleStop}
                onTypeCommand={processCommand}
              />
            </div>
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

        <div className="flex flex-col items-center gap-3 pointer-events-auto">
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
