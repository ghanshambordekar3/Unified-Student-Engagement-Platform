import { useState, useEffect } from 'react';
import { Newspaper, Clock, Tag, ChevronDown, Bookmark, Sparkles, Mail } from 'lucide-react';
import articlesData from '../data/articles.json';
import { trackPageView } from '../utils/personalization';
import storage from '../utils/storage';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { PageTransition } from '../components/ui/PageTransition';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

const BOOKMARKS_KEY = 'edupath_bookmarks';

export default function Content() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [bookmarks, setBookmarks] = useState(() => storage.get(BOOKMARKS_KEY, []));
  const [email, setEmail] = useState('');

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

  const handleSubscribe = () => {
    if (email) {
      alert('Subscribed successfully!');
      setEmail('');
    }
  };

  return (
    <PageTransition transitionKey="content">
      <div className="space-y-10 pb-12">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-200 rounded-full w-fit"
            >
              <Newspaper size={14} className="text-pink-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-pink-700">Generative Intelligence</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">AI Insights <span className="text-gradient">Hub</span></h1>
            <p className="text-gray-500 font-medium text-sm">Expert guides, country comparisons, loan tips — powered by AI</p>
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-4 py-2 bg-pink-50 border border-pink-200 rounded-full"
          >
            <span className="text-xs font-black uppercase tracking-widest text-pink-500">AI-Generated Content</span>
          </motion.div>
        </section>

        {/* Featured Article */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={14} className="text-yellow-500" />
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Featured Intelligence</h2>
          </div>
          <GlassCard 
            className="p-8 relative overflow-hidden cursor-pointer border-pink-200" 
            hoverable={true}
            onClick={() => setExpandedId(expandedId === articlesData[0].id ? null : articlesData[0].id)}
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-pink-100 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="px-3 py-1 bg-yellow-100 border border-yellow-200 text-yellow-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                  Featured
                </span>
                <span className="px-3 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                  {articlesData[0].tag}
                </span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">{articlesData[0].title}</h2>
              <p className="text-gray-500 text-sm mb-4 max-w-2xl">{articlesData[0].summary}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                <span className="flex items-center gap-1.5"><Clock size={12} /> {articlesData[0].readTime}</span>
                <span className="flex items-center gap-1.5"><Tag size={12} /> {articlesData[0].category}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === articlesData[0].id ? null : articlesData[0].id); }}
                  className="ml-auto flex items-center gap-1.5 text-pink-500 hover:text-pink-600 transition-colors font-black uppercase tracking-widest"
                >
                  {expandedId === articlesData[0].id ? 'Collapse' : 'Read Article'}
                  <ChevronDown size={14} className={cn("transition-transform duration-300", expandedId === articlesData[0].id && "rotate-180")} />
                </button>
              </div>

              {expandedId === articlesData[0].id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-6 pt-6 border-t border-gray-200"
                >
                  {articlesData[0].content.map((para, i) => (
                    <p key={i} className="text-sm text-gray-700 leading-7 mb-4 last:mb-0">{para}</p>
                  ))}
                </motion.div>
              )}
            </div>
          </GlassCard>
        </section>

        {/* Category Filter */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
            <Sparkles size={14} className="text-teal-500" /> Knowledge Categories
          </h2>
          <div className="flex gap-3 flex-wrap">
            {categories.map((cat, idx) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300",
                  activeCategory === cat 
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg" 
                    : "bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-pink-300"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Articles Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 flex items-center gap-2">
              <Newspaper size={14} className="text-pink-500" /> Latest Insights
            </h2>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{filtered.length} Articles</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((article, idx) => (
              <GlassCard 
                key={article.id} 
                className={cn(
                  "p-6 cursor-pointer overflow-hidden",
                  article.border?.includes('border-pink') ? 'border-pink-200' : 
                  article.border?.includes('border-blue') ? 'border-blue-200' : 
                  'border-gray-200'
                )}
                hoverable={true}
                delay={idx * 0.1}
                onClick={() => setExpandedId(expandedId === article.id ? null : article.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{article.icon}</span>
                    <span className={cn(
                      "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border",
                      article.border?.includes('border-pink') ? 'bg-pink-50 border-pink-200 text-pink-500' :
                      article.border?.includes('border-blue') ? 'bg-blue-50 border-blue-200 text-blue-500' :
                      'bg-gray-100 border-gray-200 text-gray-600'
                    )}>
                      {article.tag}
                    </span>
                  </div>
                  <button
                    onClick={(e) => toggleBookmark(article.id, e)}
                    className={cn(
                      "p-2 rounded-xl transition-all duration-300",
                      bookmarks.includes(article.id) 
                        ? 'text-yellow-500 bg-yellow-50' 
                        : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-50'
                    )}
                  >
                    <Bookmark size={16} className={bookmarks.includes(article.id) ? 'fill-yellow-500' : ''} />
                  </button>
                </div>

                <h3 className="text-lg font-black text-gray-900 mb-2 leading-tight">{article.title}</h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{article.summary}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1.5"><Clock size={11} /> {article.readTime}</span>
                  <span className="flex items-center gap-1.5"><Tag size={11} /> {article.category}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setExpandedId(expandedId === article.id ? null : article.id); }}
                    className="ml-auto flex items-center gap-1.5 text-pink-500 hover:text-pink-600 transition-colors font-bold uppercase tracking-wider"
                  >
                    {expandedId === article.id ? 'Less' : 'More'}
                    <ChevronDown size={12} className={cn("transition-transform duration-300", expandedId === article.id && "rotate-180")} />
                  </button>
                </div>

                {expandedId === article.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-5 pt-5 border-t border-gray-200"
                  >
                    {article.content.map((para, i) => (
                      <p key={i} className="text-sm text-gray-700 leading-7 mb-3 last:mb-0">{para}</p>
                    ))}
                  </motion.div>
                )}
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section>
          <GlassCard className="p-10 text-center border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50 relative overflow-hidden" hoverable={false}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-pink-100 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-pink-100 border border-pink-200 flex items-center justify-center"
              >
                <Mail size={28} className="text-pink-500" />
              </motion.div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Stay Ahead with AI Insights</h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                Get weekly AI-curated articles on scholarships, visa updates, and university deadlines delivered to your inbox.
              </p>
              <div className="flex gap-4 max-w-md mx-auto flex-col sm:flex-row">
                <input 
                  type="email" 
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-400 transition-all"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button 
                  onClick={handleSubscribe}
                  className="h-auto px-8 py-4 font-black uppercase tracking-widest text-xs"
                  glow
                >
                  Subscribe
                </Button>
              </div>
              <p className="text-[10px] text-gray-400 mt-4 font-black uppercase tracking-widest">Join 12,000+ students</p>
            </div>
          </GlassCard>
        </section>
      </div>
    </PageTransition>
  );
}
