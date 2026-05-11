'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AdminSidebar, { TabType } from './layout/AdminSidebar';
import AdminTopbar from './layout/AdminTopbar';

// Loading Skeleton for Lazy Modules
const ComponentSkeleton = () => (
    <div className="w-full h-[600px] bg-cyber-900/20 animate-pulse rounded-2xl border border-cyber-800/30 flex items-center justify-center shadow-xl">
        <div className="text-cyber-500 font-mono flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-t-accent border-cyber-800 rounded-full animate-spin"></div>
            <span className="tracking-widest text-xs">SYSTEM.LOADING_MODULE...</span>
        </div>
    </div>
);

// Lazy-loaded Components (Code Splitting)
const AdminOverview = dynamic(() => import('./AdminOverview'), { loading: () => <ComponentSkeleton />, ssr: false });
const AdminSessions = dynamic(() => import('./AdminSessions'), { loading: () => <ComponentSkeleton /> });
const AdminInstructors = dynamic(() => import('./AdminInstructors'), { loading: () => <ComponentSkeleton /> });
const AdminProfile = dynamic(() => import('./AdminProfile'), { loading: () => <ComponentSkeleton /> });
const IncidentDashboard = dynamic(() => import('./IncidentDashboard'), { loading: () => <ComponentSkeleton /> });
const FirewallManager = dynamic(() => import('./FirewallManager'), { loading: () => <ComponentSkeleton /> });
const IdsDashboard = dynamic(() => import('./IdsDashboard'), { loading: () => <ComponentSkeleton /> });
const AssetRegistry = dynamic(() => import('./AssetRegistry'), { loading: () => <ComponentSkeleton /> });
const AuditLogViewer = dynamic(() => import('./AuditLogViewer'), { loading: () => <ComponentSkeleton /> });
const ComplianceManager = dynamic(() => import('./ComplianceManager'), { loading: () => <ComponentSkeleton /> });
const BackupManager = dynamic(() => import('./BackupManager'), { loading: () => <ComponentSkeleton /> });
const VulnerabilityTracker = dynamic(() => import('./VulnerabilityTracker'), { loading: () => <ComponentSkeleton /> });
const ChangeControlManager = dynamic(() => import('./ChangeControlManager'), { loading: () => <ComponentSkeleton /> });
const AdminTerms = dynamic(() => import('./AdminTerms'), { loading: () => <ComponentSkeleton /> });
const AdminUsers = dynamic(() => import('./AdminUsers'), { loading: () => <ComponentSkeleton /> });
const AdminSubscriptions = dynamic(() => import('./AdminSubscriptions'), { loading: () => <ComponentSkeleton /> });

export default function AdminControlCenter() {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab') as TabType;
        if (tab) setActiveTab(tab);
    }, []);

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        const url = new URL(window.location.href);
        url.searchParams.set('tab', tab);
        window.history.pushState({}, '', url);
    };

    const renderContent = () => {
        if (!isMounted) return <ComponentSkeleton />; // Prevent hydration mismatch
        
        switch (activeTab) {
            case 'overview': return <AdminOverview />;
            case 'sessions': return <AdminSessions />;
            case 'instructors': return <AdminInstructors />;
            case 'terms': return <AdminTerms />;
            case 'users': return <AdminUsers />;
            case 'subscriptions': return <AdminSubscriptions />;
            case 'incidents': return <IncidentDashboard />;
            case 'firewall': return <FirewallManager />;
            case 'ids': return <IdsDashboard />;
            case 'assets': return <AssetRegistry />;
            case 'audit': return <AuditLogViewer />;
            case 'compliance': return <ComplianceManager />;
            case 'vulnerabilities': return <VulnerabilityTracker />;
            case 'backup': return <BackupManager />;
            case 'change-control': return <ChangeControlManager />;
            case 'settings': return <AdminProfile />;
            default: return <AdminOverview />;
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#06080a] overflow-hidden text-white font-sans selection:bg-accent/30">
            {/* Sidebar Navigation */}
            <AdminSidebar 
                activeTab={activeTab} 
                onTabChange={handleTabChange} 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
            />

            {/* Main View Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <AdminTopbar 
                    activeTab={activeTab} 
                    sidebarOpen={sidebarOpen} 
                    setSidebarOpen={setSidebarOpen} 
                />
                
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-gradient-to-br from-[#06080a] to-[#0b0e14]">
                    <div className="max-w-7xl mx-auto w-full pb-20 animate-fade-in">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
}
