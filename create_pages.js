const fs = require('fs');
const pages = ['courses', 'students', 'live', 'quizzes', 'certificates', 'analytics', 'settings'];
pages.forEach(p => {
    const title = p === 'courses' ? 'إدارة الدورات' 
                : p === 'students' ? 'الطلاب'
                : p === 'live' ? 'الجلسات المباشرة'
                : p === 'quizzes' ? 'الاختبارات والواجبات'
                : p === 'certificates' ? 'الشهادات'
                : p === 'analytics' ? 'التحليلات'
                : 'الإعدادات';
    
    const content = `export default function ${p.charAt(0).toUpperCase() + p.slice(1)}Page() {
    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-2">${title}</h1>
            <p className="text-gray-400">جاري تطوير هذه الوحدة. ستتوفر قريباً.</p>
            
            <div className="mt-8 border-2 border-dashed border-cyber-800/50 rounded-2xl h-96 flex items-center justify-center bg-cyber-900/20">
                <p className="text-cyber-500 font-bold">Coming Soon...</p>
            </div>
        </div>
    );
}`;
    fs.writeFileSync(`src/app/instructor/${p}/page.tsx`, content);
});
console.log('Done');
