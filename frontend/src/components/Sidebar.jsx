import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, ClipboardList, BarChart3, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SIDEBAR_BG = '#0f172a';
const SIDEBAR_HOVER = '#1e293b';
const SIDEBAR_ACTIVE = '#4f46e5';
const SIDEBAR_BORDER = 'rgba(255,255,255,0.07)';
const SIDEBAR_TEXT = '#94a3b8';
const SIDEBAR_HEAD = '#e2e8f0';

const Sidebar = () => {
    const { user } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        { title: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} />, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
        { title: 'Question Bank', path: '/questions', icon: <BookOpen size={18} />, roles: ['ADMIN', 'TEACHER'] },
        { title: 'Exams', path: '/exams', icon: <ClipboardList size={18} />, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
        { title: 'Results', path: '/results', icon: <BarChart3 size={18} />, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
    ];

    const visible = user?.role
        ? menuItems.filter(i => i.roles.includes(user.role))
        : menuItems;

    const w = collapsed ? '68px' : '240px';

    return (
        <aside style={{
            width: w, minWidth: w, background: SIDEBAR_BG,
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            borderRight: `1px solid ${SIDEBAR_BORDER}`,
            transition: 'width .2s ease, min-width .2s ease',
            flexShrink: 0, position: 'relative', overflow: 'hidden',
            userSelect: 'none',
        }}>
            {/* ── Brand ─────────────────────────────────────── */}
            <div style={{ padding: collapsed ? '1.5rem 0' : '1.375rem 1.25rem', borderBottom: `1px solid ${SIDEBAR_BORDER}`, display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden', justifyContent: collapsed ? 'center' : 'flex-start' }}>
                <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg,#6366f1,#4338ca)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(99,102,241,.4)' }}>
                    <GraduationCap size={16} color="#fff" />
                </div>
                {!collapsed && (
                    <div>
                        <p style={{ margin: 0, color: SIDEBAR_HEAD, fontWeight: '700', fontSize: '0.875rem', lineHeight: 1.2 }}>ExamPlatform</p>
                        <p style={{ margin: 0, color: SIDEBAR_TEXT, fontSize: '0.7rem' }}>Online Assessments</p>
                    </div>
                )}
            </div>

            {/* ── Nav ───────────────────────────────────────── */}
            <nav style={{ flex: 1, padding: '1rem 0.625rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {!collapsed && (
                    <p style={{ color: 'rgba(148,163,184,.5)', fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 0.625rem', margin: '0 0 0.5rem' }}>Main Menu</p>
                )}
                {visible.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        title={collapsed ? item.title : undefined}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: collapsed ? '0.7rem' : '0.65rem 0.75rem',
                            borderRadius: '0.75rem',
                            textDecoration: 'none',
                            color: isActive ? '#fff' : SIDEBAR_TEXT,
                            background: isActive ? SIDEBAR_ACTIVE : 'transparent',
                            fontWeight: isActive ? '600' : '500',
                            fontSize: '0.875rem',
                            transition: 'all .15s',
                            boxShadow: isActive ? '0 4px 12px rgba(79,70,229,.35)' : 'none',
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                        })}
                        onMouseEnter={e => { if (!e.currentTarget.className.includes('active')) e.currentTarget.style.background = SIDEBAR_HOVER; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => {
                            const isActive = window.location.pathname === item.path || (item.path !== '/' && window.location.pathname.startsWith(item.path));
                            e.currentTarget.style.background = isActive ? SIDEBAR_ACTIVE : 'transparent';
                            e.currentTarget.style.color = isActive ? '#fff' : SIDEBAR_TEXT;
                        }}
                    >
                        <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
                        {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* ── Collapse toggle ────────────────────────────── */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                style={{
                    margin: '0 0.625rem 0.625rem', padding: '0.6rem', background: SIDEBAR_HOVER,
                    border: `1px solid ${SIDEBAR_BORDER}`, borderRadius: '0.75rem', cursor: 'pointer',
                    color: SIDEBAR_TEXT, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background .15s', gap: '0.5rem',
                }}
            >
                {collapsed ? <ChevronRight size={15} /> : <><ChevronLeft size={15} /><span style={{ fontSize: '0.75rem', fontWeight: '500' }}>Collapse</span></>}
            </button>

            {/* ── Footer ────────────────────────────────────── */}
            {!collapsed && (
                <div style={{ padding: '0.875rem 1.25rem', borderTop: `1px solid ${SIDEBAR_BORDER}` }}>
                    <p style={{ margin: 0, color: 'rgba(148,163,184,.4)', fontSize: '0.7rem' }}>© 2025 ExamPlatform</p>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
