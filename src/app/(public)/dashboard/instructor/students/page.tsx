"use client";
import { useEffect, useState } from "react";
import { Search, Mail, ExternalLink, ShieldCheck } from "lucide-react";

interface Student {
    id: string; name: string; email: string; avatar: string;
    experience_level: string; sessions_taken: number; last_session: string; points: number;
}

export default function InstructorStudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/instructor/students')
            .then(res => res.json())
            .then(data => { if(data.students) setStudents(data.students) })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-cyan-400 animate-pulse text-center mt-20">جاري تحميل السجلات...</div>;

    const filtered = students.filter(s => s.name.includes(search) || s.email.includes(search));

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">إدارة الطلاب</h2>
                    <p className="text-sm text-gray-400 mt-1">تابع إحصائيات طلابك ومستوى تقدمهم في الأكاديمية.</p>
                </div>
                <div className="relative">
                    <Search className="absolute right-3 top-2.5 text-gray-500" size={18} />
                    <input 
                        type="text" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="ابحث بالاسم أو الإيميل..." 
                        className="bg-cyber-900 border border-white/10 text-white rounded-lg pr-10 pl-4 py-2 text-sm focus:outline-none focus:border-cyan-500 w-full md:w-64"
                    />
                </div>
            </div>

            {students.length === 0 ? (
                <div className="text-center py-20 glass-panel border border-white/5">لا يوجد طلاب مسجلون بجلساتك بعد.</div>
            ) : (
                <div className="glass-panel overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-4 text-cyan-400 font-medium text-sm">الطالب</th>
                                <th className="p-4 text-cyan-400 font-medium text-sm">النقاط</th>
                                <th className="p-4 text-cyan-400 font-medium text-sm">المستوى</th>
                                <th className="p-4 text-cyan-400 font-medium text-sm text-center">الجلسات المكتملة</th>
                                <th className="p-4 text-cyan-400 font-medium text-sm text-center">آخر تفاعل</th>
                                <th className="p-4 text-cyan-400 font-medium text-sm text-center">تواصل مباشر</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((student, i) => (
                                <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img src={student.avatar || "https://ui-avatars.com/api/?name=" + student.name} className="w-10 h-10 rounded-full border border-white/10" />
                                            <div>
                                                <div className="font-bold text-gray-200 text-sm">{student.name}</div>
                                                <div className="text-xs text-gray-500 font-mono">{student.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-cyan-400 font-bold">{student.points}</td>
                                    <td className="p-4 text-sm text-gray-400 flex items-center gap-2">
                                        <ShieldCheck size={16} className={student.experience_level === 'تقدم' ? 'text-purple-500' : 'text-gray-500'} />
                                        {student.experience_level}
                                    </td>
                                    <td className="p-4 text-center text-gray-300 font-bold">{student.sessions_taken}</td>
                                    <td className="p-4 text-center text-xs text-gray-500">
                                        {student.last_session ? new Date(student.last_session).toLocaleDateString('ar-EG') : 'لا يوجد'}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-md transition" title="إرسال رسالة بريدية">
                                                <Mail size={16} />
                                            </button>
                                            <button className="p-2 bg-gray-500/10 text-gray-400 hover:text-white rounded-md transition" title="عرض الحساب التعريفي">
                                                <ExternalLink size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
