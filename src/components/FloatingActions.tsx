import React, { useState } from 'react'

interface FloatingActionsProps {
  onOpenChat: () => void;
  onStartVoice: () => void;
  whatsappNumber?: string;
  voiceStatus?: 'idle' | 'listening' | 'paused';
}

const FloatingActions: React.FC<FloatingActionsProps> = ({ 
  onOpenChat, 
  onStartVoice, 
  whatsappNumber = '94773951560', // Example number
  voiceStatus = 'idle'
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const buttons = [
    {
      id: 'voice',
      icon: voiceStatus === 'listening' ? '🎤' : voiceStatus === 'paused' ? '⏸' : '🎤',
      label: 'Voice Command',
      color: voiceStatus === 'listening' ? 'linear-gradient(135deg, #CC2222, #FF4444)' : voiceStatus === 'paused' ? 'linear-gradient(135deg, #F5A623, #FFB347)' : '#004F31',
      onClick: () => {
        onStartVoice()
        setIsOpen(false)
      }
    },
    {
      id: 'chat',
      icon: '💬',
      label: 'Live Chat',
      color: '#007E50',
      onClick: () => {
        onOpenChat()
        setIsOpen(false)
      }
    },
    {
      id: 'whatsapp',
      icon: '📱',
      label: 'WhatsApp',
      color: '#25D366',
      onClick: () => {
        window.open(
          `https://wa.me/${whatsappNumber}`,
          '_blank'
        )
        setIsOpen(false)
      }
    }
  ]

  return (
    <>
      {/* Backdrop for closing */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            background: 'transparent'
          }}
        />
      )}

      <div style={{
        position: 'fixed',
        bottom: '30px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>

        {/* SUB BUTTONS - show when open */}
        {isOpen && buttons.map((btn, index) => (
          <div
            key={btn.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              animation: `slideUp 0.3s ease forwards`,
              animationDelay: `${index * 0.08}s`,
              opacity: 0,
              width: '100%',
              position: 'relative'
            }}
          >
            {/* Pulse rings for Voice when listening */}
            {btn.id === 'voice' && voiceStatus === 'listening' && (
              <>
                <div style={{
                  position: 'absolute',
                  right: '0',
                  bottom: '0',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: '2px solid rgba(204,34,34,0.5)',
                  animation: 'ringPulse 1.5s ease-out infinite',
                  pointerEvents: 'none'
                }} />
                <div style={{
                  position: 'absolute',
                  right: ' -8px',
                  bottom: '-8px',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  border: '2px solid rgba(204,34,34,0.25)',
                  animation: 'ringPulse 1.5s ease-out infinite',
                  animationDelay: '0.5s',
                  pointerEvents: 'none'
                }} />
              </>
            )}

            {/* Label tooltip */}
            <span style={{
              background: 'rgba(0,0,0,0.85)',
              color: 'white',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              pointerEvents: 'none'
            }}>
              {btn.label}
            </span>

            {/* Button circle */}
            <button
              onClick={btn.onClick}
              className="group"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: btn.color,
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: btn.id === 'voice' && voiceStatus === 'listening' ? '0 4px 20px rgba(204,34,34,0.5)' : '0 4px 15px rgba(0,0,0,0.2)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                zIndex: 1
              }}
            >
              <span className="group-hover:scale-125 transition-transform duration-300">
                {btn.icon}
              </span>
            </button>
          </div>
        ))}

        {/* MAIN TOGGLE BUTTON */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center text-white relative group"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: isOpen 
              ? 'linear-gradient(135deg, #FF4B2B 0%, #CC2222 100%)' 
              : 'linear-gradient(135deg, #007E50 0%, #004F31 100%)',
            border: 'none',
            cursor: 'pointer',
            boxShadow: isOpen 
              ? '0 8px 25px rgba(204,34,34,0.4)' 
              : '0 8px 25px rgba(0,79,49,0.3)',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: isOpen ? 'rotate(135deg)' : 'rotate(0deg)',
          }}
        >
          <span className="text-2xl font-bold pointer-events-none">+</span>
          
          {/* Subtle ring on hover */}
          {!isOpen && (
            <div className="absolute inset-0 rounded-full border-2 border-white/20 scale-100 group-hover:scale-125 opacity-0 group-hover:opacity-100 transition-all duration-300" />
          )}
        </button>
      </div>
    </>
  )
}

export default FloatingActions
