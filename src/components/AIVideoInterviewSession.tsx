import React, { useState, useEffect, useRef } from 'react';
import { Video, Mic, MicOff, Phone, PhoneOff, Loader, AlertCircle, CheckCircle, Play, Pause } from 'lucide-react';

interface AIVideoInterviewSessionProps {
  question: string;
  questionNumber: number;
  role: string;
  onAnswerSubmit: (answer: string, feedback: string, score: number) => void;
  onNext: () => void;
  isLast: boolean;
}

interface InterviewState {
  status: 'idle' | 'starting' | 'question' | 'listening' | 'thinking' | 'feedback' | 'complete';
  currentPhase: string;
}

const AIVideoInterviewSession: React.FC<AIVideoInterviewSessionProps> = ({
  question,
  questionNumber,
  role,
  onAnswerSubmit,
  onNext,
  isLast
}) => {
  const [interviewState, setInterviewState] = useState<InterviewState>({
    status: 'idle',
    currentPhase: 'Initializing...'
  });
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [finalFeedback, setFinalFeedback] = useState('');
  const [finalScore, setFinalScore] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeVideoInterview();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeVideoInterview = async () => {
    try {
      setInterviewState({ status: 'starting', currentPhase: 'Setting up camera...' });
      
      // Get user media for local video
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      localStreamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsVideoReady(true);
      
      // Start the interview sequence
      setTimeout(() => {
        startInterviewSequence();
      }, 1000);
      
    } catch (error) {
      console.error('Error initializing video interview:', error);
      setInterviewState({ 
        status: 'idle', 
        currentPhase: 'Failed to access camera. Please check permissions.' 
      });
    }
  };

  const startInterviewSequence = () => {
    // Phase 1: AI introduces the question
    setInterviewState({ status: 'question', currentPhase: 'AI is asking the question...' });
    
    // Simulate AI speaking the question (3-5 seconds)
    phaseTimerRef.current = setTimeout(() => {
      setInterviewState({ status: 'listening', currentPhase: 'Your turn to respond...' });
    }, 4000);
  };

  const startRecording = async () => {
    if (!localStreamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(localStreamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        // Here you could process the audio if needed
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      
      // Move to AI thinking phase
      setInterviewState({ status: 'thinking', currentPhase: 'AI is analyzing your response...' });
      
      // Simulate AI processing time
      setTimeout(() => {
        generateFeedback();
      }, 3000);
    }
  };

  const generateFeedback = () => {
    // Generate mock feedback
    const mockFeedback = generateMockFeedback();
    setFinalFeedback(mockFeedback.text);
    setFinalScore(mockFeedback.score);
    
    setInterviewState({ status: 'feedback', currentPhase: 'AI is providing feedback...' });
    
    // Show feedback phase
    setTimeout(() => {
      setSessionComplete(true);
      setInterviewState({ status: 'complete', currentPhase: 'Interview complete!' });
    }, 2000);
  };

  const generateMockFeedback = () => {
    const feedbackOptions = [
      {
        text: "Excellent video interview performance! Your communication skills were clear and professional. You maintained good eye contact and provided detailed responses. Your technical knowledge came through well in the conversation.",
        score: 8
      },
      {
        text: "Good video interview! You demonstrated solid understanding of the role requirements. Your responses were well-structured and you showed enthusiasm for the position. Consider providing more specific examples in future interviews.",
        score: 7
      },
      {
        text: "Strong video interview performance! You handled the real-time conversation well and showed good problem-solving skills. Your technical explanations were clear and you asked thoughtful questions.",
        score: 9
      }
    ];

    return feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
  };

  const submitTextResponse = () => {
    if (!userResponse.trim()) return;
    
    setInterviewState({ status: 'thinking', currentPhase: 'AI is analyzing your response...' });
    
    setTimeout(() => {
      generateFeedback();
    }, 3000);
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    
    if (phaseTimerRef.current) {
      clearTimeout(phaseTimerRef.current);
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVideoReady && interviewState.status === 'starting') {
    return (
      <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
        <div className="flex flex-col items-center justify-center h-64">
          <Loader className="h-12 w-12 text-purple-400 animate-spin mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Setting Up AI Video Interview</h3>
          <p className="text-gray-400 text-center mb-4">
            Preparing your camera and AI interviewer...
          </p>
          <p className="text-purple-400 text-sm">{interviewState.currentPhase}</p>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">AI Video Interview Complete!</h3>
          <p className="text-gray-400">
            Great job completing your AI video interview session.
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-6 border border-purple-500/30 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">AI Interview Feedback</h4>
            <div className="text-2xl font-bold text-purple-400">
              {finalScore}/10
            </div>
          </div>
          <p className="text-gray-300 leading-relaxed">
            {finalFeedback}
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={async () => {
              await onAnswerSubmit(
                userResponse || 'Video interview response recorded', 
                finalFeedback, 
                finalScore
              );
              onNext();
            }}
            className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {isLast ? 'Complete Interview' : 'Next Question'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Video Interview Interface */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold mr-4">
              {questionNumber}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">AI Video Interview</h3>
              <p className="text-gray-400 text-sm">{role} - Real-time Conversation</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              interviewState.status === 'listening' ? 'bg-green-400 animate-pulse' : 
              interviewState.status === 'thinking' ? 'bg-yellow-400 animate-pulse' : 
              interviewState.status === 'question' ? 'bg-blue-400 animate-pulse' :
              'bg-gray-400'
            }`}></div>
            <span className="text-sm text-gray-400">
              {interviewState.currentPhase}
            </span>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
          {/* AI Interviewer Section */}
          <div className="absolute inset-0 grid grid-cols-2">
            {/* AI Interviewer Side */}
            <div className="bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center border-r-2 border-purple-500">
              <div className="text-center">
                {interviewState.status === 'question' && (
                  <div className="animate-pulse">
                    <div className="w-24 h-24 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Video className="h-12 w-12 text-white" />
                    </div>
                    <p className="text-white font-medium">AI Interviewer</p>
                    <p className="text-purple-300 text-sm">Speaking...</p>
                  </div>
                )}
                
                {interviewState.status === 'listening' && (
                  <div>
                    <div className="w-24 h-24 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Mic className="h-12 w-12 text-white" />
                    </div>
                    <p className="text-white font-medium">AI Interviewer</p>
                    <p className="text-green-300 text-sm">Listening...</p>
                  </div>
                )}
                
                {interviewState.status === 'thinking' && (
                  <div className="animate-pulse">
                    <div className="w-24 h-24 bg-yellow-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Loader className="h-12 w-12 text-white animate-spin" />
                    </div>
                    <p className="text-white font-medium">AI Interviewer</p>
                    <p className="text-yellow-300 text-sm">Analyzing...</p>
                  </div>
                )}
                
                {interviewState.status === 'feedback' && (
                  <div className="animate-pulse">
                    <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <CheckCircle className="h-12 w-12 text-white" />
                    </div>
                    <p className="text-white font-medium">AI Interviewer</p>
                    <p className="text-blue-300 text-sm">Providing Feedback...</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* User Video Side */}
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                You
              </div>
              {isRecording && (
                <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm animate-pulse">
                  REC {formatTime(recordingTime)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition-colors duration-200 ${
              isMuted 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <MicOff className="h-5 w-5 text-white" />
            ) : (
              <Mic className="h-5 w-5 text-white" />
            )}
          </button>
          
          {interviewState.status === 'listening' && !isRecording && (
            <button
              onClick={startRecording}
              className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <Mic className="h-4 w-4 mr-2" />
              Start Recording Response
            </button>
          )}
          
          {isRecording && (
            <button
              onClick={stopRecording}
              className="flex items-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 animate-pulse"
            >
              <Phone className="h-4 w-4 mr-2" />
              Stop Recording
            </button>
          )}
        </div>
      </div>

      {/* Question Display */}
      <div className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
        <h4 className="text-white font-medium mb-3 flex items-center">
          <Video className="h-5 w-5 text-purple-400 mr-2" />
          Interview Question:
        </h4>
        <p className="text-gray-300 text-lg leading-relaxed">{question}</p>
      </div>

      {/* Text Response Option */}
      {interviewState.status === 'listening' && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h4 className="text-white font-medium mb-4">Alternative: Type Your Response</h4>
          <textarea
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            placeholder="If you prefer, you can type your response here instead of recording..."
            className="w-full h-32 p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={submitTextResponse}
              disabled={!userResponse.trim()}
              className="inline-flex items-center bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Submit Text Response
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIVideoInterviewSession;