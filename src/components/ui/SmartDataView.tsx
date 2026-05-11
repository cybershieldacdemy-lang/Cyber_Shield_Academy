import React, { ReactNode } from 'react';
import { Loader2, SearchX, AlertCircle, Database, PlusCircle } from 'lucide-react';

export type EmptyStateType = 'no-data' | 'filter' | 'error' | 'onboarding';

interface SmartDataViewProps {
    loading?: boolean;
    error?: string | null;
    isEmpty?: boolean;
    isFilterEmpty?: boolean;
    emptyType?: EmptyStateType;
    emptyConfig?: {
        title?: string;
        desc?: string;
        action?: ReactNode;
    };
    skeleton?: ReactNode;
    children: ReactNode;
    onRetry?: () => void;
}

export function SmartDataView({
    loading = false,
    error = null,
    isEmpty = false,
    isFilterEmpty = false,
    emptyType = 'no-data',
    emptyConfig,
    skeleton,
    children,
    onRetry
}: SmartDataViewProps) {

    // 1. Loading State
    if (loading) {
        if (skeleton) return <>{skeleton}</>;
        return (
            <div className="flex flex-col items-center justify-center p-12 glass-card animate-fade-in border border-cyber-700">
                <Loader2 className="w-12 h-12 animate-spin text-neon-blue mb-4" />
                <p className="text-cyber-400 font-medium animate-pulse">جاري تحميل البيانات...</p>
            </div>
        );
    }

    // 2. Error State
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 glass-card animate-fade-in border border-red-900/50 bg-red-950/10">
                <div className="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-red-400 mb-2">حدث خطأ أثناء تحميل البيانات</h3>
                <p className="text-cyber-400 text-center max-w-md mb-6">{error}</p>
                {onRetry && (
                    <button 
                        onClick={onRetry}
                        className="px-6 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                )}
            </div>
        );
    }

    // 3. Filter Empty State
    if (isFilterEmpty || (isEmpty && emptyType === 'filter')) {
        return (
            <div className="flex flex-col items-center justify-center p-16 text-center animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-cyber-800/50 flex items-center justify-center mb-6 border border-cyber-700">
                    <SearchX className="w-10 h-10 text-cyber-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">لا توجد نتائج مطابقة</h3>
                <p className="text-cyber-400 max-w-md mx-auto mb-6">
                    لم نتمكن من العثور على أي نتائج تطابق معايير البحث والفلترة الحالية. جرب استخدام كلمات مفتاحية مختلفة.
                </p>
                {emptyConfig?.action}
            </div>
        );
    }

    // 4. No Data State (Database is actually empty)
    if (isEmpty && emptyType === 'no-data') {
        return (
            <div className="flex flex-col items-center justify-center p-16 glass-card animate-fade-in text-center border border-cyber-700">
                <div className="w-24 h-24 rounded-full bg-neon-blue/10 flex items-center justify-center mb-6 border border-neon-blue/20">
                    <Database className="w-10 h-10 text-neon-blue" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                    {emptyConfig?.title || 'لا توجد بيانات مسجلة'}
                </h3>
                <p className="text-cyber-400 max-w-md mx-auto mb-8">
                    {emptyConfig?.desc || 'لم يتم العثور على أي بيانات لعرضها هنا في الوقت الحالي.'}
                </p>
                {emptyConfig?.action || (
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-neon-blue text-black font-bold rounded-lg hover:bg-blue-600 transition-colors opacity-50 cursor-not-allowed">
                        <PlusCircle className="w-5 h-5" />
                        إضافة سجل جديد
                    </button>
                )}
            </div>
        );
    }

    // 5. Onboarding / First-time user State
    if (isEmpty && emptyType === 'onboarding') {
        return (
            <div className="flex flex-col items-center justify-center p-16 glass-card animate-fade-in text-center border-2 border-accent border-dashed bg-accent/5">
                <div className="text-6xl mb-6">🚀</div>
                <h3 className="text-2xl font-bold text-accent mb-3">
                    {emptyConfig?.title || 'مرحباً بك في تجربتك الجديدة'}
                </h3>
                <p className="text-cyber-300 max-w-md mx-auto mb-8 text-lg">
                    {emptyConfig?.desc || 'يبدو أنك مستخدم جديد! ابدأ رحلتك الآن بإضافة المحتوى الأول أو استكشاف المنصة.'}
                </p>
                {emptyConfig?.action}
            </div>
        );
    }

    // 6. Data is present
    return <>{children}</>;
}
