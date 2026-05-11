"use client";
import { useState, useEffect } from 'react';

export default function CookieConsent() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setShow(true);
        }
    }, []);

    const accept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-cyber-900 border-t border-cyber-700 shadow-2xl animate-slide-up">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-cyber-100 flex items-center gap-2">
                        🍪 سياسة وتفضيلات الخصوصية
                    </h3>
                    <p className="text-sm text-cyber-300 mt-1">
                        نستخدم ملفات تعريف الارتباط لتحسين تجربتك وضمان أمان الموقع. المتابعة تعني موافقتك على ذلك وفقاً لـ
                        <a href="/policies?tab=privacy" className="text-accent hover:underline mx-1">سياسة الخصوصية</a>.
                    </p>
                </div>
                <div className="flex gap-3">
                    {/* <button className="px-4 py-2 text-sm text-cyber-300 hover:text-white transition-colors">تخصيص</button> */}
                    <button onClick={accept} className="btn-primary px-6 py-2 text-sm">موافق</button>
                </div>
            </div>
            <style jsx>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.5s ease-out;
                }
            `}</style>
        </div>
    );
}
