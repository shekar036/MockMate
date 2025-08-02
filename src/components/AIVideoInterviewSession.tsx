import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, MessageSquare, Video, AlertCircle, Zap } from 'lucide-react';
import AudioRecorder from './AudioRecorder';
import FeedbackDisplay from './FeedbackDisplay';

interface AIVideoInterviewSessionProps {
  question: string;
  questionNumber: number;
  role: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  onAnswerSubmit: (answer: string, feedback: string, score: number) => void;
  onNext: () => void;
  isLast: boolean;
}

interface TavusConversation {
  conversation_id: string;
  conversation_url: string;
  status: string;
}

const AIVideoInterviewSession: React.FC<AIVideoInterviewSessionProps> = ({
  question,
  questionNumber,
  role,
  category,
  difficulty,
  onAnswerSubmit,
  onNext,
  isLast
}) => {
  const [answer, setAnswer] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<TavusConversation | null>(null);
  const [videoError, setVideoError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [creditsExhausted, setCreditsExhausted] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    initializeVideoInterview();
    
    return () => {
      // Cleanup conversation when component unmounts
      if (conversation?.conversation_id) {
        endConversation(conversation.conversation_id);
      }
    };
  }, [question]);

  const initializeVideoInterview = async () => {
    setIsInitializing(true);
    setVideoError('');
    setCreditsExhausted(false);
    
    try {
      const conversationData = await createTavusConversation();
      setConversation(conversationData);
    } catch (error) {
      console.error('Error initializing video interview:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('out of conversational credits')) {
          setCreditsExhausted(true);
          setVideoError('AI Video Interview is temporarily unavailable due to service limits. Quick Practice mode offers the same great questions with text and voice input!');
        } else if (error.message.includes('maximum concurrent conversations')) {
          setVideoError('Maximum concurrent interviews reached. Please close any other interview sessions and try again.');
        } else {
          setVideoError(`Failed to initialize video interview: ${error.message}`);
        }
      } else {
        setVideoError('Failed to initialize video interview. Please try again.');
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const createTavusConversation = async (): Promise<TavusConversation> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    const conversationContext = `You are Alex, a senior technical interviewer conducting a ${role} interview. 
    
Current Question: "${question}"
Category: ${category}
Difficulty: ${difficulty}

Please ask this question naturally and engage in a professional interview conversation. After the candidate responds, provide constructive feedback and a score from 1-10.`;

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/create-tavus-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          conversation_name: `MockMate ${role} Interview - Question ${questionNumber}`,
          conversational_context: conversationContext,
          properties: {
            max_call_duration: 600, // 10 minutes
            participant_left_timeout: 60,
            participant_absent_timeout: 30,
            enable_recording: false,
            language: "English"
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Tavus API error:', errorData);
        
        if (errorData.error?.includes('out of conversational credits')) {
          throw new Error('out of conversational credits');
        }
        
        throw new Error(`Tavus API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating Tavus conversation:', error);
      
      if (error instanceof Error && error.message.includes('out of conversational credits')) {
        throw new Error('out of conversational credits');
      }
      
      throw error;
    }
  };

  const endConversation = async (conversationId: string) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      await fetch(`${supabaseUrl}/functions/v1/end-tavus-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId
        }),
      });
    } catch (error) {
      console.error('Error ending conversation:', error);
    }
  };

  const generateFeedback = (userAnswer: string) => {
    // Mock AI feedback generation
    const feedbackOptions = [
      {
        text: "Good response! You demonstrated solid understanding of the topic. Consider providing more specific examples to strengthen your answer.",
        score: 7
      },
      {
        text: "Excellent answer! You showed deep knowledge and provided concrete examples. Your explanation was clear and well-structured.",
        score: 9
      },
      {
        text: "Your answer covers the basics well. To improve, try to elaborate on the practical applications and share more personal experience.",
        score: 6
      },
      {
        text: "Strong response with good technical depth. You could enhance it by discussing potential challenges and how you'd address them.",
        score: 8
      }
    ];

    return feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;

    setLoading(true);
    
    // End the conversation if it exists
    if (conversation?.conversation_id) {
      await endConversation(conversation.conversation_id);
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const feedbackData = generateFeedback(answer);
    setFeedback(feedbackData.text);
    setScore(feedbackData.score);
    setShowFeedback(true);
    
    // Save to database
    await onAnswerSubmit(answer, feedbackData.text, feedbackData.score);
    
    setLoading(false);
  };

  const handleNext = () => {
    setAnswer('');
    setShowFeedback(false);
    setFeedback('');
    setScore(0);
    setAudioBlob(null);
    setConversation(null);
    setVideoError('');
    onNext();
  };

  const handleUseQuickPractice = () => {
    // Navigate to Quick Practice mode
    window.location.reload(); // Simple way to restart and choose Quick Practice
  };

  if (isInitializing) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
            <h3 className="text-lg font-semibold text-white mb-2">Initializing AI Video Interview</h3>
            <p className="text-gray-400 text-center">
              Setting up your personalized video interview experience...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (videoError) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-red-500/30">
          <div className="flex flex-col items-center justify-center h-64">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {creditsExhausted ? 'Video Interview Temporarily Unavailable' : 'Video Interview Error'}
            </h3>
            <p className="text-gray-400 text-center mb-6 max-w-md">{videoError}</p>
            
            <div className="flex space-x-4">
              {creditsExhausted ? (
                <button
                  onClick={handleUseQuickPractice}
                  className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Use Quick Practice Instead
                </button>
              ) : (
                <button
                  onClick={initializeVideoInterview}
                  className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  <Video className="h-5 w-5 mr-2" />
                  Retry Video Interview
                </button>
              )}
            </div>
            
            {creditsExhausted && (
              <div className="mt-4 text-center">
                <p className="text-blue-400 text-sm">
                  💡 Quick Practice offers the same great questions with text and voice input!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Video Interview */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
        <div className="flex items-center mb-4">
          <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
            {questionNumber}
          </div>
          <h3 className="ml-3 text-xl font-semibold text-white">AI Video Interview</h3>
          <div className="ml-auto flex items-center text-green-400 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Live Session
          </div>
        </div>
        
        {conversation && (
          <div className="bg-black rounded-lg overflow-hidden">
            <iframe
              ref={iframeRef}
              src={conversation.conversation_url}
              className="w-full h-96"
              allow="camera; microphone; fullscreen"
              title="AI Video Interview"
            />
          </div>
        )}
        
        <div className="mt-4 p-4 bg-purple-600/10 border border-purple-500/30 rounded-lg">
          <p className="text-gray-300 text-sm">
            <strong>Current Question:</strong> {question}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {category} • {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level
          </p>
        </div>
      </div>

      {/* Answer Section */}
      <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
        {/* Answer Input */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <MessageSquare className="h-5 w-5 text-purple-400 mr-2" />
            <h4 className="text-lg font-medium text-white">Your Answer</h4>
          </div>
          
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="You can also type your answer here as a backup or for additional notes..."
            className="w-full h-32 p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
            disabled={showFeedback}
          />

          {/* Audio Recorder */}
          <div className="mt-4">
            <AudioRecorder
              onRecordingComplete={(blob, transcript) => {
                setAudioBlob(blob);
                if (transcript) {
                  setAnswer(prev => prev + (prev ? ' ' : '') + transcript);
                }
              }}
              disabled={showFeedback}
            />
          </div>
        </div>

        {/* Feedback Display */}
        {showFeedback && (
          <FeedbackDisplay
            feedback={feedback}
            score={score}
            onNext={handleNext}
            isLast={isLast}
          />
        )}

        {/* Submit Button */}
        {!showFeedback && (
          <div className="flex justify-end">
            <button
              onClick={handleSubmitAnswer}
              disabled={!answer.trim() || loading}
              className="inline-flex items-center bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Submit Answer
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIVideoInterviewSession;