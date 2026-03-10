import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Bell, ChevronDown } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const initials = user?.username?.slice(0, 2).toUpperCase() || 'U';
    const role = user?.role || 'User';

    return (
        <header style={{
            height: '60px', background: '#fff',
            borderBottom: '1px solid #e8edf3',
            padding: '0 1.75rem', display: 'flex', alignItems: 'center',
            justifyContent: 'flex-end', position: 'sticky', top: 0, zIndex: 30,
            boxShadow: '0 1px 3px rgba(0,0,0,.04)',
            gap: '0.75rem', userSelect: 'none',
        }}>

            {/* Notification bell */}
            <button style={{
                width: '36px', height: '36px', borderRadius: '10px', border: 'none',
                background: 'transparent', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', position: 'relative',
                color: '#94a3b8', transition: 'background .15s',
            }}
                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
                <Bell size={17} />
                {/* red dot */}
                <span style={{
                    position: 'absolute', top: '8px', right: '8px',
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: '#6366f1', border: '2px solid #fff',
                }} />
            </button>

            {/* Divider */}
            <div style={{ width: '1px', height: '24px', background: '#e8edf3' }} />

            {/* User pod */}
            {user && (
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.625rem',
                            padding: '0.375rem 0.625rem', borderRadius: '10px',
                            border: '1px solid #e8edf3', background: '#fff',
                            cursor: 'pointer', transition: 'background .15s, border-color .15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#d1d5db'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e8edf3'; }}
                    >
                        {/* Avatar */}
                        <div style={{
                            width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                            background: 'linear-gradient(135deg,#6366f1 0%,#4338ca 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: '700', fontSize: '0.7rem',
                            boxShadow: '0 2px 6px rgba(99,102,241,.35)',
                        }}>
                            {initials}
                        </div>
                        {/* Name+role */}
                        <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '600', color: '#1e293b' }}>{user.username}</p>
                            <p style={{ margin: 0, fontSize: '0.68rem', color: '#94a3b8', fontWeight: '500' }}>{role}</p>
                        </div>
                        <ChevronDown size={13} color="#94a3b8" style={{ flexShrink: 0, transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
                    </button>

                    {/* Dropdown menu */}
                    {menuOpen && (
                        <div style={{
                            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                            minWidth: '180px', background: '#fff', borderRadius: '12px',
                            border: '1px solid #e8edf3', boxShadow: '0 8px 24px -4px rgba(0,0,0,.12)',
                            overflow: 'hidden', zIndex: 50, animation: 'slideDown .15s ease-out both',
                        }}>
                            <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '700', color: '#1e293b' }}>{user.username}</p>
                                <p style={{ margin: '.1rem 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>{role}</p>
                            </div>
                            <div style={{ padding: '0.375rem' }}>
                                <button
                                    onClick={() => { setMenuOpen(false); logout(); }}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.6rem 0.75rem', borderRadius: '8px', border: 'none',
                                        background: 'transparent', color: '#ef4444', fontWeight: '600',
                                        fontSize: '0.8rem', cursor: 'pointer', transition: 'background .15s',
                                        textAlign: 'left',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fff1f2'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <LogOut size={14} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style>{`@keyframes slideDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </header>
    );
};

export default Navbar;
