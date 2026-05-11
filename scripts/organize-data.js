/**
 * This script analyzes and reports inconsistencies between:
 *   - learningPaths in page.tsx
 *   - pathsDetailData in paths-detail-data.ts
 *   - modules in modules-data.ts
 * We use it for reference to manually fix the data.
 */

// Define the correct difficulty for each path (from pathsDetailData)
const pathDifficulties = {
    "pre-security": { detail: "سهل", page: "سهل", correct: "سهل" },
    "cyber-fundamentals": { detail: "سهل", page: "سهل", correct: "سهل" },
    "jr-penetration-tester": { detail: "متوسط", page: "متوسط", correct: "متوسط" },
    "soc-level-1": { detail: "سهل", page: "سهل", correct: "سهل" },
    "soc-level-2": { detail: "متوسط", page: "متوسط", correct: "متوسط" },
    "security-engineer": { detail: "سهل", page: "متوسط", correct: "سهل" }, // MISMATCH - detail says سهل, page says متوسط
    "devsecops": { detail: "متوسط", page: "متوسط", correct: "متوسط" },
    "red-team": { detail: "صعب", page: "صعب", correct: "صعب" },
    "comptia-pentest": { detail: "سهل", page: "متوسط", correct: "سهل" }, // MISMATCH
    "web-fundamentals": { detail: "سهل", page: "سهل", correct: "سهل" },
    "offensive-pentesting": { detail: "متوسط", page: "صعب", correct: "متوسط" }, // MISMATCH - detail says متوسط, page says صعب
    "aws-security": { detail: "متوسط", page: "متوسط", correct: "متوسط" },
    "web-application-pentesting": { detail: "متوسط", page: "متوسط", correct: "متوسط" },
    "defending-azure": { detail: "متوسط", page: "متوسط", correct: "متوسط" },
    "advanced-endpoint-investigations": { detail: "صعب", page: "صعب", correct: "صعب" },
    "intro-to-cyber-security": { detail: "سهل", page: "سهل", correct: "سهل" },
    "pre-security-legacy": { detail: "سهل", page: "سهل", correct: "سهل" },
};

// Check mismatches
console.log("=== MISMATCHES between page.tsx and paths-detail-data.ts ===");
for (const [id, diff] of Object.entries(pathDifficulties)) {
    if (diff.detail !== diff.page) {
        console.log(`  ${id}: detail="${diff.detail}" vs page="${diff.page}" => using detail as source of truth`);
    }
}

console.log("\n=== DESIRED ORDER: Easy → Intermediate → Advanced ===");
const order = { "سهل": 1, "متوسط": 2, "صعب": 3 };
const sorted = Object.entries(pathDifficulties)
    .sort((a, b) => order[a[1].correct] - order[b[1].correct]);

for (const [id, diff] of sorted) {
    console.log(`  [${diff.correct}] ${id}`);
}
