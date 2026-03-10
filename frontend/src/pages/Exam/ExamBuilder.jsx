import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import { Save, X, Plus, ArrowLeft, Search, Check, BookOpen } from 'lucide-react';

/* ── shared helpers ─────────────────────────────────────────── */
const card = {
    background: '#fff', borderRadius: '1rem',
    border: '1px solid #e8edf3',
    boxShadow: '0 1px 4px rgba(0,0,0,.05)',
    overflow: 'hidden',
};
const inputStyle = {
    display: 'block', width: '100%',
    padding: '.625rem .875rem',
    background: '#f8fafc', border: '1.5px solid #e2e8f0',
    borderRadius: '.75rem', fontSize: '.875rem', color: '#1e293b',
    fontFamily: 'inherit', outline: 'none',
    transition: 'border-color .15s, box-shadow .15s',
};
const labelStyle = { display: 'block', fontSize: '.775rem', fontWeight: '700', color: '#374151', letterSpacing: '.03em', textTransform: 'uppercase', marginBottom: '.5rem' };

const focusIn = e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.12)'; e.target.style.background = '#fff'; };
const focusOut = e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; };

import { useAuth } from '../../context/AuthContext';

const ExamBuilder = () => {
    const { user } = useAuth();
    const isStudent = user?.role === 'STUDENT';
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (isStudent) {
            navigate('/exams');
            return;
        }
    }, [isStudent, navigate]);

    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ title: '', durationMinutes: 30, description: '', questions: [] });

    useEffect(() => { fetchQuestions(); if (id) fetchExam(); }, [id]);

    const fetchQuestions = async () => {
        try { const r = await api.get('/questions'); setQuestions(r.data); }
        catch (e) { console.error(e); }
    };
    const fetchExam = async () => {
        try { const r = await api.get(`/exams/${id}`); setFormData(r.data); }
        catch (e) { console.error(e); navigate('/exams'); }
    };

    const toggleQuestion = (q) => {
        const sel = formData.questions.some(s => s.id === q.id);
        setFormData({ ...formData, questions: sel ? formData.questions.filter(s => s.id !== q.id) : [...formData.questions, q] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.questions.length === 0) { alert('Please select at least one question.'); return; }
        setLoading(true);
        try {
            if (id) await api.put(`/exams/${id}`, formData);
            else await api.post('/exams', formData);
            navigate('/exams');
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const filtered = questions.filter(q =>
        q.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const diffColor = d => {
        const map = { easy: { bg: '#d1fae5', color: '#065f46' }, medium: { bg: '#fef3c7', color: '#92400e' }, hard: { bg: '#fee2e2', color: '#991b1b' } };
        return map[(d || '').toLowerCase()] || { bg: '#f1f5f9', color: '#64748b' };
    };

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '4rem', animation: 'slideUp .28s ease-out both' }}>

            {/* ── Page header ──────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => navigate('/exams')} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all .15s', flexShrink: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#64748b'; }}
                >
                    <ArrowLeft size={16} />
                </button>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.03em' }}>
                        {id ? 'Edit Exam' : 'Create New Exam'}
                    </h1>
                    <p style={{ margin: '.2rem 0 0', fontSize: '.875rem', color: '#64748b' }}>
                        {id ? 'Update exam details and questions.' : 'Fill in the details and pick questions from your bank.'}
                    </p>
                </div>
            </div>

            {/* ── Two-column form ───────────────────────────── */}
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.25rem', alignItems: 'start' }}>

                {/* ── Left: Exam info + selected questions ─── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {/* Exam info card */}
                    <div style={card}>
                        <div style={{ padding: '1.125rem 1.375rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '.625rem' }}>
                            <div style={{ width: '2rem', height: '2rem', borderRadius: '.625rem', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '.9rem' }}>📋</span>
                            </div>
                            <h2 style={{ margin: 0, fontSize: '.9375rem', fontWeight: '700', color: '#0f172a' }}>Exam Details</h2>
                        </div>
                        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Title <span style={{ color: '#ef4444', fontWeight: '900' }}>*</span></label>
                                <input type="text" required value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    style={inputStyle} placeholder="e.g. Final Exam 2024"
                                    onFocus={focusIn} onBlur={focusOut}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Duration (minutes) <span style={{ color: '#ef4444', fontWeight: '900' }}>*</span></label>
                                <input type="number" required min="1" value={formData.durationMinutes}
                                    onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                                    style={inputStyle}
                                    onFocus={focusIn} onBlur={focusOut}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Description</label>
                                <textarea rows={3} value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                                    placeholder="Brief description of the exam…"
                                    onFocus={focusIn} onBlur={focusOut}
                                />
                            </div>

                            <button type="submit" disabled={loading} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                                width: '100%', padding: '.75rem',
                                background: loading ? '#818cf8' : 'linear-gradient(135deg,#6366f1,#4338ca)',
                                color: '#fff', fontWeight: '700', fontSize: '.9rem',
                                border: 'none', borderRadius: '.875rem', cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 4px 14px -2px rgba(79,70,229,.4)',
                                transition: 'opacity .15s', marginTop: '.25rem',
                            }}
                                onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '.88'; }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                            >
                                {loading ? (
                                    <><span style={{ width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} /> Saving…</>
                                ) : (
                                    <><Save size={16} /> {id ? 'Update Exam' : 'Save Exam'}</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Selected questions summary */}
                    <div style={card}>
                        <div style={{ padding: '1rem 1.375rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h2 style={{ margin: 0, fontSize: '.9rem', fontWeight: '700', color: '#0f172a' }}>Selected Questions</h2>
                            <span style={{ padding: '.2rem .7rem', borderRadius: '9999px', background: '#eef2ff', color: '#4f46e5', fontSize: '.75rem', fontWeight: '700' }}>
                                {formData.questions.length}
                            </span>
                        </div>
                        <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '0.75rem' }}>
                            {formData.questions.length === 0 ? (
                                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '.8125rem', fontStyle: 'italic' }}>
                                    No questions selected yet.<br />Pick from the bank →
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                                    {formData.questions.map((q, i) => (
                                        <div key={q.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '.625rem', padding: '.625rem .75rem', background: '#f8fafc', borderRadius: '.625rem', border: '1px solid #f1f5f9' }}>
                                            <span style={{ fontWeight: '800', color: '#6366f1', fontSize: '.75rem', flexShrink: 0, marginTop: '.05rem' }}>#{i + 1}</span>
                                            <p style={{ margin: 0, fontSize: '.8rem', color: '#374151', lineHeight: 1.5, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{q.content}</p>
                                            <button type="button" onClick={() => toggleQuestion(q)} style={{ flexShrink: 0, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '.1rem', borderRadius: '.375rem', display: 'flex', transition: 'color .1s' }}
                                                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                                            >
                                                <X size={13} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Right: Question bank picker ──────────── */}
                <div style={card}>
                    {/* Toolbar */}
                    <div style={{ padding: '1.125rem 1.375rem', borderBottom: '1px solid #f1f5f9', background: '#fafbfd' }}>
                        <h2 style={{ margin: '0 0 .875rem', fontSize: '.9375rem', fontWeight: '700', color: '#0f172a' }}>Question Bank</h2>
                        <div style={{ position: 'relative' }}>
                            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                            <input type="text" placeholder="Filter by content or subject…" value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ ...inputStyle, paddingLeft: '2.25rem' }}
                                onFocus={focusIn} onBlur={focusOut}
                            />
                        </div>
                    </div>

                    {/* Question rows */}
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {filtered.length === 0 ? (
                            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                <BookOpen size={28} style={{ opacity: .4 }} />
                                <p style={{ margin: 0, fontSize: '.875rem' }}>{searchTerm ? 'No questions match your search.' : 'No questions in the bank yet.'}</p>
                            </div>
                        ) : (
                            filtered.map(q => {
                                const sel = formData.questions.some(s => s.id === q.id);
                                const dc = diffColor(q.difficulty);
                                return (
                                    <QuestionRow key={q.id} q={q} selected={sel} onClick={() => toggleQuestion(q)} diffColor={dc} />
                                );
                            })
                        )}
                    </div>

                    {/* Footer count */}
                    <div style={{ padding: '.75rem 1.375rem', borderTop: '1px solid #f1f5f9', background: '#fafbfd' }}>
                        <p style={{ margin: 0, fontSize: '.75rem', color: '#94a3b8' }}>{filtered.length} of {questions.length} questions shown</p>
                    </div>
                </div>
            </form>

            <style>{`
                @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes spin { to{transform:rotate(360deg)} }
                @media (max-width: 900px) { form { grid-template-columns: 1fr !important; } }
            `}</style>
        </div>
    );
};

const QuestionRow = ({ q, selected, onClick, diffColor: dc }) => {
    const [hov, setHov] = useState(false);
    return (
        <div onClick={onClick} style={{
            padding: '1rem 1.375rem', display: 'flex', alignItems: 'flex-start', gap: '1rem',
            cursor: 'pointer', borderBottom: '1px solid #f8fafc',
            background: selected ? '#fafaff' : hov ? '#fafbfd' : '#fff',
            transition: 'background .1s',
        }}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        >
            {/* Checkbox */}
            <div style={{
                width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0, marginTop: '.1rem',
                border: `2px solid ${selected ? '#6366f1' : '#d1d5db'}`,
                background: selected ? '#6366f1' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .15s',
            }}>
                {selected && <Check size={12} color="#fff" />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.375rem', marginBottom: '.375rem' }}>
                    {q.subject && (
                        <span style={{ padding: '.15rem .5rem', borderRadius: '4px', background: '#f1f5f9', color: '#64748b', fontSize: '.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                            {q.subject}
                        </span>
                    )}
                    {q.difficulty && (
                        <span style={{ padding: '.15rem .5rem', borderRadius: '4px', background: dc.bg, color: dc.color, fontSize: '.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                            {q.difficulty}
                        </span>
                    )}
                    {q.type && (
                        <span style={{ padding: '.15rem .5rem', borderRadius: '4px', background: '#dbeafe', color: '#1e40af', fontSize: '.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                            {q.type}
                        </span>
                    )}
                </div>
                <p style={{ margin: 0, fontSize: '.875rem', color: '#1e293b', lineHeight: 1.55, fontWeight: selected ? '600' : '400' }}>{q.content}</p>
            </div>
        </div>
    );
};

export default ExamBuilder;
