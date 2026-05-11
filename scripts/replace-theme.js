const fs = require('fs');
const path = require('path');

const files = [
    "src/app/(public)/ctf/page.tsx",
    "src/app/(public)/threat-map/page.tsx",
    "src/app/(public)/tools/page.tsx",
    "src/app/(public)/dashboard/teacher/live/page.tsx",
    "src/app/(public)/simulations/page.tsx",
    "src/app/(public)/simulations/[id]/page.tsx",
    "src/app/(public)/simulations/red-vs-blue/page.tsx",
    "src/app/(public)/labs/[id]/page.tsx",
    "src/components/cyber-range/CyberTerminal.tsx",
    "src/components/admin/SessionLock.tsx",
    "src/components/admin/IncidentDashboard.tsx",
    "src/components/admin/AssetRegistry.tsx",
    "src/app/(admin)/admin/users/page.tsx",
    "src/app/(admin)/admin/terms/page.tsx"
];

const replacements = [
    // Backgrounds
    { search: /bg-\[#0a0f16\]/g, replace: "bg-cyber-950" },
    { search: /bg-\[#070b10\]/g, replace: "bg-cyber-950" },
    { search: /bg-\[#111827\]/g, replace: "bg-cyber-950" },
    { search: /bg-black\/90/g, replace: "bg-cyber-900/80 backdrop-blur-xl" },
    { search: /bg-black\/80/g, replace: "bg-cyber-900/80 backdrop-blur-sm" },
    { search: /bg-black\/60/g, replace: "bg-cyber-800/80" },
    { search: /bg-black\/50/g, replace: "bg-cyber-800/50" },
    { search: /bg-black\/40/g, replace: "bg-cyber-800/40" },
    { search: /bg-black\/30/g, replace: "bg-cyber-900/50" },
    { search: /bg-black\/20/g, replace: "bg-cyber-900/30" },
    { search: /bg-black/g, replace: "bg-cyber-950" },
    
    // Grays
    { search: /bg-gray-900/g, replace: "bg-cyber-900" },
    { search: /bg-gray-800/g, replace: "bg-cyber-800" },
    { search: /border-gray-800/g, replace: "border-cyber-700" },
    { search: /border-gray-700/g, replace: "border-cyber-600" },
    { search: /border-cyber-100\/30/g, replace: "border-cyber-300/30" }, // For neon borders that were using white

    // Text Colors
    { search: /text-gray-500/g, replace: "text-cyber-500" },
    { search: /text-gray-400/g, replace: "text-cyber-400" },
    { search: /text-gray-300/g, replace: "text-cyber-300" },
    { search: /text-gray-200/g, replace: "text-cyber-200" },
];

for (const relPath of files) {
    const fullPath = path.join(process.cwd(), relPath);
    if (!fs.existsSync(fullPath)) {
        console.log(`File not found: ${fullPath}`);
        continue;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    replacements.forEach(r => {
        content = content.replace(r.search, r.replace);
    });

    // Special handling for text-white: we want to change it to text-cyber-100 (which is dark in this theme)
    // but avoid changing it if it's inside a standard colored button (like bg-red-600)
    // A simple hack: replace globally, then fix common button patterns
    content = content.replace(/text-white/g, "text-cyber-100");
    
    // Restore text-white in explicit color backgrounds or specific badges where white text is needed for contrast
    content = content.replace(/bg-red-(\d+)([^>]*)text-cyber-100/g, "bg-red-$1$2text-white");
    content = content.replace(/bg-green-(\d+)([^>]*)text-cyber-100/g, "bg-green-$1$2text-white");
    content = content.replace(/bg-blue-(\d+)([^>]*)text-cyber-100/g, "bg-blue-$1$2text-white");

    // Also replace SVGs that had fill="#fff" or stroke="#fff"
    content = content.replace(/fill="#fff"/g, 'fill="#1a1612"');
    
    fs.writeFileSync(fullPath, content);
    console.log(`Updated: ${relPath}`);
}
