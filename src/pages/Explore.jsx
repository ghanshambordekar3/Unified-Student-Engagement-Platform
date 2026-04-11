import { useState, useRef, useEffect } from 'react';
import { Send, Bot, GraduationCap, Filter, Search, SlidersHorizontal, Sparkles, X, Globe, DollarSign } from 'lucide-react';
import { getChatResponse, createUserMessage } from '../utils/chatbot';
import ChatMessage from '../components/ChatMessage';
import UniversityCard from '../components/UniversityCard';
import storage from '../utils/storage';
import { PageTransition } from '../components/ui/PageTransition';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import universitiesData from '../data/universities.json';
import { trackEvent } from '../utils/rewards';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const CHAT_KEY = 'edupath_chat_history';

const welcomeMessage = {
  text: "Welcome to EduPath Career Navigator!\n\nI'm your AI study abroad assistant. Ask me anything about:\n\n- Countries: Canada, UK, Australia, Germany, USA\n- Programs: MBA, CS, Data Science, Engineering\n- Finance: Loans, ROI, Scholarships\n- Visa & Application tips\n- Tests: IELTS, TOEFL, GRE, GMAT\n\nWhat would you like to explore?",
  isBot: true,
  timestamp: new Date().toISOString(),
  suggestions: ['Tell me about Canada', 'MBA programs', 'IELTS preparation', 'Education loans'],
};

export default function Explore() {
  const [activeTab, setActiveTab] = useState('chatbot');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState(() => {
    const saved = storage.get(CHAT_KEY, null);
    return saved || [welcomeMessage];
  });
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const profile = storage.get('edupath_profile', {});
  const [countryFilter, setCountryFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState(profile.targetCourse || 'All');
  const [budgetFilter, setBudgetFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const countries = ['All', ...new Set(universitiesData.map((u) => u.country))];
  const courses = ['All', ...new Set(universitiesData.map((u) => u.course))];

  const filteredUniversities = universitiesData.filter((u) => {
    const matchCountry = countryFilter === 'All' || u.country === countryFilter;
    const matchCourse = courseFilter === 'All' || u.course === courseFilter;
    const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchBudget =
      budgetFilter === 'All' ||
      (budgetFilter === 'under-15k' && u.fees < 15000) ||
      (budgetFilter === '15k-30k' && u.fees >= 15000 && u.fees < 30000) ||
      (budgetFilter === '30k-50k' && u.fees >= 30000 && u.fees < 50000) ||
      (budgetFilter === 'over-50k' && u.fees >= 50000);
    return matchCountry && matchCourse && matchBudget && matchSearch;
  });

  useEffect(() => {
    storage.set(CHAT_KEY, messages);
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const handler = (e) => {
      setInputValue(e.detail);
      inputRef.current?.focus();
    };
    window.addEventListener('chatSuggestion', handler);
    return () => window.removeEventListener('chatSuggestion', handler);
  }, []);

  const sendMessage = (text) => {
    const query = (text || inputValue).trim();
    if (!query) return;

    const userMsg = createUserMessage(query);
    setMessages((m) => [...m, userMsg]);
    setInputValue('');
    setIsTyping(true);
    trackEvent('chatbot_queries');

    setTimeout(() => {
      const botResponse = getChatResponse(query);
      setMessages((m) => [...m, botResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([welcomeMessage]);
    storage.remove(CHAT_KEY);
  };

  return (
    <PageTransition transitionKey="explore">
      <div className="space-y-8 pb-10">
        {/* Page Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-200 rounded-full w-fit"
            >
              <Globe size={14} className="text-teal-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-700">Global Intelligence Hub</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Intelligence <span className="text-gradient">Explorer</span></h1>
            <p className="text-gray-500 font-medium text-sm">Deploy AI agents to plan your career or browse world-class institutions.</p>
          </div>

          {/* Premium Tabs */}
          <div className="flex p-1.5 bg-gray-100 border border-gray-200 rounded-2xl w-fit relative">
            <motion.div 
              layoutId="activeTab"
              className="absolute inset-y-1.5 rounded-xl bg-teal-500 shadow-lg"
              initial={false}
              animate={{ 
                x: activeTab === 'chatbot' ? 0 : 155,
                width: activeTab === 'chatbot' ? 145 : 145 
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button
              onClick={() => setActiveTab('chatbot')}
              className={cn(
                "relative z-10 px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-colors duration-300 w-[145px]",
                activeTab === 'chatbot' ? "text-white" : "text-gray-600 hover:text-gray-900"
              )}
            >
              AI Assistant
            </button>
            <button
              onClick={() => setActiveTab('universities')}
              className={cn(
                "relative z-10 px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-colors duration-300 w-[145px]",
                activeTab === 'universities' ? "text-white" : "text-gray-600 hover:text-gray-900"
              )}
            >
              Universities
            </button>
          </div>
        </section>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'chatbot' ? (
            <motion.div
              key="chatbot"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-0 overflow-hidden flex flex-col h-[650px] border-gray-200 shadow-xl" hoverable={false}>
                {/* Chat Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20 border border-white/10">
                      <Bot size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-base tracking-tight uppercase">EduPath Intelligence Core</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-teal-500">Processing Node Active</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={clearChat}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-all bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl"
                  >
                    <X size={12} /> Clear Cache
                  </button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-8 space-y-4 bg-gray-50">
                  {messages.map((msg, i) => (
                    <ChatMessage key={i} message={msg} />
                  ))}
                  {isTyping && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-4 mb-4"
                    >
                      <div className="w-8 h-8 rounded-xl bg-gray-200 border border-gray-300 flex items-center justify-center text-[10px] font-black text-teal-500 uppercase">AI</div>
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-6 py-3">
                        <div className="flex gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-400/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-400/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-teal-400/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="px-8 py-6 border-t border-gray-100 bg-gray-50">
                  <div className="flex gap-4 p-2 bg-white border border-gray-200 rounded-2xl focus-within:border-teal-400 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
                    <input
                      ref={inputRef}
                      id="chat-input"
                      type="text"
                      className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-gray-900 placeholder-gray-400 font-medium text-sm"
                      placeholder="Ask the Intelligence Core..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <Button
                      id="chat-send"
                      onClick={() => sendMessage()}
                      disabled={!inputValue.trim() || isTyping}
                      className="aspect-square p-0 w-11 h-11 flex items-center justify-center rounded-xl"
                    >
                      <Send size={18} />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              key="universities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Refined Filters */}
              <GlassCard className="p-8 space-y-8 border-gray-200 shadow-lg" hoverable={false}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-teal-50 text-teal-500">
                    <SlidersHorizontal size={20} />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">Advanced Search Logic</h3>
                  <div className="ml-auto flex items-center gap-2 h-6 px-3 bg-gray-100 rounded-full border border-gray-200">
                    <span className="text-[10px] font-black text-teal-500">{filteredUniversities.length}</span>
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-none">Modules Found</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Search */}
                  <div className="lg:col-span-1 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Primary Search</label>
                    <div className="relative group">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-teal-400 transition-colors" />
                      <input
                        id="uni-search"
                        type="text"
                        className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-teal-400 transition-all font-medium"
                        placeholder="Institute Name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Dropdowns */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Node: Country</label>
                    <select 
                      id="uni-country-filter" 
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-teal-400 transition-all font-medium appearance-none"
                      value={countryFilter} 
                      onChange={(e) => setCountryFilter(e.target.value)}
                    >
                      {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Node: Course</label>
                    <select 
                      id="uni-course-filter" 
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-teal-400 transition-all font-medium appearance-none"
                      value={courseFilter} 
                      onChange={(e) => setCourseFilter(e.target.value)}
                    >
                      {courses.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Financial Capacitor</label>
                    <select 
                      id="uni-budget-filter" 
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 outline-none focus:border-teal-400 transition-all font-medium appearance-none"
                      value={budgetFilter} 
                      onChange={(e) => setBudgetFilter(e.target.value)}
                    >
                      <option value="All">Global Budget</option>
                      <option value="under-15k">Under $15k</option>
                      <option value="15k-30k">$15k - $30k</option>
                      <option value="30k-50k">$30k - $50k</option>
                      <option value="over-50k">Over $50k</option>
                    </select>
                  </div>
                </div>
              </GlassCard>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                  {filteredUniversities.map((uni, idx) => (
                    <motion.div
                      key={uni.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <UniversityCard university={uni} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredUniversities.length === 0 && (
                <div className="text-center py-24 bg-white rounded-3xl border border-gray-200">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                    <GraduationCap size={40} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Zero Matches Found</h3>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto">The parameters provided do not match any existing nodes in the database.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
