"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Comment {
    id: number;
    lesson_id: number;
    user_id: string;
    user_name: string;
    user_role: string;
    content: string;
    is_teacher_reply: number;
    created_at: string;
}

interface LessonDiscussionProps {
    courseId: string;
    lessonId: string;
}

export default function LessonDiscussion({ courseId, lessonId }: LessonDiscussionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lessonId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment })
            });

            if (res.status === 401) {
                router.push('/login');
                return;
            }

            if (res.ok) {
                const data = await res.json();
                if (data.success && data.comment) {
                    setComments(prev => [...prev, data.comment]);
                    setNewComment('');
                }
            } else {
                const err = await res.json();
                alert(err.message || 'خطأ في إضافة التعليق');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('حدث خطأ في الاتصال');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr + 'Z');
        return d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return <div className="text-center py-8 text-cyber-500 animate-pulse">جاري تحميل المناقشات...</div>;
    }

    return (
        <div className="mt-12 glass-card p-6 md:p-8">
            <h2 className="text-2xl font-bold text-cyber-100 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-cyber-900 border border-cyber-700">
                    💬
                </span>
                الأسئلة والمناقشات
                <span className="text-sm font-normal px-3 py-1 rounded-full bg-cyber-900/50 text-cyber-400">
                    {comments.length} تعليق
                </span>
            </h2>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="mb-8">
                <div className="relative">
                    <textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="اطرح سؤالاً أو شارك أفكارك حول هذا الدرس..."
                        className="w-full bg-cyber-950/50 border border-cyber-700 rounded-xl p-4 text-cyber-100 placeholder-cyber-600 focus:outline-none focus:border-accent transition-colors resize-none min-h-[100px]"
                        dir="auto"
                    />
                    <div className="absolute left-3 bottom-3">
                        <button 
                            type="submit" 
                            disabled={submitting || !newComment.trim()}
                            className="bg-accent text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg shadow-accent/20 hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {submitting ? '⏳ جاري النشر...' : 'إرسال'}
                        </button>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center py-8 text-cyber-500 text-sm">
                        لا توجد أسئلة أو تعليقات حتى الآن. كن أول من يطرح سؤالاً!
                    </div>
                ) : (
                    comments.map(comment => (
                        <div 
                            key={comment.id} 
                            className={`p-4 rounded-xl border flex gap-4 ${
                                comment.is_teacher_reply 
                                ? 'bg-accent/5 border-accent/20' 
                                : 'bg-cyber-900/20 border-cyber-800'
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-sm ${
                                comment.is_teacher_reply 
                                ? 'bg-gradient-to-br from-accent to-[#b0831f] text-white' 
                                : 'bg-cyber-800 text-cyber-300 border border-cyber-700'
                            }`}>
                                {comment.user_name.charAt(0)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`font-bold text-sm ${comment.is_teacher_reply ? 'text-accent' : 'text-cyber-100'}`}>
                                        {comment.user_name}
                                    </span>
                                    {comment.is_teacher_reply ? (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent font-bold">
                                            مدرّب
                                        </span>
                                    ) : null}
                                    <span className="text-[11px] text-cyber-500 mr-auto flex-shrink-0">
                                        {formatDate(comment.created_at)}
                                    </span>
                                </div>
                                <p className="text-cyber-300 text-sm leading-relaxed whitespace-pre-wrap break-words" dir="auto">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
