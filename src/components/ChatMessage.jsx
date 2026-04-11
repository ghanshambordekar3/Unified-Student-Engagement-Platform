import { formatTime } from '../utils/chatbot';

export default function ChatMessage({ message }) {
  const { text, isBot, timestamp, suggestions } = message;

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4 animate-fade-in`}>
      <div className={`max-w-[85%] ${isBot ? '' : ''}`}>
        {/* Avatar */}
        {isBot && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-teal flex items-center justify-center text-xs font-bold text-white">
              AI
            </div>
            <span className="text-xs text-gray-500">EduPath AI</span>
            <span className="text-xs text-gray-500">{formatTime(timestamp)}</span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isBot
              ? 'bg-white border border-gray-200 rounded-tl-sm shadow-sm'
              : 'bg-gradient-to-r from-blue-600 to-teal-500 rounded-tr-sm text-white'
          }`}
        >
          {/* Render markdown-like text */}
          <div className={`text-sm whitespace-pre-wrap leading-relaxed ${isBot ? 'text-gray-800' : 'text-white'}`}>
            {text.split('\n').map((line, i) => {
              // Bold text: **text**
              const parts = line.split(/(\*\*[^*]+\*\*)/g);
              return (
                <span key={i}>
                  {parts.map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
                    }
                    return part;
                  })}
                  {i < text.split('\n').length - 1 && '\n'}
                </span>
              );
            })}
          </div>
        </div>

        {/* Suggestions */}
        {isBot && suggestions && suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                className="text-xs px-3 py-1.5 rounded-full border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                onClick={() => {
                  // Dispatch a custom event that Explore.jsx will listen to
                  window.dispatchEvent(new CustomEvent('chatSuggestion', { detail: s }));
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* User timestamp */}
        {!isBot && (
          <p className="text-xs text-gray-500 text-right mt-1">{formatTime(timestamp)}</p>
        )}
      </div>
    </div>
  );
}
