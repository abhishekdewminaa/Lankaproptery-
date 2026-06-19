import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Search, Calendar, User, Clock, ArrowRight, TrendingUp, Eye, FileText } from 'lucide-react';
import { motion } from 'motion/react';

export default function PublicBlog({ onNavigatePost }: { onNavigatePost: (slug: string) => void }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const CATEGORIES = ['All', 'Property News', 'Buying Guide', 'Market Update', 'Area Guide', 'Legal & Finance'];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      if (error) {
        if (error.code === '42P01') {
           // fallback mock
           setPosts([{
             id: 1, title: 'Top 5 Up-and-Coming Neighborhoods in Colombo', 
             slug: 'top-5-colombo',
             excerpt: 'Explore the latest trends in Colombo real estate and find out which neighborhoods are experiencing the highest growth this quarter.',
             category: 'Market Update', author: 'Senaka De Silva', created_at: new Date().toISOString(),
             views_count: 1420,
             featured_image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2000&auto=format&fit=crop'
           },
           {
             id: 2, title: 'Legal Checklist for First Time Buyers', 
             slug: 'legal-checklist',
             excerpt: 'Buying property can be stressful. We break down the absolute essentials you must verify regarding clear deeds and title reports.',
             category: 'Legal & Finance', author: 'LankaProperty Legal', created_at: new Date().toISOString(),
             views_count: 980,
             featured_image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop'
           }]);
        }
      } else {
        setPosts(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(p => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || (p.excerpt && p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const featuredPost = posts.length > 0 ? posts[0] : null;

  return (
    <div className="font-sans min-h-screen bg-gray-50 pb-20 animate-in fade-in duration-700">
      
      {/* HERO SECTION */}
      <div className="bg-[linear-gradient(135deg,#0a2010_0%,#0d2d18_50%,#0a1f0e_100%)] text-white pt-32 pb-24 px-6 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-[#10B981] blur-[120px] rounded-full mix-blend-screen opacity-20 animate-pulse"></div>
            <div className="absolute top-[20%] right-[-10%] w-[40%] h-[120%] bg-[#059669] blur-[100px] rounded-full mix-blend-screen opacity-20"></div>
         </div>
         <div className="max-w-7xl mx-auto relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
               <span className="bg-white/10 text-emerald-400 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest border border-emerald-500/30 mb-6 inline-block">The Blog</span>
               <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">LankaProperty <span className="text-emerald-400">Insights</span></h1>
               <p className="text-xl text-white/70 font-medium max-w-2xl mx-auto">Expert guides, market updates & property tips for Sri Lanka's leading real estate market.</p>
            </motion.div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">

        <div className="flex flex-col lg:flex-row gap-12">
           {/* MAIN CONTENT AREA */}
           <div className="w-full lg:w-[70%] space-y-12">
               
               {/* FEATURED POST */}
               {featuredPost && activeCategory === 'All' && !searchQuery && (
                  <div className="bg-white rounded-[32px] overflow-hidden shadow-xl shadow-black/5 border border-gray-100 group cursor-pointer" onClick={() => onNavigatePost(featuredPost.slug)}>
                     <div className="h-[300px] md:h-[400px] bg-gray-200 relative overflow-hidden">
                        {featuredPost.featured_image && (
                           <img src={featuredPost.featured_image} alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        )}
                        <div className="absolute top-6 left-6">
                           <span className="bg-emerald-600 text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg">{featuredPost.category}</span>
                        </div>
                     </div>
                     <div className="p-8 md:p-12">
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">
                           <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(featuredPost.created_at).toLocaleDateString()}</span>
                           <span className="hidden md:flex items-center gap-1.5"><User size={14} /> {featuredPost.author}</span>
                           <span className="flex items-center gap-1.5"><Eye size={14} /> {featuredPost.views_count || 0} views</span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-4 leading-tight group-hover:text-emerald-600 transition-colors">
                           {featuredPost.title}
                        </h2>
                        <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                           {featuredPost.excerpt}
                        </p>
                        <span className="inline-flex items-center gap-2 text-emerald-600 font-bold group-hover:text-emerald-700">
                           Read Full Story <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                     </div>
                  </div>
               )}

               {/* FILTERS */}
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex gap-2 overflow-x-auto pb-2 w-full hide-scrollbar">
                     {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                           {cat}
                        </button>
                     ))}
                  </div>
               </div>

               {/* ARTICLE GRID */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredPosts.filter(p => p.id !== featuredPost?.id || activeCategory !== 'All' || searchQuery).map(post => (
                     <div key={post.id} onClick={() => onNavigatePost(post.slug)} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 group cursor-pointer transition-all duration-300">
                        <div className="h-[240px] bg-gray-100 overflow-hidden relative">
                           {post.featured_image ? (
                              <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                                 <FileText size={48} />
                              </div>
                           )}
                           <div className="absolute top-4 left-4">
                              <span className="bg-white/90 backdrop-blur text-emerald-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm">{post.category}</span>
                           </div>
                        </div>
                        <div className="p-6">
                           <div className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-widest flex items-center gap-3">
                              <span>{new Date(post.created_at).toLocaleDateString()}</span>
                              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              <span>3 min read</span>
                           </div>
                           <h3 className="text-xl font-black text-gray-900 leading-snug mb-3 group-hover:text-emerald-700 transition-colors line-clamp-2">{post.title}</h3>
                           <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                           <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2"><User size={14}/> {post.author}</span>
                              <ArrowRight size={18} className="text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
               
               {filteredPosts.length === 0 && !loading && (
                  <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100">
                     <p className="text-gray-500 font-bold">No articles found matching your criteria.</p>
                  </div>
               )}

           </div>

           {/* SIDEBAR AREA (30%) */}
           <div className="w-full lg:w-[30%] space-y-8 mt-4 lg:mt-0">
               
               {/* Search */}
               <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm relative">
                  <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                     type="text" 
                     placeholder="Search articles..." 
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                     className="w-full bg-gray-50 pl-12 pr-4 py-3.5 rounded-xl border border-gray-100 text-sm font-bold outline-none focus:border-emerald-500 transition-colors" 
                  />
               </div>

               {/* Popular */}
               <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                     <TrendingUp className="text-emerald-600" size={20} /> Popular Articles
                  </h3>
                  <div className="space-y-6">
                     {posts.slice(0, 5).sort((a,b) => (b.views_count||0) - (a.views_count||0)).map((post, idx) => (
                        <div key={post.id} onClick={() => onNavigatePost(post.slug)} className="flex items-start gap-4 group cursor-pointer">
                           <span className="text-3xl font-black text-gray-200 mt-1">{idx + 1}</span>
                           <div>
                              <h4 className="text-sm font-bold text-gray-800 group-hover:text-emerald-600 leading-snug line-clamp-2 transition-colors mb-1">{post.title}</h4>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{new Date(post.created_at).toLocaleDateString()} · {post.views_count || 0} Views</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Newsletter Sidebar Banner */}
               <div className="bg-[linear-gradient(135deg,#0a2010_0%,#0d2d18_50%,#0a1f0e_100%)] p-8 rounded-[32px] shadow-xl text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981] blur-[50px] opacity-20 rounded-full"></div>
                  <h3 className="text-white text-xl font-black mb-3 relative z-10">Market Updates,<br/> Delivered.</h3>
                  <p className="text-emerald-100 text-sm mb-6 relative z-10">Get the latest insights and properties in your inbox weekly.</p>
                  <input type="email" placeholder="Your email address" className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 px-4 py-3 rounded-xl mb-3 text-sm focus:outline-none focus:border-emerald-500 relative z-10" />
                  <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-colors relative z-10">Subscribe Now</button>
               </div>

           </div>
        </div>

      </div>
    </div>
  );
}
