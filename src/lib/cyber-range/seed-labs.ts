/**
 * 🌱 Seed Labs — Seeds pre-built scenarios into the database
 * Called once during database initialization.
 */
import db from '@/lib/db';
import { ALL_SCENARIOS } from './scenario-data';

export function seedLabs(): void {
    const existingLabs = (db.prepare('SELECT COUNT(*) as count FROM labs').get() as any)?.count || 0;

    // Only seed if labs table is empty
    if (existingLabs > 0) return;

    const insertLab = db.prepare(`
        INSERT OR IGNORE INTO labs (id, title_ar, title_en, description_ar, description_en, difficulty, category, xp, duration, tools, is_online, environment_config)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

    const insertScenario = db.prepare(`
        INSERT OR IGNORE INTO lab_scenarios (id, lab_id, step_order, title_ar, title_en, task_description, validation_regex, hint, solution)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, '')
    `);

    const seedTransaction = db.transaction(() => {
        for (const scenario of ALL_SCENARIOS) {
            insertLab.run(
                scenario.id,
                scenario.title_ar,
                scenario.title_en,
                scenario.description_ar,
                scenario.description_en,
                scenario.difficulty,
                scenario.category,
                scenario.xp,
                scenario.duration,
                JSON.stringify(scenario.tools),
                scenario.id // Use scenario ID as config reference
            );

            for (const obj of scenario.objectives) {
                insertScenario.run(
                    obj.id,
                    scenario.id,
                    obj.step_order,
                    obj.title_ar,
                    obj.title_en,
                    obj.task_description,
                    obj.validation_regex,
                    obj.hint
                );
            }
        }
    });

    try {
        seedTransaction();
        console.log(`✅ Seeded ${ALL_SCENARIOS.length} lab scenarios into database.`);
    } catch (error) {
        console.error('Lab seeding error:', error);
    }
}
