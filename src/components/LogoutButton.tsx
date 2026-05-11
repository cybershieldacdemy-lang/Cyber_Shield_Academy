"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        router.refresh();
    };

    return (
        <button
            onClick={handleLogout}
            className="w-full block text-center p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-colors cursor-pointer"
        >
            تسجيل الخروج
        </button>
    );
}
