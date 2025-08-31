import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Brain, TrendingUp, AlertTriangle, Lightbulb, Github, Share2, Box } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';

const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAppState();
  const { analysisResult, githubUsername } = state;
  
  // 从location.state获取数据（优先级更高）
  const locationState = location.state as { username?: string; mbtiResult?: any } | null;
  const finalAnalysisResult = locationState?.mbtiResult || analysisResult;
  const finalGithubUsername = locationState?.username || githubUsername;

  // 数据验证和默认值设置
  const validateAndSetDefaults = (result: any) => {
    if (!result) return null;
    
    return {
      type: result.type || 'INTJ',
      description: result.description || '基于您的 GitHub 项目分析得出的性格类型',
      dimensions: result.dimensions || {
        'EI': { tendency: 'I', score: 0.6 },
        'SN': { tendency: 'N', score: 0.7 },
        'TF': { tendency: 'T', score: 0.8 },
        'JP': { tendency: 'J', score: 0.7 }
      },
      confidence: result.confidence || 0.85,
      strengths: result.strengths || ['独立思考', '战略规划', '创新能力', '逻辑分析'],
      weaknesses: result.weaknesses || ['过于理想化', '不善社交', '过分挑剔', '容易忽视细节'],
      recommendations: result.recommendations || [
        '尝试更多团队协作项目，提升沟通技能',
        '关注用户体验和界面设计，平衡技术与实用性',
        '参与开源社区，分享你的技术见解',
        '学习敏捷开发方法，提高项目管理能力'
      ],
      username: result.username || finalGithubUsername || 'Unknown',
      timestamp: result.timestamp || new Date().toISOString()
    };
  };

  const validatedResult = validateAndSetDefaults(finalAnalysisResult);
  
  // 如果没有分析结果，重定向到分析页面
  if (!validatedResult) {
    navigate('/analyze');
    return null;
  }

  const getMBTIDescription = (type: string) => {
    const descriptions: Record<string, { name: string; subtitle: string; color: string }> = {
      'INTJ': { name: '建筑师', subtitle: '富有想象力和战略性的思想家', color: 'purple' },
      'INTP': { name: '逻辑学家', subtitle: '具有创造性的发明家', color: 'blue' },
      'ENTJ': { name: '指挥官', subtitle: '大胆、富有想象力的强势领导者', color: 'red' },
      'ENTP': { name: '辩论家', subtitle: '聪明好奇的思想家', color: 'orange' },
      'INFJ': { name: '提倡者', subtitle: '安静而神秘的理想主义者', color: 'green' },
      'INFP': { name: '调停者', subtitle: '诗意、善良的利他主义者', color: 'teal' },
      'ENFJ': { name: '主人公', subtitle: '富有魅力的鼓舞人心的领导者', color: 'pink' },
      'ENFP': { name: '竞选者', subtitle: '热情、有创造力的自由精神', color: 'yellow' },
      'ISTJ': { name: '物流师', subtitle: '实用主义的事实导向者', color: 'gray' },
      'ISFJ': { name: '守护者', subtitle: '非常专注、温暖的守护者', color: 'blue' },
      'ESTJ': { name: '总经理', subtitle: '出色的管理者', color: 'red' },
      'ESFJ': { name: '执政官', subtitle: '极有同情心、受欢迎的陪伴者', color: 'green' },
      'ISTP': { name: '鉴赏家', subtitle: '大胆而实际的实验者', color: 'orange' },
      'ISFP': { name: '探险家', subtitle: '灵活、有魅力的艺术家', color: 'purple' },
      'ESTP': { name: '企业家', subtitle: '聪明、精力充沛的感知者', color: 'red' },
      'ESFP': { name: '娱乐家', subtitle: '自发的、精力充沛的娱乐者', color: 'pink' }
    };
    return descriptions[type] || { name: '未知类型', subtitle: '', color: 'gray' };
  };

  const typeInfo = getMBTIDescription(validatedResult.type);

  const getDimensionLabel = (dimension: string) => {
    const labels: Record<string, { full: string; desc: string }> = {
      'E': { full: '外向型 (Extraversion)', desc: '从外部世界获得能量' },
      'I': { full: '内向型 (Introversion)', desc: '从内心世界获得能量' },
      'S': { full: '感觉型 (Sensing)', desc: '关注具体信息和细节' },
      'N': { full: '直觉型 (Intuition)', desc: '关注可能性和概念' },
      'T': { full: '思考型 (Thinking)', desc: '基于逻辑做决定' },
      'F': { full: '情感型 (Feeling)', desc: '基于价值观做决定' },
      'J': { full: '判断型 (Judging)', desc: '喜欢有序和计划' },
      'P': { full: '感知型 (Perceiving)', desc: '喜欢灵活和适应' }
    };
    return labels[dimension] || { full: dimension, desc: '' };
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `我的 MBTI 类型是 ${validatedResult.type}`,
        text: `通过 GitHub 代码分析，我的 MBTI 性格类型是 ${validatedResult.type} - ${typeInfo.name}！`,
        url: window.location.href
      });
    } else {
      // 复制到剪贴板
      navigator.clipboard.writeText(
        `我的 MBTI 类型是 ${validatedResult.type} - ${typeInfo.name}！通过 GitHub 代码分析得出。`
      );
      alert('结果已复制到剪贴板！');
    }
  };

  const handleViewGallery = () => {
    // 跳转到3D展览馆页面，传递用户数据
    navigate(`/github-gallery/${finalGithubUsername}`, {
      state: {
        githubUsername: finalGithubUsername,
        mbtiResult: validatedResult
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Header */}
      <header className="bg-[#161b22] border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <button
              onClick={() => navigate('/analyze')}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>重新分析</span>
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-gray-300 border border-gray-600 rounded-lg transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>分享结果</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* User Info */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Github className="h-6 w-6 text-white" />
            <span className="text-lg font-medium text-white">@{finalGithubUsername}</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            MBTI 分析结果
          </h1>
          <p className="text-gray-300">
            基于你的 GitHub 代码风格和项目特点生成
          </p>
        </div>

        {/* MBTI Type Card */}
        <div className="bg-[#21262d] rounded-2xl shadow-xl p-8 border border-gray-600 mb-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#238636]/20 border border-[#238636]/30 mb-4">
                <Brain className="h-12 w-12 text-[#238636]" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-2">
                {validatedResult.type}
              </h2>
              <h3 className="text-2xl font-semibold text-[#238636] mb-2">
                {typeInfo.name}
              </h3>
              <p className="text-lg text-gray-300 mb-4">
                {typeInfo.subtitle}
              </p>
              <div className="inline-flex items-center space-x-2 bg-[#238636]/20 text-[#238636] px-4 py-2 rounded-full border border-[#238636]/30">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">
                  置信度: {Math.round(validatedResult.confidence * 100)}%
                </span>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed max-w-3xl mx-auto">
              {validatedResult.description}
            </p>
          </div>
        </div>

        {/* Dimensions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {Object.entries(validatedResult.dimensions).map(([key, value]: [string, { tendency: string; score: number }]) => {
            const label = getDimensionLabel(value.tendency);
            const percentage = Math.round(value.score * 100);
            
            return (
              <div key={key} className="bg-[#21262d] rounded-2xl shadow-xl p-6 border border-gray-600">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    {key.split('').join(' vs ')}
                  </h3>
                  <span className="text-2xl font-bold text-[#238636]">
                    {value.tendency}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-300 mb-2">
                  {label.full}
                </p>
                <p className="text-sm text-gray-400 mb-3">
                  {label.desc}
                </p>
                <div className="w-full bg-[#30363d] rounded-full h-2">
                  <div 
                    className="bg-[#238636] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400 mt-1 text-right">
                  {percentage}%
                </p>
              </div>
            );
          })}
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#21262d] rounded-2xl shadow-xl p-6 border border-gray-600">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="text-xl font-semibold text-white">性格优势</h3>
            </div>
            <ul className="space-y-3">
              {validatedResult.strengths.map((strength, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-300">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#21262d] rounded-2xl shadow-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <h3 className="text-xl font-semibold text-white">发展空间</h3>
            </div>
            <ul className="space-y-3">
              {validatedResult.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-300">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-[#21262d] rounded-2xl shadow-xl p-6 border border-gray-600 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <h3 className="text-xl font-semibold text-white">发展建议</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {validatedResult.recommendations.map((recommendation, index) => (
              <div key={index} className="bg-[#161b22] border border-yellow-600/30 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-300">{recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="text-center">
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <button
              onClick={() => navigate('/analyze')}
              className="w-full sm:w-auto px-6 py-3 bg-[#21262d] text-gray-300 border border-gray-600 rounded-lg hover:bg-[#30363d] transition-colors"
            >
              分析其他用户
            </button>
            <button
              onClick={handleShare}
              className="w-full sm:w-auto px-6 py-3 bg-[#21262d] text-gray-300 border border-gray-600 rounded-lg hover:bg-[#30363d] transition-colors flex items-center justify-center space-x-2"
            >
              <Share2 className="h-4 w-4" />
              <span>分享结果</span>
            </button>
            <button
              onClick={handleViewGallery}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#238636] to-[#2ea043] text-white rounded-lg hover:from-[#2ea043] hover:to-[#238636] transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
            >
              <Box className="h-4 w-4" />
              <span>创建我的3DGithub展览馆</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#161b22] border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p className="mb-2">
              此分析基于你的 GitHub 公开信息，仅供参考。MBTI 是一个复杂的心理学工具，
              建议结合专业测试获得更准确的结果。
            </p>
            <p>&copy; 2024 MBTI Gallery 分析器. 基于开源技术构建.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResultPage;