import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Star, Play, TrendingUp } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';
import { useAuth } from '../hooks/useAuth';

interface InterviewSession {
  id: string;
  role: string;
  question: string;
  user_answer: string;
  feedback_text: string;
  score: number;
  session_id: string;
  created_at: string;
}

const InterviewHistory: React.FC = () => {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string>('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedSessions = sessions.reduce((acc, session) => {
    if (!acc[session.session_id]) {
      acc[session.session_id] = {
        id: session.session_id,
        role: session.role,
        date: session.created_at,
        questions: [],
        averageScore: 0
      };
    }
    acc[session.session_id].questions.push(session);
    return acc;
  }, {} as any);

  // Calculate average scores
  Object.values(groupedSessions).forEach((session: any) => {
    session.averageScore = Math.round(
      session.questions.reduce((sum: number, q: any) => sum + q.score, 0) / session.questions.length
    );
  });

  const sessionList = Object.values(groupedSessions).slice(0, 5);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-white mb-4">No Interview History</h2>
          <p className="text-gray-400">
            Complete your first mock interview to see your performance history here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Interview History</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-400 mr-2" />
              <div>
                <div className="text-2xl font-bold text-white">{sessionList.length}</div>
                <div className="text-sm text-gray-400">Total Sessions</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 mr-2" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {sessionList.length > 0 
                    ? Math.round(sessionList.reduce((sum: number, s: any) => sum + s.averageScore, 0) / sessionList.length)
                    : 0}
                </div>
                <div className="text-sm text-gray-400">Average Score</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-400 mr-2" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {sessionList.reduce((sum: number, s: any) => sum + s.questions.length, 0)}
                </div>
                <div className="text-sm text-gray-400">Questions Answered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sessionList.map((session: any) => (
          <div
            key={session.id}
            className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-blue-600 text-white rounded-lg px-3 py-1 text-sm font-medium">
                  {session.role}
                </div>
                <div className="ml-4 flex items-center text-gray-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(session.date).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className={`font-bold ${getScoreColor(session.averageScore)}`}>
                    {session.averageScore}/10
                  </span>
                </div>
                <button
                  onClick={() => setSelectedSession(
                    selectedSession === session.id ? '' : session.id
                  )}
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  {selectedSession === session.id ? 'Hide Details' : 'View Details'}
                </button>
              </div>
            </div>

            {selectedSession === session.id && (
              <div className="space-y-4 mt-6 pt-6 border-t border-gray-700">
                {session.questions.map((question: InterviewSession, index: number) => (
                  <div key={question.id} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-blue-400">
                        Question {index + 1}
                      </div>
                      <div className={`text-sm font-bold ${getScoreColor(question.score)}`}>
                        {question.score}/10
                      </div>
                    </div>
                    <p className="text-gray-300 mb-3 text-sm">
                      {question.question}
                    </p>
                    <div className="bg-gray-800 rounded p-3 mb-3">
                      <div className="text-xs text-gray-400 mb-1">Your Answer:</div>
                      <p className="text-gray-300 text-sm">
                        {question.user_answer}
                      </p>
                    </div>
                    <div className="bg-blue-600/10 rounded p-3 border-l-4 border-blue-600">
                      <div className="text-xs text-blue-400 mb-1">AI Feedback:</div>
                      <p className="text-gray-300 text-sm">
                        {question.feedback_text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewHistory;