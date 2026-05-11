"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

interface Hint { id: number; cost: number; sort_order: number; is_unlocked: boolean; content: string | null; }
interface Attachment { id: number; file_name: string; file_url: string; file_type: string; }
interface Challenge {
  id: number; category_id: string; title: string; description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'; points: number; base_points: number;
  decay_solves: number; total_solves: number; author: string; tags: string[];
  external_links: { title: string; url: string }[]; hints: Hint[]; attachments: Attachment[];
  file_url?: string; solved?: boolean;
}
interface Category { id: string; name_ar: string; name_en?: string; description?: string; icon?: string; challenges: Challenge[]; }

const DIFF_ORDER: Record<string, number> = { easy: 0, medium: 1, hard: 2, expert: 3 };
const DIFF_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  easy:   { label: 'سهل',   color: '#2c7a7b', bg: 'rgba(56,178,172,0.1)',  border: 'rgba(56,178,172,0.3)' },
  medium: { label: 'متوسط', color: '#dd6b20', bg: 'rgba(221,107,32,0.1)',  border: 'rgba(221,107,32,0.3)' },
  hard:   { label: 'صعب',   color: '#e53e3e', bg: 'rgba(229,62,62,0.1)',   border: 'rgba(229,62,62,0.3)' },
  expert: { label: 'خبير',  color: '#805ad5', bg: 'rgba(128,90,213,0.1)',  border: 'rgba(128,90,213,0.3)' },
};
const COOLDOWN = 3000;
function sanitize(s: string) { return s.trim().replace(/[\r\n\t]/g, '').replace(/\u200B/g, '').replace(/\u00A0/g, ' '); }

function StatsBar({ categories, userPoints }: { categories: Category[]; userPoints: number }) {
  const all = categories.flatMap(c => c.challenges);
  const total = all.length, solved = all.filter(c => c.solved).length;
  const totalPts = all.reduce((s, c) => s + c.points, 0);
  const earnedPts = all.filter(c => c.solved).reduce((s, c) => s + c.points, 0);
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
  const stats = [
    { label: 'النقاط المكتسبة', value: `${earnedPts}/${totalPts}`, icon: '⭐', color: '#c8962e' },
    { label: 'تحديات محلولة', value: `${solved}/${total}`, icon: '🏆', color: '#2da5c7' },
    { label: 'التقدم', value: `${pct}%`, icon: '📊', color: '#805ad5' },
    { label: 'نقاطي الكلية', value: String(userPoints), icon: '⚡', color: '#d69e2e' },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((s, i) => (
        <div key={i} className="glass-card p-5 text-center group hover:scale-[1.02] transition-transform">
          <div className="text-3xl mb-2">{s.icon}</div>
          <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
          <div className="text-cyber-400 text-xs mt-1">{s.label}</div>
        </div>
      ))}
      <div className="col-span-2 lg:col-span-4 rounded-full overflow-hidden h-2" style={{ background: 'var(--color-cyber-800)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #c8962e, #e8c068)' }} />
      </div>
    </div>
  );
}

function ChallengeCard({ ch, onClick }: { ch: Challenge; onClick: () => void }) {
  const d = DIFF_CFG[ch.difficulty] || DIFF_CFG.easy;
  return (
    <div onClick={onClick}
      className={`glass-card p-6 flex flex-col h-full ${ch.solved ? 'opacity-70 cursor-default' : 'cursor-pointer'}`}
      style={ch.solved ? { borderColor: 'rgba(56,178,172,0.25)', background: 'rgba(56,178,172,0.03)' } : {}}>
      <div className="flex justify-between items-center mb-4">
        <span className="text-[11px] px-3 py-1 rounded-full font-bold"
          style={{ background: d.bg, color: d.color, border: `1px solid ${d.border}` }}>{d.label}</span>
        {ch.solved
          ? <span className="badge badge-beginner text-xs font-bold">✓ محلول</span>
          : <span className="text-xs px-3 py-1 rounded-full font-bold"
              style={{ background: 'rgba(200,150,46,0.1)', color: '#c8962e', border: '1px solid rgba(200,150,46,0.2)' }}>
              {ch.points} نقطة</span>}
      </div>
      <h3 className="text-lg font-bold mb-2 text-cyber-100 group-hover:text-accent transition-colors">{ch.title}</h3>
      <p className="text-sm leading-relaxed mb-4 line-clamp-2 text-cyber-400 flex-1">{ch.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {ch.tags?.slice(0, 3).map(t => (
          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full text-cyber-500"
            style={{ background: 'var(--color-cyber-900)', border: '1px solid var(--color-cyber-700)' }}>#{t}</span>
        ))}
      </div>
      <div className="pt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--color-cyber-800)' }}>
        <span className="text-xs text-cyber-500">بواسطة: <span className="text-cyber-400">{ch.author}</span></span>
        <span className="text-xs text-cyber-500">👥 {ch.total_solves}</span>
      </div>
    </div>
  );
}

function ChallengeModal({ ch, onClose, onSubmit, flag, setFlag, loading, msg, onHint }: {
  ch: Challenge; onClose: () => void; onSubmit: (e: React.FormEvent) => void;
  flag: string; setFlag: (v: string) => void; loading: boolean;
  msg: { text: string; isError: boolean; showAnimation?: boolean }; onHint: (id: number) => void;
}) {
  const d = DIFF_CFG[ch.difficulty] || DIFF_CFG.easy;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose} style={{ background: 'rgba(26,22,18,0.6)', backdropFilter: 'blur(4px)' }}>
      {msg.showAnimation && !msg.isError && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center pointer-events-none animate-pulse"
          style={{ background: 'rgba(56,178,172,0.15)' }}>
          <div className="text-5xl font-black mb-4" style={{ color: '#2c7a7b' }}>✓ تم الاختراق بنجاح!</div>
          <div className="text-xl font-bold text-white px-6 py-2 rounded-full"
            style={{ background: '#2c7a7b' }}>+{msg.text.split('+')[1] || 'نقاط'}</div>
        </div>
      )}
      <div onClick={e => e.stopPropagation()}
        className="w-full max-w-4xl rounded-2xl overflow-hidden relative flex flex-col md:flex-row animate-scale-in"
        style={{ background: 'var(--color-cyber-950)', border: '1px solid rgba(200,150,46,0.2)', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
        {/* Details Panel */}
        <div className="flex-1 p-6 md:p-8 flex flex-col md:border-l" style={{ borderColor: 'var(--color-cyber-800)', maxHeight: '85vh', overflowY: 'auto' }}>
          <button onClick={onClose} className="md:hidden absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center text-cyber-500 hover:text-cyber-100"
            style={{ background: 'var(--color-cyber-800)' }}>✕</button>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs px-3 py-1 rounded-full font-bold"
              style={{ background: d.bg, color: d.color, border: `1px solid ${d.border}` }}>{d.label}</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: 'rgba(200,150,46,0.1)', color: '#c8962e', border: '1px solid rgba(200,150,46,0.2)' }}>
              {ch.points} نقطة</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-cyber-100 mb-2">{ch.title}</h2>
          <div className="flex items-center gap-4 text-xs text-cyber-500 mb-6 pb-4" style={{ borderBottom: '1px solid var(--color-cyber-800)' }}>
            <span>الكاتب: <span className="font-bold text-cyber-300">@{ch.author}</span></span>
            <span>|</span>
            <span>مرات الحل: <span className="font-bold text-cyber-300">{ch.total_solves}</span></span>
          </div>
          <div className="text-sm text-cyber-300 mb-8 leading-relaxed whitespace-pre-wrap">{ch.description}</div>
          {ch.attachments?.length > 0 && (
            <div className="mb-8">
              <h4 className="text-sm font-bold text-cyber-400 mb-3">📎 المرفقات</h4>
              {ch.attachments.map(a => (
                <a key={a.id} href={a.file_url} download
                  className="flex items-center justify-between p-3 rounded-xl mb-2 transition-colors hover:scale-[1.01]"
                  style={{ background: 'var(--color-cyber-900)', border: '1px solid var(--color-cyber-700)' }}>
                  <span className="text-sm font-bold text-cyber-300">{a.file_name}</span>
                  <span className="badge badge-intermediate text-xs">تحميل ↓</span>
                </a>
              ))}
            </div>
          )}
          {ch.external_links?.length > 0 && (
            <div className="mb-8">
              <h4 className="text-sm font-bold text-cyber-400 mb-3">🔗 مراجع خارجية</h4>
              <div className="flex flex-wrap gap-2">
                {ch.external_links.map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                    className="badge badge-advanced text-xs font-bold hover:opacity-80">{l.title} ↗</a>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* Action Panel */}
        <div className="w-full md:w-[380px] p-6 md:p-8 flex flex-col"
          style={{ background: 'var(--color-cyber-900)', maxHeight: '85vh', overflowY: 'auto' }}>
          <button onClick={onClose}
            className="hidden md:flex absolute top-4 left-4 w-8 h-8 rounded-full items-center justify-center text-cyber-500 hover:text-cyber-100 transition-colors"
            style={{ background: 'var(--color-cyber-800)' }}>✕</button>
          <h4 className="text-sm font-bold text-cyber-200 mb-4 mt-6 md:mt-0">💡 التلميحات المساعدة</h4>
          <div className="flex-1">
            {ch.hints?.length > 0 ? (
              <div className="space-y-3 mb-8">
                {ch.hints.map((h, i) => (
                  <div key={h.id}>
                    {h.is_unlocked ? (
                      <div className="p-4 rounded-xl text-sm text-cyber-300"
                        style={{ background: 'rgba(200,150,46,0.06)', border: '1px solid rgba(200,150,46,0.15)' }}>
                        <span className="font-bold block mb-1" style={{ color: '#c8962e' }}>تلميح {i + 1}:</span>
                        {h.content}
                      </div>
                    ) : (
                      <button onClick={() => onHint(h.id)}
                        className="w-full text-right p-4 rounded-xl transition-colors flex justify-between items-center"
                        style={{ background: 'var(--color-cyber-950)', border: '1px solid var(--color-cyber-700)' }}>
                        <span className="text-cyber-400 font-bold text-sm">فتح التلميح {i + 1}</span>
                        <span className="text-xs font-bold px-2 py-1 rounded"
                          style={{ background: 'rgba(229,62,62,0.1)', color: '#e53e3e', border: '1px solid rgba(229,62,62,0.2)' }}>
                          -{h.cost} نقطة</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-cyber-500 p-4 rounded-xl text-center mb-8"
                style={{ background: 'var(--color-cyber-950)', border: '1px solid var(--color-cyber-800)' }}>
                لا توجد تلميحات متاحة لهذا التحدي.
              </div>
            )}
          </div>
          <form onSubmit={onSubmit} className="mt-auto pt-6" style={{ borderTop: '1px solid var(--color-cyber-800)' }}>
            <label className="block text-sm font-bold text-cyber-200 mb-2">تسليم العلم (Flag)</label>
            <input type="text" value={flag} onChange={e => setFlag(sanitize(e.target.value))}
              placeholder="flag{...}" dir="ltr" required disabled={loading || ch.solved}
              className="w-full px-4 py-3 rounded-xl text-sm font-mono outline-none transition-all mb-4"
              style={{ background: 'var(--color-cyber-950)', border: '1px solid var(--color-cyber-700)',
                color: 'var(--color-accent)', caretColor: 'var(--color-accent)' }} />
            {msg.text && !msg.showAnimation && (
              <div className="mb-4 p-3 rounded-xl text-sm font-bold"
                style={{
                  background: msg.isError ? 'rgba(229,62,62,0.08)' : 'rgba(56,178,172,0.08)',
                  border: `1px solid ${msg.isError ? 'rgba(229,62,62,0.2)' : 'rgba(56,178,172,0.2)'}`,
                  color: msg.isError ? '#e53e3e' : '#2c7a7b',
                }}>{msg.text}</div>
            )}
            <button type="submit" disabled={loading || !flag.trim() || ch.solved}
              className={ch.solved ? 'btn-secondary w-full !py-3 !text-sm' : 'btn-primary w-full !py-3 !text-sm'}
              style={ch.solved ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
              {ch.solved ? 'تم حل التحدي مسبقاً ✓' : loading ? 'جاري التحقق...' : 'إرسال العلم 🚀'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CTFPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Challenge | null>(null);
  const [flag, setFlag] = useState('');
  const [subLoad, setSubLoad] = useState(false);
  const [msg, setMsg] = useState({ text: '', isError: false, showAnimation: false });
  const [search, setSearch] = useState('');
  const [diffF, setDiffF] = useState('all');
  const [catF, setCatF] = useState('all');
  const [pts, setPts] = useState(0);
  const lastRef = useRef(0);

  useEffect(() => { fetchData(); }, []);

  const fetchData = useCallback(async () => {
    try {
      const r = await fetch('/api/ctf');
      if (r.ok) { const d = await r.json(); setCategories(d.categories || []); setPts(d.userPoints || 0); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  const unlockHint = async (hintId: number) => {
    try {
      const r = await fetch('/api/ctf/hints', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hintId }) });
      const d = await r.json();
      if (r.ok) {
        setActive(p => p ? { ...p, hints: p.hints.map(h => h.id === hintId ? { ...h, is_unlocked: true, content: d.content } : h) } : p);
        fetchData();
      } else { alert(d.message); }
    } catch { alert("حدث خطأ أثناء فتح التلميح."); }
  };

  const filtered = useMemo(() => {
    return categories
      .filter(c => catF === 'all' || c.id === catF)
      .map(c => ({
        ...c,
        challenges: c.challenges
          .filter(ch => diffF === 'all' || ch.difficulty === diffF)
          .filter(ch => { if (!search.trim()) return true; const q = search.toLowerCase(); return ch.title.toLowerCase().includes(q) || ch.description.toLowerCase().includes(q) || ch.tags.some(t => t.toLowerCase().includes(q)); })
          .sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 0) - (DIFF_ORDER[b.difficulty] ?? 0) || a.points - b.points)
      }))
      .filter(c => c.challenges.length > 0);
  }, [categories, search, diffF, catF]);

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !flag.trim()) return;
    const now = Date.now();
    if (now - lastRef.current < COOLDOWN) { setMsg({ text: '⏳ يرجى الانتظار قليلاً', isError: true, showAnimation: false }); return; }
    lastRef.current = now;
    setSubLoad(true); setMsg({ text: '', isError: false, showAnimation: false });
    try {
      const r = await fetch('/api/ctf/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ challengeId: active.id, flag: sanitize(flag) }) });
      const d = await r.json();
      if (r.ok) {
        setMsg({ text: `إجابة صحيحة! +${d.earnedPoints}`, isError: false, showAnimation: true });
        setTimeout(() => { setActive(null); setFlag(''); setMsg({ text: '', isError: false, showAnimation: false }); fetchData(); }, 2000);
      } else { setMsg({ text: `خطأ: ${d.message}`, isError: true, showAnimation: false }); }
    } catch { setMsg({ text: 'حدث خطأ في الاتصال', isError: true, showAnimation: false }); }
    finally { setSubLoad(false); }
  }, [active, flag, fetchData]);

  return (
    <div style={{ paddingTop: '80px' }}>
      <div className="section-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: 'linear-gradient(135deg, #c8962e, #b0831f)' }}>🏴</div>
            <div>
              <h1 className="text-2xl font-bold text-cyber-100">
                تحديات <span className="gradient-text">Capture The Flag</span>
              </h1>
              <p className="text-cyber-500 text-sm mt-1">حل التحديات الأمنية واعثر على الأعلام المخفية لزيادة نقاطك!</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {!loading && categories.length > 0 && <StatsBar categories={categories} userPoints={pts} />}

        {/* Filters */}
        {!loading && categories.length > 0 && (
          <div className="glass-card p-5 mb-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-cyber-600">🔍</span>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="ابحث عن تحدي أو كلمة مفتاحية..."
                className="w-full pr-10 pl-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: 'var(--color-cyber-950)', border: '1px solid var(--color-cyber-700)', color: 'var(--color-cyber-100)' }} />
            </div>
            <select value={diffF} onChange={e => setDiffF(e.target.value)}
              className="px-4 py-3 rounded-xl text-sm outline-none cursor-pointer"
              style={{ background: 'var(--color-cyber-950)', border: '1px solid var(--color-cyber-700)', color: 'var(--color-cyber-300)', minWidth: '130px' }}>
              <option value="all">كل المستويات</option>
              <option value="easy">سهل</option><option value="medium">متوسط</option>
              <option value="hard">صعب</option><option value="expert">خبير</option>
            </select>
            <select value={catF} onChange={e => setCatF(e.target.value)}
              className="px-4 py-3 rounded-xl text-sm outline-none cursor-pointer"
              style={{ background: 'var(--color-cyber-950)', border: '1px solid var(--color-cyber-700)', color: 'var(--color-cyber-300)', minWidth: '130px' }}>
              <option value="all">كل الأقسام</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
            </select>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="glass-card p-5 text-center animate-pulse">
                <div className="w-10 h-10 rounded-full mx-auto mb-2" style={{ background: 'var(--color-cyber-800)' }} />
                <div className="h-6 w-10 rounded mx-auto mb-1" style={{ background: 'var(--color-cyber-800)' }} />
                <div className="h-3 w-20 rounded mx-auto" style={{ background: 'var(--color-cyber-900)' }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg font-bold text-cyber-300">لا توجد نتائج مطابقة</p>
            <p className="text-sm mt-2 text-cyber-500">حاول تغيير معايير البحث أو التصفية.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {filtered.map(cat => (
              <div key={cat.id}>
                <div className="flex items-center gap-4 mb-6 pb-4" style={{ borderBottom: '2px solid rgba(200,150,46,0.15)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: 'rgba(200,150,46,0.1)', border: '1px solid rgba(200,150,46,0.2)' }}>
                    {cat.icon || '🏴'}</div>
                  <div>
                    <h2 className="text-xl font-bold text-cyber-100">{cat.name_ar}</h2>
                    {cat.description && <p className="text-sm mt-0.5 text-cyber-500">{cat.description}</p>}
                  </div>
                  <span className="mr-auto text-sm font-bold px-3 py-1 rounded-full"
                    style={{ background: 'rgba(200,150,46,0.08)', color: '#c8962e' }}>
                    {cat.challenges.length} تحدي</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {cat.challenges.map(ch => (
                    <ChallengeCard key={ch.id} ch={ch} onClick={() => {
                      setActive(ch); setFlag(''); setMsg({ text: '', isError: false, showAnimation: false });
                    }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {active && (
        <ChallengeModal ch={active}
          onClose={() => { setActive(null); setMsg({ text: '', isError: false, showAnimation: false }); setFlag(''); }}
          onSubmit={submit} flag={flag} setFlag={setFlag} loading={subLoad} msg={msg} onHint={unlockHint} />
      )}
    </div>
  );
}
