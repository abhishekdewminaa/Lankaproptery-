import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Star, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

export const Feedback: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { error: submitError } = await supabase
        .from('feedback')
        .insert([
          {
            name,
            email,
            rating,
            comments: feedback,
            created_at: new Date().toISOString()
          }
        ]);

      if (submitError) throw submitError;

      setSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-sage flex items-center justify-center p-6 pt-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[40px] p-12 shadow-2xl text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-black text-dark-navy mb-4">Thank You!</h2>
          <p className="text-gray-500 font-medium mb-8">
            Your feedback is incredibly valuable to us. We use it to improve LankaProperty for everyone.
          </p>
          <button 
            onClick={onBack}
            className="w-full py-4 bg-brand-green text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-dark-navy transition-all shadow-xl shadow-brand-green/20"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-sage pt-12 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green/10 text-brand-green rounded-full text-xs font-black uppercase tracking-widest mb-6"
          >
            <MessageSquare size={14} />
            Share Your Experience
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-dark-navy mb-4 tracking-tight"
          >
            Help us get <span className="text-brand-green">better.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 font-medium text-lg"
          >
            We're building the best property marketplace in Sri Lanka, and your feedback is the most important part of that journey.
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[40px] p-8 md:p-12 shadow-2xl shadow-dark-navy/5 border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Rating */}
            <div className="text-center">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">How was your experience?</label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-2 transition-all duration-200 transform hover:scale-110"
                  >
                    <Star 
                      size={40} 
                      className={`transition-colors ${
                        (hoverRating || rating) >= star ? 'fill-brand-gold text-brand-gold' : 'text-gray-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="mt-2 text-sm font-bold text-gray-400">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Your Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-green outline-none font-medium transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                <input 
                  type="email" 
                   value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-green outline-none font-medium transition-all"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Your Feedback</label>
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-green outline-none font-medium transition-all resize-none"
                placeholder="What do you like? What can we improve? We're all ears."
                required
              ></textarea>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={submitting}
              className="w-full py-5 bg-brand-green text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-dark-navy transition-all shadow-xl shadow-brand-green/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {submitting ? (
                <>Processing...</>
              ) : (
                <>
                  <Send size={18} />
                  Send Feedback
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
