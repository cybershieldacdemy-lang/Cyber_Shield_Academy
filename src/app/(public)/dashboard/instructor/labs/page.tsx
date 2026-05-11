"use client";
import { Plus, UploadCloud, TerminalSquare, AlertCircle } from "lucide-react";

export default function InstructorLabsPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">إدارة المحتوى والمختبرات</h2>
                    <p className="text-sm text-gray-400 mt-1">ارفع محتوى تعليمي، صمم تدريبات، وأنشئ مختبرات افتراضية.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-lg text-sm text-white font-medium transition">
                        <UploadCloud size={16} /> رفع ملف وسائط
                    </button>
                    <button className="flex items-center gap-2 bg-cyan-500 text-black hover:bg-cyan-400 px-4 py-2 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(0,245,255,0.3)] transition">
                        <Plus size={16} /> إنشاء مختبر جديد
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Mocked Example Labs */}
                {[
                    { title: 'التحقيق الجنائي الرقمي (Windows)', type: 'CTF', enrolled: 12, status: 'مفعل' },
                    { title: 'أساسيات الشبكات وهجوم MitM', type: 'مختبر موجه', enrolled: 45, status: 'مفعل' },
                    { title: 'حقن قواعد البيانات SQLi', type: 'تحدي اختراق', enrolled: 0, status: 'مسودة' }
                ].map((lab, i) => (
                    <div key={i} className="glass-panel p-6 border-t border-white/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-white/5 px-3 py-1 rounded-bl-lg text-[10px] text-gray-400 border-b border-l border-white/5">{lab.type}</div>
                        <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center mb-4">
                            <TerminalSquare size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-200 mb-1">{lab.title}</h3>
                        <p className="text-xs text-gray-500 mb-4">{lab.enrolled} متدرب أتموا هذا المختبر</p>
                        
                        <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${lab.status === 'مفعل' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                {lab.status}
                            </span>
                            <div className="flex gap-2">
                                <button className="text-xs text-gray-400 hover:text-white transition">تعديل</button>
                                <button className="text-xs text-red-500/70 hover:text-red-400 transition">تفريغ</button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Create New Block */}
                <div className="glass-panel p-6 border border-dashed border-gray-600 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition opacity-70 hover:opacity-100 min-h-[200px]">
                    <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mb-3">
                        <Plus size={24} />
                    </div>
                    <h3 className="font-bold text-gray-300">مختبر فارغ</h3>
                    <p className="text-xs text-gray-500 mt-1">ابدأ بتصميم بيئة افتراضية تفاعلية</p>
                </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center gap-3">
                <AlertCircle className="text-blue-400 shrink-0" />
                <p className="text-sm text-blue-200">هذه واجهة تصميم مبدئية، سيتم تفعيل محرك إنشاء الحاويات الافتراضية Container Engine في التحديث القادم الخاص بالمختبرات.</p>
            </div>
        </div>
    );
}
