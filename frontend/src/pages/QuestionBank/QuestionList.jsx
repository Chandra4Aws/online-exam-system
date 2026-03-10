import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { Plus, Trash2, Edit, Search, BookOpen, FileDown, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PILL = { display: 'inline-flex', alignItems: 'center', padding: '.175rem .625rem', borderRadius: '9999px', fontSize: '.7rem', fontWeight: '700' };

const typePill = (t) => t === 'MCQ'
    ? { ...PILL, background: '#dbeafe', color: '#1e40af' }
    : { ...PILL, background: '#ede9fe', color: '#5b21b6' };

const diffPill = (d) => {
    if (!d) return null;
    const map = { EASY: { bg: '#d1fae5', color: '#065f46' }, MEDIUM: { bg: '#fef3c7', color: '#92400e' }, HARD: { bg: '#fee2e2', color: '#991b1b' } };
    const m = map[d.toUpperCase()] || { bg: '#f1f5f9', color: '#475569' };
    return { ...PILL, background: m.bg, color: m.color };
};
const QuestionList = () => {
    const { user } = useAuth();
    const isStudent = user?.role === 'STUDENT';
    const isAdminOrTeacher = user?.role === 'ADMIN' || user?.role === 'TEACHER';

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [search, setSearch] = useState('');
    const fileInputRef = React.useRef(null);

    useEffect(() => { fetchQuestions(); }, []);

    const fetchQuestions = async () => {
        try {
            const r = await api.get('/questions');
            setQuestions(r.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this question?')) return;
        try {
            await api.delete(`/questions/${id}`);
            setQuestions(questions.filter(q => q.id !== id));
        } catch { alert('Failed to delete question'); }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await api.get('/questions/template', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'questions_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            alert('Failed to download template');
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setImporting(true);
        try {
            await api.post('/questions/import', formData);
            alert('Questions imported successfully!');
            fetchQuestions();
        } catch (e) {
            alert('Failed to import questions. Please check the file format.');
        } finally {
            setImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const filtered = questions.filter(q =>
        q.content?.toLowerCase().includes(search.toLowerCase()) ||
        q.subject?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'slideUp .28s ease-out both' }}>

            {/* ── Header ───────────────────────────────────── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.03em' }}>Question Bank</h1>
                    <p style={{ margin: '.25rem 0 0', fontSize: '0.875rem', color: '#64748b' }}>Manage your repository of test questions</p>
                </div>
                <div style={{ display: 'flex', gap: '.75rem' }}>
                    {isAdminOrTeacher && (
                        <>
                            <button
                                onClick={handleDownloadTemplate}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                                    padding: '.65rem 1.25rem',
                                    background: '#fff', border: '1.5px solid #e2e8f0',
                                    color: '#475569', fontWeight: '700', fontSize: '0.875rem',
                                    borderRadius: '0.875rem', cursor: 'pointer',
                                    transition: 'all .15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                            >
                                <FileDown size={15} /> Template
                            </button>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={importing}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                                    padding: '.65rem 1.25rem',
                                    background: '#fff', border: '1.5px solid #e2e8f0',
                                    color: '#475569', fontWeight: '700', fontSize: '0.875rem',
                                    borderRadius: '0.875rem', cursor: 'pointer',
                                    transition: 'all .15s',
                                    opacity: importing ? 0.7 : 1
                                }}
                                onMouseEnter={e => { if (!importing) { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; } }}
                                onMouseLeave={e => { if (!importing) { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; } }}
                            >
                                <Upload size={15} /> {importing ? 'Importing...' : 'Import'}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept=".xlsx, .xls"
                                onChange={handleImport}
                            />

                            <Link to="/questions/new" style={{
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
                                <Plus size={15} /> Add Question
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* ── Table card ───────────────────────────────── */}
            <div style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e8edf3', boxShadow: '0 1px 4px rgba(0,0,0,.05)', overflow: 'hidden' }}>

                {/* Toolbar */}
                <div style={{ padding: '.875rem 1.25rem', borderBottom: '1px solid #f1f5f9', background: '#fafbfd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem' }}>
                    <div style={{ position: 'relative', flex: '0 0 auto', minWidth: '240px', maxWidth: '360px', width: '100%' }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                        <input
                            type="text"
                            placeholder="Search by content or subject…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                width: '100%', padding: '.55rem .875rem .55rem 2.25rem',
                                background: '#fff', border: '1.5px solid #e2e8f0',
                                borderRadius: '.75rem', fontSize: '.8125rem', color: '#1e293b',
                                outline: 'none', transition: 'border-color .15s, box-shadow .15s',
                            }}
                            onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.1)'; }}
                            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>
                    {!loading && (
                        <span style={{ fontSize: '.75rem', color: '#94a3b8', fontWeight: '500', flexShrink: 0 }}>
                            {filtered.length} {filtered.length === 1 ? 'question' : 'questions'}
                        </span>
                    )}
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8edf3' }}>
                                {['Question', 'Subject', 'Type', 'Difficulty', ''].map((h, i) => (
                                    <th key={i} style={{ padding: '.875rem 1.375rem', fontSize: '.68rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em', whiteSpace: 'nowrap', textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '2.5px solid #e0e7ff', borderTopColor: '#6366f1', animation: 'spin .7s linear infinite' }} />
                                    </div>
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.75rem', color: '#94a3b8' }}>
                                        <BookOpen size={28} style={{ opacity: .4 }} />
                                        <p style={{ margin: 0, fontSize: '.875rem' }}>{search ? 'No questions match your search.' : 'No questions yet. Add your first one!'}</p>
                                    </div>
                                </td></tr>
                            ) : (
                                filtered.map((q, idx) => (
                                    <QuestionRow
                                        key={q.id}
                                        q={q}
                                        onDelete={handleDelete}
                                        idx={idx}
                                        role={user?.role}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {!loading && filtered.length > 0 && (
                    <div style={{ padding: '.75rem 1.375rem', borderTop: '1px solid #f1f5f9', background: '#fafbfd' }}>
                        <p style={{ margin: 0, fontSize: '.75rem', color: '#cbd5e1' }}>Showing {filtered.length} of {questions.length} total questions</p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
                @keyframes spin { to { transform:rotate(360deg); } }
            `}</style>
        </div>
    );
};

const QuestionRow = ({ q, onDelete, idx, role }) => {
    const isAdminOrTeacher = role === 'ADMIN' || role === 'TEACHER';
    const [hovered, setHovered] = useState(false);
    const diffStyle = diffPill(q.difficulty);

    return (
        <tr
            style={{ borderBottom: '1px solid #f1f5f9', background: hovered ? '#fafbfd' : idx % 2 === 0 ? '#fff' : '#fdfeff', transition: 'background .1s' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <td style={{ padding: '1rem 1.375rem', maxWidth: '300px' }}>
                <p style={{ margin: 0, fontWeight: '600', color: '#1e293b', fontSize: '.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.content}</p>
            </td>
            <td style={{ padding: '1rem 1.375rem', fontSize: '.8125rem', color: '#64748b', whiteSpace: 'nowrap' }}>{q.subject || '—'}</td>
            <td style={{ padding: '1rem 1.375rem' }}>
                <span style={typePill(q.type)}>{q.type}</span>
            </td>
            <td style={{ padding: '1rem 1.375rem' }}>
                {diffStyle ? <span style={diffStyle}>{q.difficulty}</span> : <span style={{ color: '#cbd5e1', fontSize: '.8rem' }}>—</span>}
            </td>
            <td style={{ padding: '.875rem 1.375rem', textAlign: 'right' }}>
                {isAdminOrTeacher && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.375rem' }}>
                        <Link to={`/questions/edit/${q.id}`} title="Edit"
                            style={{ display: 'flex', alignItems: 'center', padding: '.4rem', borderRadius: '.5rem', color: '#6366f1', background: 'transparent', transition: 'background .15s', textDecoration: 'none' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#eef2ff'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <Edit size={15} />
                        </Link>
                        <button onClick={() => onDelete(q.id)} title="Delete"
                            style={{ display: 'flex', alignItems: 'center', padding: '.4rem', borderRadius: '.5rem', border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', transition: 'background .15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#fff1f2'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <Trash2 size={15} />
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
};

export default QuestionList;
