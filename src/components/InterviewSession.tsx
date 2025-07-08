import React, { useState, useEffect } from 'react';
import { Play, ChevronDown, ArrowRight, RefreshCw, RotateCcw, MessageSquare, Video, Clock, Zap } from 'lucide-react';
import RoleSelector from './RoleSelector';
import QuickPracticeSession from './QuickPracticeSession';
import AIVideoInterviewSession from './AIVideoInterviewSession';
import ProgressBar from './ProgressBar';
import { useSupabase } from '../contexts/SupabaseContext';
import { useAuth } from '../hooks/useAuth';

const INTERVIEW_QUESTIONS = {
  'Frontend Developer': [
    'Tell me about your experience with React and modern frontend frameworks.',
    'How do you handle state management in large React applications?',
    'Explain the difference between client-side and server-side rendering.',
    'How do you optimize web application performance?',
    'Describe your approach to responsive design and CSS architecture.'
  ],
  'Backend Developer': [
    'Explain your experience with API design and RESTful services.',
    'How do you handle database optimization and scaling?',
    'Describe your approach to error handling and logging.',
    'How do you ensure security in backend applications?',
    'Explain your experience with microservices architecture.'
  ],
  'Data Scientist': [
    'Describe your experience with machine learning algorithms.',
    'How do you handle data cleaning and preprocessing?',
    'Explain your approach to model validation and evaluation.',
    'How do you communicate complex findings to non-technical stakeholders?',
    'Describe a challenging data science project you\'ve worked on.'
  ],
  'DevOps Engineer': [
    'Explain your experience with containerization and orchestration.',
    'How do you implement CI/CD pipelines?',
    'Describe your approach to monitoring and alerting.',
    'How do you handle infrastructure as code?',
    'Explain your experience with cloud platforms and services.'
  ]
};

interface InProgressSession {
  sessionId: string;
  role: string;
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: number;
  lastActivity: string;
}

const InterviewSession: React.FC = () => {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [sessionMode, setSessionMode] = useState<'quick' | 'video' | ''>('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [inProgressSessions, setInProgressSessions] = useState<InProgressSession[]>([]);
  const [showResumeOptions, setShowResumeOptions] = useState(false);

  useEffect(() => {
    if (user) {
      checkForInProgressSessions();
    }
  }, [user]);

  const checkForInProgressSessions = async () => {
    if (!user) return;

    try {
      // Get all sessions from the last 24 hours
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data: recentSessions, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!recentSessions || recentSessions.length === 0) return;

      // Group by session_id and find incomplete sessions
      const sessionGroups = recentSessions.reduce((acc, session) => {
        if (!acc[session.session_id]) {
          acc[session.session_id] = {
            role: session.role,
            questions: [],
            lastActivity: session.created_at
          };
        }
        acc[session.session_id].questions.push(session);
        // Update last activity to the most recent question
        if (session.created_at > acc[session.session_id].lastActivity) {
          acc[session.session_id].lastActivity = session.created_at;
        }
        return acc;
      }, {} as any);

      const inProgress: InProgressSession[] = [];

      Object.entries(sessionGroups).forEach(([sessionId, data]: [string, any]) => {
        const role = data.role;
        const totalQuestions = INTERVIEW_QUESTIONS[role as keyof typeof INTERVIEW_QUESTIONS]?.length || 5;
        const answeredQuestions = data.questions.length;

        // If session is incomplete (less than total questions)
        if (answeredQuestions < totalQuestions) {
          inProgress.push({
            sessionId,
            role,
            currentQuestion: answeredQuestions,
            totalQuestions,
            answeredQuestions,
            lastActivity: data.lastActivity
          });
        }
      });

      setInProgressSessions(inProgress);
      if (inProgress.length > 0) {
        setShowResumeOptions(true);
      }
    } catch (error) {
      console.error('Error checking for in-progress sessions:', error);
    }
  };

  const resumeSession = (session: InProgressSession) => {
    const roleQuestions = INTERVIEW_QUESTIONS[session.role as keyof typeof INTERVIEW_QUESTIONS];
    setQuestions(roleQuestions);
    setSelectedRole(session.role);
    setCurrentQuestion(session.currentQuestion);
    setSessionId(session.sessionId);
    setIsInterviewActive(true);
    setIsComplete(false);
    setShowResumeOptions(false);
  };

  const startNewInterview = () => {
    if (!selectedRole || !sessionMode) return;
    
    const roleQuestions = INTERVIEW_QUESTIONS[selectedRole as keyof typeof INTERVIEW_QUESTIONS];
    setQuestions(roleQuestions);
    setCurrentQuestion(0);
    setIsInterviewActive(true);
    setIsComplete(false);
    setSessionId(Date.now().toString());
    setShowResumeOptions(false);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsComplete(true);
    }
  };

  const resetInterview = () => {
    setSelectedRole('');
    setSessionMode('');
    setCurrentQuestion(0);
    setQuestions([]);
    setIsInterviewActive(false);
    setIsComplete(false);
    setSessionId('');
    setShowResumeOptions(false);
    // Check for new in-progress sessions
    checkForInProgressSessions();
  };

  const saveAnswer = async (answer: string, feedback: string, score: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('interview_sessions')
        .insert({
          user_id: user.id,
          role: selectedRole,
          question: questions[currentQuestion],
          user_answer: answer,
          feedback_text: feedback,
          score: score,
          session_id: sessionId
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const dismissResumeOptions = () => {
    setShowResumeOptions(false);
  };

  // Show resume options if available
  if (showResumeOptions && inProgressSessions.length > 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔄</div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Resume Your Interview?
            </h2>
            <p className="text-gray-300 text-lg">
              We found {inProgressSessions.length} incomplete interview session{inProgressSessions.length > 1 ? 's' : ''} from the last 24 hours.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {inProgressSessions.map((session) => (
              <div
                key={session.sessionId}
                className="bg-gray-700/50 rounded-lg p-6 border border-gray-600"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {session.role}
                    </h3>
                    <p className="text-gray-400">
                      Progress: {session.answeredQuestions} of {session.totalQuestions} questions completed
                    </p>
                    <p className="text-gray-500 text-sm">
                      Last activity: {new Date(session.lastActivity).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400 mb-1">
                      {Math.round((session.answeredQuestions / session.totalQuestions) * 100)}%
                    </div>
                    <div className="text-gray-400 text-sm">Complete</div>
                  </div>
                </div>

                <div className="mb-4">
                  <ProgressBar 
                    current={session.answeredQuestions} 
                    total={session.totalQuestions} 
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => resumeSession(session)}
                    className="flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Resume Interview
                  </button>
                  <button
                    onClick={() => {
                      // Start fresh with the same role
                      setSelectedRole(session.role);
                      setShowResumeOptions(false);
                    }}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Start Fresh
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={dismissResumeOptions}
              className="flex items-center bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Choose Different Role
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isInterviewActive) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Choose Your Interview Experience
            </h2>
            <p className="text-gray-300 text-lg">
              Select your preferred interview mode and role
            </p>
          </div>

          {/* Session Mode Selection */}
          {!sessionMode && (
            <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Choose Interview Mode
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quick Practice Mode */}
                <button
                  onClick={() => setSessionMode('quick')}
                  className="p-6 rounded-xl border-2 border-gray-600 bg-gray-700/50 hover:border-blue-500 hover:bg-blue-600/10 transition-all duration-200 text-left group hover:scale-105"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-600 p-3 rounded-lg group-hover:bg-blue-500 transition-colors">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-white mb-2">
                        Quick Practice
                      </h4>
                      <p className="text-gray-400 text-sm mb-4">
                        Fast-paced practice with text or voice responses. Perfect for quick skill assessment and practice.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center text-green-400 text-sm">
                          <Clock className="h-4 w-4 mr-2" />
                          5-10 minutes
                        </div>
                        <div className="flex items-center text-blue-400 text-sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Text & Voice Input
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* AI Video Interview Mode */}
                <button
                  onClick={() => setSessionMode('video')}
                  className="p-6 rounded-xl border-2 border-gray-600 bg-gray-700/50 hover:border-purple-500 hover:bg-purple-600/10 transition-all duration-200 text-left group hover:scale-105"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-600 p-3 rounded-lg group-hover:bg-purple-500 transition-colors">
                      <Video className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-white mb-2">
                        AI Video Interview
                      </h4>
                      <p className="text-gray-400 text-sm mb-4">
                        Real-time video conversation with AI interviewer. Most realistic interview experience.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center text-green-400 text-sm">
                          <Clock className="h-4 w-4 mr-2" />
                          15-20 minutes
                        </div>
                        <div className="flex items-center text-purple-400 text-sm">
                          <Video className="h-4 w-4 mr-2" />
                          Real-time Video Chat
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Role Selection */}
          {sessionMode && !selectedRole && (
            <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Select Your Role
                </h3>
                <button
                  onClick={() => setSessionMode('')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ← Back to Mode Selection
                </button>
              </div>
              
              <RoleSelector
                selectedRole={selectedRole}
                onRoleChange={setSelectedRole}
              />
            </div>
          )}

          {/* Start Interview Button */}
          {sessionMode && selectedRole && (
            <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center bg-gray-700 rounded-lg p-4 mb-4">
                    {sessionMode === 'quick' ? (
                      <Zap className="h-6 w-6 text-blue-400 mr-3" />
                    ) : (
                      <Video className="h-6 w-6 text-purple-400 mr-3" />
                    )}
                    <div className="text-left">
                      <div className="text-white font-medium">
                        {sessionMode === 'quick' ? 'Quick Practice' : 'AI Video Interview'}
                      </div>
                      <div className="text-gray-400 text-sm">{selectedRole}</div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={startNewInterview}
                  className={`inline-flex items-center font-medium py-3 px-6 rounded-lg transition-colors duration-200 transform hover:scale-105 ${
                    sessionMode === 'quick' 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start {sessionMode === 'quick' ? 'Quick Practice' : 'AI Video Interview'}
                </button>
                
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setSelectedRole('');
                      setSessionMode('');
                    }}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    ← Change selection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Interview Complete!
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            Great job completing your {selectedRole} mock interview. 
            Check your history to review your performance.
          </p>
          <button
            onClick={resetInterview}
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Start New Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {sessionMode === 'quick' ? 'Quick Practice' : 'AI Video Interview'}
            </h2>
            <p className="text-gray-400">{selectedRole}</p>
          </div>
          <div className="text-gray-400">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>
        <ProgressBar 
          current={currentQuestion + 1} 
          total={questions.length} 
        />
      </div>

      {sessionMode === 'quick' ? (
        <QuickPracticeSession
          question={questions[currentQuestion]}
          questionNumber={currentQuestion + 1}
          onAnswerSubmit={saveAnswer}
          onNext={nextQuestion}
          isLast={currentQuestion === questions.length - 1}
        />
      ) : (
        <AIVideoInterviewSession
          question={questions[currentQuestion]}
          questionNumber={currentQuestion + 1}
          role={selectedRole}
          onAnswerSubmit={saveAnswer}
          onNext={nextQuestion}
          isLast={currentQuestion === questions.length - 1}
        />
      )}
    </div>
  );
};

export default InterviewSession;