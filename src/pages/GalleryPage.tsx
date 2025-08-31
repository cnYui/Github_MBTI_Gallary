import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import VirtualGallery from '../components/VirtualGallery';
import { GitHubDataProcessor, ProcessedGitHubData } from '../services/githubDataProcessor';
import { GitHubAnalysisResult } from '../services/githubService';
import { Loader2, ArrowLeft, Github, User } from 'lucide-react';

interface MBTIData {
  type: string;
  dimensions: {
    E_I: number;
    S_N: number;
    T_F: number;
    J_P: number;
  };
  description: string;
  strengths: string[];
  developmentAreas: string[];
  suggestions: string[];
}

interface LocationState {
  githubUsername?: string;
  mbtiResult?: MBTIData;
}

const GalleryPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [githubData, setGithubData] = useState<GitHubAnalysisResult | null>(null);
  const [mbtiData, setMbtiData] = useState<MBTIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [githubUsername, setGithubUsername] = useState('');

  useEffect(() => {
    const state = location.state as LocationState;
    
    // 从路由状态获取数据
    if (state?.githubUsername) {
      setGithubUsername(state.githubUsername);
      
      // 生成模拟GitHub数据
      try {
        const mockGithubData = GitHubDataProcessor.generateMockData(state.githubUsername);
        const usernameFromUrl = state.githubUsername;
        // 转换为GitHubAnalysisResult格式
        const formattedData: GitHubAnalysisResult = {
          userInfo: {
            ...mockGithubData.userInfo,
            name: mockGithubData.userInfo.name || mockGithubData.userInfo.login,
            avatar_url: mockGithubData.userInfo.avatar_url || 'https://github.com/identicons/default.png',
            bio: mockGithubData.userInfo.bio || null,
            location: mockGithubData.userInfo.location || null,
            company: mockGithubData.userInfo.company || null,
            blog: mockGithubData.userInfo.blog || null,
            public_repos: mockGithubData.summary.totalRepos,
            followers: mockGithubData.userInfo.followers,
            following: mockGithubData.userInfo.following,
            created_at: mockGithubData.userInfo.created_at
          },
          languageStats: mockGithubData.skillData.reduce((acc, skill) => {
            acc[skill.name] = {
              bytes: skill.level * 1000,
              percentage: skill.percentage.toString() + '%'
            };
            return acc;
          }, {} as { [language: string]: { bytes: number; percentage: string } }),
          projectAnalysis: {
            topStarred: mockGithubData.summary.topRepos.map(repo => ({
              name: repo.name,
              full_name: `${usernameFromUrl}/${repo.name}`,
              stargazers_count: repo.stars,
              description: `${repo.language} project`,
              language: repo.language || 'Unknown',
              html_url: `https://github.com/${usernameFromUrl}/${repo.name}`
            })),
            mostActive: mockGithubData.summary.topRepos.map(repo => ({
              name: repo.name,
              full_name: `${usernameFromUrl}/${repo.name}`,
              updated_at: new Date().toISOString(),
              description: `${repo.language} project`,
              language: repo.language || 'Unknown',
              html_url: `https://github.com/${usernameFromUrl}/${repo.name}`
            })),
            projectTypes: {
              'Web Development': 8,
              'Data Science': 5,
              'Mobile Apps': 3,
              'Tools & Utilities': 9
            },
            totalProjects: mockGithubData.summary.totalRepos,
            totalStars: mockGithubData.summary.totalStars,
            totalForks: mockGithubData.summary.totalForks
          },
          socialNetwork: {
            followers: [],
            following: []
          },
          habitAnalysis: {
            hourlyDistribution: Array(24).fill(0).map(() => Math.floor(Math.random() * 20)),
            weeklyDistribution: Array(7).fill(0).map(() => Math.floor(Math.random() * 50)),
            avgCommitsPerDay: '3.2',
            mostActiveTime: '14:00-16:00',
            workPattern: 'Regular',
            totalCommitDays: 180,
            recentActivity: Array(30).fill(0).map((_, i) => [
              new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              Math.floor(Math.random() * 10)
            ] as [string, number])
          },
          mbtiAnalysis: {
            type: 'INTJ',
            description: '建筑师型人格，具有想象力和战略性思维',
            scores: {
              'E/I': 'I-75%',
              'S/N': 'N-80%',
              'T/F': 'T-70%',
              'J/P': 'J-85%'
            },
            traits: ['Analytical', 'Independent', 'Strategic']
          },
          analyzedAt: new Date().toISOString()
        };
        setGithubData(formattedData);
      } catch (err) {
        setError('生成GitHub数据失败');
      }
    }
    
    if (state?.mbtiResult) {
      setMbtiData(state.mbtiResult);
    } else {
      // 如果没有MBTI数据，生成默认数据
      setMbtiData({
        type: 'INTJ',
        dimensions: {
          E_I: 25,
          S_N: 80,
          T_F: 75,
          J_P: 85
        },
        description: '建筑师型人格，具有想象力和战略性思维，一切皆在计划中。',
        strengths: ['独立思考', '战略规划', '创新能力', '逻辑分析'],
        developmentAreas: ['团队协作', '情感表达', '灵活应变'],
        suggestions: ['多参与团队活动', '练习表达情感', '保持开放心态']
      });
    }
    
    // 如果没有GitHub用户名，尝试从URL参数获取
    if (!state?.githubUsername) {
      const urlParams = new URLSearchParams(location.search);
      const usernameFromUrl = urlParams.get('username');
      
      if (usernameFromUrl) {
        setGithubUsername(usernameFromUrl);
        try {
          const mockGithubData = GitHubDataProcessor.generateMockData(usernameFromUrl);
          // 转换为GitHubAnalysisResult格式
          const formattedData: GitHubAnalysisResult = {
            userInfo: {
              ...mockGithubData.userInfo,
              name: mockGithubData.userInfo.name || mockGithubData.userInfo.login,
              avatar_url: mockGithubData.userInfo.avatar_url || 'https://github.com/identicons/default.png',
              bio: mockGithubData.userInfo.bio || null,
              location: mockGithubData.userInfo.location || null,
              company: mockGithubData.userInfo.company || null,
              blog: mockGithubData.userInfo.blog || null,
              public_repos: mockGithubData.summary.totalRepos,
              followers: mockGithubData.userInfo.followers,
              following: mockGithubData.userInfo.following,
              created_at: mockGithubData.userInfo.created_at
            },
            languageStats: mockGithubData.skillData.reduce((acc, skill) => {
              acc[skill.name] = {
                bytes: skill.level * 1000,
                percentage: skill.percentage.toString() + '%'
              };
              return acc;
            }, {} as { [language: string]: { bytes: number; percentage: string } }),
            projectAnalysis: {
              topStarred: mockGithubData.summary.topRepos.map(repo => ({
                name: repo.name,
                full_name: `${usernameFromUrl}/${repo.name}`,
                stargazers_count: repo.stars,
                description: `${repo.language} project`,
                language: repo.language || 'Unknown',
                html_url: `https://github.com/${usernameFromUrl}/${repo.name}`
              })),
              mostActive: mockGithubData.summary.topRepos.map(repo => ({
                name: repo.name,
                full_name: `${usernameFromUrl}/${repo.name}`,
                updated_at: new Date().toISOString(),
                description: `${repo.language} project`,
                language: repo.language || 'Unknown',
                html_url: `https://github.com/${usernameFromUrl}/${repo.name}`
              })),
              projectTypes: {
                'Web Development': 8,
                'Data Science': 5,
                'Mobile Apps': 3,
                'Tools & Utilities': 9
              },
              totalProjects: mockGithubData.summary.totalRepos,
              totalStars: mockGithubData.summary.totalStars,
              totalForks: mockGithubData.summary.totalForks
            },
            socialNetwork: {
              followers: [],
              following: []
            },
            habitAnalysis: {
              hourlyDistribution: Array(24).fill(0).map(() => Math.floor(Math.random() * 20)),
              weeklyDistribution: Array(7).fill(0).map(() => Math.floor(Math.random() * 50)),
              avgCommitsPerDay: '3.2',
              mostActiveTime: '14:00-16:00',
              workPattern: 'Regular',
              totalCommitDays: 180,
              recentActivity: Array(30).fill(0).map((_, i) => [
                new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                Math.floor(Math.random() * 10)
              ] as [string, number])
            },
            mbtiAnalysis: {
              type: 'INTJ',
              description: '建筑师型人格，具有想象力和战略性思维',
              scores: {
                'E/I': 'I-75%',
                'S/N': 'N-80%',
                'T/F': 'T-70%',
                'J/P': 'J-85%'
              },
              traits: ['Analytical', 'Independent', 'Strategic']
            },
            analyzedAt: new Date().toISOString()
          };
          setGithubData(formattedData);
        } catch (err) {
          setError('生成GitHub数据失败');
        }
      } else {
        setError('未提供GitHub用户名');
      }
    }
    
    setLoading(false);
  }, [location]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">正在加载3D展览馆...</p>
        </div>
      </div>
    );
  }

  if (error || !githubData || !mbtiData) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-2">加载失败</h2>
            <p className="text-red-200">{error || '数据加载失败，请重试'}</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleBack}
              className="w-full bg-[#238636] hover:bg-[#2ea043] text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              返回上一页
            </button>
            
            <button
              onClick={handleGoHome}
              className="w-full bg-[#21262d] hover:bg-[#30363d] text-white border border-gray-600 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              回到首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 3D展览馆 */}
      <VirtualGallery githubData={githubData} />
      
      {/* 顶部导航栏 */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-[#161b22]/90 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 bg-[#21262d] hover:bg-[#30363d] text-white border border-gray-600 px-4 py-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回
          </button>
          
          <h1 className="text-white text-xl font-bold">
            {githubUsername} 的3D项目展览馆
          </h1>
          
          <button
            onClick={handleGoHome}
            className="bg-[#21262d] hover:bg-[#30363d] text-white border border-gray-600 px-4 py-2 rounded-lg transition-colors"
          >
            首页
          </button>
        </div>
      </div>
      
      {/* 底部信息栏 */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-[#161b22]/90 backdrop-blur-sm border-t border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4 text-white">
            <div className="flex items-center gap-2">
              <Github className="w-5 h-5" />
              <span className="font-medium">{githubUsername}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="font-medium">MBTI: {mbtiData.type}</span>
            </div>
          </div>
          
          <div className="text-white text-sm">
            <p>使用 WASD 移动 | 点击锁定视角 | 移动鼠标环顾四周</p>
          </div>
        </div>
      </div>
      
      {/* 加载提示（首次进入时显示） */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <div className="bg-[#21262d]/90 text-white border border-gray-600 px-6 py-3 rounded-lg text-center animate-pulse">
          <p className="text-lg font-medium">点击屏幕开始探索</p>
          <p className="text-sm text-gray-300 mt-1">使用 WASD 键移动，鼠标控制视角</p>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;