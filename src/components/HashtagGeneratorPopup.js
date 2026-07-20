"use client";

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import html2canvas from 'html2canvas';

const TAB_WORDS = ['#ForUs', '#OurVows', '#JustUs', '#InLove', '#Bliss'];
const TAB_TYPE = 105;
const TAB_DELETE = 65;
const TAB_PAUSE = 1300;

const HashtagGeneratorPopup = () => {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [popIn, setPopIn] = useState(false);
  const [formData, setFormData] = useState({ bride: '', groom: '', vibe: '', loveWord: '' });
  const [loading, setLoading] = useState(false);
  const [hashtags, setHashtags] = useState([]);
  const [error, setError] = useState('');

  // Ref for direct DOM text update — no React re-renders for typewriter
  const tabTextRef = useRef(null);
  const tabStateRef = useRef({ word: 0, text: '', deleting: false });

  const vibes = ['Royal', 'Romantic', 'Whimsical', 'Modern'];

  // Scroll-triggered appearance — fires setVisible once, setPopIn once
  useEffect(() => {
    const onScroll = () => {
      const isNowVisible = window.scrollY > window.innerHeight * 0.6;
      setVisible(prev => {
        if (!prev && isNowVisible) {
          setPopIn(true);
          setTimeout(() => setPopIn(false), 750);
        }
        return isNowVisible;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Tab typewriter — runs once, updates DOM directly, zero re-renders
  useEffect(() => {
    let timer;
    const tick = () => {
      const s = tabStateRef.current;
      const word = TAB_WORDS[s.word];
      if (!s.deleting && s.text === word) {
        timer = setTimeout(() => { s.deleting = true; tick(); }, TAB_PAUSE);
      } else if (s.deleting && s.text === '') {
        timer = setTimeout(() => {
          s.deleting = false;
          s.word = (s.word + 1) % TAB_WORDS.length;
          tick();
        }, 300);
      } else {
        s.text = s.deleting
          ? word.slice(0, s.text.length - 1)
          : word.slice(0, s.text.length + 1);
        if (tabTextRef.current) tabTextRef.current.textContent = s.text || '#';
        timer = setTimeout(tick, s.deleting ? TAB_DELETE : TAB_TYPE);
      }
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

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
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const { hashtags } = await res.json();
      setHashtags(hashtags);
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
    tooltip.className = 'absolute -top-8 left-1/2 -translate-x-1/2 bg-[#C9A234] text-white px-2 py-1 rounded text-[10px]';
    tooltip.innerText = 'Copied! ✓';
    e.currentTarget.appendChild(tooltip);
    setTimeout(() => tooltip.remove(), 1500);
  };

  const shareResults = () => {
    const el = document.getElementById('hashtag-results-card-popup');
    html2canvas(el).then(canvas => {
      const link = document.createElement('a');
      link.download = 'vows-and-vedas-hashtags.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  // Landing pages (/lp/*) stay distraction-free — no popup there
  if (pathname?.startsWith("/lp")) return null;

  return (
    <>
      {/* Hashtag Tab — scroll-triggered, spring pop entrance */}
      {/* On mobile: only render on homepage. On desktop: always render. */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Wedding Hashtag Generator"
        className={`hashtag-btn fixed left-0 top-1/2 z-40 focus:outline-none scale-75 sm:scale-100 origin-left${!isHome ? ' hidden sm:block' : ''}`}
        style={{
          transform: `translateY(-50%) translateX(${visible ? '0px' : '-115%'})`,
          transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Glow ring — static border+shadow, only opacity animates (compositor-only) */}
        <div
          className="hashtag-glow-ring"
          style={{
            position: 'absolute',
            inset: '-3px',
            borderRadius: '0 13px 13px 0',
            border: '1.5px solid rgba(201,162,52,0.65)',
            boxShadow: '0 0 18px rgba(201,162,52,0.3), 4px 0 28px rgba(201,162,52,0.2)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Main pill — hover handled entirely by CSS */}
        <div
          className={`hashtag-pill${popIn ? ' hashtag-pop-in' : ''}`}
          style={{
            position: 'relative',
            zIndex: 1,
            borderRadius: '0 11px 11px 0',
            minHeight: '150px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: '22px 0',
          }}
        >
          {/* Default: sparkle + typewriter word (ref-driven, no re-renders) */}
          <div className="hashtag-default" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '9px',
            position: 'absolute',
            pointerEvents: 'none',
          }}>
            <span className="hashtag-sparkle-pulse" style={{ color: '#C9A234', fontSize: '12px', lineHeight: 1 }}>✦</span>
            <div style={{ width: '1px', height: '14px', background: 'rgba(201,162,52,0.25)' }} />
            <span style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              color: '#F5EDD6',
              fontSize: '9.5px',
              letterSpacing: '0.2em',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-body, sans-serif)',
            }}>
              <span ref={tabTextRef}>#</span>
              <span className="hashtag-cursor" />
            </span>
          </div>

          {/* Hover reveal */}
          <div className="hashtag-hover-reveal" style={{
            textAlign: 'center',
            padding: '0 14px',
            width: '100%',
            pointerEvents: 'none',
          }}>
            <span style={{ color: '#C9A234', fontSize: '18px', display: 'block', marginBottom: '10px', filter: 'drop-shadow(0 0 6px rgba(201,162,52,0.6))' }}>✦</span>
            <span style={{
              color: 'rgba(201,162,52,0.8)',
              fontSize: '8.5px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              display: 'block',
              fontFamily: 'var(--font-body, sans-serif)',
              whiteSpace: 'nowrap',
            }}>
              Create Your
            </span>
            <span style={{
              color: '#FDFAF5',
              fontSize: '14px',
              fontStyle: 'italic',
              display: 'block',
              marginTop: '5px',
              fontFamily: 'var(--font-heading, Georgia, serif)',
              whiteSpace: 'nowrap',
              letterSpacing: '0.03em',
            }}>
              Hashtag
            </span>
            <div style={{ width: '24px', height: '1px', background: 'rgba(201,162,52,0.4)', margin: '10px auto 0' }} />
            <span style={{
              color: 'rgba(201,162,52,0.5)',
              fontSize: '7.5px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              display: 'block',
              marginTop: '8px',
              fontFamily: 'var(--font-body, sans-serif)',
              whiteSpace: 'nowrap',
            }}>
              Just For You
            </span>
          </div>
        </div>
      </button>

      <style>{`
        /* Pill — hover via CSS, no JS state */
        .hashtag-pill {
          width: 38px;
          background: linear-gradient(135deg, #111000 0%, #0A0800 100%);
          border: 1px solid rgba(201,162,52,0.45);
          border-left: none;
          transition: width 0.5s cubic-bezier(0.23, 1, 0.32, 1),
                      background 0.35s ease,
                      border-color 0.3s ease;
        }
        .hashtag-btn:hover .hashtag-pill {
          width: 156px;
          background: linear-gradient(135deg, #1a1200 0%, #0E0900 100%);
          border-color: rgba(201,162,52,0.9);
        }
        .hashtag-default {
          opacity: 1;
          transition: opacity 0.15s ease;
        }
        .hashtag-btn:hover .hashtag-default { opacity: 0; }
        .hashtag-hover-reveal {
          opacity: 0;
          transition: opacity 0.28s ease 0.2s;
        }
        .hashtag-btn:hover .hashtag-hover-reveal { opacity: 1; }

        /* Spring pop on entry — compositor-friendly (transform + opacity only) */
        @keyframes hashtagPopIn {
          0%   { transform: scale(0.45); opacity: 0; }
          55%  { transform: scale(1.14); opacity: 1; }
          75%  { transform: scale(0.93); }
          90%  { transform: scale(1.04); }
          100% { transform: scale(1); }
        }
        .hashtag-pop-in {
          animation: hashtagPopIn 0.72s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          will-change: transform, opacity;
        }

        /* Glow ring — opacity-only animation, no paint cost */
        @keyframes hashtagGlowRing {
          0%, 100% { opacity: 0.35; }
          50%      { opacity: 1; }
        }
        .hashtag-glow-ring {
          animation: hashtagGlowRing 2.8s ease-in-out infinite;
          will-change: opacity;
        }

        /* Sparkle — transform + opacity only */
        @keyframes hashtagSparklePulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.25); }
        }
        .hashtag-sparkle-pulse {
          animation: hashtagSparklePulse 2s ease-in-out infinite;
          will-change: transform, opacity;
        }

        /* Cursor blink */
        @keyframes hashtagCursorBlink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0; }
        }
        .hashtag-cursor {
          display: inline-block;
          width: 0;
          border-right: 1.5px solid rgba(201,162,52,0.7);
          animation: hashtagCursorBlink 1s step-end infinite;
          will-change: opacity;
        }
      `}</style>

      {/* Modal Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[200] px-4 py-4"
          style={{ overflowY: 'scroll', WebkitOverflowScrolling: 'touch' }}
          data-lenis-prevent
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-ink/75 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Modal Panel */}
          <div className="relative z-10 w-full max-w-[700px] mx-auto bg-[#FDFAF5] border border-gold/30 shadow-[0_0_60px_rgba(201,162,52,0.12)]" style={{ borderRadius: '2px' }}>
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 bg-[#FDFAF5] border-b border-[#EDE8DC]">
              <div className="flex items-center gap-3">
                <span className="text-gold text-sm">◆</span>
                <p className="font-body uppercase tracking-[0.3em] text-[10px] text-[#9A8F7E]">Vows & Vedas</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[#9A8F7E] hover:text-ink transition-colors duration-200 font-body text-xs uppercase tracking-widest flex items-center gap-2"
              >
                Close <span className="text-base leading-none">×</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-8 pb-10 pt-8 text-center">
              <p className="font-body uppercase text-[#C9A234] tracking-[0.5em] text-[10px] mb-3">Just For You</p>
              <h2 className="font-heading font-light text-3xl text-ink mb-2">
                Create Your Wedding <em className="italic">Hashtag</em>
              </h2>
              <p className="text-[#9A8F7E] font-body font-light text-[13px] mb-6">Answer a few quick questions and we'll generate the perfect hashtag.</p>
              <div className="w-10 h-px bg-gold mx-auto mb-8" />

              <div className="text-left space-y-5">
                <div>
                  <label className="block font-body uppercase text-[#9A8F7E] text-[10px] tracking-[0.2em] mb-2">Bride's First Name</label>
                  <input
                    type="text"
                    className="w-full h-11 bg-white border border-[#EDE8DC] px-4 focus:border-[#C9A234] outline-none transition-colors font-body text-[14px] text-ink"
                    style={{ borderRadius: '2px' }}
                    value={formData.bride}
                    onChange={(e) => setFormData({ ...formData, bride: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-body uppercase text-[#9A8F7E] text-[10px] tracking-[0.2em] mb-2">Groom's First Name</label>
                  <input
                    type="text"
                    className="w-full h-11 bg-white border border-[#EDE8DC] px-4 focus:border-[#C9A234] outline-none transition-colors font-body text-[14px] text-ink"
                    style={{ borderRadius: '2px' }}
                    value={formData.groom}
                    onChange={(e) => setFormData({ ...formData, groom: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-body uppercase text-[#9A8F7E] text-[10px] tracking-[0.2em] mb-3">Your Wedding Vibe</label>
                  <div className="flex gap-2 flex-wrap">
                    {vibes.map(v => (
                      <button
                        key={v}
                        onClick={() => setFormData({ ...formData, vibe: v })}
                        className={`px-5 py-2 text-[11px] font-body uppercase tracking-widest transition-all border ${formData.vibe === v ? 'bg-[#C9A234] text-white border-[#C9A234]' : 'bg-white text-[#9A8F7E] border-[#EDE8DC] hover:border-[#C9A234]'}`}
                        style={{ borderRadius: '2px' }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-body uppercase text-[#9A8F7E] text-[10px] tracking-[0.2em] mb-2">One Word Describing Your Love</label>
                  <input
                    type="text"
                    placeholder="e.g. Eternal, Soulful…"
                    className="w-full h-11 bg-white border border-[#EDE8DC] px-4 focus:border-[#C9A234] outline-none transition-colors font-body text-[14px] text-ink placeholder:text-[#C5BCAF]"
                    style={{ borderRadius: '2px' }}
                    value={formData.loveWord}
                    onChange={(e) => setFormData({ ...formData, loveWord: e.target.value })}
                  />
                </div>

                <button
                  onClick={generateHashtags}
                  disabled={loading}
                  className={`w-full h-12 bg-[#C9A234] text-white font-body uppercase tracking-[0.3em] text-[11px] transition-all duration-300 hover:bg-[#b8922e] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  style={{ borderRadius: '2px' }}
                >
                  {loading ? 'Generating…' : 'Generate Our Hashtag ✦'}
                </button>

                {error && <p className="text-[#E87B3A] text-xs text-center">{error}</p>}
              </div>

              {hashtags.length > 0 && (
                <div id="hashtag-results-card-popup" className="mt-8 pt-8 border-t border-[#EDE8DC]">
                  <p className="font-body uppercase text-[#C9A234] tracking-[0.5em] text-[10px] mb-5 text-center">Your Hashtags</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {hashtags.map((tag, i) => (
                      <div
                        key={i}
                        onClick={(e) => copyToClipboard(tag, e)}
                        className="relative bg-white border border-[#EDE8DC] p-4 text-center cursor-pointer hover:border-[#C9A234] hover:bg-[#FDFAF5] transition-all"
                        style={{ borderRadius: '2px' }}
                      >
                        <span className="font-heading italic text-lg text-ink">{tag}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center gap-3 mt-6">
                    <button
                      onClick={generateHashtags}
                      className="px-6 py-3 bg-[#C9A234] text-white font-body uppercase tracking-widest text-[10px] hover:bg-[#b8922e] transition-colors"
                      style={{ borderRadius: '2px' }}
                    >
                      Regenerate →
                    </button>
                    <button
                      onClick={shareResults}
                      className="px-6 py-3 border border-[#C9A234] text-[#C9A234] font-body uppercase tracking-widest text-[10px] hover:bg-[#C9A234] hover:text-white transition-all"
                      style={{ borderRadius: '2px' }}
                    >
                      Save as Image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HashtagGeneratorPopup;
