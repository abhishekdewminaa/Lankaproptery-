import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  FileText, TrendingUp, Eye, FileEdit, Trash2, Settings, Plus, Loader2, Sparkles, X, ChevronLeft, Calendar, Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminBlog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editingPost, setEditingPost] = useState<any>(null);

  // Editor State
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Property News');
  const [tags, setTags] = useState('');
  const [author, setAuthor] = useState('LankaProperty.lk Team');
  const [featuredImage, setFeaturedImage] = useState('');
  const [status, setStatus] = useState('draft');
  const [publishDate, setPublishDate] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [slug, setSlug] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist yet, that's fine
          console.warn("blog_posts table not created. Using mock data.");
          setPosts([{
            id: 1, title: 'Mock Post', category: 'Property News', author: 'Team', status: 'published', created_at: new Date().toISOString(), views_count: 142
          }]);
        } else {
          throw error;
        }
      } else {
        setPosts(data || []);
      }
    } catch (e) {
      console.error("Error fetching admin blogs", e);
    } finally {
      setLoading(false);
    }
  };

  const openEditor = (post?: any) => {
    if (post) {
      setEditingPost(post);
      setTitle(post.title || '');
      setExcerpt(post.excerpt || '');
      setContent(post.content || '');
      setCategory(post.category || 'Property News');
      setTags(post.tags || '');
      setAuthor(post.author || 'LankaProperty.lk Team');
      setFeaturedImage(post.featured_image || '');
      setStatus(post.status || 'draft');
      setPublishDate(post.publish_date ? new Date(post.publish_date).toISOString().slice(0, 16) : '');
      setMetaTitle(post.meta_title || '');
      setMetaDesc(post.meta_description || '');
      setSlug(post.slug || '');
    } else {
      setEditingPost(null);
      setTitle('');
      setExcerpt('');
      setContent('');
      setCategory('Property News');
      setTags('');
      setAuthor('LankaProperty.lk Team');
      setFeaturedImage('');
      setStatus('draft');
      setPublishDate('');
      setMetaTitle('');
      setMetaDesc('');
      setSlug('');
    }
    setView('editor');
  };

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  useEffect(() => {
    if (!editingPost && title && !slug) {
      setSlug(generateSlug(title));
    }
  }, [title]);

  const handleSave = async (saveStatus: string) => {
    if (!title) {
      toast.error('Title is required');
      return;
    }
    setIsSaving(true);
    try {
      const postData = {
        title,
        slug: slug || generateSlug(title),
        excerpt,
        content,
        category,
        tags,
        author,
        featured_image: featuredImage,
        status: saveStatus,
        publish_date: publishDate ? new Date(publishDate).toISOString() : null,
        meta_title: metaTitle,
        meta_description: metaDesc,
        updated_at: new Date().toISOString()
      };

      if (editingPost) {
        const { error } = await supabase.from('blog_posts').update(postData).eq('id', editingPost.id);
        if (error) {
           if (error.code === '42P01') throw new Error("Table doesn't exist");
           throw error;
        }
        toast.success('Post updated!');
      } else {
        const { error } = await supabase.from('blog_posts').insert([postData]);
        if (error) {
           if (error.code === '42P01') throw new Error("Table doesn't exist. Apply setup-blog-views.sql");
           throw error;
        }
        toast.success('Post created!');
      }
      fetchPosts();
      setView('list');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to save post');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) {
         if (error.code === '42P01') {
            setPosts(posts.filter(p => p.id !== id));
            toast.success('Mock post deleted');
            return;
         }
         throw error;
      };
      toast.success('Post deleted');
      fetchPosts();
    } catch (e) {
      toast.error('Failed to delete post');
    }
  };

  const handleAIGenerate = async () => {
    if (!title) {
      toast.error("Please enter a title first to generate content.");
      return;
    }
    setIsGenerating(true);
    try {
      // Mocking AI generation if key is not straightforward, or using generic fetch
      // For this implementation, we will mock the AI output for safety unless a real key works
      let apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        // Mock generation
        await new Promise(r => setTimeout(r, 2000));
        setContent(`<h2>Introduction to ${title}</h2>\n<p>Sri Lanka's real estate market offers incredible opportunities. In this article, we explore everything you need to know about ${title.toLowerCase()}.</p>\n<h3>Why It Matters</h3>\n<p>Whether you are buying your first home or investing in commercial real estate, understanding the market trends is crucial. Recent data shows a steady appreciation in property values, particularly in the urban sectors of Colombo and its suburbs.</p>\n<ul>\n<li>Factor 1: Location accessibility</li>\n<li>Factor 2: Infrastructure development</li>\n<li>Factor 3: Neighborhood amenities</li>\n</ul>\n<h3>Conclusion</h3>\n<p>Stay informed with LankaProperty to make the best property decisions.</p>`);
        setExcerpt(`An insightful look into ${title.toLowerCase()} and what it means for Sri Lankan property investors and buyers.`);
        toast.success('Generated dummy content (No API key found)');
      } else {
        const prompt = `Write a high-quality blog post for a real estate platform called LankaProperty.lk. The title is "${title}". Format it in clean HTML with <h2>, <h3>, <p>, and <ul> tags. Include an excerpt at the very beginning wrapped in <div id="excerpt">...</div>. Keep it around 500 words.`;
        const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=" + apiKey;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        let text = data.candidates[0].content.parts[0].text;
        
        let genExcerpt = "";
        const excerptMatch = text.match(/<div id="excerpt">([\s\S]*?)<\/div>/);
        if (excerptMatch) {
           genExcerpt = excerptMatch[1].trim();
           text = text.replace(excerptMatch[0], '').trim();
        } else {
           genExcerpt = text.substring(0, 150) + '...';
        }

        setContent(text.replace(/```html|```/g, '').trim());
        setExcerpt(genExcerpt.replace(/(<([^>]+)>)/gi, ""));
        toast.success('Article generated automatically!');
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };


  if (view === 'editor') {
    return (
      <div className="max-w-[1600px] mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors">
            <ChevronLeft size={20} /> Back to Blog Manager
          </button>
          <div className="flex items-center gap-3">
            <button 
               onClick={() => handleSave('draft')}
               disabled={isSaving}
               className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold justify-center rounded-xl transition-all"
            >
              Save Draft
            </button>
            <button 
               onClick={() => handleSave(status === 'draft' ? 'published' : status)}
               disabled={isSaving}
               className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold justify-center rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />} 
              Publish
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: CONTENT AREA (70%) */}
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8">
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter article title..."
                className="w-full text-4xl font-black text-gray-900 placeholder:text-gray-300 outline-none mb-6"
              />
              <textarea 
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                placeholder="Add a short subtitle or excerpt..."
                className="w-full text-lg text-gray-500 placeholder:text-gray-300 outline-none resize-none mb-6 h-20"
              />

              <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
                <div className="bg-gray-50 border-b border-gray-100 p-2 flex gap-1 flex-wrap">
                  {['H1', 'H2', 'H3', 'B', 'I', 'U'].map(btn => (
                    <button key={btn} className="w-8 h-8 flex items-center justify-center rounded bg-white hover:bg-gray-100 text-xs font-bold text-gray-700 shadow-sm border border-gray-200">{btn}</button>
                  ))}
                  <div className="w-px h-8 bg-gray-200 mx-1"></div>
                  <button onClick={handleAIGenerate} disabled={isGenerating} className="px-3 h-8 flex items-center gap-2 rounded bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 text-xs font-bold text-indigo-700 transition-colors">
                    {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    Generate with AI
                  </button>
                </div>
                <textarea 
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write your article content here... HTML is supported."
                  className="w-full min-h-[500px] p-6 text-gray-800 outline-none resize-y leading-relaxed font-sans"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: SETTINGS AREA (30%) */}
          <div className="w-full lg:w-[400px] shrink-0 space-y-6">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-black text-gray-900 mb-4 pb-4 border-b border-gray-100">Publish Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-emerald-500">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>

                {status === 'scheduled' && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1.5 block">Publish Date</label>
                    <input type="datetime-local" value={publishDate} onChange={e => setPublishDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-emerald-500" />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-emerald-500">
                    {['Property News', 'Buying Guide', 'Selling Tips', 'Market Update', 'Area Guide', 'Legal & Finance', 'Investment Tips', 'Announcements'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-black text-gray-900 mb-4 pb-4 border-b border-gray-100">Article Meta</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Author Name</label>
                  <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">Tags (comma separated)</label>
                  <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="Sri Lanka, Colombo, Investment" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block flex justify-between">
                    <span>Featured Image URL</span>
                    <ImageIcon size={14} />
                  </label>
                  {featuredImage && (
                    <div className="w-full h-32 rounded-lg bg-gray-100 mb-2 overflow-hidden border border-gray-200">
                       <img src={featuredImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input type="text" value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-emerald-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-black text-gray-900 mb-4 pb-4 border-b border-gray-100 flex justify-between items-center">
                SEO Settings
                <Settings size={14} className="text-gray-400" />
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 flex justify-between">
                    <span>Meta Title</span>
                    <span className={metaTitle.length > 60 ? 'text-red-500' : ''}>{metaTitle.length}/60</span>
                  </label>
                  <input type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 flex justify-between">
                    <span>Meta Description</span>
                    <span className={metaDesc.length > 160 ? 'text-red-500' : ''}>{metaDesc.length}/160</span>
                  </label>
                  <textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none resize-none h-20 focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1.5 block">URL Slug</label>
                  <div className="flex items-center">
                    <span className="text-gray-400 text-xs bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg py-2 pl-3 pr-1">/blog/</span>
                    <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-r-lg px-2 py-2 text-sm font-bold outline-none focus:border-emerald-500" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  const publishedCount = posts.filter(p => p.status === 'published').length;
  const draftCount = posts.filter(p => p.status === 'draft').length;
  const totalViews = posts.reduce((sum, p) => sum + (p.views_count || 0), 0);

  return (
    <div className="max-w-[1600px] mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
             <FileText className="text-emerald-600" /> Blog Manager
          </h2>
          <p className="text-gray-500 font-medium">Manage articles, news, and market insights.</p>
        </div>
        <button onClick={() => openEditor()} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/30">
          <Plus size={18} /> New Article
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
         <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="bg-gray-50 text-gray-600 p-4 rounded-2xl"><FileText size={24} /></div>
            <div>
               <p className="text-[11px] font-black tracking-widest text-gray-400 uppercase">Total Articles</p>
               <p className="text-2xl font-black text-gray-900 mt-1">{posts.length}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl"><TrendingUp size={24} /></div>
            <div>
               <p className="text-[11px] font-black tracking-widest text-gray-400 uppercase">Published</p>
               <p className="text-2xl font-black text-gray-900 mt-1">{publishedCount}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="bg-orange-50 text-orange-600 p-4 rounded-2xl"><FileEdit size={24} /></div>
            <div>
               <p className="text-[11px] font-black tracking-widest text-gray-400 uppercase">Drafts</p>
               <p className="text-2xl font-black text-gray-900 mt-1">{draftCount}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-5">
            <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl"><Eye size={24} /></div>
            <div>
               <p className="text-[11px] font-black tracking-widest text-gray-400 uppercase">Total Views</p>
               <p className="text-2xl font-black text-gray-900 mt-1">{totalViews.toLocaleString()}</p>
            </div>
         </div>
      </div>

      {/* LIST */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Title</th>
                      <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                      <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Author</th>
                      <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                      <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Views</th>
                      <th className="py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {posts.map(post => (
                      <tr key={post.id} className="hover:bg-gray-50/50 group transition-colors">
                         <td className="py-4 px-6">
                           <div className="font-bold text-gray-900 text-sm">{post.title}</div>
                           <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{post.slug}</div>
                         </td>
                         <td className="py-4 px-6 text-sm text-gray-600 font-medium">{post.category}</td>
                         <td className="py-4 px-6 text-sm text-gray-600">{post.author}</td>
                         <td className="py-4 px-6">
                            {post.status === 'published' && <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wide">LIVE</span>}
                            {post.status === 'draft' && <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wide">DRAFT</span>}
                            {post.status === 'scheduled' && <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wide">SCHEDULED</span>}
                         </td>
                         <td className="py-4 px-6 text-xs text-gray-500 font-medium">
                           {new Date(post.created_at).toLocaleDateString()}
                         </td>
                         <td className="py-4 px-6 text-sm font-bold text-gray-700">{post.views_count || 0}</td>
                         <td className="py-4 px-6 text-right space-x-2">
                            <button onClick={() => openEditor(post)} className="p-1.5 text-gray-400 hover:text-emerald-600 bg-white hover:bg-emerald-50 rounded shadow-sm border border-transparent hover:border-emerald-100 transition-colors" title="Edit"><FileEdit size={16} /></button>
                            <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="inline-block p-1.5 text-gray-400 hover:text-blue-600 bg-white hover:bg-blue-50 rounded shadow-sm border border-transparent hover:border-blue-100 transition-colors" title="Preview"><Eye size={16} /></a>
                            <button onClick={() => handleDelete(post.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 rounded shadow-sm border border-transparent hover:border-red-100 transition-colors" title="Delete"><Trash2 size={16} /></button>
                         </td>
                      </tr>
                   ))}
                   {posts.length === 0 && !loading && (
                      <tr><td colSpan={7} className="py-12 text-center text-gray-400 font-bold text-sm">No blog posts found</td></tr>
                   )}
                </tbody>
             </table>
          </div>
        )}
      </div>

    </div>
  );
}
