import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, FileText, EyeOff, Video, MicOff } from 'lucide-react';

const TestPlayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [shuffledQuestions, setShuffledQuestions] = useState([]);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [switchWarning, setSwitchWarning] = useState(false);

    // ── Recording state ───────────────────────────────────────
    const [recordingStatus, setRecordingStatus] = useState('pending'); // 'pending' | 'recording' | 'error' | 'denied' | 'finished'
    const [uploadStatus, setUploadStatus] = useState(null); // null | 'uploading' | 'done' | 'failed'
    const mediaStreamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const videoPreviewRef = useRef(null);

    const submittingRef = useRef(false);

    const shuffleArray = (arr) => {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    useEffect(() => {
        fetchExam();
    }, [id]);

    const fetchExam = async () => {
        try {
            const response = await api.get(`/exams/${id}`);
            setExam(response.data);
            setShuffledQuestions(shuffleArray(response.data.questions));
            setTimeLeft(response.data.durationMinutes * 60);
        } catch (error) {
            console.error('Error fetching exam:', error);
            navigate('/exams');
        } finally {
            setLoading(false);
        }
    };

    // ── Start camera + audio recording once exam is loaded ────
    useEffect(() => {
        let isMounted = true;
        if (!exam) return;

        const startRecording = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

                if (!isMounted) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }

                mediaStreamRef.current = stream;

                // Attach live preview
                if (videoPreviewRef.current) {
                    videoPreviewRef.current.srcObject = stream;
                }

                // Pick a supported MIME type
                const mimeType = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']
                    .find(t => MediaRecorder.isTypeSupported(t)) || '';

                const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
                mediaRecorderRef.current = recorder;
                recordedChunksRef.current = [];

                recorder.ondataavailable = (e) => {
                    if (e.data && e.data.size > 0) {
                        recordedChunksRef.current.push(e.data);
                    }
                };

                recorder.start(1000); // collect a chunk every 1 s
                setRecordingStatus('recording');
            } catch (err) {
                if (!isMounted) return;
                console.error('Camera/mic access denied:', err);
                setRecordingStatus('denied');
                alert('⚠️ Camera and microphone access is required for this exam. The exam will now end.');
                navigate('/exams');
            }
        };

        startRecording();

        // Cleanup always uses refs so it works even if the async init hadn't finished
        return () => {
            isMounted = false;
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                try { mediaRecorderRef.current.stop(); } catch (e) { }
            }
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(t => t.stop());
                mediaStreamRef.current = null;
            }
            if (videoPreviewRef.current) {
                videoPreviewRef.current.srcObject = null;
            }
        };
    }, [exam, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Ensure video preview is attached once element renders ──
    useEffect(() => {
        if (recordingStatus === 'recording' && mediaStreamRef.current && videoPreviewRef.current) {
            videoPreviewRef.current.srcObject = mediaStreamRef.current;
        }
    }, [recordingStatus]);

    // ── Stop recording and upload to backend ─────────────────
    const stopAndUploadRecording = useCallback(() => {
        return new Promise((resolve) => {
            const recorder = mediaRecorderRef.current;
            setRecordingStatus('finished');

            // ── Kill the camera immediately so the indicator light goes off ──
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(t => t.stop());
                mediaStreamRef.current = null;
            }
            if (videoPreviewRef.current) {
                videoPreviewRef.current.srcObject = null;
            }

            if (!recorder || recorder.state === 'inactive') {
                resolve(null);
                return;
            }

            // Assign onstop BEFORE calling stop() to avoid missing the event
            recorder.onstop = async () => {
                const chunks = recordedChunksRef.current;
                if (chunks.length === 0) {
                    resolve();
                    return;
                }

                const blob = new Blob(chunks, { type: 'video/webm' });
                const formData = new FormData();
                formData.append('file', blob, `recording-${id}-${Date.now()}.webm`);

                setUploadStatus('uploading');
                try {
                    const response = await api.post(`/recordings/upload/${id}`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    setUploadStatus('done');
                    resolve(response.data.filename); // Return the filename
                } catch (err) {
                    console.error('Failed to upload recording:', err);
                    setUploadStatus('failed');
                    resolve(null);
                }
            };

            // requestData flushes the last partial chunk, then stop fires onstop
            recorder.requestData();
            recorder.stop();
        });
    }, [id]);

    const submitExam = useCallback(async () => {
        if (submittingRef.current) return;
        submittingRef.current = true;
        setSubmitting(true);
        try {
            // Stop and upload recording before navigating away
            const recordingPath = await stopAndUploadRecording();

            const response = await api.post(`/results/submit/${id}`, {
                answers: answers,
                recordingPath: recordingPath
            });
            navigate(`/results/${response.data.id}`);
        } catch (error) {
            console.error('Error submitting exam:', error);
            alert('Failed to submit exam');
            submittingRef.current = false;
            setSubmitting(false);
        }
    }, [id, answers, navigate, stopAndUploadRecording]);

    // ── Timer ─────────────────────────────────────────────────
    useEffect(() => {
        if (timeLeft <= 0 && exam) {
            submitExam();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, exam, submitExam]);

    // ── Anti-Cheating: disable right-click & copy ─────────────
    useEffect(() => {
        const block = (e) => e.preventDefault();

        document.addEventListener('contextmenu', block);
        document.addEventListener('copy', block);
        document.addEventListener('cut', block);
        document.addEventListener('selectstart', block);

        return () => {
            document.removeEventListener('contextmenu', block);
            document.removeEventListener('copy', block);
            document.removeEventListener('cut', block);
            document.removeEventListener('selectstart', block);
        };
    }, []);

    // ── Anti-Cheating: auto-submit on window/tab switch ───────
    useEffect(() => {
        let warningTimer = null;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setSwitchWarning(true);
                warningTimer = setTimeout(() => {
                    submitExam();
                }, 3000);
            } else {
                clearTimeout(warningTimer);
                setSwitchWarning(false);
            }
        };

        const handleBlur = () => {
            setSwitchWarning(true);
            warningTimer = setTimeout(() => {
                submitExam();
            }, 3000);
        };

        const handleFocus = () => {
            clearTimeout(warningTimer);
            setSwitchWarning(false);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            clearTimeout(warningTimer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, [submitExam]);

    const handleAnswerChange = (questionId, option) => {
        setAnswers({ ...answers, [questionId]: option });
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
                <p style={{ color: '#64748b', fontWeight: '500' }}>Loading assessment...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );

    if (!exam) return <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Exam not found.</div>;

    // ── Uploading overlay (shown while recording is being sent) ─
    if (uploadStatus === 'uploading') return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', border: '4px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }} />
                <p style={{ color: '#0f172a', fontWeight: '700', fontSize: '1.125rem', marginBottom: '0.5rem' }}>Uploading proctoring recording…</p>
                <p style={{ color: '#64748b', fontWeight: '500', fontSize: '0.875rem' }}>Please wait, do not close this tab.</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );

    const currentQuestion = shuffledQuestions[currentQuestionIdx];

    return (
        <div
            style={{
                minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column',
                fontFamily: "'Inter', sans-serif",
                userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none'
            }}
        >
            {/* ── Global animation styles ──────────────────────── */}
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                @keyframes slideDown { from { transform: translateY(-120%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
                .timer-pulse { animation: pulse 1s infinite; }
                .rec-dot { animation: blink 1.2s ease-in-out infinite; }
            `}</style>

            {/* ── Window-switch warning banner ─────────────────── */}
            {switchWarning && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
                    background: 'linear-gradient(135deg,#dc2626,#b91c1c)',
                    color: '#fff', padding: '1rem 2rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                    boxShadow: '0 4px 20px rgba(220,38,38,0.35)',
                    animation: 'slideDown 0.3s ease'
                }}>
                    <EyeOff size={20} />
                    <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                        ⚠️ Tab switch detected! Your exam will be submitted automatically in 3 seconds.
                    </span>
                </div>
            )}

            {/* ── Test Header ──────────────────────────────── */}
            <header style={{
                height: '72px', background: '#fff', borderBottom: '1px solid #e2e8f0',
                padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,.02)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg,#6366f1,#4338ca)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={20} color="#fff" />
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>{exam.title}</h1>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>Question {currentQuestionIdx + 1} of {shuffledQuestions.length}</p>
                    </div>
                </div>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1.25rem',
                    borderRadius: '9999px', background: timeLeft < 300 ? '#fef2f2' : '#f0f9ff',
                    border: `1px solid ${timeLeft < 300 ? '#fee2e2' : '#e0f2fe'}`,
                    color: timeLeft < 300 ? '#ef4444' : '#0369a1',
                    transition: 'all .3s ease'
                }}>
                    <Clock size={18} className={timeLeft < 300 ? 'timer-pulse' : ''} />
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', fontFamily: 'monospace' }}>{formatTime(timeLeft)}</span>
                </div>

                <button
                    onClick={() => window.confirm('Are you sure you want to finish the test?') && submitExam()}
                    disabled={submitting}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.65rem 1.5rem', background: 'linear-gradient(135deg,#0f172a,#1e293b)',
                        color: '#fff', fontWeight: '700', fontSize: '0.875rem',
                        borderRadius: '0.875rem', border: 'none', cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(15,23,42,.2)', transition: 'transform .15s, opacity .15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                    <CheckCircle size={16} />
                    {submitting ? 'Submitting...' : 'Finish Test'}
                </button>
            </header>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* ── Main Content ────────────────────────────── */}
                <main style={{ flex: 1, overflowY: 'auto', padding: '2.5rem 2rem' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        {/* Question Card */}
                        <div style={{
                            background: '#fff', borderRadius: '1.5rem', border: '1px solid #e2e8f0',
                            padding: '2.5rem', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.05)',
                            minHeight: '400px', display: 'flex', flexDirection: 'column'
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '2.5rem' }}>
                                    <div style={{
                                        width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem',
                                        background: '#f1f5f9', color: '#6366f1', fontWeight: '800',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0, fontSize: '1.125rem'
                                    }}>
                                        {currentQuestionIdx + 1}
                                    </div>
                                    <h2 style={{ margin: 0, fontSize: '1.375rem', fontWeight: '700', color: '#0f172a', lineHeight: 1.45 }}>
                                        {currentQuestion.content}
                                    </h2>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginLeft: '3.75rem' }}>
                                    {currentQuestion.options.map((option, idx) => {
                                        const isSelected = answers[currentQuestion.id] === option;
                                        return (
                                            <label
                                                key={idx}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '1rem',
                                                    padding: '1.125rem 1.5rem', borderRadius: '1rem',
                                                    border: `2px solid ${isSelected ? '#6366f1' : '#f1f5f9'}`,
                                                    background: isSelected ? '#f5f7ff' : '#f8fafc',
                                                    cursor: 'pointer', transition: 'all .15s ease'
                                                }}
                                                onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; } }}
                                                onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#f1f5f9'; e.currentTarget.style.background = '#f8fafc'; } }}
                                            >
                                                <div style={{
                                                    width: '20px', height: '20px', borderRadius: '50%',
                                                    border: `2px solid ${isSelected ? '#6366f1' : '#cbd5e1'}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: isSelected ? '#6366f1' : '#fff', transition: 'all .15s'
                                                }}>
                                                    {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name={`question-${currentQuestion.id}`}
                                                    value={option}
                                                    checked={isSelected}
                                                    onChange={() => handleAnswerChange(currentQuestion.id, option)}
                                                    style={{ display: 'none' }}
                                                />
                                                <span style={{ fontSize: '1rem', fontWeight: isSelected ? '600' : '500', color: isSelected ? '#3730a3' : '#475569' }}>
                                                    {option}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Controls */}
                            <div style={{
                                marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #f1f5f9',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <button
                                    disabled={currentQuestionIdx === 0}
                                    onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.75rem 1.5rem', borderRadius: '0.875rem',
                                        border: '1px solid #e2e8f0', background: '#fff',
                                        color: '#64748b', fontWeight: '700', fontSize: '0.875rem',
                                        cursor: currentQuestionIdx === 0 ? 'not-allowed' : 'pointer',
                                        opacity: currentQuestionIdx === 0 ? 0.4 : 1, transition: 'all .15s'
                                    }}
                                    onMouseEnter={e => { if (currentQuestionIdx !== 0) e.currentTarget.style.background = '#f8fafc'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                                >
                                    <ChevronLeft size={18} /> Previous
                                </button>

                                {currentQuestionIdx === shuffledQuestions.length - 1 ? (
                                    <button
                                        onClick={() => window.confirm('Ready to submit?') && submitExam()}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.75rem 2rem', borderRadius: '0.875rem',
                                            border: 'none', background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                                            color: '#fff', fontWeight: '700', fontSize: '0.875rem',
                                            cursor: 'pointer', boxShadow: '0 4px 12px rgba(34,197,94,.3)'
                                        }}
                                    >
                                        Final Submit <CheckCircle size={18} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.75rem 2rem', borderRadius: '0.875rem',
                                            border: 'none', background: '#0f172a',
                                            color: '#fff', fontWeight: '700', fontSize: '0.875rem',
                                            cursor: 'pointer', transition: 'background .15s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#000'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#0f172a'}
                                    >
                                        Next <ChevronRight size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {/* ── Question Sidebar ────────────────────────── */}
                <aside style={{
                    width: '320px', background: '#fff', borderLeft: '1px solid #e2e8f0',
                    display: 'flex', flexDirection: 'column', padding: '2rem', overflowY: 'auto'
                }}>
                    <h3 style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Questions Overview
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.625rem', contentStart: 'start' }}>
                        {shuffledQuestions.map((q, idx) => {
                            const isAnswered = !!answers[q.id];
                            const isCurrent = currentQuestionIdx === idx;
                            return (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestionIdx(idx)}
                                    style={{
                                        width: '42px', height: '42px', borderRadius: '10px',
                                        border: isCurrent ? '2px solid #6366f1' : '1px solid #e2e8f0',
                                        background: isCurrent ? '#fff' : isAnswered ? '#6366f1' : '#f8fafc',
                                        color: isCurrent ? '#6366f1' : isAnswered ? '#fff' : '#64748b',
                                        fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer',
                                        transition: 'all .15s ease', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', transform: isCurrent ? 'scale(1.1)' : 'none',
                                        boxShadow: isCurrent ? '0 4px 12px rgba(99,102,241,.15)' : 'none'
                                    }}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Webcam proctoring preview ──────────── */}
                    <div style={{ marginTop: '1.5rem' }}>
                        {/* Camera preview card */}
                        <div style={{
                            borderRadius: '1rem', overflow: 'hidden',
                            background: '#0f172a', position: 'relative',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
                        }}>
                            {recordingStatus === 'recording' ? (
                                <>
                                    <video
                                        ref={videoPreviewRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        style={{ width: '100%', display: 'block', borderRadius: '1rem' }}
                                    />
                                    {/* Recording badge */}
                                    <div style={{
                                        position: 'absolute', top: '0.625rem', left: '0.625rem',
                                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                                        background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)',
                                        borderRadius: '9999px', padding: '0.25rem 0.75rem',
                                        color: '#fff', fontSize: '0.7rem', fontWeight: '700'
                                    }}>
                                        <span className="rec-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                                        REC
                                    </div>
                                    {/* Upload status badge */}
                                    {uploadStatus === 'done' && (
                                        <div style={{
                                            position: 'absolute', bottom: '0.625rem', right: '0.625rem',
                                            background: '#22c55e', borderRadius: '9999px',
                                            padding: '0.2rem 0.6rem', color: '#fff', fontSize: '0.65rem', fontWeight: '700'
                                        }}>✓ Saved</div>
                                    )}
                                </>
                            ) : (
                                <div style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    justifyContent: 'center', padding: '2rem 1rem', gap: '0.75rem'
                                }}>
                                    <MicOff size={28} color="#94a3b8" />
                                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.78rem', fontWeight: '500', textAlign: 'center' }}>
                                        {recordingStatus === 'pending' ? 'Starting camera…' : 'Camera unavailable'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Camera label */}
                        <div style={{
                            marginTop: '0.625rem',
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            color: recordingStatus === 'recording' ? '#16a34a' : '#94a3b8',
                            fontSize: '0.72rem', fontWeight: '700'
                        }}>
                            <Video size={13} />
                            {recordingStatus === 'recording' ? 'Proctoring camera active' : 'Camera initialising…'}
                        </div>
                    </div>

                    {/* Proctoring rules notice */}
                    <div style={{
                        marginTop: '1.25rem', padding: '1.25rem', borderRadius: '1rem',
                        background: '#fef2f2', border: '1px solid #fecaca', color: '#7f1d1d'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                            <EyeOff size={15} />
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Proctoring Active</span>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.72rem', lineHeight: 1.6, fontWeight: '500' }}>
                            <li>Camera &amp; microphone are being recorded</li>
                            <li>Right-click is disabled</li>
                            <li>Copy &amp; paste are disabled</li>
                            <li>Switching tabs/windows ends the test</li>
                        </ul>
                    </div>

                    <div style={{
                        marginTop: '1rem', padding: '1.25rem', borderRadius: '1rem',
                        background: '#fffbeb', border: '1px solid #fef3c7', color: '#92400e'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <AlertTriangle size={16} />
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase' }}>Attention</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.725rem', lineHeight: 1.5, fontWeight: '500' }}>
                            Progress is saved automatically. Do not refresh or close the tab before finishing.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default TestPlayer;
