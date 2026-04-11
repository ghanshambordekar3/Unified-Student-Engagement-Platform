import { useState, useEffect } from 'react';
import { Newspaper, Clock, Tag, ChevronDown, ChevronUp, Bookmark } from 'lucide-react';
import articlesData from '../data/articles.json';
import { trackPageView } from '../utils/personalization';
import storage from '../utils/storage';

const BOOKMARKS_KEY = 'edupath_bookmarks';

export default function Content() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [bookmarks, setBookmarks] = useState(() => storage.get(BOOKMARKS_KEY, []));

  useEffect(() => {
    trackPageView('/content');
  }, []);

  useEffect(() => {
    storage.set(BOOKMARKS_KEY, bookmarks);
  }, [bookmarks]);

  const categories = ['All', ...new Set(articlesData.map((a) => a.category))];
  const filtered = activeCategory === 'All' ? articlesData : articlesData.filter((a) => a.category === activeCategory);

  const toggleBookmark = (id, e) => {
    e.stopPropagation();
    setBookmarks((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Newspaper className="text-pink-400" size={26} />
            AI Insights Hub
          </h1>
          <p className="text-muted text-sm mt-1">Expert guides, country comparisons, loan tips — powered by AI</p>
        </div>
        <span className="badge bg-pink-500/20 border border-pink-500/30 text-pink-400 text-xs font-bold px-3 py-1.5">
          🤖 AI-Generated Content
        </span>
      </div>

      {/* Featured Article */}
      <div className="card bg-gradient-to-br from-primary/20 to-teal/10 border-primary/30 relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-all"
        onClick={() => setExpandedId(expandedId === articlesData[0].id ? null : articlesData[0].id)}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs">⭐ Featured</span>
            <span className="badge bg-surface border border-surface-border text-muted text-xs">{articlesData[0].tag}</span>
          </div>
          <h2 className="text-xl font-black text-white mb-2 group-hover:text-blue-300 transition-colors">{articlesData[0].title}</h2>
          <p className="text-muted text-sm mb-4">{articlesData[0].summary}</p>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1"><Clock size={12} /> {articlesData[0].readTime} read</span>
            <span className="flex items-center gap-1"><Tag size={12} /> {articlesData[0].category}</span>
            <span className="ml-auto text-blue-300 flex items-center gap-1">
              {expandedId === articlesData[0].id ? 'Collapse' : 'Read article'} <ChevronDown size={14} className={`transition-transform ${expandedId === articlesData[0].id ? 'rotate-180' : ''}`} />
            </span>
          </div>

          {expandedId === articlesData[0].id && (
            <div className="mt-5 pt-5 border-t border-surface-border space-y-3 animate-fade-in">
              {articlesData[0].content.map((para, i) => (
                <p key={i} className="text-sm text-white/90 leading-7">{para}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-surface border border-surface-border text-muted hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((article) => (
          <div key={article.id} className={`card cursor-pointer transition-all duration-200 hover:border-pink-500/30 bg-gradient-to-br ${article.color} ${article.border} border`}
            onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}>

            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl">{article.icon}</span>
                <span className={`badge border text-xs ${article.border} text-muted`}>{article.tag}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => toggleBookmark(article.id, e)}
                  className={`p-1.5 rounded-lg transition-colors ${bookmarks.includes(article.id) ? 'text-yellow-400' : 'text-muted hover:text-yellow-400'}`}
                >
                  <Bookmark size={14} className={bookmarks.includes(article.id) ? 'fill-yellow-400' : ''} />
                </button>
              </div>
            </div>

            <h3 className="font-bold text-white mb-2 group-hover:text-blue-300 leading-snug">{article.title}</h3>
            <p className="text-sm text-muted mb-3 leading-relaxed">{article.summary}</p>

            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1"><Clock size={11} /> {article.readTime}</span>
              <span className="flex items-center gap-1"><Tag size={11} /> {article.category}</span>
              <span className="ml-auto flex items-center gap-1 text-blue-300">
                {expandedId === article.id ? 'Collapse' : 'Read more'}
                <ChevronDown size={12} className={`transition-transform ${expandedId === article.id ? 'rotate-180' : ''}`} />
              </span>
            </div>

            {/* Expanded content */}
            {expandedId === article.id && (
              <div className="mt-4 pt-4 border-t border-surface-border space-y-3 animate-fade-in">
                {article.content.map((para, i) => (
                  <p key={i} className="text-sm text-white/90 leading-7">{para}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Newsletter CTA */}
      <div className="card text-center py-8 border border-pink-500/20 bg-gradient-to-br from-pink-500/10 to-purple-500/10">
        <div className="text-4xl mb-3">📬</div>
        <h3 className="text-xl font-bold text-white mb-2">Stay Ahead with AI Insights</h3>
        <p className="text-muted text-sm max-w-md mx-auto mb-5">Get weekly AI-curated articles on scholarships, visa updates, and university deadlines delivered to your inbox.</p>
        <div className="flex gap-3 max-w-sm mx-auto">
          <input type="email" className="input-field flex-1" placeholder="your@email.com" />
          <button className="btn-primary flex-shrink-0 px-5">Subscribe</button>
        </div>
        <p className="text-xs text-muted mt-3">Join 12,000+ students • Unsubscribe anytime</p>
      </div>
    </div>
  );
}
