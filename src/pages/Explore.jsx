import { useState, useRef, useEffect } from 'react';
import { Send, Bot, GraduationCap, Filter, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { getChatResponseStream } from '../utils/chatbot';
import ChatMessage from '../components/ChatMessage';
import UniversityCard from '../components/UniversityCard';
import storage from '../utils/storage';
import universitiesData from '../data/universities.json';
import { trackEvent } from '../utils/rewards';
import { motion, AnimatePresence } from 'framer-motion';

const CHAT_KEY = 'edupath_chat_history';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const welcomeMessage = {
  id: generateId(),
  text: "👋 **Welcome to EduPath Career Navigator!**\n\nI'm your AI study abroad assistant. Ask me anything about:\n\n- 🌍 Countries: Canada, UK, Australia, Germany, USA\n- 📚 Programs: MBA, CS, Data Science, Engineering\n- 💰 Finance: Loans, ROI, Scholarships\n- 🛂 Visa & Application tips\n- 📝 Tests: IELTS, TOEFL, GRE, GMAT\n\nWhat would you like to explore?",
  isBot: true,
  timestamp: new Date().toISOString(),
  suggestions: ['Tell me about Canada', 'MBA programs', 'IELTS preparation', 'Education loans'],
};

export default function Explore() {
  const [activeTab, setActiveTab] = useState('chatbot');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState(() => {
    const saved = storage.get(CHAT_KEY, null);
    if (saved && Array.isArray(saved)) {
      return saved.map(msg => ({ ...msg, id: msg.id || generateId() }));
    }
    return [welcomeMessage];
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const isGeneratingRef = useRef(false);

  // University filters
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

  // Save chat to localStorage
  useEffect(() => {
    storage.set(CHAT_KEY, messages);
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle suggestion chip clicks
  useEffect(() => {
    const handler = (e) => {
      setInputValue(e.detail);
      inputRef.current?.focus();
    };
    window.addEventListener('chatSuggestion', handler);
    return () => window.removeEventListener('chatSuggestion', handler);
  }, []);

  const sendMessage = async (text) => {
    const query = (text || inputValue).trim();
    if (!query) return;
    
    // Prevent double execution
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;

    const userMsgId = generateId();
    const botMsgId = generateId();
    
    const userMsg = {
      id: userMsgId,
      text: query,
      isBot: false,
      timestamp: new Date().toISOString(),
    };
    
    const placeholderMsg = {
      id: botMsgId,
      text: '',
      isBot: true,
      isStreaming: true,
      timestamp: new Date().toISOString(),
      suggestions: [],
    };
    
    setMessages((m) => [...m, userMsg, placeholderMsg]);
    setInputValue('');
    trackEvent('chatbot_queries');

    let accumulated = '';
    
    await getChatResponseStream(
      query,
      (chunk) => {
        accumulated += chunk;
        setMessages((m) =>
          m.map((msg) =>
            msg.id === botMsgId ? { ...msg, text: accumulated } : msg
          )
        );
      },
      (suggestions, data) => {
        setMessages((m) =>
          m.map((msg) =>
            msg.id === botMsgId
              ? { 
                  ...msg, 
                  isStreaming: false, 
                  suggestions: suggestions.length > 0 ? suggestions : welcomeMessage.suggestions,
                  data: data
                }
              : msg
          )
        );
        isGeneratingRef.current = false;
      },
      messages // pass history
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{ ...welcomeMessage, id: generateId() }]);
    storage.remove(CHAT_KEY);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Background decoration */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
           <Sparkles size={16} className="text-teal-500" />
           <span className="text-[10px] font-black uppercase tracking-widest text-teal-600">Knowledge Hub</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Explore the <span className="text-gradient">Unknown</span></h1>
        <p className="text-gray-500 text-sm font-medium">Consult our AI or filter through the world's best institutions.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-gray-100/80 backdrop-blur-md rounded-2xl border border-gray-200/50 w-fit">
        <button
          id="tab-chatbot"
          onClick={() => setActiveTab('chatbot')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
            activeTab === 'chatbot'
              ? 'bg-white text-teal-600 shadow-md border border-teal-100 ring-2 ring-teal-50'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          🤖 AI Counselor
        </button>
        <button
          id="tab-universities"
          onClick={() => setActiveTab('universities')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
            activeTab === 'universities'
              ? 'bg-white text-teal-600 shadow-md border border-teal-100 ring-2 ring-teal-50'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          🏫 Institution Matrix
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Chatbot Tab */}
        {activeTab === 'chatbot' && (
          <motion.div
            key="chatbot"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-gray-200 rounded-[2rem] overflow-hidden flex flex-col bg-white shadow-2xl shadow-gray-200/50"
            style={{ height: '650px' }}
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                  <Bot size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-sm uppercase tracking-tight">EduPath AI</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Cognitive Stream Active</span>
                  </div>
                </div>
              </div>
              <button
                onClick={clearChat}
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all p-2 rounded-xl hover:bg-gray-100"
              >
                Reset Session
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 scrollbar-hide">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50">
              <div className="flex gap-4">
                <div className="relative flex-1">
                   <input
                    ref={inputRef}
                    id="chat-input"
                    type="text"
                    className="input-field pr-12 h-14"
                    placeholder="Ask about universities, visas, or finance..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                    <Search size={18} />
                  </div>
                </div>
                <button
                  id="chat-send"
                  onClick={() => sendMessage()}
                  disabled={!inputValue.trim() || isGeneratingRef.current}
                  className="btn-primary w-14 h-14 flex items-center justify-center p-0 rounded-2xl disabled:opacity-30"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Universities Tab */}
        {activeTab === 'universities' && (
          <motion.div
            key="unis"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="card border-gray-200 p-8 rounded-[2rem] shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                  <SlidersHorizontal size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Filter Matrix</h3>
                  <p className="text-[10px] font-bold text-gray-400 tracking-widest">{filteredUniversities.length} Institutions Found</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="uni-search"
                    type="text"
                    className="input-field pl-12 h-12 bg-gray-50/50"
                    placeholder="Search by name or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="label ml-1">Geographic Node</label>
                    <select id="uni-country-filter" className="input-field h-12 bg-gray-50/50" value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
                      {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label ml-1">Academic Discipline</label>
                    <select id="uni-course-filter" className="input-field h-12 bg-gray-50/50" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
                      {courses.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label ml-1">Capital Reservoir</label>
                    <select id="uni-budget-filter" className="input-field h-12 bg-gray-50/50" value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)}>
                      <option value="All">All Budgets</option>
                      <option value="under-15k">Under $15k</option>
                      <option value="15k-30k">$15k – $30k</option>
                      <option value="30k-50k">$30k – $50k</option>
                      <option value="over-50k">Over $50k</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* University Cards */}
            {filteredUniversities.length === 0 ? (
              <div className="card text-center py-24 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <GraduationCap size={40} className="text-gray-300" />
                </div>
                <h3 className="text-xl font-black text-gray-900 uppercase">No Matches Resolved</h3>
                <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto font-medium">Try recalibrating your filters to find similar academic trajectories.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredUniversities.map((uni) => (
                  <UniversityCard key={uni.id} university={uni} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
