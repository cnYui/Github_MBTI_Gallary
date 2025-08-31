/**
 * GitHub数据服务
 * 负责与后端GitHub API通信
 */

const API_BASE_URL = 'http://localhost:3001/api';

export interface GitHubUserInfo {
  login: string;
  name: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  bio?: string;
  location?: string;
  blog?: string;
  company?: string;
  created_at: string;
}

export interface LanguageStats {
  [language: string]: {
    bytes: number;
    percentage: string;
  };
}

export interface ProjectAnalysis {
  topStarred: Array<{
    name: string;
    full_name: string;
    stargazers_count: number;
    description: string;
    language: string;
    html_url: string;
  }>;
  mostActive: Array<{
    name: string;
    full_name: string;
    updated_at: string;
    description: string;
    language: string;
    html_url: string;
  }>;
  projectTypes: {
    [type: string]: number;
  };
  totalProjects: number;
  totalStars: number;
  totalForks: number;
}

export interface SocialNetwork {
  followers: Array<{
    login: string;
    avatar_url: string;
    html_url: string;
  }>;
  following: Array<{
    login: string;
    avatar_url: string;
    html_url: string;
  }>;
}

export interface HabitAnalysis {
  hourlyDistribution: number[];
  weeklyDistribution: number[];
  avgCommitsPerDay: string;
  mostActiveTime: string;
  workPattern: string;
  totalCommitDays: number;
  recentActivity: Array<[string, number]>;
}

export interface MBTIAnalysis {
  type: string;
  description: string;
  scores: {
    'E/I': string;
    'S/N': string;
    'T/F': string;
    'J/P': string;
  };
  dimensions?: {
    [key: string]: {
      score: number;
      tendency: string;
    };
  };
  traits: string[];
  strengths?: string[];
  reasoning?: {
    [key: string]: string;
  };
}

export interface GitHubAnalysisResult {
  userInfo: GitHubUserInfo;
  languageStats: LanguageStats;
  projectAnalysis: ProjectAnalysis;
  socialNetwork: SocialNetwork;
  habitAnalysis: HabitAnalysis;
  mbtiAnalysis: MBTIAnalysis;
  analyzedAt: string;
}

export interface AnalysisProgress {
  username: string;
  progress: number;
  currentStep: string;
  totalSteps: number;
  completed: boolean;
}

class GitHubService {
  /**
   * 检查GitHub用户是否存在
   * @param username GitHub用户名
   * @returns 用户基本信息
   */
  async checkUser(username: string): Promise<GitHubUserInfo> {
    try {
      const response = await fetch(`${API_BASE_URL}/github/check/${username}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '用户不存在');
      }
      
      return result.data;
    } catch (error) {
      console.error('检查用户失败:', error);
      throw error;
    }
  }

  /**
   * 获取GitHub用户的完整分析数据
   * @param username GitHub用户名
   * @returns 分析结果
   */
  async analyzeUser(username: string): Promise<GitHubAnalysisResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/github/analyze/${username}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '分析失败');
      }
      
      return result.data;
    } catch (error) {
      console.error('分析用户失败:', error);
      throw error;
    }
  }

  /**
   * 获取分析进度
   * @param username GitHub用户名
   * @returns 分析进度
   */
  async getAnalysisProgress(username: string): Promise<AnalysisProgress> {
    try {
      const response = await fetch(`${API_BASE_URL}/github/progress/${username}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '获取进度失败');
      }
      
      return result.data;
    } catch (error) {
      console.error('获取分析进度失败:', error);
      throw error;
    }
  }

  /**
   * 模拟分析进度（用于演示）
   * @param username GitHub用户名
   * @param onProgress 进度回调
   * @returns 最终分析结果
   */
  async simulateAnalysis(
    username: string,
    onProgress?: (progress: AnalysisProgress) => void
  ): Promise<GitHubAnalysisResult> {
    const steps = [
      '获取用户基本信息',
      '获取仓库列表',
      '分析语言分布',
      '获取社交网络',
      '分析贡献数据',
      '分析代码风格',
      'MBTI性格分析',
      '生成可视化数据'
    ];

    // 模拟分析过程
    for (let i = 0; i < steps.length; i++) {
      const progress = {
        username,
        progress: Math.round(((i + 1) / steps.length) * 100),
        currentStep: steps[i],
        totalSteps: steps.length,
        completed: i === steps.length - 1
      };

      if (onProgress) {
        onProgress(progress);
      }

      // 模拟处理时间
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    }

    // 返回实际分析结果
    return this.analyzeUser(username);
  }

  /**
   * 验证GitHub用户名格式
   * @param username 用户名
   * @returns 是否有效
   */
  validateUsername(username: string): boolean {
    // GitHub用户名规则：
    // - 只能包含字母数字字符和连字符
    // - 不能以连字符开头或结尾
    // - 不能包含连续的连字符
    // - 长度1-39个字符
    const githubUsernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
    
    if (!username || username.length === 0) {
      return false;
    }
    
    if (username.length > 39) {
      return false;
    }
    
    if (username.includes('--')) {
      return false;
    }
    
    return githubUsernameRegex.test(username);
  }

  /**
   * 格式化语言统计数据为图表数据
   * @param languageStats 语言统计
   * @returns 图表数据
   */
  formatLanguageChartData(languageStats: LanguageStats) {
    return Object.entries(languageStats)
      .map(([language, stats]) => ({
        name: language,
        value: parseFloat(stats.percentage),
        bytes: stats.bytes
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // 只显示前10种语言
  }

  /**
   * 格式化项目类型数据为图表数据
   * @param projectTypes 项目类型统计
   * @returns 图表数据
   */
  formatProjectTypeChartData(projectTypes: { [type: string]: number }) {
    return Object.entries(projectTypes)
      .map(([type, count]) => ({
        name: type,
        value: count
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }

  /**
   * 格式化提交时间分布数据
   * @param hourlyDistribution 小时分布
   * @returns 热力图数据
   */
  formatCommitHeatmapData(hourlyDistribution: number[]) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    // 简化版热力图数据（实际应该是7x24的矩阵）
    return hours.map(hour => ({
      hour,
      commits: hourlyDistribution[hour] || 0,
      intensity: Math.min((hourlyDistribution[hour] || 0) / Math.max(...hourlyDistribution) * 100, 100)
    }));
  }

  /**
   * 获取MBTI类型的颜色
   * @param mbtiType MBTI类型
   * @returns 颜色值
   */
  getMBTIColor(mbtiType: string): string {
    const colors: { [key: string]: string } = {
      'INTJ': '#6366f1', // 紫色
      'INTP': '#8b5cf6', // 紫罗兰
      'ENTJ': '#ef4444', // 红色
      'ENTP': '#f59e0b', // 橙色
      'INFJ': '#10b981', // 绿色
      'INFP': '#06b6d4', // 青色
      'ENFJ': '#84cc16', // 青绿色
      'ENFP': '#f97316', // 橙红色
      'ISTJ': '#64748b', // 灰蓝色
      'ISFJ': '#94a3b8', // 浅灰蓝
      'ESTJ': '#dc2626', // 深红色
      'ESFJ': '#ea580c', // 深橙色
      'ISTP': '#475569', // 深灰色
      'ISFP': '#0ea5e9', // 蓝色
      'ESTP': '#dc2626', // 红色
      'ESFP': '#f59e0b'  // 黄色
    };
    
    return colors[mbtiType] || '#6b7280';
  }
}

// 导出单例实例
export const githubService = new GitHubService();
export default githubService;