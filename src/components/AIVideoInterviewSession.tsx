import React, { useState, useEffect, useRef } from 'react';
import { Video, Mic, MicOff, Phone, PhoneOff, Loader, AlertCircle, CheckCircle } from 'lucide-react';

interface AIVideoInterviewSessionProps {
  question: string;
  questionNumber: number;
  role: string;
  onAnswerSubmit: (answer: string, feedback: string, score: number) => void;
  onNext: () => void;
  isLast: boolean;
}

interface ConversationState {
  conversationId: string;
  status: 'idle' | 'connecting' | 'connected' | 'ended' | 'error';
  error?: string;
}

const AIVideoInterviewSession: React.FC<AIVideoInterviewSessionProps> = ({
  question,
  questionNumber,
  role,
  onAnswerSubmit,
  onNext,
  isLast
}) => {
  const [conversation, setConversation] = useState<ConversationState>({
    conversationId: '',
    status: 'idle'
  });
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [finalFeedback, setFinalFeedback] = useState('');
  const [finalScore, setFinalScore] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const conversationIdRef = useRef<string>('');

  useEffect(() => {
    initializeVideoInterview();
    
    return () => {
      cleanupWithConversationEnd();
    };
  }, []);

  const initializeVideoInterview = async () => {
    try {
      setConversation(prev => ({ ...prev, status: 'connecting' }));
      
      // Get user media for local video
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      localStreamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Create Tavus conversation
      await createTavusConversation();
      
    } catch (error) {
      console.error('Error initializing video interview:', error);
      setConversation(prev => ({ 
        ...prev, 
        status: 'error', 
        error: 'Failed to initialize video interview. Please check camera/microphone permissions.' 
      }));
    }
  };

  const createTavusConversation = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const personaId = 'p3d4ffc5df47'; // Your persona ID

      const conversationData = {
        persona_id: personaId,
        conversation_name: `MockMate ${role} Interview - Session ${Date.now()}`,
        conversational_context: `You are an experienced ${role} interviewer conducting a professional job interview. Your role is to:

1. Ask the following interview question in a natural, conversational way: "${question}"

2. Listen carefully to the candidate's response and provide follow-up questions if needed to get more detailed answers

3. After the candidate has fully answered the question, provide constructive feedback on their response including:
   - What they did well
   - Areas for improvement
   - Specific suggestions for strengthening their answer
   - A score from 1-10 based on the quality and completeness of their response

4. Maintain a professional but friendly tone throughout the interview

5. Keep the conversation focused on the specific question and the candidate's technical/professional experience related to ${role}

6. End the conversation naturally after providing feedback and scoring

Remember: This is a mock interview for practice, so be encouraging while still providing honest, constructive feedback.`,
        properties: {
          max_call_duration: 1200, // 20 minutes
          participant_left_timeout: 60,
          participant_absent_timeout: 30,
          enable_recording: false,
          language: "English"
        }
      };

      const response = await fetch(`${supabaseUrl}/functions/v1/create-tavus-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(conversationData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Tavus API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('Conversation created:', data);
      
      conversationIdRef.current = data.conversation_id;
      setConversation(prev => ({
        ...prev,
        conversationId: data.conversation_id,
        status: 'connected'
      }));
      
      setIsVideoReady(true);
      
      // Start monitoring conversation status
      monitorConversation(data.conversation_id);
      
    } catch (error) {
      console.error('Error creating Tavus conversation:', error);
      
      let errorMessage = 'Failed to initialize video interview. Please check camera/microphone permissions.';
      
      // Handle specific API errors
      if (error instanceof Error && error.message.includes('User has reached maximum concurrent conversations')) {
        errorMessage = 'You have too many active video interviews. Please wait a moment and try again, or refresh the page to clear any stuck sessions.';
      } else if (error instanceof Error && error.message.includes('Tavus API error')) {
        errorMessage = `Video interview service error. Please try again in a moment.`;
      }
      
      setConversation(prev => ({ 
        ...prev, 
        status: 'error', 
        error: errorMessage
      }));
    }
  };

  const monitorConversation = async (conversationId: string) => {
    const maxAttempts = 60; // 10 minutes max wait time
    let attempts = 0;
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    const poll = async () => {
      try {
        attempts++;
        setGenerationStatus(`Processing... (${attempts}/${maxAttempts})`);
        
        const response = await fetch(`${supabaseUrl}/functions/v1/get-tavus-conversation?conversation_id=${conversationId}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.status === 'ended') {
            handleConversationEnd(data);
            return;
          }
        }
        
        // Continue monitoring if conversation is still active
        setTimeout(poll, 5000);
        
      } catch (error) {
        console.error('Error monitoring conversation:', error);
      }
    };
    
    // Start monitoring after a delay
    setTimeout(poll, 10000);
  };

  const handleConversationEnd = async (conversationData: any) => {
    setConversation(prev => ({ ...prev, status: 'ended' }));
    setSessionComplete(true);
    
    // Generate feedback based on conversation (mock implementation)
    const mockFeedback = generateMockFeedback();
    setFinalFeedback(mockFeedback.text);
    setFinalScore(mockFeedback.score);
    
    // Save to database
    await onAnswerSubmit(
      'Video interview response recorded', 
      mockFeedback.text, 
      mockFeedback.score
    );
    
    cleanup();
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

  const endInterview = async () => {
    await endTavusConversation();
    handleConversationEnd({});
  };

  const endTavusConversation = async () => {
    const conversationId = conversationIdRef.current || conversation.conversationId;
    if (conversationId) {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        
        await fetch(`${supabaseUrl}/functions/v1/end-tavus-conversation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ conversation_id: conversationId }),
        });
        
        conversationIdRef.current = '';
        
      } catch (error) {
        console.error('Error ending conversation:', error);
      }
    }
  };

  const cleanupWithConversationEnd = async () => {
    await endTavusConversation();
    cleanup();
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
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

  if (conversation.status === 'error') {
    return (
      <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-red-500/30">
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Video Interview Failed</h3>
          <p className="text-gray-400 text-center mb-4">{conversation.error}</p>
          <button
            onClick={initializeVideoInterview}
            className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
          >
            <Video className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Video Interview Complete!</h3>
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
            onClick={onNext}
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
              conversation.status === 'connected' ? 'bg-green-400 animate-pulse' : 
              conversation.status === 'connecting' ? 'bg-yellow-400 animate-pulse' : 
              'bg-gray-400'
            }`}></div>
            <span className="text-sm text-gray-400 capitalize">
              {conversation.status === 'connecting' ? 'Connecting...' : conversation.status}
            </span>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
          {conversation.status === 'connecting' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Loader className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
                <p className="text-white">Connecting to AI Interviewer...</p>
                <p className="text-gray-400 text-sm mt-2">Please wait while we set up your video interview</p>
              </div>
            </div>
          )}
          
          {/* Local Video */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* AI Interviewer Placeholder */}
          {isVideoReady && (
            <div className="absolute top-4 right-4 w-32 h-24 bg-gray-700 rounded-lg border-2 border-purple-500 flex items-center justify-center">
              <div className="text-center">
                <Video className="h-6 w-6 text-purple-400 mx-auto mb-1" />
                <p className="text-xs text-white">AI Interviewer</p>
              </div>
            </div>
          )}
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
          
          <button
            onClick={endInterview}
            className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            disabled={conversation.status !== 'connected'}
          >
            <PhoneOff className="h-4 w-4 mr-2" />
            End Interview
          </button>
        </div>
      </div>

      {/* Question Context */}
      <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
        <h4 className="text-white font-medium mb-2">Interview Question:</h4>
        <p className="text-gray-300 text-sm">{question}</p>
      </div>
    </div>
  );
};

export default AIVideoInterviewSession;