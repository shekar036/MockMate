import React from 'react';
import { Star, ArrowRight, RotateCcw, Volume2 } from 'lucide-react';

interface FeedbackDisplayProps {
  feedback: string;
  score: number;
  onNext: () => void;
  isLast: boolean;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({
  feedback,
  score,
  onNext,
  isLast
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    return 'Needs Improvement';
  };

  const speakFeedback = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(feedback);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-6 border border-blue-500/30">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-white">AI Feedback</h4>
        <div className="flex items-center space-x-4">
          <button
            onClick={speakFeedback}
            className="flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200"
            title="Listen to feedback"
          >
            <Volume2 className="h-5 w-5" />
          </button>
          <div className="flex items-center">
            <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
              {score}/10
            </div>
            <div className="ml-2 flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(score / 2) 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
          score >= 8 
            ? 'bg-green-600/20 text-green-400' 
            : score >= 6 
              ? 'bg-yellow-600/20 text-yellow-400' 
              : 'bg-red-600/20 text-red-400'
        }`}>
          {getScoreDescription(score)}
        </div>
      </div>

      <p className="text-gray-300 mb-6 leading-relaxed">
        {feedback}
      </p>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
        >
          {isLast ? (
            <>
              <RotateCcw className="h-5 w-5 mr-2" />
              Complete Interview
            </>
          ) : (
            <>
              <ArrowRight className="h-5 w-5 mr-2" />
              Next Question
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FeedbackDisplay;