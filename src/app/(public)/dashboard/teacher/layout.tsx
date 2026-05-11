"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TeacherDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname();

    const navItems = [
        { name: 'لوحة التحكم', href: '/dashboard/teacher', icon: '📊' },
        { name: 'الدورات التعليمية', href: '/dashboard/teacher/courses', icon: '📚' },
        { name: 'الاستفسارات والمناقشات', href: '/dashboard/teacher/discussions', icon: '💬' },
        { name: 'سجل الطلاب', href: '/dashboard/teacher/students', icon: '👥' },
        { name: 'إعدادات المدرب', href: '/dashboard/teacher/settings', icon: '⚙️' },
    ];

    return (
        <div style={{ paddingTop: "64px", minHeight: "100vh", background: '#f5f1e8' }} dir="rtl">
            <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
                {/* Sidebar */}
                <aside className="w-full md:w-64 flex-shrink-0" style={{
                    background: 'rgba(250,246,238,0.98)',
                    borderLeft: '1px solid rgba(200,150,46,0.1)'
                }}>
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{
                                background: 'linear-gradient(135deg, #1a1612, #2d2620)', border: '1px solid #c8962e'
                            }}>
                                👨‍🏫
                            </div>
                            <div>
                                <h2 className="font-bold text-cyber-100">بوابة المدرب</h2>
                                <p className="text-xs text-accent">CyberShield Academy</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href || (item.href !== '/dashboard/teacher' && pathname.startsWith(item.href));
                                return (
                                    <Link key={item.name} href={item.href} className="block">
                                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all" style={{
                                            background: isActive ? 'linear-gradient(to left, rgba(200,150,46,0.1), transparent)' : 'transparent',
                                            borderRight: isActive ? '3px solid #c8962e' : '3px solid transparent',
                                            color: isActive ? '#c8962e' : '#718096'
                                        }}>
                                            <span>{item.icon}</span>
                                            <span className="font-medium text-sm">{item.name}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
