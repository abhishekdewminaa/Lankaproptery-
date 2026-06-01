import React, { useState, useRef, useEffect } from 'react';
import { Bot, MessageSquare, Play, Settings, Loader2, Home, MapPin, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../supabaseClient';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIAgentBuilder() {
  const [agents, setAgents] = useState([
    { id: 1, name: 'Real Estate Assistant', role: 'Customer Support', rating: 4.8, chats: 48, active: true },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [instructions, setInstructions] = useState("You are a helpful real estate assistant for LankaProperty.lk. Always respond in English. When asked about properties, search the database first...");
  const [greeting, setGreeting] = useState("Hi! I'm your LankaProperty assistant. How can I help you find your perfect home today?");

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [propertiesCache, setPropertiesCache] = useState<any[]>([]);

  useEffect(() => {
    if (isCreating) {
      setMessages([{ role: 'assistant', content: greeting }]);
      supabase.from('properties').select('*').limit(20).then(({ data }) => {
        if (data) setPropertiesCache(data);
      });
    }
  }, [isCreating, greeting]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const renderMessageContent = (content: string) => {
    // Regex to match [PROPERTY: id]
    const parts = content.split(/(\[PROPERTY:\s*[^\]]+\])/g);
    
    return parts.map((part, index) => {
      const match = part.match(/\[PROPERTY:\s*([^\]]+)\]/);
      if (match) {
        const propId = parseInt(match[1], 10) || match[1];
        const prop = propertiesCache.find((p: any) => p.id === propId || p.id === match[1]);
        
        if (prop) {
          return (
            <div key={index} className="my-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex gap-3 text-left">
              {prop.cover_image && (
                <img src={prop.cover_image} alt={prop.title} className="w-16 h-16 rounded-lg object-cover" />
              )}
              {!prop.cover_image && (
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                  <Home size={24} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-sm truncate">{prop.title}</div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 mt-0.5">Rs. {prop.price_lkr?.toLocaleString()}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1 truncate">
                   <MapPin size={10} /> {prop.city}, {prop.district}
                </div>
              </div>
            </div>
          );
        } else {
          return <span key={index} className="text-blue-600 font-medium">[Property {match[1]}]</span>;
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          instructions
        })
      });

      if (!response.ok) throw new Error('API Error');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No reader');

      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                setMessages(prev => {
                  const last = prev[prev.length - 1];
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = { ...last, content: last.content + data.text };
                  return newMessages;
                });
              }
            } catch (err) {
              console.error('Error parsing SSE data', err);
            }
          }
        }
      }
    } catch (error: any) {
      toast.error("Failed to reach AI");
      setIsTyping(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto w-full bg-gray-50">
      {isCreating ? (
        <div className="max-w-4xl mx-auto flex gap-6">
          <div className="flex-1 bg-white rounded-2xl p-6 border border-gray-200">
             <h2 className="text-xl font-black text-gray-900 mb-6">Create AI Agent</h2>
             <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Agent Name</label>
                   <input type="text" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2" placeholder="e.g. Real Estate Assistant" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Role</label>
                      <select className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2">
                         <option>Real Estate Advisor</option>
                         <option>Customer Support</option>
                         <option>Lead Qualifier</option>
                         <option>Social Media Manager</option>
                         <option>Content Writer</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Personality</label>
                      <select className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2">
                         <option>Professional</option>
                         <option>Friendly</option>
                         <option>Formal</option>
                      </select>
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Knowledge Base</label>
                   <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" defaultChecked className="rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500" /> All active properties</label>
                      <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" defaultChecked className="rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500" /> Property descriptions</label>
                      <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" defaultChecked className="rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500" /> Price information</label>
                      <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" defaultChecked className="rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500" /> District/location data</label>
                      <label className="flex items-center gap-2 text-sm text-gray-600"><input type="checkbox" className="rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500" /> Agent contact details</label>
                   </div>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Instructions</label>
                   <textarea 
                     className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2 h-24 text-sm focus:outline-none focus:border-blue-500" 
                     value={instructions}
                     onChange={(e) => setInstructions(e.target.value)}
                   ></textarea>
                </div>
                <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Greeting message</label>
                   <input 
                     type="text" 
                     className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500" 
                     value={greeting} 
                     onChange={(e) => setGreeting(e.target.value)}
                   />
                </div>
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                   <button onClick={() => { toast.success('Agent saved'); setIsCreating(false); }} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-sm shadow-blue-500/20">Save Agent</button>
                   <button onClick={() => setIsCreating(false)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                </div>
             </div>
          </div>
          <div className="w-80 bg-white rounded-2xl flex flex-col border border-gray-200 relative shadow-sm">
             <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Bot /></div>
                <div>
                   <div className="font-bold text-gray-900 text-sm">Test Chat</div>
                   <div className="text-xs text-green-500">Online</div>
                </div>
             </div>
             <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}>
                     <div className={`p-3 text-sm rounded-2xl max-w-[85%] whitespace-pre-wrap ${
                       m.role === 'user' 
                         ? 'bg-blue-600 text-white rounded-tr-sm' 
                         : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                     }`}>
                       {renderMessageContent(m.content)}
                     </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-2">
                     <div className="p-3 bg-gray-100 text-gray-400 rounded-2xl rounded-tl-sm flex gap-1 items-center h-10 px-4">
                       <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                       <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                       <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                     </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
             </div>
             <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex gap-2">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isTyping}
                  className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50" 
                  placeholder="Type a message..." 
                />
             </form>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
               <h2 className="text-3xl font-black text-gray-900">AI Agents</h2>
               <p className="text-gray-500 font-medium">Create specialized AI assistants for different tasks.</p>
            </div>
            <button onClick={() => setIsCreating(true)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-sm shadow-blue-500/20">
              Create Agent
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map(agent => (
               <div key={agent.id} className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 relative">
                     <Bot size={32} />
                     {agent.active && <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>}
                  </div>
                  <h3 className="text-lg font-black text-gray-900">{agent.name}</h3>
                  <p className="text-gray-500 text-sm font-medium mt-2 leading-relaxed">Answers buyer questions about properties using your database</p>
                  
                  <div className="flex gap-4 mt-6 text-xs font-bold text-gray-500 uppercase tracking-widest w-full justify-center">
                     <span className="bg-gray-100 px-3 py-1.5 rounded-lg text-gray-600">💬 {agent.chats} Chats</span>
                     <span className="bg-gray-100 px-3 py-1.5 rounded-lg text-gray-600">⭐ {agent.rating} Rating</span>
                  </div>
                  
                  <div className="flex gap-2 mt-6 w-full">
                     <button className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold uppercase transition-colors">Configure</button>
                     <button className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold uppercase transition-colors">Test Chat</button>
                  </div>
               </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
