import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Github, Brain, AlertCircle, CheckCircle, Loader2, ArrowLeft, Terminal } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';

const AnalyzePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, actions } = useAppState();
  const { setGithubUsername, setAnalysisResult } = actions;

  const [username, setUsername] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState('');
  const [debugLogs, setDebugLogs] = useState<Array<{
    id: string;
    timestamp: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
  }>>([]);
  const debugLogRef = useRef<HTMLDivElement>(null);

  // 添加调试日志的方法
  const addDebugLog = (type: 'info' | 'success' | 'warning' | 'error', message: string) => {
    const newLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    setDebugLogs(prev => [...prev, newLog]);
  };

  // 处理从GitHubGallery重定向回来的消息
  useEffect(() => {
    if (location.state?.message) {
      setRedirectMessage(location.state.message);
      // 清除location state中的消息
      window.history.replaceState({}, document.title);
      // 5秒后自动清除消息
      setTimeout(() => {
        setRedirectMessage('');
      }, 5000);
    }
  }, [location.state]);

  // 自动滚动到最新日志
  useEffect(() => {
    if (debugLogRef.current) {
      debugLogRef.current.scrollTop = debugLogRef.current.scrollHeight;
    }
  }, [debugLogs]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };



  const handleAnalyze = async () => {
    if (!username.trim()) {
      setError('请输入GitHub用户名');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setRedirectMessage('');
    setDebugLogs([]);
    addDebugLog('info', '正在初始化分析...');

    try {
      // 验证GitHub用户是否存在
      const userResponse = await fetch(`https://api.github.com/users/${username}`);
      if (!userResponse.ok) {
        throw new Error('GitHub用户不存在');
      }

      addDebugLog('success', '用户验证成功，开始爬取README数据...');

      // 第一步：爬取GitHub README数据
      const crawlResponse = await fetch('http://localhost:3001/api/github-crawl-readme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username
        }),
      });

      if (!crawlResponse.ok) {
        const errorData = await crawlResponse.json();
        throw new Error(errorData.error || 'README数据爬取失败');
      }

      const crawlResult = await crawlResponse.json();
      const crawledData = crawlResult.data;
      
      addDebugLog('success', `成功爬取到 ${crawledData?.repositories?.length || 0} 个仓库的README数据`);
      addDebugLog('info', '开始进行深度MBTI分析...');

      // 第二步：使用爬取的数据进行真实的MBTI分析
      const response = await fetch('http://localhost:3001/api/analyze-mbti', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          crawledData: crawledData // 传递真实的爬取数据
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'MBTI分析失败');
      }

      const result = await response.json();
      addDebugLog('success', 'Coze工作流分析完成！');
      
      console.log('MBTI分析结果:', result);

      // 生成MBTI结果对象
      const mbtiResult = {
        type: result.mbti?.type || 'INTJ',
        dimensions: result.mbti?.dimensions || {
          E_I: 50,
          S_N: 50,
          T_F: 50,
          J_P: 50
        },
        description: result.mbti?.description || '分析师型人格',
        confidence: result.mbti?.confidence || 0.75,
        traits: result.mbti?.traits || [],
        strengths: result.mbti?.strengths || [],
        weaknesses: result.mbti?.weaknesses || [],
        recommendations: result.mbti?.recommendations || result.mbti?.suggestions || []
      };

      // 设置全局状态
      setAnalysisResult(mbtiResult);
      setGithubUsername(username);

      addDebugLog('success', '分析完成，准备跳转到结果页面...');
      
      // 延迟2秒后跳转到结果页面
      setTimeout(() => {
        navigate('/result', { 
          state: { 
            username: username,
            mbtiResult: mbtiResult
          }
        });
      }, 2000);

    } catch (error) {
      console.error('分析错误:', error);
      setError(error.message);
      addDebugLog('error', `错误: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Header */}
      <header className="bg-[#161b22] border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>返回首页</span>
            </button>
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-[#238636]" />
              <h1 className="text-xl font-bold text-white">MBTI 性格分析</h1>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* Input Section */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#21262d] rounded-2xl shadow-xl p-8 border border-gray-700">
            <div className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                  GitHub 用户名
                </label>
                <div className="relative">
                  <Github className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="例如: octocat"
                    className="w-full pl-12 pr-4 py-3 border border-gray-600 bg-[#0d1117] text-white rounded-lg focus:ring-2 focus:ring-[#238636] focus:border-transparent transition-all duration-200"
                    disabled={isAnalyzing}
                  />
                </div>

              </div>

              {redirectMessage && (
                <div className="bg-yellow-900/20 border border-yellow-700 rounded-md p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
                    <span className="text-yellow-300">{redirectMessage}</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-900/20 border border-red-700 rounded-md p-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-red-300">{error}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !username.trim()}
                className="w-full bg-[#238636] text-white py-3 px-6 rounded-lg font-medium hover:bg-[#2ea043] focus:outline-none focus:ring-2 focus:ring-[#238636] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isAnalyzing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>分析中...</span>
                  </div>
                ) : (
                  '开始分析用户MBTI'
                )}
              </button>



            </div>
          </div>
          </div>

        {/* 实时调试信息显示区域 */}
        {(isAnalyzing || debugLogs.length > 0) && (
          <div className="mt-12">
            <div className="max-w-2xl mx-auto bg-[#21262d] rounded-2xl shadow-xl p-8 border border-gray-700">
              <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-gray-300">实时调试信息</span>
                </div>
                <div 
                  ref={debugLogRef}
                  className="h-64 overflow-y-auto p-4 space-y-2 bg-gray-900 font-mono text-sm"
                >
                  {debugLogs.map((log, index) => (
                    <div key={log.id || index} className="flex items-start gap-3">
                      <span className="text-gray-500 text-xs whitespace-nowrap">
                        {log.timestamp}
                      </span>
                      <span className={`inline-block w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        log.type === 'info' ? 'bg-blue-400' :
                        log.type === 'success' ? 'bg-green-400' :
                        log.type === 'warning' ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`}></span>
                      <span className={`flex-1 ${
                        log.type === 'info' ? 'text-blue-300' :
                        log.type === 'success' ? 'text-green-300' :
                        log.type === 'warning' ? 'text-yellow-300' :
                        'text-red-300'
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                  {isAnalyzing && debugLogs.length === 0 && (
                    <div className="flex items-center gap-3 text-blue-300">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>正在初始化分析流程...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}






      </main>
    </div>
  );
};

export default AnalyzePage;