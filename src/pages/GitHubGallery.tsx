import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Star, GitFork, Calendar, AlertCircle } from 'lucide-react';
import VirtualGallery from '../components/VirtualGallery';
import githubService, { GitHubAnalysisResult } from '../services/githubService';
import { useAppState } from '../hooks/useAppState';

interface GitHubGalleryProps {}

const GitHubGallery: React.FC<GitHubGalleryProps> = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAppState();
  const [githubData, setGithubData] = useState<GitHubAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setError('用户名参数缺失');
      setLoading(false);
      return;
    }

    // 检查用户是否已完成MBTI分析
    const hasCompletedMBTI = state.analysisResult || location.state?.mbtiResult;
    const isCorrectUser = state.githubUsername === username || location.state?.githubUsername === username;
    
    if (!hasCompletedMBTI || !isCorrectUser) {
      console.log('❌ 用户未完成MBTI分析或用户名不匹配，重定向到分析页面');
      navigate('/analyze', { 
        state: { 
          message: '请先完成MBTI分析才能访问3D展厅',
          redirectUsername: username 
        } 
      });
      return;
    }

    // 检查是否从AnalyzePage传递了数据
    if (location.state?.githubData) {
      console.log('✅ 使用传递的GitHub数据:', location.state.githubData);
      // 将传递的数据转换为GitHubAnalysisResult格式
       const formattedData: GitHubAnalysisResult = {
         userInfo: location.state.githubData.userInfo || {},
         languageStats: location.state.githubData.languageStats || {},
         projectAnalysis: location.state.githubData.projectAnalysis || { totalStars: 0, totalForks: 0, categories: [] },
         socialNetwork: location.state.githubData.socialNetwork || { collaborators: [], followers: [], following: [] },
         habitAnalysis: location.state.githubData.habitAnalysis || { commitPatterns: {}, activeHours: {}, workingDays: {} },
         mbtiAnalysis: location.state.mbtiResult || location.state.githubData.mbtiAnalysis || { type: 'INTJ', traits: {}, confidence: 0.5 },
         analyzedAt: new Date().toISOString()
       };
      setGithubData(formattedData);
      setLoading(false);
    } else {
      loadGitHubData();
    }
  }, [username, location.state, state.analysisResult, state.githubUsername, navigate]);

  const loadGitHubData = async () => {
    if (!username) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 开始加载GitHub数据: ${username}`);
      const data = await githubService.analyzeUser(username);
      
      console.log('✅ GitHub数据加载完成:', data);
      setGithubData(data);
    } catch (err) {
      console.error('❌ 加载GitHub数据失败:', err);
      setError(err instanceof Error ? err.message : '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadGitHubData();
  };

  const handleBack = () => {
    navigate('/analyze');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">正在加载GitHub数据...</h2>
          <p className="text-gray-300">用户: {username}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">加载失败</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              重试
            </button>
            <button
              onClick={handleBack}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!githubData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">暂无数据</h2>
          <button
            onClick={handleBack}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center mx-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-gray-500/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>返回分析页面</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <User className="h-5 w-5 text-gray-400" />
              <span className="text-white font-medium">{username}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 3D Gallery */}
      <main className="relative">
        <VirtualGallery githubData={githubData} />
      </main>
    </div>
  );
};

export default GitHubGallery;