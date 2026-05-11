import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "المسؤول المركزي | أكاديمية الدرع السيبراني",
    description: "لوحة التحكم الأمنية",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-[#06080a] text-white font-sans selection:bg-accent/30 w-full h-screen overflow-hidden">
            {children}
        </div>
    );
}

