import { useState, useRef, useEffect } from 'react';
import { Send, Bot, GraduationCap, Filter, Search, SlidersHorizontal } from 'lucide-react';
import { getChatResponse, createUserMessage } from '../utils/chatbot';
import ChatMessage from '../components/ChatMessage';
import UniversityCard from '../components/UniversityCard';
import storage from '../utils/storage';
import universitiesData from '../data/universities.json';
import { trackEvent } from '../utils/rewards';

const CHAT_KEY = 'edupath_chat_history';

const welcomeMessage = {
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
    return saved || [welcomeMessage];
  });
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
  }, [messages, isTyping]);

  // Handle suggestion chip clicks from ChatMessage
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

    // Simulate typing delay
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Explore</h1>
        <p className="text-muted text-sm mt-1">Chat with AI or browse universities</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-surface rounded-xl border border-surface-border w-fit">
        <button
          id="tab-chatbot"
          onClick={() => setActiveTab('chatbot')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'chatbot'
              ? 'bg-primary text-white shadow-lg shadow-primary/30'
              : 'text-muted hover:text-white'
          }`}
        >
          🤖 Career Chatbot
        </button>
        <button
          id="tab-universities"
          onClick={() => setActiveTab('universities')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'universities'
              ? 'bg-primary text-white shadow-lg shadow-primary/30'
              : 'text-muted hover:text-white'
          }`}
        >
          🏫 Universities
        </button>
      </div>

      {/* Chatbot Tab */}
      {activeTab === 'chatbot' && (
        <div className="card p-0 overflow-hidden flex flex-col" style={{ height: '600px' }}>
          {/* Chat Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border bg-surface">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-teal flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">EduPath AI</h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
                  <span className="text-xs text-green-400">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="text-xs text-muted hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-card"
            >
              Clear Chat
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-1">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {isTyping && (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-teal flex items-center justify-center text-xs font-bold">AI</div>
                <div className="bg-surface-card border border-surface-border rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-surface-border bg-surface">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                id="chat-input"
                type="text"
                className="input-field flex-1"
                placeholder="Ask anything... e.g. 'Tell me about Canada'"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                id="chat-send"
                onClick={() => sendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universities Tab */}
      {activeTab === 'universities' && (
        <div className="space-y-5">
          {/* Filters */}
          <div className="card space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <SlidersHorizontal size={18} className="text-primary" />
              <h3 className="font-semibold text-white">Filters</h3>
              <span className="ml-auto text-xs text-muted">{filteredUniversities.length} results</span>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                id="uni-search"
                type="text"
                className="input-field pl-9"
                placeholder="Search universities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label">Country</label>
                <select id="uni-country-filter" className="input-field" value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
                  {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Course</label>
                <select id="uni-course-filter" className="input-field" value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
                  {courses.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Budget (USD/yr)</label>
                <select id="uni-budget-filter" className="input-field" value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)}>
                  <option value="All">All Budgets</option>
                  <option value="under-15k">Under $15k</option>
                  <option value="15k-30k">$15k – $30k</option>
                  <option value="30k-50k">$30k – $50k</option>
                  <option value="over-50k">Over $50k</option>
                </select>
              </div>
            </div>
          </div>

          {/* University Cards */}
          {filteredUniversities.length === 0 ? (
            <div className="card text-center py-12">
              <GraduationCap size={40} className="mx-auto text-muted mb-3" />
              <p className="text-white font-semibold">No universities found</p>
              <p className="text-muted text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredUniversities.map((uni) => (
                <UniversityCard key={uni.id} university={uni} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
