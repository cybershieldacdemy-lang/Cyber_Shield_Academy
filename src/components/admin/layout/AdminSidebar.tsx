import React from 'react';
import { 
    LayoutDashboard, Users, Video, ShieldCheck, 
    ShieldAlert, Flame, Target, FileText, 
    Database, Activity, Lock, Settings,
    Globe, Bug, FileCheck, RefreshCw, CreditCard, ChevronRight, ChevronLeft
} from 'lucide-react';

export type TabType = 
    | 'overview' | 'sessions' | 'instructors' | 'users' | 'terms' | 'subscriptions'
    | 'incidents' | 'firewall' | 'ids' | 'assets' | 'audit' 
    | 'compliance' | 'vulnerabilities' | 'backup' | 'change-control' | 'settings';

interface AdminSidebarProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export default function AdminSidebar({ activeTab, onTabChange, sidebarOpen, setSidebarOpen }: AdminSidebarProps) {

    const NavItem = ({ tab, icon: Icon, label, color = 'text-cyber-400' }: { tab: TabType, icon: any, label: string, color?: string }) => (
        <button 
            onClick={() => onTabChange(tab)}
            title={!sidebarOpen ? label : undefined}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                activeTab === tab 
                ? `bg-cyber-800/80 text-white border border-cyber-700/50 shadow-[0_0_15px_rgba(200,150,46,0.1)]` 
                : `hover:bg-cyber-800/30 ${color} hover:text-white`
            }`}
        >
            {activeTab === tab && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent to-amber-600 rounded-r-md"></div>
            )}
            <Icon size={sidebarOpen ? 18 : 22} className={`${activeTab === tab ? 'scale-110 text-accent' : 'group-hover:scale-110'} transition-transform flex-shrink-0 ${!sidebarOpen && 'mx-auto'}`} />
            {sidebarOpen && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
        </button>
    );

    const SectionHeader = ({ title, color }: { title: string, color: string }) => {
        if (!sidebarOpen) return <div className="h-4 border-t border-cyber-800/30 mt-4 mx-4"></div>;
        return <p className={`text-[10px] uppercase tracking-widest ${color} font-bold mb-3 px-3 mt-4`}>{title}</p>;
    };

    return (
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col h-screen border-l border-cyber-800/30 bg-[#06080a]/95 backdrop-blur-xl transition-all duration-300 relative z-30 shrink-0 shadow-[5px_0_20px_rgba(0,0,0,0.5)]`}>
            
            {/* Logo Area */}
            <div className="h-16 flex items-center px-4 border-b border-cyber-800/50 shrink-0 justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-[0_0_15px_rgba(220,38,38,0.3)] bg-gradient-to-br from-red-900 to-red-500 shrink-0">
                        ⚡
                    </div>
                    {sidebarOpen && (
                        <div className="animate-fade-in whitespace-nowrap">
                            <span className="text-sm font-bold block text-white tracking-wide uppercase">القيادة المركزية</span>
                            <span className="text-[9px] block text-accent font-mono tracking-widest leading-none">CORE CONTROL</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                <SectionHeader title="الإدارة الأساسية" color="text-cyber-500" />
                <NavItem tab="overview" icon={LayoutDashboard} label="نظرة عامة" />
                <NavItem tab="users" icon={Users} label="المستخدمين" />
                <NavItem tab="instructors" icon={ShieldCheck} label="المدربين" />
                <NavItem tab="sessions" icon={Video} label="الجلسات المباشرة" />
                <NavItem tab="subscriptions" icon={CreditCard} label="الاشتراكات" />
                <NavItem tab="terms" icon={FileText} label="المصطلحات" />

                <SectionHeader title="مركز الاستجابة SOC" color="text-red-500" />
                <NavItem tab="incidents" icon={Flame} label="الحوادث الأمنية" color="text-red-400" />
                <NavItem tab="firewall" icon={Lock} label="جدار الحماية" color="text-red-400" />
                <NavItem tab="ids" icon={ShieldAlert} label="كشف التسلل" color="text-red-400" />
                <NavItem tab="assets" icon={Globe} label="سجل الأصول" color="text-red-400" />

                <SectionHeader title="الاستخبارات والامتثال" color="text-orange-500" />
                <NavItem tab="vulnerabilities" icon={Bug} label="تتبع الثغرات" color="text-orange-400" />
                <NavItem tab="compliance" icon={FileCheck} label="معايير الامتثال" color="text-orange-400" />
                <NavItem tab="audit" icon={Activity} label="سجل العمليات" color="text-orange-400" />
                <NavItem tab="backup" icon={Database} label="النسخ الاحتياطية" color="text-orange-400" />
                <NavItem tab="change-control" icon={RefreshCw} label="التحكم بالتغيير" color="text-orange-400" />
            </div>

            {/* Footer / Settings */}
            <div className="p-3 border-t border-cyber-800/50 shrink-0">
                <NavItem tab="settings" icon={Settings} label="الإعدادات" />
                
                {/* Collapse Toggle */}
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="w-full mt-2 flex items-center justify-center p-2 rounded-lg hover:bg-cyber-800/30 text-cyber-500 hover:text-white transition-colors"
                >
                    {sidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>
        </aside>
    );
}
