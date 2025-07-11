import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Info, X } from 'lucide-react';

const AuthComponent: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSkillsInfo, setShowSkillsInfo] = useState(false);
  const { signIn, signUp } = useAuth();

  // Extract the background pattern URL to avoid JSX parsing issues
  const backgroundPatternUrl = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center p-4">
      {/* Subtle Background Pattern */}
      <div className={`absolute inset-0 bg-[url('${backgroundPatternUrl}')] opacity-50`}></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              MockMate
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-200 mb-2">
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            {isSignUp 
              ? 'Join professionals who are advancing their careers with AI-powered interview preparation' 
              : 'Continue your professional development journey with personalized interview coaching'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                placeholder="Enter your email address"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-300 text-sm bg-red-900/20 p-3 rounded-lg border border-red-700/30">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-300 hover:text-blue-200 font-medium transition-colors duration-200"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : 'Need an account? Create one'}
            </button>
          </div>
        </div>

        {/* Professional Features */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl text-center border border-white/10">
            <div className="text-2xl font-bold text-blue-400 mb-1">AI</div>
            <p className="text-xs text-gray-300 font-medium">Powered</p>
            <p className="text-xs text-gray-500 mt-1">Advanced feedback</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl text-center border border-white/10">
            <div className="text-2xl font-bold text-green-400 mb-1">95%</div>
            <p className="text-xs text-gray-300 font-medium">Success Rate</p>
            <p className="text-xs text-gray-500 mt-1">Proven results</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl text-center border border-white/10">
            <button
              onClick={() => setShowSkillsInfo(true)}
              className="w-full text-center hover:scale-105 transition-transform duration-200"
            >
              <div className="flex items-center justify-center mb-2">
                <Info className="h-6 w-6 text-blue-400" />
              </div>
              <p className="text-xs text-gray-300 font-medium">How It Works</p>
              <p className="text-xs text-gray-500 mt-1">Learn more</p>
            </button>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">
            Trusted by professionals at leading companies
          </p>
          <div className="flex justify-center space-x-6 text-xs text-gray-500">
            <span>Real-time Analysis</span>
            <span>•</span>
            <span>Personalized Coaching</span>
            <span>•</span>
            <span>Progress Tracking</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>Secure • Private • Professional</p>
        </div>

        {/* Skills Info Modal */}
        {showSkillsInfo && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl p-8 max-w-lg w-full border border-gray-700 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">How MockMate Improves Your Skills</h3>
                <button
                  onClick={() => setShowSkillsInfo(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-blue-400 mb-2">AI-Powered Analysis</h4>
                  <p className="text-gray-300 text-sm">
                    Our advanced AI evaluates your responses in real-time, providing detailed feedback on technical accuracy, communication clarity, and professional presentation.
                  </p>
                </div>
                
                <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-green-400 mb-2">Personalized Coaching</h4>
                  <p className="text-gray-300 text-sm">
                    Get tailored improvement suggestions based on your specific role, experience level, and performance patterns. Practice weak areas with targeted questions.
                  </p>
                </div>
                
                <div className="bg-purple-600/10 border border-purple-500/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-purple-400 mb-2">Progress Tracking</h4>
                  <p className="text-gray-300 text-sm">
                    Monitor your improvement over time with detailed analytics, score trends, and skill development metrics across different technical domains.
                  </p>
                </div>
                
                <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-yellow-400 mb-2">Real Interview Simulation</h4>
                  <p className="text-gray-300 text-sm">
                    Experience realistic interview scenarios with our AI video interviewer, helping you build confidence and reduce anxiety for actual interviews.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowSkillsInfo(false)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                >
                  Start Improving Today
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthComponent;