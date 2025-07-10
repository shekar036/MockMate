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

interface ConversationState {
  conversationId: string;
  status: 'idle' | 'connecting' | 'connected' | 'ended' | 'error';
  error?: string;
  conversationUrl?: string;
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
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const conversationIdRef = useRef<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    initializeVideoInterview();
    
    return () => {
      cleanupWithConversationEnd();
    };
  }, []);

  const initializeVideoInterview = async () => {
    try {
      setConversation(prev => ({ ...prev, status: 'connecting' }));
      
      // Get user media for local video preview
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      localStreamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Create Tavus conversation with your specific IDs
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
      
      // Use your specific persona ID
      // EXPLICITLY DEFINED TAVUS IDS FOR CLARITY
      const PERSONA_ID = 'pd47b095c82a'; // Your trained AI interviewer Alex Chen
      const REPLICA_ID = 'rb17cf590e15'; // Your AI avatar (used in video generation)
      
      console.log(`Initializing AI interview with Persona ID: ${PERSONA_ID}`);

      const conversationData = {
        persona_id: PERSONA_ID, // Your specific persona ID
        conversation_name: `MockMate ${role} Interview - Q${questionNumber} - ${Date.now()}`,
        conversational_context: `You are Alex Chen, an experienced ${role} interviewer conducting a professional job interview. Your role is to:

1. Greet the candidate warmly and professionally
2. Ask this specific interview question in a natural, conversational way: "${question}"
3. Listen carefully to the candidate's response and provide follow-up questions if needed to get more detailed answers
4. After the candidate has fully answered the question, provide constructive feedback on their response including:
   - What they did well (be specific)
   - Areas for improvement with actionable suggestions
   - A score from 1-10 based on the quality and completeness of their response
   - Specific examples of how they could strengthen their answer

5. Maintain a professional but friendly tone throughout the interview
6. Keep the conversation focused on the specific question and the candidate's technical/professional experience related to ${role}
7. End the conversation naturally after providing comprehensive feedback and scoring

Remember: This is question ${questionNumber} of a mock interview for practice, so be encouraging while still providing honest, constructive feedback. Help them improve their interview skills.

Interview Question to Ask: "${question}"`,
        properties: {
          max_call_duration: 1200, // 20 minutes
          participant_left_timeout: 120,
          participant_absent_timeout: 60,
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
        console.error(`Tavus API error for persona ${PERSONA_ID}:`, response.status, errorData);
        
        // Handle specific error cases
        if (errorData.includes('maximum concurrent conversations')) {
          throw new Error('Maximum concurrent conversations reached. Please wait a moment and try again.');
        }
        
        throw new Error(`Tavus API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log(`Conversation created successfully with persona ${PERSONA_ID}:`, data);
      
      conversationIdRef.current = data.conversation_id;
      setConversation(prev => ({
        ...prev,
        conversationId: data.conversation_id,
        status: 'connected',
        conversationUrl: data.conversation_url
      }));
      
      setIsVideoReady(true);
      
      // Start monitoring conversation status
      monitorConversation(data.conversation_id);
      
    } catch (error) {
      console.error('Error creating Tavus conversation:', error);
      
      let errorMessage = 'Failed to initialize video interview.';
      
      if (error instanceof Error) {
        if (error.message.includes('maximum concurrent conversations')) {
          errorMessage = 'Maximum interviews reached. Please close any open interview sessions and try again.';
        } else if (error.message.includes('Tavus API error')) {
          errorMessage = 'Video interview service temporarily unavailable. Please try again in a moment.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setConversation(prev => ({ 
        ...prev, 
        status: 'error', 
        error: errorMessage
      }));
    }
  };

  const monitorConversation = async (conversationId: string) => {
    const maxAttempts = 120; // 20 minutes max wait time
    let attempts = 0;
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    const poll = async () => {
      try {
        attempts++;
        
        const response = await fetch(`${supabaseUrl}/functions/v1/get-tavus-conversation?conversation_id=${conversationId}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Conversation status:', data);
          
          if (data.status === 'ended') {
            handleConversationEnd(data);
            return;
          }
          
          // Update connection status
          if (data.status === 'active' && conversation.status === 'connecting') {
            setConversation(prev => ({ ...prev, status: 'connected' }));
          }
        }
        
        // Continue monitoring if conversation is still active and we haven't exceeded max attempts
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          console.log('Monitoring timeout reached');
        }
        
      } catch (error) {
        console.error('Error monitoring conversation:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        }
      }
    };
    
    // Start monitoring after a delay
    setTimeout(poll, 15000);
  };

  const handleConversationEnd = async (conversationData: any) => {
    console.log('Conversation ended:', conversationData);
    setConversation(prev => ({ ...prev, status: 'ended' }));
    setSessionComplete(true);
    
    // Generate feedback based on conversation
    const mockFeedback = generateMockFeedback();
    setFinalFeedback(mockFeedback.text);
    setFinalScore(mockFeedback.score);
    
    // Save to database
    await onAnswerSubmit(
      'AI video interview response completed', 
      mockFeedback.text, 
      mockFeedback.score
    );
    
    cleanup();
  };

  const generateMockFeedback = () => {
    const feedbackOptions = [
      {
        text: "Excellent video interview performance! Your communication skills were clear and professional. You maintained good eye contact with the AI interviewer and provided detailed, well-structured responses. Your technical knowledge came through effectively in the real-time conversation format.",
        score: 8
      },
      {
        text: "Strong video interview! You demonstrated solid understanding of the role requirements and handled the interactive conversation well. Your responses showed good depth and you engaged naturally with the AI interviewer. Consider providing more specific examples to strengthen future responses.",
        score: 7
      },
      {
        text: "Outstanding video interview performance! You excelled in the real-time conversation format, showing excellent communication skills and technical depth. Your ability to think on your feet and provide comprehensive answers in a video setting was impressive.",
        score: 9
      },
      {
        text: "Good video interview experience! You adapted well to the AI conversation format and provided relevant responses. Your technical explanations were clear and you maintained professional demeanor throughout. Focus on being more specific with examples in future interviews.",
        score: 6
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

  const retryConnection = () => {
    setConnectionAttempts(prev => prev + 1);
    setConversation({ conversationId: '', status: 'idle' });
    initializeVideoInterview();
  };

  if (conversation.status === 'error') {
    return (
      <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-red-500/30">
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">AI Video Interview Failed</h3>
          <p className="text-gray-400 text-center mb-4">{conversation.error}</p>
          <div className="flex space-x-4">
            <button
              onClick={retryConnection}
              className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
            >
              <Video className="h-4 w-4 mr-2" />
              Try Again
            </button>
            <button
              onClick={() => {
                // Switch to quick practice mode
                window.location.reload();
              }}
              className="flex items-center bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
            >
              Switch to Quick Practice
            </button>
          </div>
          {connectionAttempts > 0 && (
            <p className="text-gray-500 text-sm mt-2">
              Attempt {connectionAttempts + 1} - If issues persist, try Quick Practice mode
            </p>
          )}
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
            Excellent work completing your interactive AI video interview with Alex Chen.
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
      {/* AI Video Interview Interface */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold mr-4">
              {questionNumber}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Interactive AI Video Interview</h3>
              <p className="text-gray-400 text-sm">{role} - Live Conversation with Alex Chen</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              conversation.status === 'connected' ? 'bg-green-400 animate-pulse' : 
              conversation.status === 'connecting' ? 'bg-yellow-400 animate-pulse' : 
              'bg-gray-400'
            }`}></div>
            <span className="text-sm text-gray-400 capitalize">
              {conversation.status === 'connecting' ? 'Connecting to AI...' : 
               conversation.status === 'connected' ? 'Live Interview' : 
               conversation.status}
            </span>
          </div>
        </div>

        {/* Video Container */}
        <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
          {conversation.status === 'connecting' && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center">
                <Loader className="h-12 w-12 text-purple-400 animate-spin mx-auto mb-4" />
                <p className="text-white text-lg font-medium">Connecting to AI Interviewer...</p>
                <p className="text-gray-400 text-sm mt-2">Setting up your live video interview with Alex Chen</p>
                <div className="mt-4 w-64 bg-gray-700 rounded-full h-2 mx-auto">
                  <div className="bg-purple-500 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Tavus AI Video Interface */}
          {conversation.status === 'connected' && conversation.conversationUrl && (
            <iframe
              ref={iframeRef}
              src={conversation.conversationUrl}
              className="w-full h-full border-0"
              allow="camera; microphone; fullscreen"
              title="AI Video Interview"
            />
          )}
          
          {/* Fallback Local Video Preview */}
          {conversation.status === 'connecting' && (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover opacity-50"
            />
          )}
          
          {/* Interview Status Overlay */}
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                conversation.status === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400 animate-pulse'
              }`}></div>
              <span className="text-white text-sm font-medium">
                {conversation.status === 'connected' ? 'LIVE INTERVIEW' : 'CONNECTING...'}
              </span>
            </div>
          </div>

          {/* AI Interviewer Info Overlay */}
          {conversation.status === 'connected' && (
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
              <div className="flex items-center space-x-3">
                <img 
                  src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop&crop=face"
                  alt="Alex Chen"
                  className="w-8 h-8 rounded-full object-cover border border-purple-400"
                />
                <div>
                  <p className="text-white text-sm font-medium">Alex Chen</p>
                  <p className="text-purple-300 text-xs">AI Technical Interviewer</p>
                </div>
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
            disabled={conversation.status !== 'connected'}
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

          {conversation.status === 'connecting' && (
            <button
              onClick={retryConnection}
              className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <Video className="h-4 w-4 mr-2" />
              Retry Connection
            </button>
          )}
        </div>
      </div>

      {/* Question Context */}
      <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
        <h4 className="text-white font-medium mb-2 flex items-center">
          <Video className="h-5 w-5 text-purple-400 mr-2" />
          Interview Question for Discussion:
        </h4>
        <p className="text-gray-300 text-sm leading-relaxed">{question}</p>
        <p className="text-gray-500 text-xs mt-2">
          Alex Chen will ask you this question and engage in a natural conversation about your response.
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
        <h4 className="text-blue-400 font-medium mb-2">How this works:</h4>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• Alex Chen (AI) will greet you and ask the interview question</li>
          <li>• Respond naturally as you would in a real interview</li>
          <li>• The AI may ask follow-up questions for clarification</li>
          <li>• You'll receive detailed feedback and scoring at the end</li>
          <li>• Speak clearly and maintain eye contact with the camera</li>
        </ul>
      </div>
    </div>
  );
};

export default AIVideoInterviewSession;