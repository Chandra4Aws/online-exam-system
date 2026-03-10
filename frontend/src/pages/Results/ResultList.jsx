import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { Trophy, Clock, FileText, Search, ExternalLink, Calendar, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const cardStyle = {
    background: '#fff', borderRadius: '1rem',
    border: '1px solid #e8edf3',
    boxShadow: '0 1px 4px rgba(0,0,0,.05)',
    overflow: 'hidden',
};

const ResultList = () => {
    const { user } = useAuth();
    const isStudent = user?.role === 'STUDENT';
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const endpoint = isStudent ? '/results/my-results' : '/results';
                const r = await api.get(endpoint);
                setResults(r.data);
            } catch (e) {
                console.error('Failed to fetch results:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [isStudent]);

    const filtered = results.filter(r =>
        r.exam?.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.student?.username?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'slideUp .28s ease-out both' }}>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.03em' }}>
                        {isStudent ? 'My Performance' : 'Candidate Results'}
                    </h1>
                    <p style={{ margin: '.25rem 0 0', fontSize: '0.875rem', color: '#64748b' }}>
                        {isStudent ? 'Track your progress and review past exams' : 'Overview of all exam submissions and scores'}
                    </p>
                </div>
            </div>

            <div style={{ position: 'relative', maxWidth: '380px' }}>
                <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                <input
                    type="text"
                    placeholder={isStudent ? "Search exams..." : "Search by exam or student..."}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
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

            <div style={cardStyle}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8edf3' }}>
                                <th style={thStyle}>Exam</th>
                                {!isStudent && <th style={thStyle}>Student</th>}
                                <th style={thStyle}>Score</th>
                                <th style={thStyle}>Date</th>
                                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={isStudent ? 4 : 5} style={{ padding: '4rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', border: '2.5px solid #e0e7ff', borderTopColor: '#6366f1', animation: 'spin .7s linear infinite' }} />
                                    </div>
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={isStudent ? 4 : 5} style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.75rem', color: '#94a3b8' }}>
                                        <Trophy size={28} style={{ opacity: .4 }} />
                                        <p style={{ margin: 0, fontSize: '.875rem' }}>No results found.</p>
                                    </div>
                                </td></tr>
                            ) : (
                                filtered.map((r, i) => (
                                    <ResultRow key={r.id} result={r} isStudent={isStudent} idx={i} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
                @keyframes spin { to { transform:rotate(360deg); } }
            `}</style>
        </div>
    );
};

const ResultRow = ({ result, isStudent, idx }) => {
    const [hov, setHov] = useState(false);
    const percentage = Math.round((result.score / result.totalQuestions) * 100);
    const isPassed = percentage >= 40; // Assuming 40% is pass

    return (
        <tr
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                borderBottom: '1px solid #f1f5f9',
                background: hov ? '#fafbfd' : idx % 2 === 0 ? '#fff' : '#fdfeff',
                transition: 'background .1s'
            }}
        >
            <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                    <div style={{ padding: '.5rem', borderRadius: '.5rem', background: '#eef2ff', color: '#6366f1' }}>
                        <FileText size={16} />
                    </div>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{result.exam?.title}</span>
                </div>
            </td>
            {!isStudent && (
                <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#475569' }}>
                        <UserIcon size={14} />
                        <span>{result.student?.username}</span>
                    </div>
                </td>
            )}
            <td style={tdStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <span style={{ fontWeight: '700', color: '#0f172a' }}>{result.score} / {result.totalQuestions}</span>
                        <span style={{
                            padding: '.125rem .5rem', borderRadius: '9999px', fontSize: '.7rem', fontWeight: '700',
                            background: isPassed ? '#dcfce7' : '#fee2e2',
                            color: isPassed ? '#16a34a' : '#dc2626'
                        }}>
                            {percentage}%
                        </span>
                    </div>
                    <div style={{ width: '80px', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${percentage}%`, height: '100%', background: isPassed ? '#22c55e' : '#ef4444' }} />
                    </div>
                </div>
            </td>
            <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#64748b', fontSize: '.8125rem' }}>
                    <Calendar size={14} />
                    {new Date(result.submissionDate).toLocaleDateString()}
                </div>
            </td>
            <td style={{ ...tdStyle, textAlign: 'right' }}>
                <Link to={`/results/${result.id}`} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '.375rem',
                    padding: '.5rem 1rem', borderRadius: '.625rem',
                    background: '#fff', border: '1px solid #e2e8f0',
                    color: '#6366f1', fontSize: '.8125rem', fontWeight: '700',
                    textDecoration: 'none', transition: 'all .15s'
                }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                    View Details <ExternalLink size={14} />
                </Link>
            </td>
        </tr>
    );
};

const thStyle = { padding: '.875rem 1.375rem', fontSize: '.68rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em', whiteSpace: 'nowrap' };
const tdStyle = { padding: '1rem 1.375rem', fontSize: '.875rem', verticalAlign: 'middle' };

export default ResultList;
