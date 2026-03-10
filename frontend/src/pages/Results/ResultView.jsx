import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { Trophy, CheckCircle2, XCircle, LayoutDashboard, Clock, BarChart, Video } from 'lucide-react';

const ResultView = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    const isAdminOrTeacher = user?.role === 'ADMIN' || user?.role === 'TEACHER';

    useEffect(() => {
        fetchResult();
    }, [id]);

    const fetchResult = async () => {
        try {
            const response = await api.get(`/results/${id}`);
            setResult(response.data);
        } catch (error) {
            console.error('Error fetching result:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ padding: '5rem', textAlign: 'center', background: '#f8fafc', minHeight: '80vh' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }} />
            <p style={{ color: '#64748b', fontWeight: '500' }}>Preparing your results...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!result) return <div style={{ padding: '5rem', textAlign: 'center', color: '#64748b' }}>Result not found.</div>;

    const percentage = (result.score / result.totalQuestions) * 100;
    const isPassed = percentage >= 40;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '4rem', animation: 'slideUp .4s ease-out both' }}>

            {/* ── Victory/Result Header ────────────────────── */}
            <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '3.5rem' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '88px', height: '88px', borderRadius: '2rem',
                    background: isPassed ? 'linear-gradient(135deg,#dcfce7,#bbf7d0)' : 'linear-gradient(135deg,#fee2e2,#fecaca)',
                    color: isPassed ? '#16a34a' : '#dc2626',
                    marginBottom: '1.5rem', boxShadow: `0 10px 25px -5px ${isPassed ? 'rgba(22,163,74,.2)' : 'rgba(220,38,38,.2)'}`
                }}>
                    {isPassed ? <Trophy size={42} /> : <BarChart size={42} />}
                </div>
                <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.04em' }}>
                    {isPassed ? 'Outstanding Job!' : 'Keep Practicing!'}
                </h2>
                <p style={{ marginTop: '0.75rem', fontSize: '1.125rem', color: '#64748b', fontWeight: '500' }}>
                    You've completed the <span style={{ color: '#1e293b', fontWeight: '700' }}>{result.exam.title}</span>
                </p>
            </div>

            {/* ── Stats Grid ──────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Score', value: `${result.score} / ${result.totalQuestions}`, color: isPassed ? '#16a34a' : '#dc2626', sub: 'Correct Answers' },
                    { label: 'Percentage', value: `${Math.round(percentage)}%`, color: '#0f172a', sub: 'Final Grade' },
                    { label: 'Status', value: isPassed ? 'PASSED' : 'FAILED', color: isPassed ? '#16a34a' : '#dc2626', sub: 'Assessment Outcome' },
                ].map((st, i) => (
                    <div key={i} style={{
                        background: '#fff', padding: '1.75rem', borderRadius: '1.5rem',
                        border: '1px solid #e2e8f0', textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,.03)'
                    }}>
                        <p style={{ margin: '0 0 1rem', fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{st.label}</p>
                        <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '900', color: st.color, letterSpacing: '-0.02em' }}>{st.value}</p>
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>{st.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Action Bar ─────────────────────────────── */}
            <div style={{
                background: '#0f172a', borderRadius: '1.5rem', padding: '1.75rem 2.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '4rem', boxShadow: '0 12px 30px -10px rgba(15,23,42,.3)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '3rem', height: '3rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LayoutDashboard size={24} color="#fff" />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, color: '#fff', fontSize: '1.0625rem', fontWeight: '700' }}>
                            {isAdminOrTeacher ? 'Detailed Analysis' : 'Exam Summary'}
                        </h4>
                        <p style={{ margin: '.25rem 0 0', color: '#94a3b8', fontSize: '0.8125rem' }}>
                            {isAdminOrTeacher ? 'Check candidate performance on each question.' : 'Review your overall performance and grade.'}
                        </p>
                    </div>
                </div>
                <Link
                    to="/results"
                    style={{
                        padding: '0.75rem 1.5rem', background: '#fff', color: '#0f172a',
                        fontWeight: '750', fontSize: '0.875rem', borderRadius: '0.75rem',
                        textDecoration: 'none', transition: 'all .2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(-4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                    ← Back to Results
                </Link>
            </div>

            {/* ── Proctoring Recording (Admins Only) ─────────────────────── */}
            {isAdminOrTeacher && result.recordingPath && (
                <div style={{ marginBottom: '4rem' }}>
                    <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Video size={22} color="#6366f1" />
                        Proctoring Recording
                    </h3>
                    <div style={{
                        background: '#fff', borderRadius: '1.5rem', border: '1px solid #e2e8f0',
                        padding: '1.5rem', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.05)',
                        overflow: 'hidden'
                    }}>
                        <video
                            controls
                            style={{ width: '100%', borderRadius: '1rem', background: '#0f172a' }}
                        >
                            <source src={`http://localhost:8080/api/recordings/stream/${result.id}`} type="video/webm" />
                            Your browser does not support the video tag.
                        </video>
                        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #f1f5f9' }}>
                            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={14} />
                                This recording was captured automatically during the exam session.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Detailed Breakdown (Admins Only) ─────────────────────── */}
            {isAdminOrTeacher && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <CheckCircle2 size={22} color="#6366f1" />
                        Review Your Answers
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {result.exam.questions.map((q, idx) => {
                            const studentAnswer = result.selectedAnswers[q.id];
                            const isCorrect = studentAnswer === q.correctAnswer;

                            return (
                                <div key={q.id} style={{
                                    background: '#fff', borderRadius: '1.25rem', border: '1px solid #e2e8f0',
                                    padding: '1.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                                }}>
                                    <div style={{ display: 'flex', gap: '1.25rem' }}>
                                        <div style={{
                                            width: '2rem', height: '2rem', borderRadius: '0.625rem',
                                            background: isCorrect ? '#f0fdf4' : '#fef2f2',
                                            color: isCorrect ? '#16a34a' : '#ef4444',
                                            fontWeight: '800', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', flexShrink: 0, fontSize: '0.875rem'
                                        }}>
                                            {idx + 1}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: '0 0 1.5rem', fontSize: '1.0625rem', fontWeight: '700', color: '#1e293b', lineHeight: 1.5 }}>
                                                {q.content}
                                            </p>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                                                {q.options.map((opt, oIdx) => {
                                                    const isStudentPick = studentAnswer === opt;
                                                    const isCorrectOpt = q.correctAnswer === opt;

                                                    let bgColor = '#f8fafc';
                                                    let borderColor = '#f1f5f9';
                                                    let textColor = '#64748b';

                                                    if (isCorrectOpt) {
                                                        bgColor = '#f0fdf4';
                                                        borderColor = '#bbf7d0';
                                                        textColor = '#166534';
                                                    } else if (isStudentPick && !isCorrect) {
                                                        bgColor = '#fef2f2';
                                                        borderColor = '#fecaca';
                                                        textColor = '#991b1b';
                                                    }

                                                    return (
                                                        <div
                                                            key={oIdx}
                                                            style={{
                                                                padding: '0.875rem 1.125rem', borderRadius: '0.875rem',
                                                                border: `2px solid ${borderColor}`, background: bgColor,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                                color: textColor, fontSize: '0.875rem', fontWeight: '600'
                                                            }}
                                                        >
                                                            <span>{opt}</span>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                {isStudentPick && (
                                                                    <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                                                                        Your Pick
                                                                    </span>
                                                                )}
                                                                {isCorrectOpt ? <CheckCircle2 size={16} /> : isStudentPick ? <XCircle size={16} /> : null}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideUp { 
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default ResultView;
