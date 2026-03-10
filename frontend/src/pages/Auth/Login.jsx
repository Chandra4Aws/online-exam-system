import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter',system-ui,sans-serif", background: '#f8fafc' }}>


            {/* ── Right: login form ──────────────────────────────────── */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#f8fafc', minWidth: 0 }}>
                <div style={{ width: '100%', maxWidth: '400px', animation: 'slideUp 0.3s ease-out both' }}>

                    {/* Mobile brand mark */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem' }} className="mobile-brand">
                        <div style={{ width: '2rem', height: '2rem', borderRadius: '0.625rem', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '1rem' }}>🎓</span>
                        </div>
                        <span style={{ fontWeight: '700', color: '#0f172a' }}>ExamPlatform</span>
                    </div>

                    {/* Heading */}
                    <h1 style={{ margin: '0 0 0.375rem', fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                        Welcome Online Exam
                    </h1>
                    <p style={{ margin: '0 0 2rem', fontSize: '0.9rem', color: '#64748b' }}>
                        Sign in to your account to continue
                    </p>

                    {/* Error */}
                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                            padding: '0.875rem 1rem', borderRadius: '0.75rem',
                            background: '#fff1f2', border: '1px solid #fecdd3',
                            color: '#be123c', fontSize: '0.875rem', marginBottom: '1.25rem',
                        }}>
                            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form card */}
                    <div style={{
                        background: '#fff', borderRadius: '1.25rem',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 24px -4px rgb(0 0 0/0.08), 0 1px 2px rgb(0 0 0/0.04)',
                        padding: '2rem',
                    }}>
                        <form onSubmit={handleSubmit}>
                            {/* Username */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
                                    USERNAME
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="form-input"
                                    placeholder="Enter your username"
                                    autoComplete="username"
                                    style={{ fontSize: '0.9rem' }}
                                />
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: '1.75rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
                                    PASSWORD
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPwd ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="form-input"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        style={{ fontSize: '0.9rem', paddingRight: '3rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd(!showPwd)}
                                        style={{
                                            position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex',
                                        }}
                                    >
                                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    width: '100%', padding: '0.8rem',
                                    background: loading ? '#818cf8' : 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)',
                                    color: '#fff', fontWeight: '700', fontSize: '0.9rem',
                                    border: 'none', borderRadius: '0.875rem', cursor: loading ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 14px -2px rgb(79 70 229/0.45)',
                                    transition: 'all 0.15s',
                                    letterSpacing: '0.01em',
                                }}
                            >
                                {loading ? (
                                    <>
                                        <span style={{ width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                                        Signing in…
                                    </>
                                ) : 'Sign In →'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
                            <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '500' }}>Don't have an account?</span>
                            <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                        </div>

                        <Link
                            to="/register"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '100%', padding: '0.75rem',
                                background: '#f8fafc', border: '1.5px solid #e2e8f0',
                                borderRadius: '0.875rem', color: '#4f46e5', fontWeight: '600',
                                fontSize: '0.875rem', textDecoration: 'none',
                                transition: 'border-color 0.15s, background 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                        >
                            Create a free account
                        </Link>
                    </div>

                    {/* Footer */}
                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                        By signing in you agree to our{' '}
                        <span style={{ color: '#6366f1', cursor: 'pointer', textDecoration: 'underline' }}>Terms</span>
                        {' '}and{' '}
                        <span style={{ color: '#6366f1', cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</span>.
                    </p>
                </div>
            </div>

            {/* Responsive: show left panel on large screens */}
            <style>{`
                @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
                @keyframes spin    { to { transform:rotate(360deg); } }
                @media (min-width: 1024px) {
                    .lg-panel { display: flex !important; }
                    .mobile-brand { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default Login;
