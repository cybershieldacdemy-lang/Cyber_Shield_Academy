"use client";

import { useState, useEffect, useCallback } from 'react';

const categoryLabels: Record<string, string> = {
    'network-security': '🌐 أمن الشبكات',
    'ethical-hacking': '🎯 الاختراق الأخلاقي',
    'web-security': '🕷️ أمن تطبيقات الويب',
    'malware-analysis': '🦠 تحليل البرمجيات الخبيثة',
    'digital-forensics': '🔎 التحليل الجنائي الرقمي',
    'soc-operations': '🛡️ عمليات SOC',
    'cloud-security': '☁️ أمن السحابة',
    'cryptography': '🔐 علم التشفير',
    'linux-security': '🐧 أمن Linux',
    'windows-security': '🪟 أمن Windows',
};

const levelLabels: Record<string, { label: string; color: string; bg: string }> = {
    beginner:     { label: 'سهل',    color: '#38b2ac', bg: 'rgba(56,178,172,0.12)' },
    intermediate: { label: 'متوسط',  color: '#d69e2e', bg: 'rgba(214,158,46,0.12)' },
    advanced:     { label: 'صعب',    color: '#e53e3e', bg: 'rgba(229,62,62,0.12)' },
};

interface Video {
    id: number; title: string; description: string; category: string;
    level: string; video_url: string; thumbnail: string; duration: string;
    instructor: string; tags: string; views: number; likes: number;
}

export default function VideosPage() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('all');
    const [level, setLevel] = useState('all');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('default');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        fetch('/api/learning-videos?categories=true')
            .then(r => r.json()).then(d => setCategories(d.categories || []));
    }, []);

    const fetchVideos = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', page.toString());
            params.set('limit', '18');
            params.set('sort', sort);
            if (category !== 'all') params.set('category', category);
            if (level !== 'all') params.set('level', level);
            if (search.trim()) params.set('search', search.trim());

            const res = await fetch(`/api/learning-videos?${params}`);
            const data = await res.json();
            setVideos(data.videos || []);
            setTotalPages(data.totalPages || 1);
            setTotal(data.total || 0);
        } catch { setVideos([]); }
        finally { setLoading(false); }
    }, [page, category, level, search, sort]);

    useEffect(() => { fetchVideos(); }, [fetchVideos]);
    useEffect(() => { setPage(1); }, [category, level, search, sort]);

    const getYouTubeEmbedUrl = (url: string) => {
        const match = url.match(/[?&]v=([^&]+)/);
        return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0` : '';
    };

    return (
        <div className="min-h-screen" style={{ paddingTop: 80 }}>
            <div className="section-container">
                {/* ── HEADER ── */}
                <div className="page-header" style={{ marginBottom: 16 }}>
                    <h1 className="gradient-text" style={{ fontSize: '2.6rem' }}>🎬 مكتبة الفيديوهات التعليمية</h1>
                    <p style={{ maxWidth: 600, margin: '0 auto' }}>أكثر من <strong style={{ color: 'var(--color-accent)' }}>{total || 500}</strong> فيديو تعليمي في الأمن السيبراني — من المبتدئ إلى المتقدم</p>
                    <div className="section-divider" style={{ marginTop: 20 }} />
                </div>

                {/* ── FILTERS BAR ── */}
                <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center',
                    marginBottom: 32, padding: '20px 24px',
                    background: '#ffffff',
                    borderRadius: 16, border: '1px solid rgba(200,150,46,0.12)',
                }}>
                    {/* Search */}
                    <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 340 }}>
                        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 18, opacity: 0.5 }}>🔍</span>
                        <input
                            type="text" placeholder="ابحث في الفيديوهات..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            style={{
                                width: '100%', padding: '10px 42px 10px 14px',
                                borderRadius: 10, border: '1px solid rgba(200,150,46,0.2)',
                                background: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-family-arabic)',
                                fontSize: '0.9rem', outline: 'none', color: 'var(--color-cyber-100)',
                            }}
                        />
                    </div>

                    {/* Category Select */}
                    <select value={category} onChange={e => setCategory(e.target.value)}
                        style={{
                            padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(200,150,46,0.2)',
                            background: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-family-arabic)',
                            fontSize: '0.85rem', cursor: 'pointer', color: 'var(--color-cyber-100)',
                        }}
                    >
                        <option value="all">📂 جميع التصنيفات</option>
                        {categories.map(c => <option key={c} value={c}>{categoryLabels[c] || c}</option>)}
                    </select>

                    {/* Level Select */}
                    <select value={level} onChange={e => setLevel(e.target.value)}
                        style={{
                            padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(200,150,46,0.2)',
                            background: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-family-arabic)',
                            fontSize: '0.85rem', cursor: 'pointer', color: 'var(--color-cyber-100)',
                        }}
                    >
                        <option value="all">📊 جميع المستويات</option>
                        <option value="beginner">🔰 سهل</option>
                        <option value="intermediate">🔧 متوسط</option>
                        <option value="advanced">🚀 صعب</option>
                    </select>

                    {/* Sort Select */}
                    <select value={sort} onChange={e => setSort(e.target.value)}
                        style={{
                            padding: '10px 16px', borderRadius: 10, border: '1px solid rgba(200,150,46,0.2)',
                            background: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-family-arabic)',
                            fontSize: '0.85rem', cursor: 'pointer', color: 'var(--color-cyber-100)',
                        }}
                    >
                        <option value="default">⚙️ الترتيب الافتراضي</option>
                        <option value="popular">🔥 الأكثر مشاهدة</option>
                        <option value="latest">🆕 الأحدث</option>
                    </select>
                </div>

                {/* ── STATS ROW ── */}
                <div style={{
                    display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32,
                }}>
                    {[
                        { icon: '🎬', label: 'إجمالي الفيديوهات', value: total },
                        { icon: '📂', label: 'التصنيفات', value: categories.length },
                        { icon: '📊', label: '3 مستويات', value: 'سهل → صعب' },
                    ].map((s, i) => (
                        <div key={i} style={{
                            background: '#ffffff',
                            border: '1px solid rgba(200,150,46,0.1)', borderRadius: 14,
                            padding: '14px 28px', textAlign: 'center', minWidth: 140,
                        }}>
                            <div style={{ fontSize: 24 }}>{s.icon}</div>
                            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-accent)' }}>{s.value}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-cyber-400)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* ── VIDEOS GRID ── */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 80, color: 'var(--color-cyber-400)' }}>
                        <div className="animate-pulse" style={{ fontSize: '1.15rem' }}>⏳ جاري تحميل الفيديوهات...</div>
                    </div>
                ) : videos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 80, color: 'var(--color-cyber-400)' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                        <div style={{ fontSize: '1.1rem' }}>لا توجد فيديوهات تطابق معايير البحث</div>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: 24,
                    }}>
                        {videos.map((video, idx) => {
                            const lv = levelLabels[video.level] || levelLabels.beginner;
                            return (
                                <div key={video.id}
                                    className="glass-card"
                                    onClick={() => setSelectedVideo(video)}
                                    style={{
                                        cursor: 'pointer', overflow: 'hidden',
                                        animationDelay: `${idx * 40}ms`,
                                        animation: 'fade-in-up 0.5s ease-out both',
                                    }}
                                >
                                    {/* Thumbnail */}
                                    <div style={{ position: 'relative', paddingTop: '56.25%', background: '#eee' }}>
                                        <img
                                            src={video.thumbnail} alt={video.title}
                                            style={{
                                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                                objectFit: 'cover',
                                            }}
                                            onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/fNzpcB7ODxQ/hqdefault.jpg`; }}
                                        />
                                        {/* Duration badge */}
                                        <span style={{
                                            position: 'absolute', bottom: 8, left: 8,
                                            background: 'rgba(0,0,0,0.8)', color: '#fff',
                                            padding: '3px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700,
                                        }}>
                                            ⏱️ {video.duration}
                                        </span>
                                        {/* Play overlay */}
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: 'rgba(0,0,0,0)', transition: 'background 0.3s',
                                        }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.35)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}
                                        >
                                            <div style={{
                                                width: 56, height: 56, borderRadius: '50%',
                                                background: 'var(--color-accent)', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center',
                                                opacity: 0, transition: 'opacity 0.3s', fontSize: 24,
                                                boxShadow: '0 4px 20px rgba(200,150,46,0.5)',
                                            }}
                                                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                                ref={el => {
                                                    if (el) {
                                                        const parent = el.parentElement;
                                                        if (parent) {
                                                            parent.onmouseenter = () => el.style.opacity = '1';
                                                            parent.onmouseleave = () => el.style.opacity = '0';
                                                        }
                                                    }
                                                }}
                                            >
                                                ▶
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div style={{ padding: '16px 18px 18px' }}>
                                        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                                            <span style={{
                                                fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px',
                                                borderRadius: 20, color: lv.color, background: lv.bg,
                                                border: `1px solid ${lv.color}30`,
                                            }}>
                                                {lv.label}
                                            </span>
                                            <span style={{
                                                fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px',
                                                borderRadius: 20, color: 'var(--color-cyber-300)',
                                                background: 'rgba(200,150,46,0.08)',
                                                border: '1px solid rgba(200,150,46,0.15)',
                                            }}>
                                                {categoryLabels[video.category]?.split(' ').slice(1).join(' ') || video.category}
                                            </span>
                                        </div>

                                        <h3 style={{
                                            fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.5,
                                            color: 'var(--color-cyber-100)', marginBottom: 6,
                                            display: '-webkit-box', WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                        }}>
                                            {video.title}
                                        </h3>

                                        <p style={{
                                            fontSize: '0.8rem', color: 'var(--color-cyber-400)',
                                            lineHeight: 1.6, marginBottom: 12,
                                            display: '-webkit-box', WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                        }}>
                                            {video.description}
                                        </p>

                                        <div style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            paddingTop: 10, borderTop: '1px solid rgba(200,150,46,0.08)',
                                            fontSize: '0.75rem', color: 'var(--color-cyber-500)',
                                        }}>
                                            <span>👤 {video.instructor}</span>
                                            <span>👁️ {video.views.toLocaleString('ar-EG')}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── PAGINATION ── */}
                {totalPages > 1 && (
                    <div style={{
                        display: 'flex', gap: 8, justifyContent: 'center',
                        marginTop: 40, flexWrap: 'wrap',
                    }}>
                        <button disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                            style={{
                                padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(200,150,46,0.2)',
                                background: page <= 1 ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.7)',
                                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                                fontFamily: 'var(--font-family-arabic)', fontWeight: 600,
                                color: page <= 1 ? 'var(--color-cyber-600)' : 'var(--color-cyber-200)',
                            }}
                        >
                            ← السابق
                        </button>

                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 7) { pageNum = i + 1; }
                            else if (page <= 4) { pageNum = i + 1; }
                            else if (page >= totalPages - 3) { pageNum = totalPages - 6 + i; }
                            else { pageNum = page - 3 + i; }
                            return (
                                <button key={pageNum} onClick={() => setPage(pageNum)}
                                    style={{
                                        padding: '10px 16px', borderRadius: 10, fontWeight: 700,
                                        border: page === pageNum ? '1px solid var(--color-accent)' : '1px solid rgba(200,150,46,0.15)',
                                        background: page === pageNum ? 'linear-gradient(135deg, var(--color-accent), var(--color-accent-dim))' : 'rgba(255,255,255,0.6)',
                                        color: page === pageNum ? '#fff' : 'var(--color-cyber-300)',
                                        cursor: 'pointer', fontFamily: 'var(--font-family-arabic)',
                                        boxShadow: page === pageNum ? '0 4px 16px rgba(200,150,46,0.3)' : 'none',
                                    }}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            style={{
                                padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(200,150,46,0.2)',
                                background: page >= totalPages ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.7)',
                                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                                fontFamily: 'var(--font-family-arabic)', fontWeight: 600,
                                color: page >= totalPages ? 'var(--color-cyber-600)' : 'var(--color-cyber-200)',
                            }}
                        >
                            التالي →
                        </button>
                    </div>
                )}

                {/* Page indicator */}
                {totalPages > 1 && (
                    <div style={{ textAlign: 'center', marginTop: 12, fontSize: '0.8rem', color: 'var(--color-cyber-500)' }}>
                        صفحة {page} من {totalPages} — عرض {videos.length} من {total} فيديو
                    </div>
                )}
            </div>

            {/* ── VIDEO PLAYER MODAL ── */}
            {selectedVideo && (
                <div
                    onClick={() => setSelectedVideo(null)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9999,
                        background: 'rgba(0,0,0,0.92)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 24, animation: 'fade-in 0.25s ease',
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: '100%', maxWidth: 960,
                            background: 'var(--color-cyber-950)', borderRadius: 20,
                            overflow: 'hidden', border: '1px solid rgba(200,150,46,0.2)',
                            boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
                            animation: 'scale-in 0.3s ease',
                        }}
                    >
                        {/* Embed */}
                        <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
                            <iframe
                                src={getYouTubeEmbedUrl(selectedVideo.video_url)}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        {/* Info */}
                        <div style={{ padding: '20px 24px' }}>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                                <span style={{
                                    fontSize: '0.72rem', fontWeight: 700, padding: '3px 12px', borderRadius: 20,
                                    color: levelLabels[selectedVideo.level]?.color,
                                    background: levelLabels[selectedVideo.level]?.bg,
                                }}>
                                    {levelLabels[selectedVideo.level]?.label}
                                </span>
                                <span style={{
                                    fontSize: '0.72rem', fontWeight: 600, padding: '3px 12px', borderRadius: 20,
                                    color: 'var(--color-cyber-300)', background: 'rgba(200,150,46,0.08)',
                                }}>
                                    {categoryLabels[selectedVideo.category] || selectedVideo.category}
                                </span>
                            </div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8, color: 'var(--color-cyber-100)' }}>
                                {selectedVideo.title}
                            </h2>
                            <p style={{ fontSize: '0.88rem', color: 'var(--color-cyber-400)', lineHeight: 1.7, marginBottom: 14 }}>
                                {selectedVideo.description}
                            </p>
                            <div style={{
                                display: 'flex', gap: 20, fontSize: '0.8rem', color: 'var(--color-cyber-500)',
                                paddingTop: 12, borderTop: '1px solid rgba(200,150,46,0.1)',
                            }}>
                                <span>👤 {selectedVideo.instructor}</span>
                                <span>⏱️ {selectedVideo.duration}</span>
                                <span>👁️ {selectedVideo.views.toLocaleString('ar-EG')}</span>
                            </div>
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="btn-secondary"
                                style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
                            >
                                ✕ إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
