import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ClipboardList, Clock, Star, ArrowRight, CheckCircle2, Image as ImageIcon, Mic, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { collection, getDocs, doc, setDoc, updateDoc, increment, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { getFirebaseDb } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Survey, SurveyQuestion } from '../types';
import { seedSurveys } from '../lib/seedSurveys';

export default function Surveys() {
  const { user, profile } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [completedSurveys, setCompletedSurveys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const fetchSurveys = async () => {
      const db = getFirebaseDb();
      if (!db) return;

      try {
        // Ensure database is seeded
        await seedSurveys();
        
        const q = query(collection(db, 'surveys'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const fetchedSurveys = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Survey[];
        
        setSurveys(fetchedSurveys);
      } catch (e) {
        console.error('Error fetching surveys:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  // Load surveys already answered by the user
  useEffect(() => {
    const loadCompleted = async () => {
      if (!user) return;
      const db = getFirebaseDb();
      if (!db) return;
      try {
        const ansQuery = query(collection(db, 'user_answers'), where('userId', '==', user.uid));
        const ansSnap = await getDocs(ansQuery);
        const completed = new Set<string>();
        ansSnap.forEach(doc => {
          const data = doc.data() as any;
          if (data.surveyId) completed.add(data.surveyId);
        });
        setCompletedSurveys(completed);
      } catch (e) {
        console.error('Error loading completed surveys:', e);
      }
    };
    loadCompleted();
  }, [user]);
  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    if (activeSurvey && currentQuestion < activeSurvey.questions.length - 1) {
      setTimeout(() => setCurrentQuestion(prev => prev + 1), 300);
    } else {
      submitSurvey();
    }
  };

  const submitSurvey = async () => {
    if (!activeSurvey || !user) return;
    setSubmitting(true);
    
    const db = getFirebaseDb();
    if (!db) return;

    try {
      // 1. Save answers
      const answerRef = doc(collection(db, 'user_answers'));
      await setDoc(answerRef, {
        userId: user.uid,
        surveyId: activeSurvey.id,
        answers,
        completedAt: serverTimestamp()
      });

      // 2. Update user points
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        points: increment(activeSurvey.reward)
      });

      // 3. Mark survey as completed locally to prevent re‑open
      setCompletedSurveys(prev => new Set(prev).add(activeSurvey.id));

      setCompleted(true);
      setTimeout(() => {
        setActiveSurvey(null);
        setCompleted(false);
        setCurrentQuestion(0);
        setAnswers({});
      }, 3000);
    } catch (e) {
      console.error('Submission error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-brand animate-spin" />
        <p className="text-white/40 font-mono uppercase tracking-[0.3em] text-xs">Syncing Protocol Data...</p>
      </div>
    );
  }

  if (activeSurvey) {
    const question = activeSurvey.questions[currentQuestion];
    
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="space-y-8">
          <div className="flex justify-between items-center px-2">
            <button 
              onClick={() => {
                setActiveSurvey(null);
                setCurrentQuestion(0);
                setAnswers({});
              }}
              className="text-white/40 hover:text-white flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors"
            >
              Abort Mission
            </button>
            <div className="flex gap-1.5">
              {activeSurvey.questions.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1 w-8 rounded-full transition-all duration-500",
                    i <= currentQuestion ? "bg-brand shadow-brand" : "bg-white/10"
                  )} 
                />
              ))}
            </div>
            <span className="text-xs font-black font-mono text-brand">{currentQuestion + 1} / {activeSurvey.questions.length}</span>
          </div>

          <AnimatePresence mode="wait">
            {completed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-12 rounded-[40px] text-center space-y-6 border-brand/50 shadow-[0_0_50px_rgba(204,255,0,0.1)]"
              >
                <div className="w-20 h-20 bg-brand rounded-full mx-auto flex items-center justify-center text-black shadow-brand">
                  <CheckCircle2 size={40} strokeWidth={3} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter">Mission Accomplished</h2>
                  <p className="text-brand font-black text-xl">+{activeSurvey.reward} PROTOCOL POINTS</p>
                </div>
                <p className="text-white/40 text-sm italic">Synchronizing results with the blockchain...</p>
              </motion.div>
            ) : (
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card p-10 rounded-[40px] space-y-8 border border-white/10 relative overflow-hidden group"
              >
                <div className="space-y-2 relative z-10">
                  <span className="text-brand text-[10px] font-black uppercase tracking-[0.3em]">Question {currentQuestion + 1}</span>
                  <h2 className="text-2xl sm:text-3xl font-black leading-tight uppercase italic">{question.text}</h2>
                </div>
                
                <div className="space-y-3 relative z-10">
                  {question.type === 'multiple-choice' ? (
                    question.options?.map((option, i) => (
                      <button 
                        key={i}
                        disabled={submitting}
                        onClick={() => handleAnswer(question.id, option)}
                        className="w-full p-5 bg-white/5 hover:bg-brand text-white hover:text-black border border-white/5 hover:border-brand transition-all rounded-2xl text-left font-bold group flex justify-between items-center shadow-none hover:shadow-brand relative overflow-hidden"
                      >
                        <span className="relative z-10">{option}</span>
                        <ArrowRight className="relative z-10 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0" size={18} strokeWidth={3} />
                      </button>
                    ))
                  ) : (
                    <div className="space-y-4">
                      <textarea 
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 min-h-[150px] focus:outline-none focus:border-brand/40 transition-colors font-medium text-white/80"
                        placeholder="Enter your insights here..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            handleAnswer(question.id, (e.target as HTMLTextAreaElement).value);
                          }
                        }}
                      />
                      <button 
                        onClick={(e) => {
                          const val = (e.currentTarget.previousSibling as HTMLTextAreaElement).value;
                          handleAnswer(question.id, val);
                        }}
                        className="bg-brand text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-brand transition-all w-full"
                      >
                        Submit Response (Ctrl + Enter)
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Decorative background logo */}
                <ClipboardList className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity rotate-12" size={200} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 mb-10">
        <h1 className="text-5xl font-black uppercase tracking-tighter italic glow-text">Active Research</h1>
        <p className="text-white/40 font-medium italic">Contribute your insights to earn protocol points and unlock exclusive tiers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {surveys.map((survey) => (
          <motion.div 
            key={survey.id}
            whileHover={{ y: -8, scale: 1.01 }}
            className="glass-card p-10 rounded-[48px] flex flex-col h-full border border-white/10 group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="p-5 bg-brand/10 text-brand rounded-2xl group-hover:bg-brand group-hover:text-black transition-all shadow-none group-hover:shadow-brand">
                {survey.type === 'text' && <ClipboardList size={28} />}
                {survey.type === 'image' && <ImageIcon size={28} />}
                {survey.type === 'voice' && <Mic size={28} />}
              </div>
              <div className="bg-brand/5 border border-brand/20 px-4 py-1.5 rounded-full">
                <span className="text-brand font-black italic uppercase text-[10px] tracking-widest">{survey.questions.length} Units</span>
              </div>
            </div>

            <div className="flex-1 space-y-4 relative z-10">
              <h3 className="text-3xl font-black uppercase tracking-tight italic group-hover:text-brand transition-colors leading-none">{survey.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed font-medium line-clamp-2">{survey.description}</p>
            </div>

            <div className="mt-10 pt-10 border-t border-white/5 flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black">Est. Yield</p>
                <p className="font-black text-2xl text-brand tracking-tighter">+{survey.reward} PTS</p>
              </div>
              <button 
                onClick={() => setActiveSurvey(survey)}
                disabled={completedSurveys.has(survey.id)}
                className={`bg-white/5 hover:bg-brand text-white hover:text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/10 hover:border-brand hover:shadow-brand active:scale-95 ${completedSurveys.has(survey.id) ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {completedSurveys.has(survey.id) ? 'Completed' : 'Launch'}
              </button>
            </div>
            
            {/* Background pattern */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
               <Star size={120} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
