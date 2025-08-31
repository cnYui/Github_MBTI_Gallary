// GitHub 数据聚合和处理服务
// 整合 GitHub API 数据并生成可视化所需的数据结构

export interface SkillData {
  name: string;
  level: number;
  percentage: number;
}

export interface TimelineData {
  name: string;
  date: string;
  description?: string;
  language?: string;
  stars?: number;
}

export interface ProcessedGitHubData {
  userInfo: {
    login: string;
    name?: string;
    avatar_url?: string;
    bio?: string;
    location?: string;
    company?: string;
    blog?: string;
    public_repos: number;
    followers: number;
    following: number;
    created_at: string;
  };
  skillData: SkillData[];
  timelineData: TimelineData[];
  summary: {
    totalRepos: number;
    totalStars: number;
    totalForks: number;
    languageCount: number;
    topRepos: Array<{
      name: string;
      stars: number;
      forks: number;
      language?: string;
    }>;
  };
}

// 模拟数据生成器
export class GitHubDataProcessor {
  static generateMockData(username: string): ProcessedGitHubData {
    const mockSkillData: SkillData[] = [
      { name: 'JavaScript', level: 85, percentage: 35 },
      { name: 'TypeScript', level: 80, percentage: 25 },
      { name: 'Python', level: 75, percentage: 20 },
      { name: 'React', level: 90, percentage: 15 },
      { name: 'Node.js', level: 70, percentage: 5 }
    ];

    const mockTimelineData: TimelineData[] = [
      {
        name: 'awesome-project',
        date: '2024-01-15',
        description: '一个很棒的开源项目',
        language: 'JavaScript',
        stars: 150
      },
      {
        name: 'web-app',
        date: '2023-11-20',
        description: '现代化的Web应用',
        language: 'TypeScript',
        stars: 89
      },
      {
        name: 'data-analysis',
        date: '2023-08-10',
        description: '数据分析工具',
        language: 'Python',
        stars: 45
      }
    ];

    return {
      userInfo: {
        login: username,
        name: `${username} Developer`,
        avatar_url: `https://github.com/${username}.png`,
        bio: '热爱编程的开发者',
        location: 'China',
        company: 'Tech Company',
        blog: '',
        public_repos: 25,
        followers: 120,
        following: 80,
        created_at: '2020-01-01T00:00:00Z'
      },
      skillData: mockSkillData,
      timelineData: mockTimelineData,
      summary: {
        totalRepos: 25,
        totalStars: 284,
        totalForks: 45,
        languageCount: 8,
        topRepos: [
          { name: 'awesome-project', stars: 150, forks: 25, language: 'JavaScript' },
          { name: 'web-app', stars: 89, forks: 15, language: 'TypeScript' },
          { name: 'data-analysis', stars: 45, forks: 5, language: 'Python' }
        ]
      }
    };
  }
}