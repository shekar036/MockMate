import React, { useState } from 'react';
import { Mail, Lock, User, Mic, Eye, EyeOff, Sparkles, Zap, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const AuthComponent: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-10 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo and Header */}
        <div className="text-center transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <Mic className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="h-3 w-3 text-yellow-800" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 animate-pulse">
            MockMate
          </h1>
          <p className="text-gray-300 text-lg font-medium">
            Your AI-Powered Interview Coach 🚀
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Practice • Learn • Succeed
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 transform hover:scale-[1.02] transition-all duration-300">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isSignUp ? '🎉 Join MockMate' : '👋 Welcome Back'}
            </h2>
            <p className="text-gray-300 text-sm">
              {isSignUp 
                ? 'Start your interview preparation journey' 
                : 'Continue your path to interview success'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-200 mb-2 group-focus-within:text-blue-400 transition-colors">
                ✉️ Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 hover:bg-white/15"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-200 mb-2 group-focus-within:text-blue-400 transition-colors">
                🔐 Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 hover:bg-white/15"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-300 text-sm bg-red-900/30 p-3 rounded-lg border border-red-700/50 animate-shake">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105 hover:shadow-2xl group"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  <span>Getting you ready...</span>
                </div>
              ) : (
                <>
                  <User className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                  {isSignUp ? '🚀 Start Your Journey' : '✨ Let\'s Go!'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-300 hover:text-blue-200 font-medium transition-colors duration-200 hover:underline"
            >
              {isSignUp 
                ? '👈 Already have an account? Sign in' 
                : '🆕 New here? Create your account'}
            </button>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl text-center border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 group">
            <div className="text-3xl mb-2 group-hover:animate-bounce">🎤</div>
            <p className="text-sm text-gray-200 font-medium">Voice Recording</p>
            <p className="text-xs text-gray-400 mt-1">Practice with audio</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl text-center border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 group">
            <div className="text-3xl mb-2 group-hover:animate-pulse">🤖</div>
            <p className="text-sm text-gray-200 font-medium">AI Feedback</p>
            <p className="text-xs text-gray-400 mt-1">Real-time analysis</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl text-center border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105 group">
            <div className="text-3xl mb-2 group-hover:animate-spin">📊</div>
            <p className="text-sm text-gray-200 font-medium">Progress Tracking</p>
            <p className="text-xs text-gray-400 mt-1">Monitor improvement</p>
          </div>
        </div>

        {/* Success Stories */}
        <div className="text-center mt-8">
          <p className="text-gray-300 text-sm mb-4">
            ⭐ Join thousands who've aced their interviews
          </p>
          <div className="flex justify-center space-x-6 text-xs text-gray-400">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-1 text-green-400" />
              <span>95% Success Rate</span>
            </div>
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-1 text-blue-400" />
              <span>10k+ Interviews</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-4 w-4 mr-1 text-yellow-400" />
              <span>AI Powered</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default AuthComponent;