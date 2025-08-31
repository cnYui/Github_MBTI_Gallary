// GitHub相关类型
export interface GitHubUser {
  login: string;
  name: string;
  bio: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
}

export interface ReadmeContent {
  content: string;
  encoding: string;
}

// MBTI分析相关类型
export interface MBTIAnalysisRequest {
  username: string;
  readmeContent: string;
  userProfile?: GitHubUser;
  repositories?: GitHubRepo[];
}

export interface MBTIResult {
  type: string;
  confidence: number;
  dimensions: {
    EI: { score: number; tendency: 'E' | 'I' };
    SN: { score: number; tendency: 'S' | 'N' };
    TF: { score: number; tendency: 'T' | 'F' };
    JP: { score: number; tendency: 'J' | 'P' };
  };
  description: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface CozeWorkflowResponse {
  success: boolean;
  data: MBTIResult;
  message?: string;
}

// 爬虫结果类型
export interface CrawlerResult {
  username: string;
  readmeCount: number;
  totalChars: number;
  resultDir: string;
}

// MBTI分析结果类型
export interface MBTIAnalysisResult {
  mbtiType?: string;
  confidence?: number;
  mbtiResult?: string;
  data?: string;
}

// 应用状态类型
export interface AppState {
  currentStep: 'input' | 'analyzing' | 'result';
  githubUsername: string;
  analysisResult: MBTIResult | null;
  error: string | null;
  loading: boolean;
}

// Gallery相关类型
export interface GalleryData {
  username: string;
  mbtiResult: MBTIResult;
}

export interface NavigationState {
  fromMBTI: boolean;
  galleryData?: GalleryData;
}