import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';

/* ─── tiny helpers ─────────────────────────────────────────── */
const s = {
    /* layout */
    page: { display: 'flex', flexDirection: 'column', gap: '1.75rem', animation: 'slideUp .28s ease-out both' },
    row: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' },
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' },

    /* card shell */
    card: {
        background: '#fff', borderRadius: '1.125rem',
        border: '1px solid #e8edf3',
        boxShadow: '0 1px 4px rgb(0 0 0/.06), 0 0 0 0.5px rgb(0 0 0/.04)',
        overflow: 'hidden',
    },

    /* typography */
    h1: { margin: 0, fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.15 },
    h2: { margin: '0 0 .125rem', fontSize: '1rem', fontWeight: '700', color: '#0f172a' },
    label: { margin: 0, fontSize: '0.8rem', fontWeight: '500', color: '#64748b' },
    muted: { margin: 0, fontSize: '0.8rem', color: '#94a3b8' },
    value: { margin: '.25rem 0 0', fontSize: '2rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.04em' },
};

/* ─── Stat Card ─────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, bg, iconColor, badge, badgeColor }) => (
    <div style={{ ...s.card, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.125rem', transition: 'box-shadow .2s', cursor: 'default' }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px -4px rgb(0 0 0/.12), 0 2px 8px -2px rgb(0 0 0/.06)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgb(0 0 0/.06), 0 0 0 .5px rgb(0 0 0/.04)'}
    >
        {/* icon bubble */}
        <div style={{ width: '3rem', height: '3rem', borderRadius: '0.875rem', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: '1.375rem' }}>{icon}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <p style={s.label}>{label}</p>
            <p style={s.value}>{value}</p>
        </div>
        {badge && (
            <span style={{ padding: '.2rem .55rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: '700', background: badgeColor + '22', color: badgeColor }}>
                {badge}
            </span>
        )}
    </div>
);

/* ─── Quick Action Link ─────────────────────────────────────── */
const ActionCard = ({ icon, title, desc, to, accent }) => (
    <Link to={to} style={{ textDecoration: 'none' }}>
        <div
            style={{ ...s.card, padding: '1.125rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'box-shadow .15s, transform .15s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px -4px rgb(0 0 0/.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgb(0 0 0/.06), 0 0 0 .5px rgb(0 0 0/.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '1.1rem' }}>{icon}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>{title}</p>
                <p style={{ margin: '.1rem 0 0', fontSize: '0.775rem', color: '#94a3b8' }}>{desc}</p>
            </div>
            <span style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1 }}>›</span>
        </div>
    </Link>
);

/* ─── Activity row ──────────────────────────────────────────── */
const ActivityItem = ({ icon, text, time, dot }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: dot + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.875rem' }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '500', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</p>
        </div>
        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', flexShrink: 0 }}>{time}</p>
    </div>
);

/* ─── Main Dashboard ────────────────────────────────────────── */
const Dashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState({ totalExams: 0, totalResults: 0, totalQuestions: 0, recentActivities: [] });
    const [loading, setLoading] = useState(true);

    const isStudent = user?.role === 'STUDENT';
    const isAdminOrTeacher = user?.role === 'ADMIN' || user?.role === 'TEACHER';

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const r = await api.get('/dashboard/stats');
                setData(r.data);
            } catch (e) {
                console.error('Failed to fetch dashboard stats:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const stats = isStudent ? [
        { icon: '📋', label: 'Available Exams', value: data.totalExams, bg: '#eff6ff', badge: null, badgeColor: '#3b82f6' },
        { icon: '📊', label: 'My Results', value: data.totalResults, bg: '#f0fdf4', badge: null, badgeColor: '#22c55e' },
    ] : [
        { icon: '📋', label: 'Total Exams', value: data.totalExams, bg: '#eff6ff', badge: null, badgeColor: '#3b82f6' },
        { icon: '📊', label: 'Total Results', value: data.totalResults, bg: '#f0fdf4', badge: null, badgeColor: '#22c55e' },
        { icon: '📚', label: 'Questions Bank', value: data.totalQuestions, bg: '#faf5ff', badge: null, badgeColor: '#a855f7' },
    ];

    const actions = isStudent ? [
        { icon: '📝', title: 'Available Exams', desc: 'Browse and take assessments', to: '/exams', accent: '#4f46e5' },
        { icon: '📊', title: 'My Results', desc: 'Check your scores', to: '/results', accent: '#10b981' },
    ] : [
        { icon: '✏️', title: 'Create Exam', desc: 'Build a new assessment', to: '/exams/new', accent: '#4f46e5' },
        { icon: '➕', title: 'Add Question', desc: 'Grow your question bank', to: '/questions/new', accent: '#0ea5e9' },
        { icon: '📈', title: 'View Results', desc: 'Analyse candidate scores', to: '/results', accent: '#10b981' },
        { icon: '📋', title: 'Manage Exams', desc: 'Edit or publish exams', to: '/exams', accent: '#f59e0b' },
    ];

    const activity = data.recentActivities.map(a => ({
        icon: a.type === 'EXAM_SUBMITTED' ? '📝' : '🎓',
        text: a.text,
        time: a.time,
        dot: a.color
    }));

    return (
        <div style={s.page}>

            {/* ── Hero greeting banner ───────────────────────────────── */}
            <div style={{
                borderRadius: '1.25rem', overflow: 'hidden',
                background: 'linear-gradient(130deg, #1e1b4b 0%, #3730a3 50%, #4f46e5 100%)',
                padding: '2rem 2.25rem', position: 'relative',
                boxShadow: '0 8px 32px -4px rgb(79 70 229/.35)',
            }}>
                {/* decorative blobs */}
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(165,180,252,.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-30px', left: '30%', width: '160px', height: '160px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,.2) 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                        <p style={{ margin: '0 0 .25rem', fontSize: '0.85rem', fontWeight: '500', color: 'rgba(199,210,254,.8)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {greeting}
                        </p>
                        <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: '800', color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                            {user?.username || 'User'} 👋
                        </h1>
                        <p style={{ margin: '.5rem 0 0', fontSize: '0.9rem', color: 'rgba(199,210,254,.75)', maxWidth: '380px', lineHeight: 1.6 }}>
                            {isStudent ? "Welcome to your learner's portal. Browse available exams and track your progress." : "Here's your platform overview. Create exams, manage questions, and track results all in one place."}
                        </p>
                    </div>
                    {!isStudent && (
                        <Link to="/exams/new" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                            padding: '.75rem 1.5rem', borderRadius: '0.875rem',
                            background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,.25)',
                            color: '#fff', fontWeight: '700', fontSize: '0.875rem', textDecoration: 'none',
                            transition: 'background .15s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.22)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.15)'}
                        >
                            ✏️ &nbsp;Create Exam
                        </Link>
                    )}
                </div>
            </div>

            {/* ── Stat cards ─────────────────────────────────────────── */}
            <div style={s.grid3}>
                {stats.map(st => <StatCard key={st.label} {...st} />)}
            </div>

            {/* ── Bottom two-column section ───────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>

                {/* Quick actions */}
                <div style={s.card}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                        <h2 style={s.h2}>Quick Actions</h2>
                        <p style={s.muted}>Shortcuts to common tasks</p>
                    </div>
                    <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {actions.map(a => <ActionCard key={a.title} {...a} />)}
                    </div>
                </div>

                {/* Recent activity */}
                <div style={s.card}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                        <h2 style={s.h2}>Recent Activity</h2>
                        <p style={s.muted}>Latest events on the platform</p>
                    </div>
                    <div style={{ padding: '0 1.5rem' }}>
                        {activity.map((a, i) => <ActivityItem key={i} {...a} />)}
                    </div>
                    <div style={{ padding: '1rem 1.5rem' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                            Activity will appear here as you use the platform.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Getting started tip strip ────────────────────────────── */}
            <div style={{
                borderRadius: '1rem', padding: '1.25rem 1.5rem',
                background: 'linear-gradient(to right, #f0fdf4, #ecfdf5)',
                border: '1px solid #bbf7d0',
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem',
            }}>
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '1.125rem' }}>💡</span>
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <p style={{ margin: 0, fontWeight: '600', color: '#14532d', fontSize: '0.875rem' }}>Getting started</p>
                    <p style={{ margin: '.15rem 0 0', fontSize: '0.8rem', color: '#166534' }}>
                        Start by adding questions to your bank, then create an exam and publish it for candidates.
                    </p>
                </div>
                <Link to="/questions/new" style={{
                    padding: '.6rem 1.25rem', borderRadius: '0.75rem',
                    background: '#22c55e', color: '#fff', fontWeight: '700', fontSize: '0.8rem',
                    textDecoration: 'none', flexShrink: 0, transition: 'background .15s',
                }}
                    onMouseEnter={e => e.currentTarget.style.background = '#16a34a'}
                    onMouseLeave={e => e.currentTarget.style.background = '#22c55e'}
                >
                    Add Questions →
                </Link>
            </div>

            <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
        </div>
    );
};

export default Dashboard;
