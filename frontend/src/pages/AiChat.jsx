import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import { MessageSquare, Send, Sparkles, User, Bot, HelpCircle } from 'lucide-react';

const AiChat = () => {
  const defaultMessage = {
    sender: 'bot',
    text: 'Bonjour ! Je suis l\'assistant intelligent **PetLuxe AI**. Posez-moi vos questions sur la santé, la nutrition, l\'éducation ou le comportement de vos compagnons. Comment puis-je vous aider aujourd\'hui ?'
  };

  const [messages, setMessages] = useState([defaultMessage]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    'Quels vaccins pour mon chien ?',
    'Comment nourrir un chaton ?',
    'Mon chat vomit, que faire ?',
    'Conseils pour couper les griffes ?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/chat/history');
        if (response.data && response.data.length > 0) {
          setMessages([defaultMessage, ...response.data]);
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    // Add user message
    const updatedMessages = [...messages, { sender: 'user', text: query }];
    setMessages(updatedMessages);
    setInputText('');
    setLoading(true);

    try {
      const response = await api.post('/chat', {
        message: query
      });
      setMessages(prev => [...prev, { sender: 'bot', text: response.data.reply }]);
    } catch (err) {
      // Handled by global interceptor, but we keep local fallback just in case
      setMessages(prev => [...prev, { sender: 'bot', text: 'Désolé, j\'ai rencontré un problème réseau. Veuillez réessayer.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <DashboardLayout title="Assistant IA">
      
      <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Chat Header banner */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-secondary text-white flex items-center justify-center shadow-md glow-secondary">
              <Bot size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">PetLuxe Chatbot</h4>
              <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Vétérinaire virtuel actif
              </p>
            </div>
          </div>
          <HelpCircle size={18} className="text-slate-400 cursor-pointer hover:text-slate-600" title="Informations" />
        </div>

        {/* Chat Screen area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {messages.map((m, idx) => (
            <div 
              key={idx}
              className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                m.sender === 'user' 
                  ? 'bg-secondary text-white shadow-sm shadow-secondary/15' 
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {m.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`rounded-2xl p-4 text-xs leading-relaxed border relative group ${
                m.sender === 'user' 
                  ? 'bg-secondary/5 border-secondary/15 text-slate-700 font-medium' 
                  : 'bg-white border-slate-100 text-slate-650'
              }`}>
                {/* Parse Markdown-like bold strings dynamically */}
                {m.text.split('\n').map((para, pIdx) => (
                  <p key={pIdx} className={pIdx > 0 ? 'mt-2' : ''}>
                    {para.split('**').map((chunk, cIdx) => 
                      cIdx % 2 === 1 ? <strong key={cIdx} className="font-extrabold text-slate-800">{chunk}</strong> : chunk
                    )}
                  </p>
                ))}
                
                {m.sender === 'bot' && m.text !== defaultMessage.text && (
                  <button 
                    onClick={() => navigator.clipboard.writeText(m.text)}
                    className="absolute top-2 right-2 p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100 hover:text-slate-600 shadow-sm"
                    title="Copier la réponse"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Typing Loading dots */}
          {loading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                <Bot size={14} />
              </div>
              <div className="rounded-2xl p-4 bg-white border border-slate-100 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries row */}
        {messages.length === 1 && (
          <div className="px-6 py-2 border-t border-slate-100 bg-slate-50/20">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Suggestions</span>
            <div className="flex flex-wrap gap-2 mb-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200/60 bg-white text-[11px] font-semibold text-slate-600 hover:border-slate-350 hover:bg-slate-50 transition-all shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input box form */}
        <div className="p-4 border-t border-slate-100 bg-white flex gap-3 items-center">
          <input
            type="text"
            placeholder="Posez une question sur la santé, alimentation de votre animal..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="flex-1 rounded-2xl border border-slate-200 py-3.5 px-4 text-xs placeholder-slate-400 focus:border-secondary focus:outline-none focus:ring-4 focus:ring-secondary/10 transition-all bg-white"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || loading}
            className="h-11 w-11 rounded-xl bg-secondary hover:bg-secondary-hover disabled:bg-slate-150 text-white flex items-center justify-center shadow-md shadow-secondary/15 transition-all shrink-0"
          >
            <Send size={16} />
          </button>
        </div>

      </div>

    </DashboardLayout>
  );
};

export default AiChat;
