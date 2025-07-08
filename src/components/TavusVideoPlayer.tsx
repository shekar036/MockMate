import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Loader, AlertCircle } from 'lucide-react';

interface TavusVideoPlayerProps {
  question: string;
  onVideoReady?: () => void;
  onVideoEnd?: () => void;
  className?: string;
}

const TavusVideoPlayer: React.FC<TavusVideoPlayerProps> = ({
  question,
  onVideoReady,
  onVideoEnd,
  className = ''
}) => {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoId, setVideoId] = useState<string>('');
  const [generationStatus, setGenerationStatus] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (question) {
      generateTavusVideo(question);
    }
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [question]);

  const generateTavusVideo = async (questionText: string) => {
    setIsLoading(true);
    setError('');
    setVideoUrl('');
    setGenerationStatus('Initializing...');
    
    try {
      // Get API credentials from environment variables
      const tavusApiKey = import.meta.env.VITE_TAVUS_API_KEY;
      const replicaId = import.meta.env.VITE_TAVUS_REPLICA_ID;
      
      if (!tavusApiKey || !replicaId) {
        throw new Error('Tavus API key or Replica ID not configured');
      }

      console.log('Generating Tavus video with:', { replicaId, questionLength: questionText.length });
      setGenerationStatus('Creating video...');

      // Create video generation request
      const response = await fetch('https://tavusapi.com/v2/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': tavusApiKey,
        },
        body: JSON.stringify({
          replica_id: replicaId,
          script: questionText,
          video_name: `MockMate Interview Question - ${Date.now()}`,
          properties: {
            voice_settings: {
              stability: 0.8,
              similarity_boost: 0.8,
              style: 0.2,
              use_speaker_boost: true
            },
            video_settings: {
              quality: 'high',
              aspect_ratio: '16:9'
            }
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Tavus API error:', response.status, errorData);
        throw new Error(`Tavus API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('Video generation started:', data);
      setVideoId(data.video_id);
      setGenerationStatus('Processing video...');
      
      // Poll for video completion
      pollVideoStatus(data.video_id, tavusApiKey);
      
    } catch (error) {
      console.error('Error generating Tavus video:', error);
      setError(`Failed to generate video: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
      setGenerationStatus('');
    }
  };

  const pollVideoStatus = async (videoId: string, apiKey: string) => {
    const maxAttempts = 60; // 10 minutes max wait time
    let attempts = 0;
    
    const poll = async () => {
      try {
        attempts++;
        setGenerationStatus(`Processing... (${attempts}/${maxAttempts})`);
        
        const response = await fetch(`https://tavusapi.com/v2/videos/${videoId}`, {
          headers: {
            'x-api-key': apiKey,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to check video status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Video status:', data);
        
        if (data.status === 'completed' && data.download_url) {
          console.log('Video generation completed:', data.download_url);
          setVideoUrl(data.download_url);
          setIsLoading(false);
          setGenerationStatus('');
          onVideoReady?.();
          return;
        }
        
        if (data.status === 'failed') {
          throw new Error('Video generation failed');
        }
        
        if (data.status === 'processing' || data.status === 'queued') {
          if (attempts < maxAttempts) {
            setTimeout(poll, 10000); // Poll every 10 seconds
          } else {
            throw new Error('Video generation timeout - please try again');
          }
        }
        
      } catch (error) {
        console.error('Error polling video status:', error);
        setError(`Video generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsLoading(false);
        setGenerationStatus('');
      }
    };
    
    poll();
  };

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      
      // Start progress tracking
      progressInterval.current = setInterval(() => {
        if (videoRef.current) {
          const current = videoRef.current.currentTime;
          const total = videoRef.current.duration;
          setProgress((current / total) * 100);
        }
      }, 1000);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setProgress(0);
      if (!isPlaying) {
        handlePlay();
      }
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    setProgress(100);
    
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    onVideoEnd?.();
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className={`bg-gray-800 rounded-lg p-8 border border-gray-700 ${className}`}>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader className="h-12 w-12 text-blue-400 animate-spin mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Generating AI Interviewer Video</h3>
          <p className="text-gray-400 text-center mb-4">
            Your AI interviewer is preparing to ask the question...
          </p>
          {generationStatus && (
            <p className="text-blue-400 text-sm">{generationStatus}</p>
          )}
          <div className="mt-4 w-full max-w-xs bg-gray-700 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-800 rounded-lg p-8 border border-red-500/30 ${className}`}>
        <div className="flex flex-col items-center justify-center h-64">
          <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Video Generation Failed</h3>
          <p className="text-gray-400 text-center mb-4">{error}</p>
          <button
            onClick={() => generateTavusVideo(question)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retry Generation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 overflow-hidden ${className}`}>
      {/* Video Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
            <h3 className="text-white font-medium">AI Interviewer</h3>
          </div>
          <div className="flex items-center text-green-400 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            Live Interview
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-64 object-cover"
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleVideoEnd}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          playsInline
          autoPlay
        />
        
        {/* Video Overlay Controls */}
        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <button
            onClick={isPlaying ? handlePause : handlePlay}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-4 transition-colors duration-200"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 text-white" />
            ) : (
              <Play className="h-8 w-8 text-white ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* Video Controls */}
      <div className="p-4 bg-gray-900">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatTime((progress / 100) * duration)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={isPlaying ? handlePause : handlePlay}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors duration-200"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Play
                </>
              )}
            </button>
            
            <button
              onClick={handleRestart}
              className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
              title="Restart video"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleToggleMute}
            className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Question Text Fallback */}
      <div className="p-4 border-t border-gray-700 bg-gray-700/30">
        <p className="text-gray-300 text-sm">
          <strong>Question:</strong> {question}
        </p>
      </div>
    </div>
  );
};

export default TavusVideoPlayer;