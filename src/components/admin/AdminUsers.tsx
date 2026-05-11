'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Search, Plus, Edit3, Trash2, Download, UserCheck, UserX, ChevronLeft, ChevronRight, X, Eye } from 'lucide-react';

interface User {
    id: string; name: string; email: string; role: string; avatar: string;
    phone: string; country: string; bio: string; experience_level: string;
    account_type: string; points: number; email_verified: number; created_at: string;
}
type ModalMode = 'create' | 'edit' | 'view' | null;

const ROLE_MAP: Record<string, { label: string; color: string; bg: string }> = {
    admin: { label: 'مسؤول', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
    teacher: { label: 'مدرّب', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
    user: { label: 'طالب', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
    student: { label: 'طالب', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' },
    suspended: { label: 'معطّل', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
};

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [roleStats, setRoleStats] = useState<{role:string;count:number}[]>([]);
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [form, setForm] = useState({ name:'', email:'', password:'', role:'user', phone:'', country:'', bio:'' });
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{msg:string;type:'ok'|'err'}|null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string|null>(null);

    const showToast = (msg: string, type: 'ok'|'err' = 'ok') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '15', sortBy, sortDir });
            if (search) params.set('search', search);
            if (roleFilter) params.set('role', roleFilter);
            if (statusFilter) params.set('status', statusFilter);
            const res = await fetch(`/api/admin/users?${params}`);
            if (res.ok) {
                const d = await res.json();
                setUsers(d.users || []);
                setTotal(d.total || 0);
                setTotalPages(d.totalPages || 0);
                setRoleStats(d.roleStats || []);
            }
        } catch { showToast('فشل تحميل البيانات', 'err'); }
        finally { setLoading(false); }
    }, [page, search, roleFilter, statusFilter, sortBy, sortDir]);

    useEffect(() => { loadUsers(); }, [loadUsers]);
    useEffect(() => { setPage(1); }, [search, roleFilter, statusFilter]);

    const openCreate = () => { setForm({ name:'', email:'', password:'', role:'user', phone:'', country:'', bio:'' }); setModalMode('create'); };
    const openEdit = (u: User) => { setSelectedUser(u); setForm({ name:u.name, email:u.email, password:'', role:u.role, phone:u.phone||'', country:u.country||'', bio:u.bio||'' }); setModalMode('edit'); };
    const openView = (u: User) => { setSelectedUser(u); setModalMode('view'); };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (modalMode === 'create') {
                if (!form.name || !form.email || !form.password) { showToast('جميع الحقول مطلوبة','err'); setSaving(false); return; }
                const res = await fetch('/api/admin/users', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) });
                const d = await res.json();
                if (!res.ok) throw new Error(d.message);
                showToast('تم إنشاء المستخدم بنجاح');
            } else if (modalMode === 'edit' && selectedUser) {
                const res = await fetch('/api/admin/users', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: selectedUser.id, ...form }) });
                const d = await res.json();
                if (!res.ok) throw new Error(d.message);
                showToast('تم تحديث البيانات بنجاح');
            }
            setModalMode(null);
            loadUsers();
        } catch (e: any) { showToast(e.message || 'حدث خطأ','err'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
            const d = await res.json();
            if (!res.ok) throw new Error(d.message);
            showToast('تم حذف المستخدم');
            setDeleteConfirm(null);
            loadUsers();
        } catch (e: any) { showToast(e.message || 'فشل الحذف','err'); }
    };

    const handleSuspend = async (u: User) => {
        const newRole = u.role === 'suspended' ? 'user' : 'suspended';
        try {
            const res = await fetch('/api/admin/users', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: u.id, role: newRole }) });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
            showToast(newRole === 'suspended' ? 'تم تعطيل الحساب' : 'تم تفعيل الحساب');
            loadUsers();
        } catch (e: any) { showToast(e.message,'err'); }
    };

    const exportCSV = async () => {
        try {
            const res = await fetch('/api/admin/users/export');
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `users_${new Date().toISOString().split('T')[0]}.csv`; a.click();
            URL.revokeObjectURL(url);
            showToast('تم تصدير البيانات بنجاح');
        } catch { showToast('فشل التصدير','err'); }
    };

    const handleSort = (col: string) => {
        if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortBy(col); setSortDir('desc'); }
    };

    const totalUsers = roleStats.reduce((a,r) => a + r.count, 0);
    const getRoleStat = (r: string) => roleStats.find(s => s.role === r)?.count || 0;

    const RoleBadge = ({ role }: { role: string }) => {
        const r = ROLE_MAP[role] || ROLE_MAP.user;
        return <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${r.bg} ${r.color}`}>{r.label}</span>;
    };

    const Avatar = ({ user: u }: { user: User }) => (
        u.avatar ? <img src={u.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-cyber-700" />
        : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-sm font-bold text-white border border-cyber-700">{u.name?.charAt(0)?.toUpperCase() || 'U'}</div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-xl text-sm font-bold shadow-2xl border transition-all ${toast.type === 'ok' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">👥 إدارة المستخدمين</h2>
                    <p className="text-cyber-500 text-sm mt-1">إدارة الحسابات والصلاحيات والأدوار — {total} مستخدم</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-cyber-800/50 text-cyber-300 border border-cyber-700 hover:border-cyan-500/40 hover:text-white transition"><Download size={15} /> تصدير CSV</button>
                    <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500 hover:text-black transition"><Plus size={15} /> إضافة مستخدم</button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: 'إجمالي', value: totalUsers, icon: '👥', border: 'border-white/10' },
                    { label: 'مسؤولين', value: getRoleStat('admin'), icon: '🛡️', border: 'border-red-500/20' },
                    { label: 'مدربين', value: getRoleStat('teacher'), icon: '🧑‍🏫', border: 'border-cyan-500/20' },
                    { label: 'طلاب', value: getRoleStat('user') + getRoleStat('student'), icon: '🎓', border: 'border-green-500/20' },
                    { label: 'معطّلين', value: getRoleStat('suspended'), icon: '🚫', border: 'border-orange-500/20' },
                ].map((s,i) => (
                    <div key={i} className={`bg-cyber-900/40 rounded-xl p-4 border ${s.border} text-center`}>
                        <div className="text-xl mb-1">{s.icon}</div>
                        <div className="text-2xl font-black text-white">{s.value}</div>
                        <div className="text-[11px] text-cyber-500 font-bold">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 flex bg-cyber-900/50 border border-cyber-800 rounded-xl p-2.5">
                    <Search size={16} className="text-cyber-500 ml-2 mt-0.5" />
                    <input className="bg-transparent text-sm w-full outline-none text-white" placeholder="ابحث بالاسم أو البريد..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="bg-cyber-900/50 border border-cyber-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none">
                    <option value="">كل الأدوار</option>
                    <option value="admin">مسؤول</option>
                    <option value="teacher">مدرّب</option>
                    <option value="user">طالب</option>
                    <option value="suspended">معطّل</option>
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-cyber-900/50 border border-cyber-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none">
                    <option value="">كل الحالات</option>
                    <option value="active">نشط</option>
                    <option value="suspended">معطّل</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-cyber-900/30 border border-cyber-800/60 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-cyber-800/60 text-cyber-400 text-[11px] uppercase tracking-wider">
                                <th className="p-4 text-right">المستخدم</th>
                                <th className="p-4 text-right cursor-pointer hover:text-white transition" onClick={() => handleSort('email')}>البريد {sortBy==='email' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                                <th className="p-4 text-right cursor-pointer hover:text-white transition" onClick={() => handleSort('role')}>الدور {sortBy==='role' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                                <th className="p-4 text-right cursor-pointer hover:text-white transition" onClick={() => handleSort('points')}>النقاط {sortBy==='points' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                                <th className="p-4 text-right cursor-pointer hover:text-white transition" onClick={() => handleSort('created_at')}>التسجيل {sortBy==='created_at' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                                <th className="p-4 text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="p-12 text-center text-cyan-500 animate-pulse font-bold">جاري التحميل...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={6} className="p-12 text-center text-cyber-600">لا يوجد مستخدمين</td></tr>
                            ) : users.map(u => (
                                <tr key={u.id} className={`border-b border-cyber-800/30 hover:bg-cyber-800/20 transition ${u.role==='suspended' ? 'opacity-60' : ''}`}>
                                    <td className="p-4"><div className="flex items-center gap-3"><Avatar user={u} /><span className="font-bold text-white">{u.name}</span></div></td>
                                    <td className="p-4 text-cyber-400 font-mono text-xs">{u.email}</td>
                                    <td className="p-4"><RoleBadge role={u.role} /></td>
                                    <td className="p-4 text-cyan-400 font-bold">{u.points || 0}</td>
                                    <td className="p-4 text-cyber-500 font-mono text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB') : '—'}</td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => openView(u)} className="p-2 rounded-lg hover:bg-cyan-500/10 text-cyber-400 hover:text-cyan-400 transition" title="عرض"><Eye size={15} /></button>
                                            <button onClick={() => openEdit(u)} className="p-2 rounded-lg hover:bg-blue-500/10 text-cyber-400 hover:text-blue-400 transition" title="تعديل"><Edit3 size={15} /></button>
                                            <button onClick={() => handleSuspend(u)} className={`p-2 rounded-lg transition ${u.role==='suspended' ? 'hover:bg-green-500/10 text-cyber-400 hover:text-green-400' : 'hover:bg-orange-500/10 text-cyber-400 hover:text-orange-400'}`} title={u.role==='suspended'?'تفعيل':'تعطيل'}>
                                                {u.role==='suspended' ? <UserCheck size={15} /> : <UserX size={15} />}
                                            </button>
                                            <button onClick={() => setDeleteConfirm(u.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-cyber-400 hover:text-red-500 transition" title="حذف"><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-cyber-800/40">
                        <span className="text-xs text-cyber-500">صفحة {page} من {totalPages} — {total} نتيجة</span>
                        <div className="flex gap-2">
                            <button disabled={page<=1} onClick={() => setPage(p=>p-1)} className="p-2 rounded-lg bg-cyber-800/50 text-cyber-400 hover:text-white disabled:opacity-30 transition"><ChevronRight size={16} /></button>
                            <button disabled={page>=totalPages} onClick={() => setPage(p=>p+1)} className="p-2 rounded-lg bg-cyber-800/50 text-cyber-400 hover:text-white disabled:opacity-30 transition"><ChevronLeft size={16} /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setDeleteConfirm(null)} />
                    <div className="relative bg-[#0e1117] border border-red-500/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h3 className="text-lg font-bold text-white mb-2">تأكيد الحذف</h3>
                        <p className="text-cyber-400 text-sm mb-6">هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl bg-cyber-800/50 text-cyber-300 font-bold text-sm border border-cyber-700 hover:border-cyber-500 transition">إلغاء</button>
                            <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 font-bold text-sm border border-red-500/30 hover:bg-red-500 hover:text-white transition">حذف نهائي</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit/View Modal */}
            {modalMode && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60" onClick={() => !saving && setModalMode(null)} />
                    <div className="relative bg-[#0e1117] border border-cyber-700 rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">{modalMode==='create' ? '➕ إضافة مستخدم' : modalMode==='edit' ? '✏️ تعديل المستخدم' : '👤 تفاصيل المستخدم'}</h3>
                            <button onClick={() => !saving && setModalMode(null)} className="text-cyber-500 hover:text-red-400 transition"><X size={20} /></button>
                        </div>

                        {modalMode === 'view' && selectedUser ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 mb-6">
                                    <Avatar user={selectedUser} />
                                    <div><div className="font-bold text-white text-lg">{selectedUser.name}</div><div className="text-cyber-500 text-sm">{selectedUser.email}</div></div>
                                    <div className="mr-auto"><RoleBadge role={selectedUser.role} /></div>
                                </div>
                                {[
                                    ['الهاتف', selectedUser.phone || '—'],
                                    ['الدولة', selectedUser.country || '—'],
                                    ['المستوى', selectedUser.experience_level || '—'],
                                    ['النقاط', String(selectedUser.points || 0)],
                                    ['التسجيل', selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString('ar-EG') : '—'],
                                    ['النبذة', selectedUser.bio || '—'],
                                ].map(([k,v], i) => (
                                    <div key={i} className="flex justify-between py-2 border-b border-cyber-800/30">
                                        <span className="text-cyber-500 text-sm font-bold">{k}</span>
                                        <span className="text-white text-sm">{v}</span>
                                    </div>
                                ))}
                                <button onClick={() => { openEdit(selectedUser); }} className="w-full mt-4 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold text-sm border border-cyan-500/30 hover:bg-cyan-500 hover:text-black transition">✏️ تعديل البيانات</button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div><label className="text-xs text-cyber-400 font-bold mb-1 block">الاسم *</label><input value={form.name} onChange={e => setForm(f=>({...f, name:e.target.value}))} className="w-full bg-cyber-900/50 border border-cyber-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50 transition" /></div>
                                <div><label className="text-xs text-cyber-400 font-bold mb-1 block">البريد الإلكتروني *</label><input type="email" value={form.email} onChange={e => setForm(f=>({...f, email:e.target.value}))} className="w-full bg-cyber-900/50 border border-cyber-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50 transition" /></div>
                                {modalMode === 'create' && <div><label className="text-xs text-cyber-400 font-bold mb-1 block">كلمة المرور *</label><input type="password" value={form.password} onChange={e => setForm(f=>({...f, password:e.target.value}))} className="w-full bg-cyber-900/50 border border-cyber-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50 transition" /></div>}
                                <div><label className="text-xs text-cyber-400 font-bold mb-1 block">الدور</label><select value={form.role} onChange={e => setForm(f=>({...f, role:e.target.value}))} className="w-full bg-cyber-900/50 border border-cyber-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none"><option value="user">طالب</option><option value="teacher">مدرّب</option><option value="admin">مسؤول</option></select></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="text-xs text-cyber-400 font-bold mb-1 block">الهاتف</label><input value={form.phone} onChange={e => setForm(f=>({...f, phone:e.target.value}))} className="w-full bg-cyber-900/50 border border-cyber-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50 transition" /></div>
                                    <div><label className="text-xs text-cyber-400 font-bold mb-1 block">الدولة</label><input value={form.country} onChange={e => setForm(f=>({...f, country:e.target.value}))} className="w-full bg-cyber-900/50 border border-cyber-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50 transition" /></div>
                                </div>
                                <div><label className="text-xs text-cyber-400 font-bold mb-1 block">نبذة</label><textarea value={form.bio} onChange={e => setForm(f=>({...f, bio:e.target.value}))} rows={3} className="w-full bg-cyber-900/50 border border-cyber-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50 transition resize-none" /></div>
                                <div className="flex gap-3 mt-4">
                                    <button onClick={() => setModalMode(null)} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-cyber-800/50 text-cyber-300 font-bold text-sm border border-cyber-700 transition">إلغاء</button>
                                    <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold text-sm border border-cyan-500/30 hover:bg-cyan-500 hover:text-black transition disabled:opacity-50 flex items-center justify-center gap-2">
                                        {saving ? <><span className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /> جاري الحفظ...</> : modalMode==='create' ? 'إنشاء' : 'حفظ التعديلات'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
