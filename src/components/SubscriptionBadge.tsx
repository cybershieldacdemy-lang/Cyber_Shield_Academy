"use client";
import { useState, useEffect } from "react";

const planColors: Record<string, string> = {
    free: '#38b2ac',
    pro: '#c8962e',
    enterprise: '#805ad5',
};

const planLabels: Record<string, string> = {
    free: 'مجاني',
    pro: 'احترافي',
    enterprise: 'مؤسسي',
};

export default function SubscriptionBadge() {
    const [planId, setPlanId] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch("/api/subscription/status", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => res.json())
            .then(data => {
                if (data.subscription) setPlanId(data.subscription.plan_id);
            })
            .catch(() => {});
    }, []);

    if (!planId || planId === 'free') return null;

    const color = planColors[planId] || '#c8962e';
    const label = planLabels[planId] || planId;

    return (
        <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
        >
            {planId === 'pro' ? '⭐' : '🏢'} {label}
        </span>
    );
}
