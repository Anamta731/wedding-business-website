"use client";

import { useState } from 'react';
import html2canvas from 'html2canvas';
import { trackClient } from '@/lib/clientTelemetry';

const HashtagGenerator = () => {
  const [formData, setFormData] = useState({ bride: '', groom: '', vibe: '', loveWord: '' });
  const [loading, setLoading] = useState(false);
  const [hashtags, setHashtags] = useState([]);
  const [error, setError] = useState('');

  const vibes = ['Royal', 'Romantic', 'Whimsical', 'Modern'];

  const generateHashtags = async () => {
    if (!formData.bride || !formData.groom || !formData.vibe || !formData.loveWord) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const { hashtags } = await res.json();
      setHashtags(hashtags);
      // Non-PII: only count + vibe, never the couple's names.
      trackClient('HashtagGenerated', {
        count: Array.isArray(hashtags) ? hashtags.length : 0,
        vibe: formData.vibe || "",
      });
    } catch (err) {
      console.error(err);
      setError('Something went wrong, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (tag, e) => {
    navigator.clipboard.writeText(tag);
    const tooltip = document.createElement('div');
    tooltip.className = 'absolute -top-8 left-1/2 -translate-x-1/2 bg-[#C9A234] text-white px-2 py-1 rounded text-[10px] animate-fade-out';
    tooltip.innerText = 'Copied! ✓';
    e.currentTarget.appendChild(tooltip);
    setTimeout(() => tooltip.remove(), 1500);
  };

  const shareResults = () => {
    const el = document.getElementById('hashtag-results-card');
    html2canvas(el).then(canvas => {
      const link = document.createElement('a');
      link.download = 'vows-and-vedas-hashtags.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  return (
    <section className="py-24 bg-gradient-to-b from-[#FFF3E0] to-[#FDFAF5]">
      <div className="max-w-[1200px] mx-auto text-center px-6">
        <p className="label !text-[#C9A234] mb-2 font-body uppercase text-[10px] tracking-[0.5em]">Just For You</p>
        <h2 className="text-5xl mb-3 font-heading font-light">Create Your Wedding <em>Hashtag</em></h2>
        <p className="text-[#9A8F7E] mb-6 font-body font-light text-[13px]">Answer a few quick questions and we'll generate the perfect hashtag.</p>
        <div className="w-12 h-px bg-[#C9A234] mx-auto mb-12"></div>

        <div className="max-w-[760px] mx-auto bg-white border border-[#EDE8DC] rounded-xl p-12 shadow-xl text-left">
          <div className="space-y-6">
            <div>
              <label className="label !text-[#9A8F7E] !mb-2 font-body text-[11px] uppercase tracking-[0.1em]">Bride's First Name</label>
              <input 
                type="text" 
                className="w-full h-12 bg-[#FDFAF5] border border-[#EDE8DC] rounded-md px-5 focus:border-[#C9A234] outline-none transition-colors"
                value={formData.bride}
                onChange={(e) => setFormData({...formData, bride: e.target.value})}
              />
            </div>
            <div>
              <label className="label !text-[#9A8F7E] !mb-2 font-body text-[11px] uppercase tracking-[0.1em]">Groom's First Name</label>
              <input 
                type="text" 
                className="w-full h-12 bg-[#FDFAF5] border border-[#EDE8DC] rounded-md px-5 focus:border-[#C9A234] outline-none transition-colors"
                value={formData.groom}
                onChange={(e) => setFormData({...formData, groom: e.target.value})}
              />
            </div>
            <div>
              <label className="label !text-[#9A8F7E] !mb-3 font-body text-[11px] uppercase tracking-[0.1em]">Your Wedding Vibe</label>
              <div className="flex gap-3 flex-wrap">
                {vibes.map(v => (
                  <button 
                    key={v}
                    onClick={() => setFormData({...formData, vibe: v})}
                    className={`px-5 py-2 rounded-full text-[12px] font-body transition-all border ${formData.vibe === v ? 'bg-[#C9A234] text-white border-[#C9A234]' : 'bg-[#FDFAF5] text-[#9A8F7E] border-[#EDE8DC] hover:border-[#C9A234]'}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label !text-[#9A8F7E] !mb-2 font-body text-[11px] uppercase tracking-[0.1em]">One Word Describing Your Love</label>
              <input 
                type="text" 
                placeholder="e.g. Eternal, Soulful..."
                className="w-full h-12 bg-[#FDFAF5] border border-[#EDE8DC] rounded-md px-5 focus:border-[#C9A234] outline-none transition-colors font-body text-[14px]"
                value={formData.loveWord}
                onChange={(e) => setFormData({...formData, loveWord: e.target.value})}
              />
            </div>

            <button 
              onClick={generateHashtags}
              disabled={loading}
              className={`btn-gold w-full flex items-center justify-center h-14 ${loading ? 'animate-pulse bg-[#B8935A]' : ''}`}
            >
              {loading ? 'Generating...' : 'Generate Our Hashtag ✦'}
            </button>
            
            {error && <p className="text-[#E87B3A] text-xs text-center">{error}</p>}
          </div>

          {hashtags.length > 0 && (
            <div id="hashtag-results-card" className="mt-8 pt-8 border-t border-[#EDE8DC] animate-in fade-in slide-in-from-bottom-5 duration-500">
              <p className="label !text-[#C9A234] mb-4 font-body uppercase text-[10px] tracking-[0.5em] text-center">Your Hashtags</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {hashtags.map((tag, i) => (
                  <div 
                    key={i} 
                    onClick={(e) => copyToClipboard(tag, e)}
                    className="relative bg-white border border-[#EDE8DC] rounded-md p-4 text-center cursor-pointer hover:border-[#C9A234] hover:bg-[#FDFAF5] transition-all"
                  >
                    <span className="font-heading italic text-xl">{tag}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-3 mt-8">
                <button onClick={generateHashtags} className="btn-gold !px-6 !py-3 !text-[10px]">Regenerate →</button>
                <button onClick={shareResults} className="btn-ghost !px-6 !py-3 !text-[10px]">Share Results</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HashtagGenerator;
