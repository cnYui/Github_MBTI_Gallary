import GitHubCrawler from './githubCrawler.js';

/**
 * GitHub数据分析服务
 */
class GitHubAnalysisService {
  constructor() {
    this.crawler = new GitHubCrawler();
  }

  /**
   * 分析项目数据
   * @param {Array} repos - 仓库列表
   * @returns {Object} 项目分析结果
   */
  analyzeProjects(repos) {
    // 按star数排序
    const topStarred = repos
      .filter(repo => !repo.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 10);

    // 按最近更新排序
    const mostActive = repos
      .filter(repo => !repo.fork)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 10);

    // 项目类型分类
    const projectTypes = {
      '工具类': 0,
      '框架/库': 0,
      '应用程序': 0,
      '学习项目': 0,
      '其他': 0
    };

    repos.forEach(repo => {
      const name = repo.name.toLowerCase();
      const description = (repo.description || '').toLowerCase();
      
      if (name.includes('tool') || name.includes('util') || description.includes('tool')) {
        projectTypes['工具类']++;
      } else if (name.includes('lib') || name.includes('framework') || description.includes('library') || description.includes('framework')) {
        projectTypes['框架/库']++;
      } else if (name.includes('app') || description.includes('application')) {
        projectTypes['应用程序']++;
      } else if (name.includes('learn') || name.includes('tutorial') || description.includes('learn')) {
        projectTypes['学习项目']++;
      } else {
        projectTypes['其他']++;
      }
    });

    return {
      topStarred,
      mostActive,
      projectTypes,
      totalProjects: repos.length,
      totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      totalForks: repos.reduce((sum, repo) => sum + repo.forks_count, 0)
    };
  }

  /**
   * 分析开发习惯
   * @param {Object} contributionData - 贡献数据
   * @param {Array} repos - 仓库列表
   * @returns {Object} 开发习惯分析
   */
  analyzeDevelopmentHabits(contributionData, repos) {
    const { commitTimes, activityByDay } = contributionData;

    // 提交时间分布（24小时）
    const hourlyDistribution = new Array(24).fill(0);
    commitTimes.forEach(commit => {
      hourlyDistribution[commit.hour]++;
    });

    // 一周提交分布
    const weeklyDistribution = new Array(7).fill(0);
    commitTimes.forEach(commit => {
      weeklyDistribution[commit.dayOfWeek]++;
    });

    // 计算平均提交频率
    const totalDays = Object.keys(activityByDay).length;
    const totalCommits = Object.values(activityByDay).reduce((sum, count) => sum + count, 0);
    const avgCommitsPerDay = totalDays > 0 ? (totalCommits / totalDays).toFixed(2) : 0;

    // 最活跃时间段
    const maxHour = hourlyDistribution.indexOf(Math.max(...hourlyDistribution));
    const timeOfDay = maxHour < 6 ? '深夜' : 
                     maxHour < 12 ? '上午' : 
                     maxHour < 18 ? '下午' : '晚上';

    // 工作模式分析
    const weekdayCommits = weeklyDistribution.slice(1, 6).reduce((sum, count) => sum + count, 0);
    const weekendCommits = weeklyDistribution[0] + weeklyDistribution[6];
    const workPattern = weekdayCommits > weekendCommits * 2 ? '工作日型' : 
                       weekendCommits > weekdayCommits ? '周末型' : '均衡型';

    return {
      hourlyDistribution,
      weeklyDistribution,
      avgCommitsPerDay,
      mostActiveTime: `${timeOfDay} (${maxHour}:00)`,
      workPattern,
      totalCommitDays: totalDays,
      recentActivity: Object.entries(activityByDay)
        .sort(([a], [b]) => new Date(b) - new Date(a))
        .slice(0, 30) // 最近30天
    };
  }

  /**
   * MBTI性格分析
   * @param {Object} codeStyleFeatures - 代码风格特征
   * @param {Object} projectAnalysis - 项目分析
   * @param {Object} habitAnalysis - 习惯分析
   * @returns {Object} MBTI分析结果
   */
  analyzeMBTI(codeStyleFeatures, projectAnalysis, habitAnalysis) {
    const scores = {
      E: 0, I: 0, // 外向/内向
      S: 0, N: 0, // 感觉/直觉
      T: 0, F: 0, // 思考/情感
      J: 0, P: 0  // 判断/感知
    };

    // E/I 维度分析
    if (projectAnalysis.totalStars > 100) scores.E += 2;
    if (codeStyleFeatures.hasReadme > 5) scores.E += 1;
    if (habitAnalysis.workPattern === '周末型') scores.I += 2;
    if (projectAnalysis.projectTypes['学习项目'] > 3) scores.I += 1;

    // S/N 维度分析
    if (projectAnalysis.projectTypes['工具类'] > projectAnalysis.projectTypes['框架/库']) scores.S += 2;
    if (codeStyleFeatures.avgRepoSize > 1000) scores.N += 1;
    if (projectAnalysis.projectTypes['框架/库'] > 2) scores.N += 2;

    // T/F 维度分析
    if (codeStyleFeatures.namingStyle.camelCase > codeStyleFeatures.namingStyle.kebabCase) scores.T += 1;
    if (projectAnalysis.projectTypes['工具类'] > 3) scores.T += 2;
    if (projectAnalysis.projectTypes['应用程序'] > 2) scores.F += 1;

    // J/P 维度分析
    if (codeStyleFeatures.hasDocumentation > 3) scores.J += 2;
    if (habitAnalysis.avgCommitsPerDay > 2) scores.J += 1;
    if (habitAnalysis.workPattern === '均衡型') scores.P += 1;
    if (projectAnalysis.projectTypes['学习项目'] > 2) scores.P += 1;

    // 确定MBTI类型
    const mbtiType = 
      (scores.E > scores.I ? 'E' : 'I') +
      (scores.S > scores.N ? 'S' : 'N') +
      (scores.T > scores.F ? 'T' : 'F') +
      (scores.J > scores.P ? 'J' : 'P');

    // MBTI类型描述
    const descriptions = {
      'INTJ': '建筑师 - 富有想象力和战略性的思想家',
      'INTP': '逻辑学家 - 具有创新精神的发明家',
      'ENTJ': '指挥官 - 大胆、富有想象力的强势领导者',
      'ENTP': '辩论家 - 聪明好奇的思想家',
      'INFJ': '提倡者 - 安静而神秘的理想主义者',
      'INFP': '调停者 - 诗意、善良的利他主义者',
      'ENFJ': '主人公 - 富有魅力的鼓舞人心的领导者',
      'ENFP': '竞选者 - 热情、有创造力的社交家',
      'ISTJ': '物流师 - 实用主义的事实导向者',
      'ISFJ': '守护者 - 非常专注、温暖的守护者',
      'ESTJ': '总经理 - 出色的管理者',
      'ESFJ': '执政官 - 极有同情心、受欢迎的人',
      'ISTP': '鉴赏家 - 大胆而实际的实验家',
      'ISFP': '探险家 - 灵活、有魅力的艺术家',
      'ESTP': '企业家 - 聪明、精力充沛的感知者',
      'ESFP': '娱乐家 - 自发的、精力充沛的娱乐者'
    };

    return {
      type: mbtiType,
      description: descriptions[mbtiType] || '独特的编程风格',
      scores: {
        'E/I': `${scores.E}/${scores.I}`,
        'S/N': `${scores.S}/${scores.N}`,
        'T/F': `${scores.T}/${scores.F}`,
        'J/P': `${scores.J}/${scores.P}`
      },
      traits: this.getMBTITraits(mbtiType)
    };
  }

  /**
   * 获取MBTI特征描述
   * @param {string} type - MBTI类型
   * @returns {Array} 特征列表
   */
  getMBTITraits(type) {
    const traits = {
      'INTJ': ['战略思维', '独立工作', '长期规划', '系统架构'],
      'INTP': ['逻辑分析', '理论探索', '创新思维', '问题解决'],
      'ENTJ': ['领导能力', '目标导向', '效率优先', '团队协作'],
      'ENTP': ['创意思维', '快速学习', '多样化项目', '概念验证'],
      'INFJ': ['用户体验', '长期愿景', '完美主义', '深度思考'],
      'INFP': ['价值驱动', '创意表达', '个人项目', '用户关怀'],
      'ENFJ': ['团队建设', '知识分享', '社区贡献', '指导他人'],
      'ENFP': ['创新实验', '快速原型', '社交编程', '灵感驱动'],
      'ISTJ': ['稳定可靠', '最佳实践', '文档完善', '渐进改进'],
      'ISFJ': ['用户支持', '维护优化', '团队和谐', '细节关注'],
      'ESTJ': ['项目管理', '流程优化', '团队效率', '目标达成'],
      'ESFJ': ['用户友好', '社区活跃', '协作开发', '反馈响应'],
      'ISTP': ['技术探索', '工具开发', '问题修复', '实用主义'],
      'ISFP': ['界面设计', '用户体验', '创意项目', '个人风格'],
      'ESTP': ['快速开发', '实时响应', '适应变化', '实用解决'],
      'ESFP': ['互动体验', '社交功能', '趋势跟随', '用户娱乐']
    };
    
    return traits[type] || ['独特风格', '个性化开发', '创新思维', '技术探索'];
  }

  /**
   * 处理完整的GitHub数据分析
   * @param {string} username - GitHub用户名
   * @returns {Promise<Object>} 分析结果
   */
  async analyzeGitHubData(username) {
    try {
      console.log(`🔍 开始分析GitHub用户: ${username}`);
      
      // 爬取原始数据
      const rawData = await this.crawler.crawlUserData(username, {
        maxRepos: 50,
        includeLanguages: true,
        includeSocial: true,
        includeContributions: true,
        includeCodeStyle: true
      });
      
      // 分析项目数据
      const projectAnalysis = this.analyzeProjects(rawData.repos);
      
      // 分析开发习惯
      const habitAnalysis = this.analyzeDevelopmentHabits(
        rawData.contributionData, 
        rawData.repos
      );
      
      // MBTI分析
      const mbtiAnalysis = this.analyzeMBTI(
        rawData.codeStyleFeatures,
        projectAnalysis,
        habitAnalysis
      );
      
      console.log(`✅ GitHub数据分析完成`);
      
      return {
        userInfo: rawData.userInfo,
        languageStats: rawData.languageStats,
        projectAnalysis,
        socialNetwork: rawData.socialNetwork,
        habitAnalysis,
        mbtiAnalysis,
        rawData: {
          repos: rawData.repos.slice(0, 20), // 只返回前20个仓库
          contributionData: rawData.contributionData,
          codeStyleFeatures: rawData.codeStyleFeatures
        },
        analyzedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ GitHub数据分析失败: ${error.message}`);
      throw error;
    }
  }
}

/**
 * GitHub API路由处理器
 */
export const githubApiHandlers = {
  /**
   * 检查用户是否存在
   */
  async checkUser(req, res) {
    try {
      const { username } = req.params;
      
      if (!username) {
        return res.status(400).json({
          success: false,
          error: '用户名不能为空'
        });
      }
      
      const crawler = new GitHubCrawler();
      const userInfo = await crawler.getUserInfo(username);
      
      res.json({
        success: true,
        data: {
          login: userInfo.login,
          name: userInfo.name,
          avatar_url: userInfo.avatar_url,
          public_repos: userInfo.public_repos,
          followers: userInfo.followers,
          following: userInfo.following
        }
      });
    } catch (error) {
      console.error('检查用户失败:', error);
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * 获取完整的GitHub数据分析
   */
  async analyzeUser(req, res) {
    try {
      const { username } = req.params;
      
      if (!username) {
        return res.status(400).json({
          success: false,
          error: '用户名不能为空'
        });
      }
      
      const analysisService = new GitHubAnalysisService();
      const analysisResult = await analysisService.analyzeGitHubData(username);
      
      res.json({
        success: true,
        data: analysisResult
      });
    } catch (error) {
      console.error('分析用户数据失败:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * 获取分析进度（模拟）
   */
  async getAnalysisProgress(req, res) {
    try {
      const { username } = req.params;
      
      // 模拟分析进度
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
      
      const currentStep = Math.floor(Math.random() * steps.length);
      const progress = Math.min(((currentStep + 1) / steps.length) * 100, 100);
      
      res.json({
        success: true,
        data: {
          username,
          progress,
          currentStep: steps[currentStep],
          totalSteps: steps.length,
          completed: progress === 100
        }
      });
    } catch (error) {
      console.error('获取分析进度失败:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

export default GitHubAnalysisService;