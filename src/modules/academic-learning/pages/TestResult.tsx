import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTestResult } from '../services/academicService';
import { Trophy, ArrowLeft, Target, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../../services/authentication/AuthContext';

interface TestResultType {
  id: string;
  testId: string;
  testTitle: string;
  score: number;
  totalQuestions: number;
}

export const TestResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { studentData } = useAuth();
  const [result, setResult] = useState<TestResultType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      if (!id) return;
      try {
        const data = await getTestResult(id);
        if (data) {
          setResult(data as TestResultType);
        } else {
          alert("Result not found!");
          navigate(studentData ? '/student/tests' : '/tests');
        }
      } catch (error) {
        console.error("Error fetching result:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id, navigate]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  if (!result) return <div className="text-center py-12 text-slate-400">Result not available.</div>;

  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  let feedbackMsg = '';
  let feedbackColor = '';
  let Icon = Target;

  if (percentage >= 90) {
    feedbackMsg = 'Outstanding Performance!';
    feedbackColor = 'text-yellow-400';
    Icon = Trophy;
  } else if (percentage >= 70) {
    feedbackMsg = 'Good Job! Well done.';
    feedbackColor = 'text-emerald-400';
    Icon = CheckCircle;
  } else if (percentage >= 40) {
    feedbackMsg = 'You passed, but keep practicing.';
    feedbackColor = 'text-blue-400';
    Icon = Target;
  } else {
    feedbackMsg = 'Needs Improvement. Review the topics.';
    feedbackColor = 'text-rose-400';
    Icon = XCircle;
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-900 rounded-3xl p-8 md:p-12 border border-slate-800 shadow-xl text-center relative overflow-hidden">
        {/* Background decorative blob */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto bg-slate-800/50 rounded-3xl flex items-center justify-center mb-6 border border-slate-700">
            <Icon className={`w-10 h-10 ${feedbackColor}`} />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">Test Completed!</h1>
          <p className="text-slate-400 text-sm font-medium mb-8">You have successfully submitted: <strong className="text-white">{result.testTitle}</strong></p>
          
          <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 mb-8 inline-block min-w-[240px]">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Your Score</div>
            <div className="flex items-baseline justify-center gap-1">
              <span className={`text-6xl font-bold tracking-tighter ${feedbackColor}`}>{result.score}</span>
              <span className="text-2xl font-medium text-slate-500">/ {result.totalQuestions}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="text-lg font-medium text-white">{percentage}%</div>
            </div>
          </div>
          
          <p className={`font-medium mb-8 ${feedbackColor}`}>{feedbackMsg}</p>
          
          <button 
            onClick={() => navigate(studentData ? '/student/tests' : '/tests')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tests
          </button>
        </div>
      </div>
    </div>
  );
};
