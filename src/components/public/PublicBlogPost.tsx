import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { ArrowLeft, Calendar, User, Clock, Share2, Copy, Check, Facebook, Twitter, Link } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PublicBlogPost({ slug, onBack }: { slug: string, onBack: () => void }) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();
        
      if (error && error.code === '42P01') {
         // fallback mock post 
         setPost({
           id: 1, title: 'Top 5 Up-and-Coming Neighborhoods in Colombo', 
           slug: 'top-5-colombo',
           excerpt: 'Explore the latest trends in Colombo real estate and find out which neighborhoods are experiencing the highest growth.',
           content: '<h2>Why Invest in Colombo?</h2><p>Colombo is rapidly growing... This is a mock article content replacing the database due to missing table.</p>',
           category: 'Market Update', author: 'Senaka De Silva', created_at: new Date().toISOString(),
           views_count: 1420, tags: 'Colombo,Investment,Trends',
           featured_image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2000&auto=format&fit=crop'
         });
      } else if (data) {
         setPost(data);
         // update views
         await supabase.from('blog_posts').update({ views_count: (data.views_count || 0) + 1 }).eq('id', data.id);
         
         // fetch related
         const { data: related } = await supabase
           .from('blog_posts')
           .select('title, slug, featured_image, created_at, category')
           .eq('category', data.category)
           .neq('id', data.id)
           .eq('status', 'published')
           .limit(3);
         if (related) setRelatedPosts(related);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!post) {
     return <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col"><h2 className="text-2xl font-black text-gray-900 mb-4">Post not found</h2><button onClick={onBack} className="text-emerald-600 font-bold">Return to Blog</button></div>;
  }

  return (
    <div className="font-sans min-h-screen bg-gray-50 pb-20 animate-in fade-in duration-500">
      
      {/* Dynamic SEO Meta Tags would normally go here using Head */}
      
      <div className="max-w-4xl mx-auto px-5 md:px-8 pt-24 md:pt-32">
         {/* BREADCRUMB */}
         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-8">
            <button onClick={() => window.location.href = '/'} className="hover:text-emerald-600 transition-colors">Home</button>
            <span className="text-gray-300">/</span>
            <button onClick={onBack} className="hover:text-emerald-600 transition-colors">Blog</button>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 truncate max-w-[200px]">{post.title}</span>
         </div>
         
         <button onClick={onBack} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors mb-8 shadow-sm">
            <ArrowLeft size={18} />
         </button>

         {/* HEADER */}
         <div className="text-center mb-10 md:mb-16">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg mb-6 inline-block">{post.category}</span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight mb-8">
               {post.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold uppercase tracking-widest text-gray-500">
               <span className="flex items-center gap-2"><User size={16} className="text-gray-400" /> {post.author}</span>
               <span className="flex items-center gap-2"><Calendar size={16} className="text-gray-400" /> {new Date(post.created_at).toLocaleDateString()}</span>
               <span className="flex items-center gap-2"><Clock size={16} className="text-gray-400" /> 4 Min Read</span>
            </div>
         </div>

         {/* FEATURED IMAGE */}
         {post.featured_image && (
            <div className="w-full h-[300px] md:h-[500px] rounded-[32px] overflow-hidden shadow-2xl shadow-black/5 mb-16 relative">
               <img onError={(e) => { e.currentTarget.src = '/placeholder-property.jpg' }} src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
            </div>
         )}

         <div className="flex flex-col md:flex-row gap-12">
            {/* SIDE SHARE BAR */}
            <div className="hidden md:flex flex-col gap-4 w-12 pt-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 rotate-180" style={{ writingMode: 'vertical-rl' }}>Share</span>
               <button onClick={handleCopyLink} className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors shadow-sm">
                  {copied ? <Check size={16} /> : <Link size={16} />}
               </button>
               <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors shadow-sm">
                  <Facebook size={16} />
               </button>
               <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors shadow-sm">
                  <Twitter size={16} />
               </button>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 max-w-3xl">
               {post.excerpt && (
                  <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-medium mb-12 italic border-l-4 border-emerald-500 pl-6 py-2">
                     "{post.excerpt}"
                  </p>
               )}

               <div className="prose prose-lg prose-emerald max-w-none text-gray-800 leading-loose" dangerouslySetInnerHTML={{ __html: post.content || '' }} />

               <div className="mt-16 pt-8 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                     {post.tags?.split(',').map((tag: string) => (
                        <span key={tag} className="bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">#{tag.trim()}</span>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* RELATED POSTS */}
      {relatedPosts.length > 0 && (
         <div className="max-w-7xl mx-auto px-6 mt-24">
            <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Read Next</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {relatedPosts.map(rp => (
                  <a href={`/blog/${rp.slug}`} key={rp.slug} className="group cursor-pointer">
                     <div className="h-[200px] bg-gray-100 rounded-3xl overflow-hidden mb-4 relative">
                        <img onError={(e) => { e.currentTarget.src = '/placeholder-property.jpg' }} src={rp.featured_image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-4 left-4">
                           <span className="bg-white/90 backdrop-blur text-emerald-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">{rp.category}</span>
                        </div>
                     </div>
                     <h4 className="text-lg font-black text-gray-900 leading-snug group-hover:text-emerald-700 transition-colors mb-2">{rp.title}</h4>
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{new Date(rp.created_at).toLocaleDateString()}</p>
                  </a>
               ))}
            </div>
         </div>
      )}
    </div>
  );
}
