import React, { useState } from 'react';
import { Mic, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateWorkflowFromPrompt } from './geminiWorkflowGen';

export function AIPromptBar({ onGenerated }: { onGenerated: (data: any) => void }) {
  const [prompt, setPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Voice input not supported in this browser.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    setIsListening(true);
    recognition.onresult = (e: any) => {
      setPrompt(e.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleBuild = async () => {
    if (!prompt.trim()) return;
    setIsBuilding(true);
    try {
      const result = await generateWorkflowFromPrompt(prompt);
      onGenerated(result);
      toast.success('Workflow Generated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate workflow. Try specifying steps clearly.');
    } finally {
      setIsBuilding(false);
      setPrompt('');
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-3">
        <div className="relative flex items-center">
          <div className="absolute left-4 opacity-50"><Sparkles size={20} className="text-blue-500" /></div>
          <input 
            type="text" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="✨ Describe your workflow in plain English..." 
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-2xl pl-12 pr-40 py-4 font-medium focus:outline-none focus:border-blue-500 shadow-inner"
            disabled={isBuilding}
          />
          <div className="absolute right-2 flex items-center gap-2">
            <button 
              onClick={startListening}
              className={`p-2 rounded-xl transition-colors ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900'}`}
              title="Voice Input"
            >
              <Mic size={20} />
            </button>
            <button 
              onClick={handleBuild}
              disabled={isBuilding || !prompt.trim()}
              className="px-6 py-2.5 bg-blue-600 text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-blue-700 transition shadow-sm shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {isBuilding ? 'Building...' : 'Build →'}
            </button>
          </div>
        </div>
        <div className="flex gap-2 justify-center text-xs text-gray-500 font-medium">
          Examples: 
          <button onClick={() => setPrompt('Post new listings to Instagram and Facebook')} className="hover:text-blue-600 px-2 rounded hover:bg-gray-100 transition">"Post new listings to Instagram and Facebook"</button> • 
          <button onClick={() => setPrompt('Email leads when a property price drops')} className="hover:text-blue-600 px-2 rounded hover:bg-gray-100 transition">"Email leads when a property price drops"</button> • 
          <button onClick={() => setPrompt('Send WhatsApp when new inquiry arrives')} className="hover:text-blue-600 px-2 rounded hover:bg-gray-100 transition">"Send WhatsApp when new inquiry arrives"</button>
        </div>
      </div>
    </div>
  );
}
