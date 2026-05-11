import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import db from '@/lib/db';

export default async function TeacherStudentsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) redirect('/login');
    const payload = verifyToken(token);
    if (!payload || !payload.id || (payload.role !== 'teacher' && payload.role !== 'admin')) {
        redirect('/login');
    }

    let query = `
        SELECT 
            ce.id, 
            ce.progress, 
            ce.completed, 
            ce.enrolled_at,
            u.name as student_name, 
            u.email as student_email, 
            u.avatar as student_avatar,
            c.title_ar as course_title
        FROM course_enrollments ce
        JOIN users u ON ce.user_id = u.id
        JOIN courses c ON ce.course_id = c.id
    `;
    const params: any[] = [];

    if (payload.role === 'teacher') {
        query += ' WHERE c.instructor = ?';
        params.push(payload.id);
    }
    query += ' ORDER BY ce.enrolled_at DESC';

    const students = db.prepare(query).all(...params) as any[];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-cyber-100">سجل الطلاب</h1>
            </div>

            <div className="bg-white rounded-2xl border border-[rgba(200,150,46,0.1)] shadow-sm overflow-hidden min-h-[500px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">الطالب</th>
                                <th className="px-6 py-4">الدورة</th>
                                <th className="px-6 py-4">تاريخ التسجيل</th>
                                <th className="px-6 py-4">التقدم</th>
                                <th className="px-6 py-4">الحالة</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">لا يوجد طلاب مسجلين في دوراتك حتى الآن.</td>
                                </tr>
                            ) : (
                                students.map((s) => (
                                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-cyber-50 flex items-center justify-center text-cyber-100 font-bold overflow-hidden">
                                                    {s.student_avatar ? <img src={s.student_avatar} alt={s.student_name} className="w-full h-full object-cover" /> : s.student_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-cyber-100">{s.student_name}</div>
                                                    <div className="text-xs text-gray-500">{s.student_email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">{s.course_title}</td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(s.enrolled_at).toLocaleDateString('ar-EG')}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-cyber-100 h-2 rounded-full" style={{ width: `${s.progress}%` }}></div>
                                                </div>
                                                <span className="text-xs font-bold w-8">{s.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {s.completed ? (
                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">مكتمل</span>
                                            ) : (
                                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">قيد الدراسة</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

