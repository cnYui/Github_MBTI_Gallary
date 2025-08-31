import fetch from 'node-fetch';

class GitHubCrawler {
  constructor(token = null) {
    this.token = token || process.env.GITHUB_TOKEN;
    this.baseUrl = 'https://api.github.com';
    this.delayMs = 1000; // API请求间隔
  }

  /**
   * 发送GitHub API请求
   * @param {string} endpoint - API端点
   * @returns {Promise<Object>} API响应数据
   */
  async makeRequest(endpoint) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GitHub-Data-Crawler'
    };
    
    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }
    
    try {
      console.log(`📡 请求: ${url}`);
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`用户或资源不存在: ${endpoint}`);
        } else if (response.status === 403) {
          throw new Error('API请求限制，请稍后重试');
        } else {
          throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      
      // 检查API限制
      const remaining = response.headers.get('x-ratelimit-remaining');
      if (remaining && parseInt(remaining) < 10) {
        console.warn('⚠️ API请求次数即将用完，请注意限制');
      }
      
      return data;
    } catch (error) {
      console.error(`❌ 请求失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 添加请求延迟
   */
  async delay(ms = this.delayMs) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取用户基本信息
   * @param {string} username - GitHub用户名
   * @returns {Promise<Object>} 用户信息
   */
  async getUserInfo(username) {
    try {
      console.log(`🔍 获取用户信息: ${username}`);
      const userInfo = await this.makeRequest(`/users/${username}`);
      
      console.log(`✅ 用户信息获取成功`);
      console.log(`   - 用户名: ${userInfo.login}`);
      console.log(`   - 姓名: ${userInfo.name || '未设置'}`);
      console.log(`   - 公开仓库: ${userInfo.public_repos}`);
      console.log(`   - 关注者: ${userInfo.followers}`);
      console.log(`   - 关注: ${userInfo.following}`);
      
      return userInfo;
    } catch (error) {
      console.error(`❌ 获取用户信息失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取用户仓库列表
   * @param {string} username - GitHub用户名
   * @param {Object} options - 选项
   * @returns {Promise<Array>} 仓库列表
   */
  async getUserRepos(username, options = {}) {
    const {
      includeForks = false,
      maxRepos = 100,
      sort = 'updated'
    } = options;

    try {
      console.log(`📚 获取用户仓库: ${username}`);
      
      let allRepos = [];
      let page = 1;
      const perPage = 100;
      
      while (allRepos.length < maxRepos) {
        const repos = await this.makeRequest(
          `/users/${username}/repos?page=${page}&per_page=${perPage}&sort=${sort}`
        );
        
        if (repos.length === 0) break;
        
        // 过滤fork仓库（如果需要）
        const filteredRepos = includeForks ? repos : repos.filter(repo => !repo.fork);
        allRepos = allRepos.concat(filteredRepos);
        
        page++;
        await this.delay();
        
        if (repos.length < perPage) break;
      }
      
      // 限制返回数量
      allRepos = allRepos.slice(0, maxRepos);
      
      console.log(`✅ 获取到 ${allRepos.length} 个仓库`);
      return allRepos;
    } catch (error) {
      console.error(`❌ 获取仓库列表失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取用户的语言统计
   * @param {Array} repos - 仓库列表
   * @returns {Promise<Object>} 语言统计
   */
  async getLanguageStats(repos) {
    try {
      console.log(`📊 分析语言分布...`);
      
      const languageStats = {};
      let totalBytes = 0;
      
      for (const repo of repos.slice(0, 50)) { // 限制分析的仓库数量
        try {
          const languages = await this.makeRequest(`/repos/${repo.full_name}/languages`);
          
          for (const [language, bytes] of Object.entries(languages)) {
            languageStats[language] = (languageStats[language] || 0) + bytes;
            totalBytes += bytes;
          }
          
          await this.delay(500); // 减少延迟
        } catch (error) {
          console.warn(`⚠️ 无法获取仓库 ${repo.name} 的语言信息`);
        }
      }
      
      // 计算百分比
      const languagePercentages = {};
      for (const [language, bytes] of Object.entries(languageStats)) {
        languagePercentages[language] = {
          bytes,
          percentage: totalBytes > 0 ? ((bytes / totalBytes) * 100).toFixed(2) : 0
        };
      }
      
      console.log(`✅ 语言分析完成，共发现 ${Object.keys(languageStats).length} 种语言`);
      return languagePercentages;
    } catch (error) {
      console.error(`❌ 语言统计失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取用户的关注者和关注的人
   * @param {string} username - GitHub用户名
   * @returns {Promise<Object>} 社交网络数据
   */
  async getSocialNetwork(username) {
    try {
      console.log(`👥 获取社交网络数据: ${username}`);
      
      // 获取关注者（限制数量）
      const followers = await this.makeRequest(`/users/${username}/followers?per_page=50`);
      await this.delay();
      
      // 获取关注的人（限制数量）
      const following = await this.makeRequest(`/users/${username}/following?per_page=50`);
      await this.delay();
      
      console.log(`✅ 社交网络数据获取完成`);
      console.log(`   - 关注者: ${followers.length}`);
      console.log(`   - 关注: ${following.length}`);
      
      return {
        followers: followers.map(user => ({
          login: user.login,
          avatar_url: user.avatar_url,
          html_url: user.html_url
        })),
        following: following.map(user => ({
          login: user.login,
          avatar_url: user.avatar_url,
          html_url: user.html_url
        }))
      };
    } catch (error) {
      console.error(`❌ 获取社交网络数据失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取用户的贡献数据
   * @param {string} username - GitHub用户名
   * @returns {Promise<Object>} 贡献数据
   */
  async getContributionData(username) {
    try {
      console.log(`📈 获取贡献数据: ${username}`);
      
      // 获取用户事件（最近活动）
      const events = await this.makeRequest(`/users/${username}/events?per_page=100`);
      
      // 分析提交时间分布
      const commitTimes = [];
      const activityByDay = {};
      
      events.forEach(event => {
        if (event.type === 'PushEvent') {
          const date = new Date(event.created_at);
          const hour = date.getHours();
          const dayOfWeek = date.getDay();
          const dateStr = date.toISOString().split('T')[0];
          
          commitTimes.push({ hour, dayOfWeek, date: dateStr });
          activityByDay[dateStr] = (activityByDay[dateStr] || 0) + 1;
        }
      });
      
      console.log(`✅ 贡献数据分析完成`);
      console.log(`   - 最近事件: ${events.length}`);
      console.log(`   - 提交记录: ${commitTimes.length}`);
      
      return {
        recentEvents: events.slice(0, 20), // 最近20个事件
        commitTimes,
        activityByDay
      };
    } catch (error) {
      console.error(`❌ 获取贡献数据失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 分析代码风格特征（用于MBTI分析）
   * @param {Array} repos - 仓库列表
   * @returns {Promise<Object>} 代码风格特征
   */
  async analyzeCodeStyle(repos) {
    try {
      console.log(`🔍 分析代码风格特征...`);
      
      const features = {
        avgRepoSize: 0,
        hasReadme: 0,
        hasTests: 0,
        hasDocumentation: 0,
        usesFrameworks: 0,
        projectTypes: {},
        namingStyle: {
          camelCase: 0,
          kebabCase: 0,
          snakeCase: 0
        }
      };
      
      let totalSize = 0;
      const sampleRepos = repos.slice(0, 20); // 分析前20个仓库
      
      for (const repo of sampleRepos) {
        totalSize += repo.size || 0;
        
        // 检查README
        if (repo.name.toLowerCase().includes('readme') || repo.description) {
          features.hasReadme++;
        }
        
        // 检查项目类型
        const language = repo.language?.toLowerCase();
        if (language) {
          features.projectTypes[language] = (features.projectTypes[language] || 0) + 1;
        }
        
        // 分析命名风格
        const name = repo.name;
        if (name.includes('-')) {
          features.namingStyle.kebabCase++;
        } else if (name.includes('_')) {
          features.namingStyle.snakeCase++;
        } else if (/[a-z][A-Z]/.test(name)) {
          features.namingStyle.camelCase++;
        }
      }
      
      features.avgRepoSize = sampleRepos.length > 0 ? totalSize / sampleRepos.length : 0;
      
      console.log(`✅ 代码风格分析完成`);
      return features;
    } catch (error) {
      console.error(`❌ 代码风格分析失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 获取完整的GitHub用户数据
   * @param {string} username - GitHub用户名
   * @param {Object} options - 选项
   * @returns {Promise<Object>} 完整的用户数据
   */
  async crawlUserData(username, options = {}) {
    const {
      includeForks = false,
      maxRepos = 50,
      includeLanguages = true,
      includeSocial = true,
      includeContributions = true,
      includeCodeStyle = true
    } = options;

    try {
      console.log(`🚀 开始爬取GitHub用户数据: ${username}`);
      
      // 1. 获取用户基本信息
      const userInfo = await this.getUserInfo(username);
      await this.delay();
      
      // 2. 获取仓库列表
      const repos = await this.getUserRepos(username, { includeForks, maxRepos });
      await this.delay();
      
      // 3. 获取语言统计
      let languageStats = {};
      if (includeLanguages && repos.length > 0) {
        languageStats = await this.getLanguageStats(repos);
      }
      
      // 4. 获取社交网络数据
      let socialNetwork = { followers: [], following: [] };
      if (includeSocial) {
        socialNetwork = await this.getSocialNetwork(username);
      }
      
      // 5. 获取贡献数据
      let contributionData = { recentEvents: [], commitTimes: [], activityByDay: {} };
      if (includeContributions) {
        contributionData = await this.getContributionData(username);
      }
      
      // 6. 分析代码风格
      let codeStyleFeatures = {};
      if (includeCodeStyle && repos.length > 0) {
        codeStyleFeatures = await this.analyzeCodeStyle(repos);
      }
      
      console.log(`✅ GitHub用户数据爬取完成!`);
      
      return {
        userInfo,
        repos,
        languageStats,
        socialNetwork,
        contributionData,
        codeStyleFeatures,
        crawledAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`❌ 爬取用户数据失败: ${error.message}`);
      throw error;
    }
  }
}

export default GitHubCrawler;