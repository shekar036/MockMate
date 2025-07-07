import React, { useState, useEffect } from 'react';
import { Play, ChevronDown, ArrowRight, RefreshCw } from 'lucide-react';
import RoleSelector from './RoleSelector';
import QuestionCard from './QuestionCard';
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

const InterviewSession: React.FC = () => {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  const startInterview = () => {
    if (!selectedRole) return;
    
    const roleQuestions = INTERVIEW_QUESTIONS[selectedRole as keyof typeof INTERVIEW_QUESTIONS];
    setQuestions(roleQuestions);
    setCurrentQuestion(0);
    setIsInterviewActive(true);
    setIsComplete(false);
    setSessionId(Date.now().toString());
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
    setCurrentQuestion(0);
    setQuestions([]);
    setIsInterviewActive(false);
    setIsComplete(false);
    setSessionId('');
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

  if (!isInterviewActive) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Welcome to MockMate!
            </h2>
            <p className="text-gray-300 text-lg">
              What role are you preparing for today?
            </p>
          </div>

          <RoleSelector
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
          />

          {selectedRole && (
            <div className="mt-8 text-center">
              <button
                onClick={startInterview}
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 transform hover:scale-105"
              >
                <Play className="h-5 w-5 mr-2" />
                Start Interview
              </button>
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
          <h2 className="text-2xl font-bold text-white">
            {selectedRole} Interview
          </h2>
          <div className="text-gray-400">
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>
        <ProgressBar 
          current={currentQuestion + 1} 
          total={questions.length} 
        />
      </div>

      <QuestionCard
        question={questions[currentQuestion]}
        questionNumber={currentQuestion + 1}
        onAnswerSubmit={saveAnswer}
        onNext={nextQuestion}
        isLast={currentQuestion === questions.length - 1}
      />
    </div>
  );
};

export default InterviewSession;