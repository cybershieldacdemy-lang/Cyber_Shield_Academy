"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ThreatMapClient = dynamic(
    () => import("./ThreatMapClient"),
    {
        ssr: false,
        loading: () => (
            <div style={{
                width: "100%", height: "100vh", display: "flex",
                alignItems: "center", justifyContent: "center",
                background: "#0B0F1A", color: "#00D4FF",
                fontFamily: "'Courier New', monospace",
                fontSize: "13px", letterSpacing: "3px",
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{
                        width: "50px", height: "50px", margin: "0 auto 20px",
                        border: "2px solid rgba(0,212,255,0.15)",
                        borderTop: "2px solid #00D4FF",
                        borderRight: "2px solid #7A00FF",
                        borderRadius: "50%",
                        animation: "tm-spin 0.8s linear infinite",
                    }} />
                    <div style={{ marginBottom: "8px" }}>INITIALIZING THREAT MAP...</div>
                    <div style={{ fontSize: "9px", color: "#334155", letterSpacing: "2px" }}>LOADING THREEJS ENGINE</div>
                    <style>{`@keyframes tm-spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        ),
    }
);

export default function ThreatMapPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Hide navbar, footer, and other overlays for full-screen dashboard
        document.body.style.overflow = "hidden";
        const nav = document.querySelector("nav");
        const footer = document.querySelector("footer");
        const backToTop = document.getElementById("back-to-top");

        if (nav) (nav as HTMLElement).style.display = "none";
        if (footer) (footer as HTMLElement).style.display = "none";
        if (backToTop) (backToTop as HTMLElement).style.display = "none";

        // Hide AI Chat Widget
        const aiWidget = document.querySelector('[class*="AIChatWidget"]') as HTMLElement;
        if (aiWidget) aiWidget.style.display = "none";

        return () => {
            document.body.style.overflow = "";
            if (nav) (nav as HTMLElement).style.display = "";
            if (footer) (footer as HTMLElement).style.display = "";
            if (backToTop) (backToTop as HTMLElement).style.display = "";
            if (aiWidget) aiWidget.style.display = "";
        };
    }, []);

    if (!mounted) return null;
    return <ThreatMapClient />;
}
