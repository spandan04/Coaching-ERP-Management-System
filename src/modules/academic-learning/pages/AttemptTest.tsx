import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTest, addTestResult, getTestAttempt, startTestAttempt, updateTestAttempt } from '../services/academicService';
import { CheckCircle, ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import { useAuth } from '../../../services/authentication/AuthContext';

interface Question {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
}

interface Test {
  id: string;
  title: string;
  questions: Question[];
  duration?: number;
}

export const AttemptTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { studentData } = useAuth();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    const fetchTestAndAttempt = async () => {
      if (!id || !studentData?.id) return;
      try {
        const testData = await getTest(id);
        if (testData) {
          const t = testData as Test;
          setTest(t);
          
          // Check attempt
          const attempt = await getTestAttempt(id, studentData.id);
          if (attempt) {
            if (attempt.completed) {
              alert("You have already completed this test.");
              navigate('/student/tests');
              return;
            }
            setAttemptId(attempt.id);
            setAnswers(attempt.answers || {});
            
            // Calculate remaining time
            const durationMs = (t.duration || 30) * 60 * 1000;
            const startedAt = attempt.startedAt?.toMillis() || Date.now();
            const elapsed = Date.now() - startedAt;
            const remaining = Math.max(0, Math.floor((durationMs - elapsed) / 1000));
            setTimeRemaining(remaining);
            if (remaining === 0) {
              setIsTimeUp(true);
            }
          } else {
            // Create new attempt
            const duration = t.duration || 30;
            const newAttemptId = await startTestAttempt({
              testId: id,
              studentId: studentData.id,
              duration,
              answers: {}
            });
            setAttemptId(newAttemptId);
            setTimeRemaining(duration * 60);
          }
        } else {
          alert("Test not found!");
          navigate('/student/tests');
        }
      } catch (error) {
        console.error("Error fetching test:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTestAndAttempt();
  }, [id, studentData, navigate]);

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || submitting) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev && prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, submitting]);

  useEffect(() => {
    if (isTimeUp && !submitting) {
      alert("Time is over. Your test has been submitted automatically.");
      handleSubmit('time_expired');
    }
  }, [isTimeUp, submitting]);

  const handleSelectOption = (questionId: string, option: string) => {
    if (submitting || isTimeUp) return;
    const newAnswers = { ...answers, [questionId]: option };
    setAnswers(newAnswers);
    if (attemptId) {
      updateTestAttempt(attemptId, { answers: newAnswers }).catch(console.error);
    }
  };

  const handleSubmit = async (submissionType: 'manual' | 'time_expired' = 'manual') => {
    if (!test || submitting) return;
    
    if (submissionType === 'manual') {
      const answeredCount = Object.keys(answers).length;
      const unattemptedCount = test.questions.length - answeredCount;
      if (!window.confirm(`Are you sure you want to submit the test?\n\nAttempted: ${answeredCount}\nUnattempted: ${unattemptedCount}\nTotal: ${test.questions.length}`)) {
        return;
      }
    }

    setSubmitting(true);
    let score = 0;
    
    // Evaluate score
    test.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        score++;
      }
    });

    try {
      const percentage = Math.round((score / test.questions.length) * 100);
      const resultRef = await addTestResult({
        testId: test.id,
        testTitle: test.title,
        studentId: studentData?.id || 'admin-preview',
        score,
        totalQuestions: test.questions.length,
        percentage,
        answers,
        submissionType
      });
      
      if (attemptId) {
        await updateTestAttempt(attemptId, { completed: true, resultId: resultRef.id });
      }
      
      navigate(studentData ? `/student/tests/${resultRef.id}/result` : `/tests/${resultRef.id}/result`);
    } catch (error) {
      console.error("Error submitting test:", error);
      alert("Failed to submit test. Please try again.");
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  if (!test || test.questions.length === 0) return <div className="text-center py-12 text-slate-400">Test not available.</div>;

  const currentQuestion = test.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === test.questions.length - 1;
  const attemptedCount = Object.keys(answers).length;
  const unattemptedCount = test.questions.length - attemptedCount;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{test.title}</h1>
            <p className="text-sm text-slate-400 mt-1">Question {currentQuestionIndex + 1} of {test.questions.length}</p>
          </div>
          <div className="flex items-center gap-4">
            {timeRemaining !== null && (
              <div className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                <Clock className="w-4 h-4 animate-pulse" />
                <span className="font-mono font-bold text-lg">Time Remaining: {formatTime(timeRemaining)}</span>
              </div>
            )}
            <span className="text-sm font-medium text-emerald-400 hidden sm:inline-block">Test in progress</span>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg text-white font-medium mb-6 leading-relaxed">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {['A', 'B', 'C', 'D'].map(opt => {
              const optionText = currentQuestion[("option" + opt) as keyof Question];
              const isSelected = answers[currentQuestion.id] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => handleSelectOption(currentQuestion.id, opt)}
                  disabled={submitting || isTimeUp}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${
                    isSelected 
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-inner' 
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                    isSelected ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-slate-600 text-slate-500'
                  }`}>
                    {opt}
                  </div>
                  {optionText}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center justify-between text-sm mb-6 bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
          <div className="font-medium text-emerald-400">Attempted: {attemptedCount}</div>
          <div className="font-medium text-rose-400">Unattempted: {unattemptedCount}</div>
          <div className="font-medium text-white">Total: {test.questions.length}</div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-slate-800">
          <button 
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>
          
          <div className="flex items-center gap-3">
            {!isLastQuestion && (
              <button 
                onClick={() => setCurrentQuestionIndex(prev => Math.min(test.questions.length - 1, prev + 1))}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            )}
            
            <button 
              onClick={() => handleSubmit('manual')}
              disabled={submitting || isTimeUp}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" /> 
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Question Navigator */}
      <div className="flex justify-center gap-2 flex-wrap">
        {test.questions.map((q, idx) => {
          const isAnswered = !!answers[q.id];
          const isCurrent = currentQuestionIndex === idx;
          return (
            <button
              key={q.id}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`w-10 h-10 rounded-xl font-medium text-sm flex items-center justify-center transition-all ${
                isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950' : ''
              } ${
                isAnswered 
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                  : 'bg-slate-900 border border-slate-800 text-slate-500 hover:bg-slate-800'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};
