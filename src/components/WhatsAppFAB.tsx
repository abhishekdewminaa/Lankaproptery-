import { safeLocalStorage } from '../utils/safeUtils';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const WhatsAppFAB = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Scroll listener
    const handleScroll = () => {
      if (window.scrollY < 300) {
        setOpacity(0.6);
      } else {
        setOpacity(1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // Check safeLocalStorage
    const badgeSeen = safeLocalStorage.getItem('whatsapp_badge_seen') === 'true';
    if (!badgeSeen) {
      setShowBadge(true);
    }

    const bubbleSeen = safeLocalStorage.getItem('bubble_seen') === 'true';

    // Auto expand/collapse logic
    const expandTimer = setTimeout(() => {
      setIsExpanded(true);
    }, 3000);

    const collapseTimer = setTimeout(() => {
      setIsExpanded(false);
    }, 8000);

    // Show tooltip bubble logic
    let bubbleTimer: NodeJS.Timeout;
    if (!bubbleSeen) {
      bubbleTimer = setTimeout(() => {
        setShowBubble(true);
        // Auto dismiss after 4 seconds
        setTimeout(() => {
          setShowBubble(false);
          safeLocalStorage.setItem('bubble_seen', 'true');
        }, 4000);
      }, 5000);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(expandTimer);
      clearTimeout(collapseTimer);
      if (bubbleTimer) clearTimeout(bubbleTimer);
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (showBadge) {
      setShowBadge(false);
      safeLocalStorage.setItem('whatsapp_badge_seen', 'true');
    }
    
    // Create ripple effect
    const btn = e.currentTarget;
    const ripple = document.createElement('div');
    ripple.className = 'whatsapp-ripple';
    btn.appendChild(ripple);
    setTimeout(() => {
      ripple.remove();
    }, 500);

    // Open WhatsApp
    const msg = encodeURIComponent("Hi LankaProperty.lk! 👋 I'm looking for a property in Sri Lanka. Can you help me?");
    const url = `https://wa.me/94332229695?text=${msg}`;
    window.open(url, '_blank');
  };

  const manuallyCloseBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBubble(false);
    safeLocalStorage.setItem('bubble_seen', 'true');
  };

  return (
    <>
      <style>{`
        @keyframes fabEntry {
          0%   { opacity: 0; transform: translateY(60px) scale(0.5); }
          60%  { transform: translateY(-8px) scale(1.05); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fabGlow {
          0%   { box-shadow: 0 8px 32px rgba(37, 211, 102, 0.45); }
          50%  { box-shadow: 0 8px 48px rgba(37, 211, 102, 0.8), 0 0 0 12px rgba(37, 211, 102, 0.1); }
          100% { box-shadow: 0 8px 32px rgba(37, 211, 102, 0.45); }
        }
        @keyframes badgePop {
          0%   { transform: scale(0); }
          70%  { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        @keyframes bubbleIn {
          0%   { opacity: 0; transform: translateY(8px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .whatsapp-ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          transform: scale(0);
          animation: rippleEffect 0.5s linear;
          width: 52px;
          height: 52px;
          left: 0;
          top: 0;
          pointer-events: none;
        }
        @keyframes rippleEffect {
          to {
            transform: scale(2.5);
            opacity: 0;
          }
        }
        .whatsapp-fab-container {
          animation: fabEntry 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: 1s;
          opacity: 0;
        }
      `}</style>
      
      <div 
        className="fixed bottom-[28px] right-[28px] z-[9999] flex flex-col items-end gap-3 whatsapp-fab-container"
        style={{ opacity: opacity, transition: 'opacity 0.3s ease' }}
      >
        {/* Tooltip Bubble */}
        {showBubble && (
          <div 
            className="bg-white rounded-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.12)] p-[10px_14px] text-[13px] text-[#1a1a1a] max-w-[200px] relative flex items-start gap-2"
            style={{ animation: 'bubbleIn 0.4s ease forwards', transformOrigin: 'bottom right' }}
          >
            <div>👋 Hi! Need help finding a property?</div>
            <button 
              onClick={manuallyCloseBubble}
              className="text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-0.5 shrink-0"
            >
              <X size={12} />
            </button>
            <div className="absolute -bottom-[6px] right-[16px] w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100 shadow-[2px_2px_2px_rgba(0,0,0,0.02)]"></div>
          </div>
        )}

        {/* WhatsApp FAB */}
        <div className="relative">
          <button
            onClick={handleClick}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            className="relative flex items-center gap-[10px] bg-[linear-gradient(135deg,#25D366,#128C7E)] h-[52px] rounded-full p-[0_20px_0_14px] hover:scale-[1.04] transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden group cursor-pointer border-none outline-none"
            style={{ 
              boxShadow: '0 8px 32px rgba(37, 211, 102, 0.45)',
              animation: 'fabGlow 3s ease-in-out infinite',
              paddingRight: isExpanded ? '20px' : '14px', // Keep padding relative
            }}
          >
            {/* React Icon container */}
            <div className="shrink-0 flex items-center justify-center w-[26px] h-[26px] ml-0.5 relative z-10">
              <svg viewBox="0 0 24 24" fill="white" width="32" height="32" className="drop-shadow-sm min-w-[26px]">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.118.553 4.101 1.519 5.819L.057 23.882l6.233-1.635A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.374l-.36-.214-3.7.971.988-3.608-.235-.371A9.818 9.818 0 1112 21.818z"/>
              </svg>
            </div>
            
            {/* Text container with max-width transition */}
            <div 
              style={{
                maxWidth: isExpanded ? '120px' : '0px',
                opacity: isExpanded ? 1 : 0,
                transition: 'max-width 0.4s ease, opacity 0.3s ease',
              }}
              className="overflow-hidden whitespace-nowrap z-10"
            >
              <span className="text-white font-[600] text-[14px] leading-[52px]">
                Chat with us
              </span>
            </div>
          </button>

          {/* Notification Badge */}
          {showBadge && (
            <div 
              className="absolute -top-[4px] -right-[4px] w-[18px] h-[18px] bg-[#FF3B30] rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-[10px] z-20 pointer-events-none"
              style={{ 
                transform: 'scale(0)', 
                animation: 'badgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                animationDelay: '1.8s'
              }}
            >
              1
            </div>
          )}
        </div>
      </div>
    </>
  );
};
