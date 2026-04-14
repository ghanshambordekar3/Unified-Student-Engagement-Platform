import { useState, useRef, useEffect } from 'react';
import { Send, Bot, GraduationCap, Filter, Search, SlidersHorizontal } from 'lucide-react';
import { getChatResponseStream } from '../utils/chatbot';
import ChatMessage from '../components/ChatMessage';
import UniversityCard from '../components/UniversityCard';
import storage from '../utils/storage';
import universitiesData from '../data/universities.json';
import { trackEvent } from '../utils/rewards';

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

  // Handle suggestion chip clicks from ChatMessage
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
    
    // Prevent double execution (React StrictMode)
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
    let isDone = false;
    
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
      (suggestions) => {
        if (isDone) return;
        isDone = true;
        setMessages((m) =>
          m.map((msg) =>
            msg.id === botMsgId
              ? { ...msg, isStreaming: false, suggestions: suggestions.length > 0 ? suggestions : ['Tell me about Canada', 'MBA programs', 'Education loans'] }
              : msg
          )
        );
        isGeneratingRef.current = false;
      }
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900">Explore</h1>
        <p className="text-gray-500 text-sm mt-1">Chat with AI or browse universities</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl border border-gray-200 w-fit">
        <button
          id="tab-chatbot"
          onClick={() => setActiveTab('chatbot')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'chatbot'
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          🤖 Career Chatbot
        </button>
        <button
          id="tab-universities"
          onClick={() => setActiveTab('universities')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'universities'
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          🏫 Universities
        </button>
      </div>

      {/* Chatbot Tab */}
      {activeTab === 'chatbot' && (
        <div className="card p-0 overflow-hidden flex flex-col" style={{ height: '600px' }}>
          {/* Chat Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">EduPath AI</h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-slow" />
                  <span className="text-xs text-green-600">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              Clear Chat
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-1">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
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
                disabled={!inputValue.trim()}
                className="btn-primary px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <SlidersHorizontal size={18} className="text-teal-500" />
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <span className="ml-auto text-xs text-gray-400">{filteredUniversities.length} results</span>
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
              <GraduationCap size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-900 font-semibold">No universities found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
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
