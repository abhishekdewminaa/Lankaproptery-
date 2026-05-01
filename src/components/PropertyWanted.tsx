import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, DollarSign, Home, MessageSquare, Plus, Filter, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface WantedRequest {
  id: string;
  title: string;
  location: string;
  budget: string;
  type: string;
  description: string;
  date: string;
  user: string;
  bedrooms?: string;
  bathrooms?: string;
  floors?: string;
}

const MOCK_WANTED: WantedRequest[] = [
  // ... mock data kept as fallback if needed or combined
];

export default function PropertyWanted({ onContact }: { onContact?: (data: any) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<WantedRequest[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    budget: '',
    type: 'Rent',
    description: '',
    bedrooms: '',
    bathrooms: '',
    floors: ''
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('property_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedRequests = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          location: item.location,
          budget: item.budget,
          type: item.type,
          description: item.description,
          date: new Date(item.created_at).toLocaleDateString(),
          user: item.user_name || 'Anonymous User',
          bedrooms: item.bedrooms,
          bathrooms: item.bathrooms,
          floors: item.floors
        }));
        setRequests(formattedRequests);
      }
    } catch (err: any) {
      console.warn('Could not fetch real requests, using mock data:', err.message);
      setRequests([
        {
          id: '1',
          title: 'Looking for a 3-bedroom apartment in Colombo 07',
          location: 'Colombo 07',
          budget: 'LKR 250,000/mo',
          type: 'Rent',
          description: 'Looking for a modern apartment with high-end finishes. Preferred higher floors with a view.',
          date: '2 hours ago',
          user: 'Amila Perera',
          bedrooms: '3',
          bathrooms: '2',
          floors: 'Above 5th'
        },
        {
          id: '2',
          title: 'Searching for commercial land for a warehouse',
          location: 'Kadawatha / Kaduwela',
          budget: 'LKR 50M - 70M',
          type: 'Sale',
          description: 'Need approximately 40-60 perches of flat land with easy access for containers. Clear deeds are a must.',
          date: '5 hours ago',
          user: 'Universal Logistics Ltd'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('property_requests')
        .insert([{
          title: formData.title,
          location: formData.location,
          budget: formData.budget,
          type: formData.type,
          description: formData.description,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          floors: formData.floors,
          user_name: 'Visitor User', // In a real app, this would be the logged in user's name
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      alert('Your property request has been submitted to Supabase! Our agents will contact you if a matching property is found.');
      setShowForm(false);
      setFormData({
        title: '',
        location: '',
        budget: '',
        type: 'Rent',
        description: '',
        bedrooms: '',
        bathrooms: '',
        floors: ''
      });
      fetchRequests(); // Refresh list
    } catch (err: any) {
      console.error('Error submitting request:', err.message);
      alert('Failed to submit to Supabase. Check if the property_requests table exists. Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-brand-dark-blue text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4"
          >
            Property Wanted
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-blue-100 text-lg mb-8"
          >
            Can't find what you're looking for? Post a request and let our network of agents find it for you.
          </motion.p>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => setShowForm(true)}
            className="bg-brand-green text-white px-8 py-4 rounded-full font-bold hover:bg-opacity-90 transition-all flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Post a Requirement
          </motion.button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8">
        {/* Search & Filter */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-8 flex flex-wrap gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search requirements..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-green outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors">
            <Filter size={18} />
            Sort By
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl"
            >
              <h2 className="text-2xl font-bold mb-6">Post Your Matching Need</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">What are you looking for?</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. 2 BR House in Kandy"
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
                    <input 
                      required
                      type="text" 
                      placeholder="City/Area"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Budget Range</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. 50k-80k"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none"
                      value={formData.budget}
                      onChange={e => setFormData({...formData, budget: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Bedrooms</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 3"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm"
                      value={formData.bedrooms}
                      onChange={e => setFormData({...formData, bedrooms: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Bathrooms</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 2"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm"
                      value={formData.bathrooms}
                      onChange={e => setFormData({...formData, bathrooms: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Floor Level</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 2nd"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none text-sm"
                      value={formData.floors}
                      onChange={e => setFormData({...formData, floors: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Rent', 'Sale'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData({...formData, type: t})}
                        className={`py-3 rounded-xl font-bold border ${formData.type === t ? 'bg-brand-green border-brand-green text-white' : 'border-gray-200 text-gray-500'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Tell us more about your preferences..."
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green outline-none resize-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-4 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-4 bg-brand-green text-white rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    {submitting && <Loader2 className="animate-spin" size={18} />}
                    {submitting ? 'Submitting...' : 'Post Request'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Listings */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-brand-green" size={48} />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Searching Database...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.length > 0 ? (
              requests.map((item, idx) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${item.type === 'Rent' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                      For {item.type}
                    </span>
                    <span className="text-gray-400 text-sm font-mono">{item.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-brand-dark-blue mb-2 hover:text-brand-green cursor-pointer transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={16} className="text-brand-green" />
                      {item.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign size={16} className="text-brand-green" />
                      Budget: {item.budget}
                    </div>
                    {item.bedrooms && (
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mr-1">Beds:</span>
                        <span className="text-dark-navy font-bold">{item.bedrooms}</span>
                      </div>
                    )}
                    {item.bathrooms && (
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mr-1">Baths:</span>
                        <span className="text-dark-navy font-bold">{item.bathrooms}</span>
                      </div>
                    )}
                    {item.floors && (
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mr-1">Floor:</span>
                        <span className="text-dark-navy font-bold">{item.floors}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-bold">
                        {item.user.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{item.user}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-tighter">Looking For</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onContact?.({ 
                        inquiryType: 'Property Match', 
                        message: `I have a property that matches the request: ${item.title}` 
                      })}
                      className="flex items-center gap-2 py-3 px-6 bg-brand-dark-blue text-white rounded-xl font-bold text-sm hover:translate-y-[-2px] transition-all"
                    >
                      <MessageSquare size={16} />
                      I Have This
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <Home size={48} className="mx-auto text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest">No active requests</h3>
                <p className="text-gray-500 mt-2">Post a requirement to see it here.</p>
              </div>
            )}
          </div>
        )}

        {/* Empty State / Bottom Info */}
        <div className="mt-12 text-center p-12 border-2 border-dashed border-gray-200 rounded-3xl">
          <p className="text-gray-400 font-medium mb-4">Are you an agent with a matching property?</p>
          <p className="text-gray-500 text-sm">Join our network to get priority access to these leads.</p>
        </div>
      </div>
    </div>
  );
}
