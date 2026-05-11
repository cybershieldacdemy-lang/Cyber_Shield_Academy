import { ReactNode } from "react";
import InstructorSidebar from "@/components/instructor/Sidebar";
import { Bell, Search, User } from "lucide-react";

export const metadata = {
    title: "لوحة تحكم المدرب | Cyber Shield Academy",
    description: "لوحة تحكم احترافية لإدارة الدورات والطلاب الخاصة بالمدربين",
};

export default function InstructorLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-[#060913] text-white flex" dir="rtl">
            <InstructorSidebar />
            
            <main className="flex-1 mr-64 flex flex-col min-h-screen relative">
                {/* Neon Background Effects */}
                <div className="fixed top-0 right-1/4 w-96 h-96 bg-cyber-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="fixed bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />

                {/* Topbar */}
                <header className="h-20 border-b border-cyber-800/50 bg-[#0B0F19]/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex-1 max-w-xl">
                        <div className="relative group">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyber-500 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="ابحث عن دورة، طالب، أو رسالة..." 
                                className="w-full bg-[#111827]/80 border border-cyber-800 rounded-xl py-2.5 pr-11 pl-4 outline-none focus:border-cyber-500 focus:ring-1 focus:ring-cyber-500/50 transition-all text-sm shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0B0F19]" />
                        </button>
                        
                        <div className="h-8 w-px bg-cyber-800/80" />

                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-500 to-blue-600 p-[2px] shadow-[0_0_15px_rgba(0,255,255,0.2)] group-hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all">
                                <div className="w-full h-full rounded-full bg-[#111827] flex items-center justify-center">
                                    <User className="w-5 h-5 text-cyber-500" />
                                </div>
                            </div>
                            <div className="hidden md:block text-right">
                                <div className="text-sm font-bold text-white">المدرب الرئيسي</div>
                                <div className="text-xs text-cyber-500">Instructor</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 p-8 overflow-x-hidden relative z-10">
                    {children}
                </div>
            </main>
        </div>
    );
}
