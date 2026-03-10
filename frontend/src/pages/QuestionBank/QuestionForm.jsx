import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import { Save, Trash2, Plus, ArrowLeft, Check } from 'lucide-react';

/* ── shared styles ──────────────────────────────────────────── */
const card = {
    background: '#fff', borderRadius: '1rem',
    border: '1px solid #e8edf3',
    boxShadow: '0 1px 4px rgba(0,0,0,.05)',
};
const inputStyle = {
    display: 'block', width: '100%',
    padding: '.625rem .875rem',
    background: '#f8fafc', border: '1.5px solid #e2e8f0',
    borderRadius: '.75rem', fontSize: '.875rem', color: '#1e293b',
    fontFamily: 'inherit', outline: 'none',
    transition: 'border-color .15s, box-shadow .15s, background .15s',
    boxSizing: 'border-box',
};
const labelStyle = {
    display: 'block', fontSize: '.775rem', fontWeight: '700',
    color: '#374151', letterSpacing: '.03em', textTransform: 'uppercase', marginBottom: '.5rem',
};
const focusIn = e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.12)'; e.target.style.background = '#fff'; };
const focusOut = e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; };

import { useAuth } from '../../context/AuthContext';

const DIFF_OPTIONS = ['Easy', 'Medium', 'Hard'];
const TYPE_OPTIONS = ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER'];

const QuestionForm = () => {
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
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        content: '', type: 'MCQ',
        options: ['', '', '', ''],
        correctAnswer: '',
        subject: '', difficulty: 'Easy',
    });

    useEffect(() => { if (id) fetchQuestion(); }, [id]);

    const fetchQuestion = async () => {
        try { const r = await api.get(`/questions/${id}`); setFormData(r.data); }
        catch (e) { console.error(e); navigate('/questions'); }
    };

    const handleOptionChange = (i, v) => {
        const opts = [...formData.options];
        opts[i] = v;
        // if this was the correct answer, update it live
        const newCorrect = formData.correctAnswer === formData.options[i] ? v : formData.correctAnswer;
        setFormData({ ...formData, options: opts, correctAnswer: newCorrect });
    };

    const addOption = () => setFormData({ ...formData, options: [...formData.options, ''] });
    const removeOption = (i) => {
        const opts = formData.options.filter((_, idx) => idx !== i);
        setFormData({ ...formData, options: opts });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (id) await api.put(`/questions/${id}`, formData);
            else await api.post('/questions', formData);
            navigate('/questions');
        } catch (e) {
            console.error(e);
            setError('Failed to save question. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isMCQ = formData.type === 'MCQ' || formData.type === 'TRUE_FALSE';

    return (
        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem', animation: 'slideUp .28s ease-out both' }}>

            {/* ── Page header ──────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button type="button" onClick={() => navigate('/questions')} style={{
                    width: '36px', height: '36px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                    background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#64748b', flexShrink: 0, transition: 'all .15s',
                }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#64748b'; }}
                >
                    <ArrowLeft size={16} />
                </button>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.03em' }}>
                        {id ? 'Edit Question' : 'Add New Question'}
                    </h1>
                    <p style={{ margin: '.2rem 0 0', fontSize: '.875rem', color: '#64748b' }}>
                        {id ? 'Update the question details below.' : 'Fill in the details to add to your question bank.'}
                    </p>
                </div>
            </div>

            {/* ── Error banner ─────────────────────────────── */}
            {error && (
                <div style={{ padding: '.875rem 1rem', borderRadius: '.75rem', background: '#fff1f2', border: '1px solid #fecdd3', color: '#be123c', fontSize: '.875rem', display: 'flex', alignItems: 'center', gap: '.625rem' }}>
                    <span style={{ flexShrink: 0 }}>⚠️</span> {error}
                </div>
            )}

            {/* ── Main form card ───────────────────────────── */}
            <form onSubmit={handleSubmit}>
                <div style={{ ...card, overflow: 'visible' }}>

                    {/* Card header */}
                    <div style={{ padding: '1.125rem 1.375rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '.625rem' }}>
                        <div style={{ width: '2rem', height: '2rem', borderRadius: '.625rem', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.875rem' }}>📝</div>
                        <h2 style={{ margin: 0, fontSize: '.9375rem', fontWeight: '700', color: '#0f172a' }}>Question Details</h2>
                    </div>

                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.375rem' }}>

                        {/* Question content */}
                        <div>
                            <label style={labelStyle}>Question Content <span style={{ color: '#ef4444' }}>*</span></label>
                            <textarea required rows={4} value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
                                placeholder="Type your question here…"
                                onFocus={focusIn} onBlur={focusOut}
                            />
                        </div>

                        {/* Row: type + subject + difficulty */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Question Type</label>
                                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    style={{ ...inputStyle, cursor: 'pointer' }}
                                    onFocus={focusIn} onBlur={focusOut}
                                >
                                    {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Subject</label>
                                <input type="text" value={formData.subject}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    style={inputStyle} placeholder="e.g. Mathematics"
                                    onFocus={focusIn} onBlur={focusOut}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Difficulty</label>
                                <div style={{ display: 'flex', gap: '.5rem' }}>
                                    {DIFF_OPTIONS.map(d => {
                                        const active = formData.difficulty === d;
                                        const colors = { Easy: ['#d1fae5', '#059669'], Medium: ['#fef3c7', '#d97706'], Hard: ['#fee2e2', '#dc2626'] };
                                        const [bg, c] = active ? colors[d] : ['#f1f5f9', '#94a3b8'];
                                        return (
                                            <button key={d} type="button" onClick={() => setFormData({ ...formData, difficulty: d })}
                                                style={{ flex: 1, padding: '.45rem .25rem', borderRadius: '.625rem', border: `1.5px solid ${active ? c + '55' : '#e2e8f0'}`, background: bg, color: c, fontWeight: '700', fontSize: '.75rem', cursor: 'pointer', transition: 'all .15s' }}
                                            >
                                                {d}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* MCQ Options */}
                        {isMCQ && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.75rem' }}>
                                    <label style={labelStyle}>Answer Options</label>
                                    <button type="button" onClick={addOption}
                                        style={{ display: 'flex', alignItems: 'center', gap: '.375rem', padding: '.35rem .75rem', borderRadius: '.625rem', border: '1.5px solid #c7d2fe', background: '#eef2ff', color: '#4f46e5', fontWeight: '700', fontSize: '.775rem', cursor: 'pointer', transition: 'all .15s' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#e0e7ff'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = '#eef2ff'; }}
                                    >
                                        <Plus size={13} /> Add Option
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
                                    {formData.options.map((opt, i) => {
                                        const isCorrect = formData.correctAnswer === opt && opt !== '';
                                        return (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                                                {/* Correct indicator */}
                                                <button type="button"
                                                    onClick={() => setFormData({ ...formData, correctAnswer: opt || '' })}
                                                    title="Mark as correct answer"
                                                    style={{ width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0, border: `2px solid ${isCorrect ? '#22c55e' : '#d1d5db'}`, background: isCorrect ? '#22c55e' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .15s' }}
                                                >
                                                    {isCorrect && <Check size={12} color="#fff" />}
                                                </button>

                                                {/* Option label */}
                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isCorrect ? '#dcfce7' : '#f1f5f9', color: isCorrect ? '#15803d' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '.75rem', flexShrink: 0 }}>
                                                    {String.fromCharCode(65 + i)}
                                                </div>

                                                {/* Input */}
                                                <input type="text" required value={opt}
                                                    onChange={e => handleOptionChange(i, e.target.value)}
                                                    style={{ ...inputStyle, flex: 1, border: `1.5px solid ${isCorrect ? '#86efac' : '#e2e8f0'}`, background: isCorrect ? '#f0fdf4' : '#f8fafc' }}
                                                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                                    onFocus={focusIn} onBlur={e => { e.target.style.borderColor = isCorrect ? '#86efac' : '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = isCorrect ? '#f0fdf4' : '#f8fafc'; }}
                                                />

                                                {/* Remove */}
                                                <button type="button" onClick={() => removeOption(i)}
                                                    disabled={formData.options.length <= 2}
                                                    style={{ flexShrink: 0, width: '30px', height: '30px', border: 'none', borderRadius: '.5rem', background: 'transparent', color: '#94a3b8', cursor: formData.options.length <= 2 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}
                                                    onMouseEnter={e => { if (formData.options.length > 2) { e.currentTarget.style.background = '#fff1f2'; e.currentTarget.style.color = '#ef4444'; } }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Hint */}
                                <p style={{ margin: '.75rem 0 0', fontSize: '.775rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '.375rem' }}>
                                    <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#f1f5f9', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: '800', color: '#6366f1' }}>i</span>
                                    Click the circle next to an option to mark it as the correct answer.
                                </p>
                            </div>
                        )}

                        {/* Correct answer fallback for non-MCQ */}
                        {!isMCQ && (
                            <div>
                                <label style={labelStyle}>Model Answer / Correct Answer</label>
                                <input type="text" value={formData.correctAnswer}
                                    onChange={e => setFormData({ ...formData, correctAnswer: e.target.value })}
                                    style={inputStyle} placeholder="Enter the correct answer…"
                                    onFocus={focusIn} onBlur={focusOut}
                                />
                            </div>
                        )}
                    </div>

                    {/* Footer: Cancel + Save */}
                    <div style={{ padding: '1.125rem 1.375rem', borderTop: '1px solid #f1f5f9', background: '#fafbfd', display: 'flex', justifyContent: 'flex-end', gap: '.75rem' }}>
                        <button type="button" onClick={() => navigate('/questions')} style={{
                            padding: '.65rem 1.25rem', borderRadius: '.875rem', border: '1.5px solid #e2e8f0',
                            background: '#fff', color: '#64748b', fontWeight: '600', fontSize: '.875rem', cursor: 'pointer', transition: 'all .15s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                        >
                            Cancel
                        </button>
                        <button type="submit" disabled={loading} style={{
                            display: 'flex', alignItems: 'center', gap: '.5rem',
                            padding: '.65rem 1.5rem',
                            background: loading ? '#818cf8' : 'linear-gradient(135deg,#6366f1,#4338ca)',
                            color: '#fff', fontWeight: '700', fontSize: '.875rem',
                            border: 'none', borderRadius: '.875rem', cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 12px rgba(79,70,229,.35)', transition: 'opacity .15s',
                        }}
                            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '.88'; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                        >
                            {loading ? (
                                <><span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} /> Saving…</>
                            ) : (
                                <><Save size={15} /> {id ? 'Update Question' : 'Save Question'}</>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            <style>{`
                @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes spin { to{transform:rotate(360deg)} }
                @media(max-width:680px){ div[style*="grid-template-columns: 1fr 1fr 1fr"] { grid-template-columns: 1fr !important; } }
            `}</style>
        </div>
    );
};

export default QuestionForm;
