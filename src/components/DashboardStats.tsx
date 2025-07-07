import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Target, 
  CheckCircle, 
  TrendingUp, 
  Calendar,
  Award,
  Clock,
  Users,
  Play,
  BookOpen,
  History
} from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';
import { useAuth } from '../hooks/useAuth';

interface DashboardData {
  totalTests: number;
  completedSessions: number;
  totalQuestions: number;
  averageScore: number;
  successRate: number;
  bestRole: string;
  recentActivity: number;
  improvementTrend: number;
}

interface RoleStats {
  role: string;
  sessions: number;
  averageScore: number;
  totalQuestions: number;
}

const DashboardStats: React.FC = () => {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalTests: 0,
    completedSessions: 0,
    totalQuestions: 0,
    averageScore: 0,
    successRate: 0,
    bestRole: 'N/A',
    recentActivity: 0,
    improvementTrend: 0
  });
  const [roleStats, setRoleStats] = useState<RoleStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch all interview sessions for the user
      const { data: sessions, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!sessions || sessions.length === 0) {
        setLoading(false);
        return;
      }

      // Group sessions by session_id to count completed interviews
      const sessionGroups = sessions.reduce((acc, session) => {
        if (!acc[session.session_id]) {
          acc[session.session_id] = {
            role: session.role,
            questions: [],
            createdAt: session.created_at
          };
        }
        acc[session.session_id].questions.push(session);
        return acc;
      }, {} as any);

      const completedSessions = Object.keys(sessionGroups).length;
      const totalQuestions = sessions.length;
      
      // Calculate average score
      const totalScore = sessions.reduce((sum, session) => sum + session.score, 0);
      const averageScore = totalQuestions > 0 ? Math.round(totalScore / totalQuestions) : 0;
      
      // Calculate success rate (scores >= 7 are considered successful)
      const successfulAnswers = sessions.filter(session => session.score >= 7).length;
      const successRate = totalQuestions > 0 ? Math.round((successfulAnswers / totalQuestions) * 100) : 0;

      // Find best performing role
      const rolePerformance = sessions.reduce((acc, session) => {
        if (!acc[session.role]) {
          acc[session.role] = { totalScore: 0, count: 0 };
        }
        acc[session.role].totalScore += session.score;
        acc[session.role].count += 1;
        return acc;
      }, {} as any);

      let bestRole = 'N/A';
      let bestAverage = 0;
      Object.entries(rolePerformance).forEach(([role, data]: [string, any]) => {
        const average = data.totalScore / data.count;
        if (average > bestAverage) {
          bestAverage = average;
          bestRole = role;
        }
      });

      // Calculate recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentSessions = sessions.filter(session => 
        new Date(session.created_at) > sevenDaysAgo
      );
      const recentActivity = recentSessions.length;

      // Calculate improvement trend (compare last 10 vs previous 10 answers)
      let improvementTrend = 0;
      if (sessions.length >= 10) {
        const recent10 = sessions.slice(0, 10);
        const previous10 = sessions.slice(10, 20);
        
        const recentAvg = recent10.reduce((sum, s) => sum + s.score, 0) / 10;
        const previousAvg = previous10.reduce((sum, s) => sum + s.score, 0) / Math.min(10, previous10.length);
        
        improvementTrend = Math.round(((recentAvg - previousAvg) / previousAvg) * 100);
      }

      // Calculate role-specific stats
      const roleStatsData: RoleStats[] = Object.entries(rolePerformance).map(([role, data]: [string, any]) => ({
        role,
        sessions: Object.values(sessionGroups).filter((group: any) => group.role === role).length,
        averageScore: Math.round(data.totalScore / data.count),
        totalQuestions: data.count
      })).sort((a, b) => b.averageScore - a.averageScore);

      setDashboardData({
        totalTests: completedSessions,
        completedSessions,
        totalQuestions,
        averageScore,
        successRate,
        bestRole,
        recentActivity,
        improvementTrend
      });

      setRoleStats(roleStatsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (dashboardData.totalTests === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to MockMate!</h2>
          <p className="text-gray-400 mb-6">
            Start your first mock interview to see your performance dashboard.
          </p>
          <button
            onClick={() => window.location.hash = '#interview'}
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            <Play className="h-5 w-5 mr-2" />
            Start Your First Interview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Performance Dashboard</h2>
        <p className="text-gray-400">Track your interview preparation progress</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tests */}
        <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">Total Tests</p>
              <p className="text-3xl font-bold text-white">{dashboardData.totalTests}</p>
              <p className="text-gray-400 text-xs mt-1">Completed interviews</p>
            </div>
            <div className="bg-blue-600 p-3 rounded-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Questions Answered */}
        <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">Questions Answered</p>
              <p className="text-3xl font-bold text-white">{dashboardData.totalQuestions}</p>
              <p className="text-gray-400 text-xs mt-1">Total responses</p>
            </div>
            <div className="bg-green-600 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-gradient-to-r from-purple-600/20 to-purple-700/20 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">Average Score</p>
              <p className="text-3xl font-bold text-white">{dashboardData.averageScore}/10</p>
              <p className="text-gray-400 text-xs mt-1">Overall performance</p>
            </div>
            <div className="bg-purple-600 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-700/20 rounded-xl p-6 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm font-medium">Success Rate</p>
              <p className="text-3xl font-bold text-white">{dashboardData.successRate}%</p>
              <p className="text-gray-400 text-xs mt-1">Scores ≥ 7/10</p>
            </div>
            <div className="bg-yellow-600 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Best Role */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Best Performance</h3>
            <Award className="h-5 w-5 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-yellow-400 mb-1">{dashboardData.bestRole}</p>
          <p className="text-gray-400 text-sm">Your strongest role</p>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <Calendar className="h-5 w-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400 mb-1">{dashboardData.recentActivity}</p>
          <p className="text-gray-400 text-sm">Questions in last 7 days</p>
        </div>

        {/* Improvement Trend */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Improvement</h3>
            <TrendingUp className={`h-5 w-5 ${dashboardData.improvementTrend >= 0 ? 'text-green-400' : 'text-red-400'}`} />
          </div>
          <p className={`text-2xl font-bold mb-1 ${dashboardData.improvementTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {dashboardData.improvementTrend >= 0 ? '+' : ''}{dashboardData.improvementTrend}%
          </p>
          <p className="text-gray-400 text-sm">vs previous sessions</p>
        </div>
      </div>

      {/* Role Performance Breakdown */}
      {roleStats.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-6">Performance by Role</h3>
          <div className="space-y-4">
            {roleStats.map((role, index) => (
              <div key={role.role} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-600' : 
                    index === 1 ? 'bg-gray-500' : 
                    index === 2 ? 'bg-orange-600' : 'bg-blue-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{role.role}</p>
                    <p className="text-gray-400 text-sm">{role.sessions} sessions • {role.totalQuestions} questions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    role.averageScore >= 8 ? 'text-green-400' :
                    role.averageScore >= 6 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {role.averageScore}/10
                  </p>
                  <p className="text-gray-400 text-sm">avg score</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              const tabsList = document.querySelector('[role="tablist"]');
              const interviewTab = tabsList?.querySelector('[data-value="interview"]') as HTMLElement;
              interviewTab?.click();
            }}
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            <Play className="h-5 w-5 mr-2" />
            Start New Interview
          </button>
          
          <button
            onClick={() => {
              const tabsList = document.querySelector('[role="tablist"]');
              const historyTab = tabsList?.querySelector('[data-value="history"]') as HTMLElement;
              historyTab?.click();
            }}
            className="flex items-center justify-center bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            <History className="h-5 w-5 mr-2" />
            View History
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Refresh Stats
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;