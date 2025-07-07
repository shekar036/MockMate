import React, { useState } from 'react';
import { Mic, MicOff, Play, Pause, ArrowRight, MessageSquare } from 'lucide-react';
import AudioRecorder from './AudioRecorder';
import FeedbackDisplay from './FeedbackDisplay';
import TavusVideoPlayer from './TavusVideoPlayer';

interface QuestionCardProps {
  question: string;
  questionNumber: number;
  onAnswerSubmit: (answer: string, feedback: string, score: number) => void;
  onNext: () => void;
  isLast: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  onAnswerSubmit,
  onNext,
  isLast
}) => {
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

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
    setVideoReady(false);
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* AI Video Interviewer */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
        <div className="flex items-center mb-4">
          <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
            {questionNumber}
          </div>
          <h3 className="ml-3 text-xl font-semibold text-white">AI Interviewer</h3>
        </div>
        
        <TavusVideoPlayer
          question={question}
          onVideoReady={() => setVideoReady(true)}
          onVideoEnd={() => {
            // Auto-focus on answer input when video ends
            const textarea = document.querySelector('textarea');
            textarea?.focus();
          }}
          className="mb-4"
        />
      </div>

      {/* Answer Section */}
      <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
        {/* Answer Input */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <MessageSquare className="h-5 w-5 text-blue-400 mr-2" />
            <h4 className="text-lg font-medium text-white">Your Answer</h4>
          </div>
          
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here or use the voice recorder below..."
            className="w-full h-32 p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
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
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
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

export default QuestionCard;