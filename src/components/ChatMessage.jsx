import { formatTime } from '../utils/chatbot';

export default function ChatMessage({ message }) {
  const { text, isBot, timestamp, suggestions, isStreaming } = message;

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4 animate-fade-in`}>
      <div className={`max-w-[85%] ${isBot ? 'chat-message-bot' : 'chat-message-user'}`}>
        {/* Avatar */}
        {isBot && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-teal flex items-center justify-center text-xs font-bold">
              AI
            </div>
            <span className="text-xs text-muted">EduPath AI</span>
            <span className="text-xs text-muted">{formatTime(timestamp)}</span>
            {isStreaming && (
              <span className="text-xs text-blue-400 animate-pulse">● typing...</span>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isBot
              ? 'bg-surface-card border border-surface-border rounded-tl-sm'
              : 'bg-primary rounded-tr-sm'
          }`}
        >
          {/* Empty state: show pulsing dot while first token loads */}
          {isBot && !text && isStreaming ? (
            <div className="flex gap-1 py-1">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            /* Render markdown-like text */
            <div className="text-sm text-white whitespace-pre-wrap leading-relaxed">
              {text.split('\n').map((line, i) => {
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
              {/* Blinking cursor while streaming */}
              {isStreaming && (
                <span className="inline-block w-0.5 h-4 bg-blue-400 ml-0.5 animate-pulse align-middle" />
              )}
            </div>
          )}
        </div>

        {/* Suggestions — only after streaming is done */}
        {isBot && !isStreaming && suggestions && suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                className="text-xs px-3 py-1.5 rounded-full border border-primary/40 text-blue-300 hover:bg-primary/20 transition-colors"
                onClick={() => {
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
          <p className="text-xs text-muted text-right mt-1">{formatTime(timestamp)}</p>
        )}
      </div>
    </div>
  );
}

