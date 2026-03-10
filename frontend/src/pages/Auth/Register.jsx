import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, User, Mail, Lock, UserPlus, GraduationCap, ChevronRight, Check } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'STUDENT'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(formData);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { value: 'STUDENT', label: 'Student', desc: 'Take exams' },
        { value: 'TEACHER', label: 'Teacher', desc: 'Create exams' },
    ];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter',system-ui,sans-serif", background: '#f8fafc' }}>

            {/* ── Left decorative panel ──────────────────────────────── */}


            {/* ── Right: register form ──────────────────────────────────── */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#f8fafc', minWidth: 0 }}>
                <div style={{ width: '100%', maxWidth: '440px', animation: 'slideUp 0.3s ease-out both' }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '2rem' }} className="mobile-brand">
                        <div style={{ width: '2rem', height: '2rem', borderRadius: '0.625rem', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <GraduationCap size={16} color="#fff" />
                        </div>
                        <span style={{ fontWeight: '700', color: '#0f172a' }}>ExamPlatform</span>
                    </div>

                    <h1 style={{ margin: '0 0 0.375rem', fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                        Create account
                    </h1>
                    <p style={{ margin: '0 0 2rem', fontSize: '0.9rem', color: '#64748b' }}>
                        Fill in your details to get started with ExamPlatform
                    </p>

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

                    {success && (
                        <div style={{
                            display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                            padding: '0.875rem 1rem', borderRadius: '0.75rem',
                            background: '#ecfdf5', border: '1px solid #a7f3d0',
                            color: '#047857', fontSize: '0.875rem', marginBottom: '1.25rem',
                        }}>
                            <Check size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                            <span>Registration successful! Redirecting to login…</span>
                        </div>
                    )}

                    <div style={{
                        background: '#fff', borderRadius: '1.25rem',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 24px -4px rgb(0 0 0/0.08), 0 1px 2px rgb(0 0 0/0.04)',
                        padding: '2rem',
                    }}>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
                                    USERNAME
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input
                                        name="username" type="text" required value={formData.username}
                                        onChange={handleChange}
                                        className="form-input" placeholder="johndoe"
                                        style={{ fontSize: '0.9rem', paddingLeft: '2.75rem' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
                                    EMAIL ADDRESS
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input
                                        name="email" type="email" required value={formData.email}
                                        onChange={handleChange}
                                        className="form-input" placeholder="john@example.com"
                                        style={{ fontSize: '0.9rem', paddingLeft: '2.75rem' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
                                    PASSWORD
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input
                                        name="password" type="password" required value={formData.password}
                                        onChange={handleChange}
                                        className="form-input" placeholder="••••••••"
                                        style={{ fontSize: '0.9rem', paddingLeft: '2.75rem' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.75rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
                                    I AM A…
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    {roles.map(r => (
                                        <button
                                            key={r.value} type="button"
                                            onClick={() => setFormData({ ...formData, role: r.value })}
                                            style={{
                                                padding: '0.75rem', borderRadius: '0.875rem', border: '1.5px solid',
                                                borderColor: formData.role === r.value ? '#6366f1' : '#e2e8f0',
                                                background: formData.role === r.value ? '#f5f7ff' : '#fff',
                                                color: formData.role === r.value ? '#4f46e5' : '#64748b',
                                                textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                                            }}
                                        >
                                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700' }}>{r.label}</p>
                                            <p style={{ margin: '0.15rem 0 0', fontSize: '0.7rem', opacity: 0.8 }}>{r.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || success}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    width: '100%', padding: '0.8rem',
                                    background: (loading || success) ? '#818cf8' : 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)',
                                    color: '#fff', fontWeight: '700', fontSize: '0.9rem',
                                    border: 'none', borderRadius: '0.875rem', cursor: (loading || success) ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 14px -2px rgb(79 70 229/0.45)',
                                    transition: 'all 0.15s',
                                    letterSpacing: '0.01em',
                                }}
                            >
                                {loading ? (
                                    <>
                                        <span style={{ width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                                        Creating account…
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={18} /> Register Now
                                    </>
                                )}
                            </button>
                        </form>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
                            <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '500' }}>Already have an account?</span>
                            <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                        </div>

                        <Link
                            to="/login"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '100%', padding: '0.75rem',
                                background: '#f8fafc', border: '1.5px solid #e2e8f0',
                                borderRadius: '0.875rem', color: '#4f46e5', fontWeight: '600',
                                fontSize: '0.875rem', textDecoration: 'none',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                        >
                            Sign in instead
                        </Link>
                    </div>
                </div>
            </div>

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

export default Register;
