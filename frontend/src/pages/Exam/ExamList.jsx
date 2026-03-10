import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { Plus, Trash2, Edit, Send, BookOpen, Clock, FileText, Search, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/* ── shared card style ── */
const card = {
    background: '#fff', borderRadius: '1rem',
    border: '1px solid #e8edf3',
    boxShadow: '0 1px 4px rgba(0,0,0,.05)',
    overflow: 'hidden',
};

const ExamList = () => {
    const { user } = useAuth();
    const isStudent = user?.role === 'STUDENT';
    const isAdminOrTeacher = user?.role === 'ADMIN' || user?.role === 'TEACHER';

    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

    useEffect(() => { fetchExams(); }, []);

    const fetchExams = async () => {
        try {
            const r = await api.get('/exams');
            setExams(r.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this exam?')) return;
        try {
            await api.delete(`/exams/${id}`);
            setExams(exams.filter(e => e.id !== id));
        } catch { alert('Failed to delete exam'); }
    };

    const handlePublish = async (id) => {
        try {
            await api.post(`/exams/${id}/publish`);
            setExams(exams.map(e => e.id === id ? { ...e, published: true } : e));
        } catch { alert('Failed to publish'); }
    };

    const filtered = exams.filter(e =>
        e.title?.toLowerCase().includes(query.toLowerCase()) ||
        e.description?.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'slideUp .28s ease-out both' }}>

            {/* ── Page header ──────────────────────────────── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.03em' }}>{isStudent ? 'Available Exams' : 'Exam Management'}</h1>
                    <p style={{ margin: '.25rem 0 0', fontSize: '0.875rem', color: '#64748b' }}>{isStudent ? 'Select an assessment to begin' : 'Create, publish and manage assessments'}</p>
                </div>
                {isAdminOrTeacher && (
                    <Link to="/exams/new" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                        padding: '.65rem 1.25rem',
                        background: 'linear-gradient(135deg,#6366f1,#4338ca)',
                        color: '#fff', fontWeight: '700', fontSize: '0.875rem',
                        borderRadius: '0.875rem', textDecoration: 'none',
                        boxShadow: '0 4px 12px rgba(79,70,229,.35)',
                        transition: 'opacity .15s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '.88'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                        <Plus size={15} /> Create Exam
                    </Link>
                )}
            </div>

            {/* ── Search bar ───────────────────────────────── */}
            <div style={{ position: 'relative', maxWidth: '380px' }}>
                <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                <input
                    type="text"
                    placeholder="Search exams…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    style={{
                        width: '100%', padding: '.6rem .875rem .6rem 2.5rem',
                        background: '#fff', border: '1.5px solid #e2e8f0',
                        borderRadius: '0.75rem', fontSize: '0.875rem', color: '#1e293b',
                        outline: 'none', transition: 'border-color .15s, box-shadow .15s',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.12)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
            </div>

            {/* ── Grid ─────────────────────────────────────── */}
            {
                loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
                        <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '2.5px solid #e0e7ff', borderTopColor: '#6366f1', animation: 'spin .7s linear infinite' }} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ ...card, padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', borderStyle: 'dashed', borderWidth: '2px', background: 'transparent', boxShadow: 'none' }}>
                        <div style={{ width: '4rem', height: '4rem', borderRadius: '1rem', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={26} color="#94a3b8" />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ margin: 0, fontWeight: '600', color: '#475569' }}>No exams found</p>
                            <p style={{ margin: '.375rem 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>{query ? 'Try a different search term.' : 'Create your first exam to get started.'}</p>
                        </div>
                        {!query && (
                            <Link to="/exams/new" style={{ padding: '.6rem 1.25rem', background: '#6366f1', color: '#fff', borderRadius: '.75rem', fontSize: '.875rem', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', gap: '.4rem', alignItems: 'center' }}>
                                <Plus size={15} /> Create Exam
                            </Link>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.125rem' }}>
                        {filtered.map(exam => (
                            <ExamCard
                                key={exam.id}
                                exam={exam}
                                onDelete={handleDelete}
                                onPublish={handlePublish}
                                role={user?.role}
                            />
                        ))}
                    </div>
                )
            }

            <style>{`
                @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
                @keyframes spin { to { transform:rotate(360deg); } }
            `}</style>
        </div >
    );
};

const ExamCard = ({ exam, onDelete, onPublish, role }) => {
    const published = exam.published;
    const [hovered, setHovered] = useState(false);
    const isStudent = role === 'STUDENT';
    const isAdminOrTeacher = role === 'ADMIN' || role === 'TEACHER';

    return (
        <div
            style={{ ...card, display: 'flex', flexDirection: 'column', transition: 'box-shadow .2s, transform .2s', boxShadow: hovered ? '0 8px 24px -4px rgba(0,0,0,.12)' : '0 1px 4px rgba(0,0,0,.05)', transform: hovered ? 'translateY(-2px)' : 'none' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Accent bar */}
            <div style={{ height: '4px', background: published ? 'linear-gradient(to right,#22c55e,#16a34a)' : 'linear-gradient(to right,#f59e0b,#d97706)' }} />

            <div style={{ padding: '1.125rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '.75rem' }}>
                    <h3 style={{ margin: 0, fontSize: '.9375rem', fontWeight: '700', color: '#0f172a', lineHeight: 1.35 }}>{exam.title}</h3>
                    <span style={{
                        flexShrink: 0, padding: '.2rem .6rem', borderRadius: '9999px', fontSize: '.7rem', fontWeight: '700',
                        background: published ? '#d1fae5' : '#fef3c7',
                        color: published ? '#065f46' : '#92400e',
                    }}>
                        {published ? 'Published' : 'Draft'}
                    </span>
                </div>
                <p style={{ margin: 0, fontSize: '.8125rem', color: '#64748b', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {exam.description || 'No description provided.'}
                </p>
                <div style={{ marginTop: 'auto', paddingTop: '.75rem', display: 'flex', gap: '1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.775rem', color: '#94a3b8', fontWeight: '500' }}>
                        <FileText size={13} /> {exam.questions?.length || 0} questions
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.775rem', color: '#94a3b8', fontWeight: '500' }}>
                        <Clock size={13} /> {exam.durationMinutes || 0} min
                    </span>
                </div>
            </div>

            {/* Footer Actions */}
            <div style={{ padding: '.75rem 1.25rem', borderTop: '1px solid #f1f5f9', background: '#fafbfd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {isStudent ? (
                    <Link
                        to={`/test/${exam.id}`}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '.5rem',
                            padding: '.5rem 1.25rem', width: '100%', justifyContent: 'center',
                            background: '#0f172a', color: '#fff', borderRadius: '.75rem',
                            fontSize: '.875rem', fontWeight: '700', textDecoration: 'none',
                            transition: 'opacity .15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '.9'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                        <PlayCircle size={16} /> Take Test
                    </Link>
                ) : isAdminOrTeacher && (
                    <>
                        <div style={{ display: 'flex', gap: '.375rem' }}>
                            <ActionBtn onClick={() => onPublish(exam.id)} disabled={published} title="Publish" color="#22c55e">
                                <Send size={14} />
                            </ActionBtn>
                            <Link to={`/exams/edit/${exam.id}`} title="Edit" style={{ display: 'flex', alignItems: 'center', padding: '.4rem', borderRadius: '.5rem', color: '#6366f1', background: 'transparent', transition: 'background .15s', textDecoration: 'none' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <Edit size={14} />
                            </Link>
                        </div>
                        <ActionBtn onClick={() => onDelete(exam.id)} title="Delete" color="#ef4444">
                            <Trash2 size={14} />
                        </ActionBtn>
                    </>
                )}
            </div>
        </div>
    );
};

const ActionBtn = ({ onClick, disabled, title, color, children }) => (
    <button
        onClick={onClick} disabled={disabled} title={title}
        style={{ display: 'flex', alignItems: 'center', padding: '.4rem', borderRadius: '.5rem', border: 'none', background: 'transparent', color: disabled ? '#d1d5db' : color, cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background .15s' }}
        onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = color + '18'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
        {children}
    </button>
);

export default ExamList;
