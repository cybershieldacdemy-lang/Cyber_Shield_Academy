"use client";

import { useState, useEffect } from 'react';


export default function JobsPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('all'); 

    useEffect(() => {
        fetchJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterCategory]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/jobs?role=${filterCategory}`);
            if (res.ok) {
                const data = await res.json();
                setJobs(data.jobs || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (jobId: number, _applyLink: string | null) => {
        try {
            const res = await fetch(`/api/jobs/${jobId}/apply`, { method: 'POST' });
            const data = await res.json();
            
            if (res.ok) {
                alert(data.message);
                if (data.apply_link) {
                    window.open(data.apply_link, '_blank');
                }
            } else {
                alert(data.message);
            }
        } catch (e) {
            console.error(e);
            alert('حدث خطأ في تقديم الطلب');
        }
    };

    const categories = [
        { id: 'all', name: 'الكل' },
        { id: 'Pentester', name: 'اختبار اختراق (Pentester)' },
        { id: 'Analyst', name: 'محلل أمني (SOC/Analyst)' },
        { id: 'Intern', name: 'تدريب داخلي / صيفي' },
        { id: 'Consultant', name: 'مستشار أمن سيبراني' },
    ];

    return (
        <div className="min-h-screen py-16">
            <div className="section-container">
                <div className="page-header">
                    <h1>سوق العمل السيبراني</h1>
                    <p>اكتشف فرص العمل والتدريب المتاحة في مجال الأمن السيبراني</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-12 justify-center">
                    {categories.map(c => (
                        <button 
                            key={c.id} 
                            onClick={() => setFilterCategory(c.id)}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${filterCategory === c.id ? 'bg-[var(--color-accent)] text-white shadow-lg' : 'bg-[var(--color-cyber-800)] text-[var(--color-cyber-300)] hover:bg-[var(--color-cyber-700)] hover:text-[var(--color-cyber-100)]'}`}
                        >
                            {c.name}
                        </button>
                    ))}
                </div>

                {/* Jobs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loading ? (
                        <div className="col-span-1 md:col-span-2 py-20 text-center text-cyber-500 animate-pulse text-lg">جاري البحث عن الفرص...</div>
                    ) : jobs.length === 0 ? (
                        <div className="col-span-1 md:col-span-2 py-20 text-center text-cyber-500">لا توجد وظائف متاحة حالياً في هذا القسم.</div>
                    ) : (
                        jobs.map((job) => (
                            <div key={job.id} className="glass-card p-6 flex flex-col h-full group">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-cyber-100 mb-1 group-hover:text-[var(--color-accent)] transition-colors">{job.title}</h3>
                                        <div className="text-cyber-400 font-medium">{job.company}</div>
                                    </div>
                                    <span className="bg-cyber-800 text-cyber-200 text-xs px-3 py-1.5 rounded-lg border border-cyber-700">{job.job_type}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="text-xs text-[var(--color-accent-dim)] bg-[var(--color-accent-light)]/20 px-2 py-1 rounded">📍 {job.location}</span>
                                    <span className="text-xs text-[#2b6cb0] bg-[#2b6cb0]/10 px-2 py-1 rounded">🛡️ {job.role}</span>
                                </div>
                                <p className="text-cyber-300 text-sm mb-6 flex-1 line-clamp-3">
                                    {job.description}
                                </p>
                                <div className="pt-4 border-t border-[rgba(200,150,46,0.1)] flex justify-between items-center mt-auto">
                                    <div className="text-xs text-cyber-500 font-mono">
                                        تم النشر: {new Date(job.created_at + 'Z').toLocaleDateString('ar-EG')}
                                    </div>
                                    <button onClick={() => handleApply(job.id, job.apply_link)} className="btn-primary px-6 py-2 text-sm">
                                        تقديم الآن
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
