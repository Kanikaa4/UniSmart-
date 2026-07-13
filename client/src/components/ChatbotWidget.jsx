import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Volume2, VolumeX, RotateCcw, Bot, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function ChatbotWidget({ user, role, token, API_BASE_URL }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('unismart_chat_history');
    return saved ? JSON.parse(saved) : [
      { 
        id: 'welcome', 
        sender: 'bot', 
        text: "Hello! I am the UniSmart AI Academic Assistant. How can I help you explore the platform today? If you have a test profile, please log in to access customized attendance analytics.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(() => {
    return localStorage.getItem('unismart_chat_audio') === 'true';
  });
  
  const messagesEndRef = useRef(null);
  const audioSynthRef = useRef(null);

  // Play chime sound using Web Audio API
  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // Tone 1 (C5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); 
      gain1.gain.setValueAtTime(0.05, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.25);

      // Tone 2 (E5) slightly delayed
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime); 
        gain2.gain.setValueAtTime(0.05, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.25);
      }, 80);
    } catch (e) {
      console.warn('Sound play failed:', e);
    }
  };

  // Speak text using Web Speech API
  const speakText = (text) => {
    if (!audioEnabled) return;
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel(); // Stop any current speech
        
        // Remove markdown markers for clearer speech
        const cleanText = text
          .replace(/\*\*([^*]+)\*\*/g, '$1')
          .replace(/\*([^*]+)\*/g, '$1')
          .replace(/[-*]\s+/g, '');
          
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
    }
  };

  // Persist messages
  useEffect(() => {
    localStorage.setItem('unismart_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Persist audio settings
  useEffect(() => {
    localStorage.setItem('unismart_chat_audio', audioEnabled.toString());
    if (!audioEnabled && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [audioEnabled]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isTyping]);

  // Update welcome message if user logs in or out
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome') {
      let welcomeText = "Hello! I am the UniSmart AI Academic Assistant. How can I help you explore the platform today? If you have a test profile, please log in to access customized attendance analytics.";
      
      if (user) {
        if (role === 'faculty') {
          welcomeText = `Hello Dr. ${user.name || 'Faculty Member'}! I am your UniSmart AI Academic Assistant. I can help you analyze student risk factors, look up attendance statistics, or inspect your student roster. What would you like to do?`;
        } else if (role === 'admin') {
          welcomeText = `Hello Super Admin! I am your UniSmart AI System Console Assistant. I can help you review system diagnostics, list registered faculty, or give student counts. How can I assist you in managing the platform today?`;
        }
      }
      setMessages([{
        id: 'welcome',
        sender: 'bot',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, [user, role]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    if (!textToSend) {
      setInputValue('');
    }

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(`${API_BASE_URL}/chatbot/message`, { message: text }, { headers });
      
      setIsTyping(false);
      
      const botReply = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: response.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botReply]);
      playChime();
      speakText(response.data.reply);

    } catch (err) {
      console.error('Chatbot API error:', err);
      setIsTyping(false);

      const errorReply = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "I am having trouble connecting to the UniSmart backend service. Please verify if the backend server is running on port 5000.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, errorReply]);
    }
  };

  const handleClearChat = () => {
    let welcomeText = "Hello! I am the UniSmart AI Academic Assistant. How can I help you explore the platform today? If you have a test profile, please log in to access customized attendance analytics.";
    
    if (user) {
      if (role === 'faculty') {
        welcomeText = `Hello Dr. ${user.name || 'Faculty Member'}! I am your UniSmart AI Academic Assistant. How can I help you analyze student risk factors or inspect your roster?`;
      } else if (role === 'admin') {
        welcomeText = `Hello Super Admin! I am your UniSmart AI System Console Assistant. Let me know what you would like to inspect or manage.`;
      }
    }

    setMessages([
      { 
        id: 'welcome', 
        sender: 'bot', 
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  // Render markdown-like structures
  const formatMessageText = (text) => {
    if (!text) return '';
    const paragraphs = text.split('\n');
    
    return paragraphs.map((p, idx) => {
      if (p.trim().startsWith('- ') || p.trim().startsWith('* ')) {
        const content = p.trim().replace(/^[-*]\s+/, '');
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-textPrimary/90 my-1 leading-relaxed">
            {parseBoldText(content)}
          </li>
        );
      }
      
      const numMatch = p.trim().match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        const num = numMatch[1];
        const content = numMatch[2];
        return (
          <li key={idx} className="ml-4 list-decimal text-xs text-textPrimary/90 my-1 leading-relaxed">
            {parseBoldText(content)}
          </li>
        );
      }

      if (p.trim() === '') {
        return <div key={idx} className="h-2"></div>;
      }

      return (
        <p key={idx} className="text-xs text-textPrimary/90 my-1 leading-relaxed">
          {parseBoldText(p)}
        </p>
      );
    });
  };

  const parseBoldText = (text) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-extrabold text-white">{part}</strong>;
      }
      
      const italicParts = part.split(/\*([^*]+)\*/g);
      if (italicParts.length > 1) {
        return italicParts.map((ip, iidx) => {
          if (iidx % 2 === 1) {
            return <em key={iidx} className="italic text-textSecondary">{ip}</em>;
          }
          return ip;
        });
      }
      
      return part;
    });
  };

  // Suggestions dynamic lists
  const getSuggestions = () => {
    if (user) {
      if (role === 'faculty') {
        return [
          "Who is at risk?",
          "Class attendance statistics",
          "Show my class roster",
          "Who am I?"
        ];
      } else if (role === 'admin') {
        return [
          "Show registered faculty",
          "How many students are active?",
          "System status report",
          "Who am I?"
        ];
      }
    }
    return [
      "How do I log in?",
      "What are the core features?",
      "What is the future roadmap?",
      "What is the tech stack?"
    ];
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primaryIndigo to-accentPurple text-white rounded-full shadow-glow hover:scale-110 active:scale-95 transition-all animate-pulse-glow border border-white/10 cursor-pointer"
          title="Open AI Academic Assistant"
        >
          <MessageSquare size={24} />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondaryTeal opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-secondaryTeal"></span>
          </span>
        </button>
      )}

      {/* Expanded Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[550px] glass-panel rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-tab-slide border border-glassBorder">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-glassBorder bg-glassSolid backdrop-blur-lg flex justify-between items-center z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primaryIndigo to-accentPurple flex items-center justify-center text-white">
                <Bot size={20} className="animate-bounce-slow" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Academic Assistant</span>
                  <Sparkles size={12} className="text-secondaryTeal" />
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-successGreen shadow-[0_0_6px_#10b981]"></span>
                  <span className="text-[10px] text-textSecondary font-semibold">Online</span>
                </div>
              </div>
            </div>
            
            {/* Header controls */}
            <div className="flex items-center gap-2.5">
              {/* TTS Toggle */}
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  audioEnabled 
                    ? 'bg-successGreen/10 border-successGreen text-successGreen' 
                    : 'bg-white/2 border-glassBorder text-textSecondary hover:text-white hover:bg-white/5'
                }`}
                title={audioEnabled ? "Disable Text-to-Speech" : "Enable Text-to-Speech (Reads bot replies aloud)"}
              >
                {audioEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              </button>

              {/* Reset History */}
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg border border-glassBorder bg-white/2 text-textSecondary hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                title="Reset conversation history"
              >
                <RotateCcw size={13} />
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                }}
                className="p-1.5 rounded-lg border border-glassBorder bg-white/2 text-textSecondary hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                title="Close Assistant"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Messages Viewport */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 flex flex-col bg-bgbase/40">
            {messages.map((m) => (
              <div 
                key={m.id}
                className={`max-w-[85%] flex flex-col ${
                  m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                }`}
              >
                <div 
                  className={`px-4 py-3 rounded-2xl text-xs shadow-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-br from-primaryIndigo to-indigo-600 text-white rounded-tr-none'
                      : 'bg-white/4 border border-glassBorder text-textPrimary rounded-tl-none'
                  }`}
                >
                  {m.sender === 'user' ? (
                    <p className="text-xs text-white leading-relaxed">{m.text}</p>
                  ) : (
                    <div className="space-y-1">{formatMessageText(m.text)}</div>
                  )}
                </div>
                <span className="text-[9px] text-textMuted mt-1 px-1 font-semibold">{m.timestamp}</span>
              </div>
            ))}

            {/* Bouncing Typing Indicator */}
            {isTyping && (
              <div className="self-start flex flex-col items-start max-w-[80%]">
                <div className="px-4 py-3.5 rounded-2xl rounded-tl-none bg-white/4 border border-glassBorder flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-textSecondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-textSecondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-textSecondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions / Suggestions pills */}
          <div className="px-4 py-2 bg-glassSolid/30 border-t border-glassBorder flex gap-2 overflow-x-auto scrollbar-none whitespace-nowrap py-2.5">
            {getSuggestions().map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s)}
                className="inline-block px-3 py-1.5 rounded-full border border-glassBorder bg-white/3 hover:bg-primaryIndigo/10 hover:border-primaryIndigo/40 hover:text-white text-[10px] font-semibold text-textSecondary transition-all cursor-pointer select-none"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-4 border-t border-glassBorder bg-glassSolid backdrop-blur-lg flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me something about UniSmart..."
              className="flex-1 bg-white/4 border border-glassBorder rounded-xl px-4 py-2.5 text-xs text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-primaryIndigoFocus focus:bg-white/[0.06] transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className={`p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                inputValue.trim() 
                  ? 'bg-primaryIndigo hover:bg-indigo-600 text-white shadow-glow hover:scale-[1.05]' 
                  : 'bg-white/2 border border-glassBorder text-textMuted'
              }`}
            >
              <Send size={14} />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
