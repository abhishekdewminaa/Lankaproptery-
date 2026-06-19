import React, { useState } from 'react';
import { MapPin, Search, ExternalLink, Loader2, Navigation } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function AdminMaps() {
  const [query, setQuery] = useState('What good Italian restaurants are nearby?');
  const [lat, setLat] = useState('6.9271');
  const [lng, setLng] = useState('79.8612'); // Default to Colombo
  const [useLocation, setUseLocation] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [chunks, setChunks] = useState<any[]>([]);
  const [errorDesc, setErrorDesc] = useState('');

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLat(position.coords.latitude.toString());
        setLng(position.coords.longitude.toString());
        setUseLocation(true);
      }, (err) => {
        console.error(err);
        setUseLocation(false);
      });
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setErrorDesc('');
    setResultText('');
    setChunks([]);

    try {
      const payload: any = { message: query };
      if (useLocation && lat && lng) {
        payload.lat = lat;
        payload.lng = lng;
      }

      const res = await fetch('/api/ai/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch maps data');

      setResultText(data.text);
      setChunks(data.chunks || []);
    } catch (err: any) {
      setErrorDesc(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-admin-text-dark">Google Maps Grounding</h2>
        <p className="text-admin-text-gray font-medium mt-1">
          Query real-time geographic data and places dynamically using Gemini and Google Maps.
        </p>
      </div>

      <div className="bg-white dark:bg-[#1f2937] p-6 rounded-2xl shadow-sm border border-admin-border transition-colors">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 pl-1">
                Query
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about places to see, restaurants, distances..."
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-[#1B5E20] focus:border-[#1B5E20] transition-all dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={useLocation} 
                  onChange={(e) => setUseLocation(e.target.checked)}
                  className="w-4 h-4 text-[#1B5E20] rounded border-gray-300 focus:ring-[#1B5E20]"
                />
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Set Origin Location</span>
              </label>
              
              {useLocation && (
                <button 
                  type="button"
                  onClick={getUserLocation}
                  className="text-xs font-bold text-[#1B5E20] border border-[#1B5E20] px-2 py-1 flex items-center gap-1 rounded bg-[#1B5E20]/5 hover:bg-[#1B5E20]/10 transition-colors"
                >
                  <Navigation size={12} />
                  My Location
                </button>
              )}
            </div>

            {useLocation && (
              <div className="flex gap-3 w-full sm:w-auto">
                <div>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="Latitude"
                    className="w-24 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold dark:text-white"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="Longitude"
                    className="w-24 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold dark:text-white"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#1B5E20] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-800 transition-colors disabled:opacity-50 ml-auto"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
              {loading ? 'Searching...' : 'Search Maps'}
            </button>
          </div>
        </form>
      </div>

      {errorDesc && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 flex items-start gap-2">
           <MapPin size={18} className="shrink-0 mt-0.5" />
           {errorDesc}
        </div>
      )}

      {resultText && (
        <div className="bg-white dark:bg-[#1f2937] p-6 rounded-2xl shadow-sm border border-admin-border transition-colors">
          <div className="markdown-body prose dark:prose-invert max-w-none mb-6">
            <ReactMarkdown>{resultText}</ReactMarkdown>
          </div>

          {chunks && chunks.length > 0 && (
            <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-6">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Referenced Places</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {chunks.map((chunk, index) => {
                  if (chunk.maps && chunk.maps.uri) {
                    return (
                      <a 
                        key={index} 
                        href={chunk.maps.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-8 rounded-full bg-[#1B5E20]/10 text-[#1B5E20] flex items-center justify-center shrink-0">
                            <MapPin size={14} />
                          </div>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate pr-2">
                            {chunk.maps.title || new URL(chunk.maps.uri).hostname}
                          </span>
                        </div>
                        <ExternalLink size={14} className="text-gray-400 group-hover:text-[#1B5E20] transition-colors shrink-0" />
                      </a>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
