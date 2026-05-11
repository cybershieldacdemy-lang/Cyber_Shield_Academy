"use client";

import { useState, useEffect } from 'react';

export default function TeacherDiscussionsPage() {
    const [discussions, setDiscussions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');

    useEffect(() => {
        fetchDiscussions();
    }, []);

    const fetchDiscussions = async () => {
        try {
            const res = await fetch('/api/teacher/discussions');
            if (res.ok) {
                const data = await res.json();
                setDiscussions(data.discussions || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (lessonId: number) => {
        if (!replyContent.trim()) return;
        
        try {
            const res = await fetch('/api/teacher/discussions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lesson_id: lessonId, content: replyContent })
            });
            if (res.ok) {
                setReplyContent('');
                setReplyingTo(null);
                fetchDiscussions();
            } else {
                alert('فشل إضافة الرد');
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-cyber-100">الاستفسارات والمناقشات</h1>
            </div>

            <div className="bg-white rounded-2xl border border-[rgba(200,150,46,0.1)] shadow-sm p-6 overflow-hidden min-h-[500px]">
                {loading ? (
                    <div className="text-center py-10 text-cyber-100 animate-pulse">جاري تحميل الاستفسارات...</div>
                ) : discussions.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 flex flex-col items-center">
                        <span className="text-4xl mb-3">💬</span>
                        لا توجد استفسارات في دوراتك حتى الآن.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {discussions.map((d) => (
                            <div key={d.id} className={`p-4 rounded-xl border ${d.is_teacher_reply ? 'bg-cyber-50/30 border-cyber-100/30 mr-8' : 'bg-gray-50 border-gray-100'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-cyber-100 flex items-center justify-center text-cyber-100 font-bold overflow-hidden">
                                            {d.user_avatar ? <img src={d.user_avatar} alt={d.user_name} className="w-full h-full object-cover" /> : d.user_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-cyber-100 text-sm">
                                                {d.is_teacher_reply ? 'أنت (مدرّب)' : d.user_name}
                                            </div>
                                            {!d.is_teacher_reply && (
                                                <div className="text-xs text-cyber-100 font-medium">حول درس: {d.lesson_title} - {d.course_title}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400 font-medium">
                                        {new Date(d.created_at).toLocaleString('ar-EG')}
                                    </div>
                                </div>
                                <div className="text-gray-700 mt-2 text-sm leading-relaxed pr-11">
                                    {d.content}
                                </div>

                                {!d.is_teacher_reply && (
                                    <div className="mt-4 pr-11">
                                        {replyingTo === d.id ? (
                                            <div className="space-y-3">
                                                <textarea 
                                                    rows={3} 
                                                    value={replyContent} 
                                                    onChange={(e) => setReplyContent(e.target.value)} 
                                                    className="w-full px-3 py-2 border rounded-lg focus:ring-cyber-100 focus:border-cyber-100 outline-none text-sm" 
                                                    placeholder="اكتب ردك هنا..."
                                                ></textarea>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleReply(d.lesson_id)} className="px-4 py-1.5 bg-cyber-100 text-cyber-950 font-bold text-sm rounded-lg hover:bg-opacity-90 transition-colors">إرسال الرد</button>
                                                    <button onClick={() => setReplyingTo(null)} className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors">إلغاء</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button onClick={() => { setReplyingTo(d.id); setReplyContent(''); }} className="text-sm font-bold text-cyber-100 hover:text-cyber-50 transition-colors flex items-center gap-1">
                                                ↩️ رد على الطالب
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

