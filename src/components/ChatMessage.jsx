import { formatTime } from '../utils/chatbot';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatMessage({ message }) {
  const { text, isBot, timestamp, suggestions, isStreaming, data } = message;

  // Robust Text Renderer (Handles bolding and basic lists)
  const renderContent = (content) => {
    if (!content) return null;
    
    return content.split('\n').map((line, i) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return <div key={i} className="h-2" />;

      // 1. Handle Bullet Points
      const isBullet = trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ');
      const cleanLine = isBullet ? trimmedLine.substring(2) : line;
      
      // 2. Handle Bold Text
      const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);
      const elements = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className={`font-bold ${isBot ? 'text-black' : 'text-blue-900'}`}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <div key={i} className={`mb-1.5 ${isBullet ? 'flex gap-2 pl-1' : ''}`}>
          {isBullet && (
            <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isBot ? 'bg-blue-600' : 'bg-blue-800'}`} />
          )}
          <span className="flex-1">{elements}</span>
        </div>
      );
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-10 group`}
    >
      <div className={`max-w-[85%] sm:max-w-[82%] ${isBot ? 'flex gap-4' : ''}`}>
        {/* Bot Avatar */}
        {isBot && (
          <div className="flex-shrink-0 mt-1">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-teal flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20"
            >
              <span className="text-[10px] font-black text-white">AI</span>
            </motion.div>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {isBot && (
            <div className="flex items-center gap-2 ml-1">
              <span className="text-[10px] uppercase tracking-widest font-black text-gray-400">EduPath Assistant</span>
              <span className="text-[10px] text-gray-300">{formatTime(timestamp)}</span>
            </div>
          )}

          {/* Message bubble */}
          <motion.div
            whileHover={{ y: -2 }}
            className={`rounded-3xl px-6 py-5 relative shadow-2xl transition-all duration-500 ${isBot
              ? 'bg-white border border-gray-100 text-slate-900 rounded-tl-none ring-1 ring-black/5 shadow-gray-200/50'
              : 'bg-teal-50 border border-teal-100 text-teal-950 rounded-tr-none ring-1 ring-teal-900/10'
              }`}
          >
            {/* Thinking / Streaming Indicator */}
            {isBot && !text && isStreaming ? (
              <div className="flex gap-2 py-2 items-center px-1">
                {[0, 0.2, 0.4].map((delay) => (
                  <motion.div 
                    key={delay}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} 
                    transition={{ repeat: Infinity, duration: 1.2, delay }} 
                    className="w-2 h-2 rounded-full bg-teal-600" 
                  />
                ))}
              </div>
            ) : (
              <div className="text-[15px] leading-[1.6] tracking-normal font-medium whitespace-pre-wrap">
                {renderContent(text)}
                {isStreaming && (
                  <motion.span 
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="inline-block w-2 h-4 bg-teal-600/50 ml-1 align-middle rounded-full font-black"
                  />
                )}
              </div>
            )}
          </motion.div>

          {/* Suggestions */}
          {isBot && !isStreaming && suggestions && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 ml-1">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => window.dispatchEvent(new CustomEvent('chatSuggestion', { detail: s }))}
                  className="px-4 py-2 rounded-full border border-gray-200 bg-white text-[11px] font-black uppercase tracking-widest text-gray-500 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 transition-all duration-300 shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* User timestamp */}
          {!isBot && (
            <span className="text-[10px] text-gray-400 text-right mt-1 pr-2">
              {formatTime(timestamp)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
