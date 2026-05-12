import React from 'react';
import Link from 'next/link';
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { prisma as db } from '@/lib/db';
import { Terminal, Shield, Cpu, Lock, ChevronRight, Play, CheckCircle2 } from 'lucide-react';

export default async function LabDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const lab = await db.lab.findUnique({
        where: { id },
        include: {
            challenges: {
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!lab) return notFound();

    const skills = JSON.parse(lab.skills || '[]');

    return (
        <div className="min-h-screen bg-[#06080a] py-20 px-4">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-cyber-500 mb-8">
                    <Link href="/labs" className="hover:text-white transition-colors">المختبرات</Link>
                    <ChevronRight size={16} />
                    <span className="text-white">{lab.title}</span>
                </div>

                {/* Hero Section */}
                <div className="bg-[#0b0e14]/80 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-cyber-800/50 shadow-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px]"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                        <div className="space-y-4 max-w-2xl">
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${
                                    lab.difficulty === 'easy' ? 'text-green-400 border-green-400/20 bg-green-400/10' :
                                    lab.difficulty === 'medium' ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10' :
                                    'text-red-400 border-red-400/20 bg-red-400/10'
                                }`}>
                                    {lab.difficulty}
                                </span>
                                <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded">
                                    {lab.category}
                                </span>
                            </div>
                            
                            <h1 className="text-4xl md:text-5xl font-black text-white">{lab.title}</h1>
                            <p className="text-cyber-400 text-lg">{lab.description}</p>
                            
                            <div className="flex flex-wrap gap-2 pt-4">
                                {skills.map((skill: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-cyber-900 rounded-lg text-sm text-cyber-300 border border-cyber-800">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="shrink-0">
                            <Link href={`/labs/${lab.id}/play`} className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-accent rounded-xl hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent overflow-hidden">
                                <div className="absolute inset-0 w-full h-full -ml-10 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                <span className="flex items-center gap-2">
                                    <Play size={20} fill="currentColor" />
                                    دخول بيئة الاختراق
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Scenario & Objectives */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-[#0b0e14]/80 backdrop-blur-md p-8 rounded-3xl border border-cyber-800/50">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                <Terminal className="text-accent" />
                                سيناريو الاختراق (Scenario)
                            </h2>
                            <div className="prose prose-invert prose-cyber max-w-none">
                                <p className="text-cyber-300 leading-relaxed whitespace-pre-wrap">{lab.scenario}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-[#0b0e14]/80 backdrop-blur-md p-8 rounded-3xl border border-cyber-800/50 sticky top-24">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <Shield className="text-accent" />
                                الأهداف (Objectives)
                            </h3>
                            <ul className="space-y-4">
                                {lab.challenges.map((challenge, i) => (
                                    <li key={challenge.id} className="flex gap-4 p-4 rounded-xl bg-cyber-900/50 border border-cyber-800/50">
                                        <div className="mt-1">
                                            <div className="w-6 h-6 rounded-full bg-cyber-800 flex items-center justify-center text-xs text-cyber-500 font-bold border border-cyber-700">
                                                {i + 1}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm mb-1">{challenge.title}</h4>
                                            <p className="text-xs text-cyber-400">{challenge.description}</p>
                                            <div className="mt-2 text-xs font-mono text-accent">
                                                +{challenge.points} Points
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
