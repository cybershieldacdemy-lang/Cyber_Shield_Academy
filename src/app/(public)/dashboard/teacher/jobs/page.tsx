"use client";

import { useState, useEffect } from 'react';

export default function TeacherJobsPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/teacher/jobs');
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-cyber-100">إدارة الوظائف والتدريب</h1>
                <button 
                    onClick={() => setShowForm(!showForm)} 
                    className="px-4 py-2 bg-[rgba(200,150,46,0.1)] text-cyber-100 font-bold rounded-lg hover:bg-[rgba(200,150,46,0.2)] transition-colors"
                >
                    {showForm ? 'العودة للقائمة' : '+ نشر وظيفة جديدة'}
                </button>
            </div>

            {showForm ? (
                <JobForm onSuccess={() => { setShowForm(false); fetchJobs(); }} onCancel={() => setShowForm(false)} />
            ) : (
                <div className="bg-white rounded-2xl border border-[rgba(200,150,46,0.1)] shadow-sm overflow-hidden min-h-[500px] p-6">
                    {loading ? (
                        <div className="text-center py-20 text-cyber-100 animate-pulse">جاري التحميل...</div>
                    ) : jobs.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">لا توجد وظائف منشورة حتى الآن. قم بنشر وظيفتك الأولى!</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {jobs.map(job => (
                                <div key={job.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:shadow-sm transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-cyber-100 truncate pr-4">{job.title}</h3>
                                            <div className="text-sm text-gray-500">{job.company} • {job.job_type}</div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-lg font-medium whitespace-nowrap ${job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{job.status === 'open' ? 'مفتوح' : 'مغلق'}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 my-3">
                                        <span className="text-xs text-cyber-500 bg-cyber-50 px-2 py-1 rounded border border-cyber-100/10">التطبيقات الان عبر المنصة: {job.applications_count}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 font-mono mt-4 pt-4 border-t border-gray-100">
                                        تاريخ النشر: {new Date(job.created_at + 'Z').toLocaleDateString('ar-EG')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function JobForm({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '', company: '', location: 'Remote', job_type: 'Full-Time', role: 'Pentester', description: '', requirements: '', apply_link: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert('تم نشر الوظيفة بنجاح');
                onSuccess();
            } else {
                const data = await res.json();
                alert(data.message || 'حدث خطأ');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-[rgba(200,150,46,0.1)] shadow-sm space-y-4">
            <h2 className="text-lg font-bold border-b pb-2 mb-4">نشر فرصة جديدة</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المسمى الوظيفي</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-cyber-100" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم الشركة / الجهة</label>
                    <input required type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-cyber-100" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع التخصص (Role)</label>
                    <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-cyber-100">
                        <option value="Pentester">اختبار اختراق (Pentester)</option>
                        <option value="Analyst">محلل أمني (SOC/Analyst)</option>
                        <option value="Intern">تدريب داخلي / صيفي</option>
                        <option value="Consultant">مستشار أمن سيبراني</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع الدوام</label>
                    <select required value={formData.job_type} onChange={e => setFormData({...formData, job_type: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-cyber-100">
                        <option value="Full-Time">دوام كامل (Full-Time)</option>
                        <option value="Part-Time">دوام جزئي (Part-Time)</option>
                        <option value="Contract">عقد حر (Contract)</option>
                        <option value="Internship">تدريب (Internship)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الموقع</label>
                    <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="الرياض / عن بعد..." className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-cyber-100" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رابط التقديم (إن وجد)</label>
                    <input type="url" dir="ltr" value={formData.apply_link} onChange={e => setFormData({...formData, apply_link: e.target.value})} placeholder="https://..." className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-cyber-100" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">وصف الوظيفة</label>
                <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-cyber-100"></textarea>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المتطلبات (Requirements)</label>
                <textarea rows={3} value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-cyber-100"></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">إلغاء</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-cyber-100 text-cyber-950 font-bold rounded-lg shadow-md hover:bg-opacity-90 transition-colors">
                    {loading ? 'يتم النشر...' : 'نشر الوظيفة'}
                </button>
            </div>
        </form>
    );
}

