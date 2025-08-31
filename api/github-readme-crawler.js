import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * GitHub README爬虫类
 */
class GitHubReadmeCrawler {
    constructor(token = null) {
        this.token = token || process.env.GITHUB_TOKEN;
        this.baseUrl = 'https://api.github.com';
        this.delay = 1000; // API请求间隔
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
            'User-Agent': 'GitHub-README-Crawler'
        };
        
        if (this.token) {
            headers['Authorization'] = `token ${this.token}`;
        }
        
        try {
            const response = await fetch(url, { headers });
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`资源未找到: ${endpoint}`);
                } else if (response.status === 403) {
                    throw new Error('API限制或权限不足，请检查Token');
                } else {
                    throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
                }
            }
            
            return await response.json();
        } catch (error) {
            throw new Error(`请求失败: ${error.message}`);
        }
    }

    /**
     * 从输入中提取GitHub用户名
     * @param {string} input - 用户输入（用户名或GitHub URL）
     * @returns {string} 用户名
     */
    extractUsername(input) {
        if (!input) {
            throw new Error('请提供GitHub用户名或用户主页URL');
        }
        
        // 如果是URL，提取用户名
        const urlMatch = input.match(/github\.com\/([^/]+)/);
        if (urlMatch) {
            return urlMatch[1];
        }
        
        // 直接返回用户名（去除空格和特殊字符）
        return input.trim().replace(/[^a-zA-Z0-9-]/g, '');
    }

    /**
     * 获取用户信息
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
            
            return {
                username: userInfo.login,
                name: userInfo.name,
                bio: userInfo.bio,
                public_repos: userInfo.public_repos,
                followers: userInfo.followers,
                following: userInfo.following,
                created_at: userInfo.created_at,
                avatar_url: userInfo.avatar_url
            };
        } catch (error) {
            throw new Error(`获取用户信息失败: ${error.message}`);
        }
    }

    /**
     * 获取用户的仓库列表
     * @param {string} username - GitHub用户名
     * @param {boolean} includeForks - 是否包含Fork的仓库
     * @returns {Promise<Array>} 仓库列表
     */
    async getUserRepositories(username, includeForks = false) {
        try {
            console.log(`📦 获取仓库列表: ${username}`);
            
            let allRepos = [];
            let page = 1;
            const perPage = 100;
            
            while (true) {
                const repos = await this.makeRequest(`/users/${username}/repos?page=${page}&per_page=${perPage}&sort=updated`);
                
                if (repos.length === 0) {
                    break;
                }
                
                allRepos = allRepos.concat(repos);
                page++;
                
                // 避免无限循环
                if (page > 10) {
                    break;
                }
            }
            
            // 过滤Fork仓库（如果需要）
            if (!includeForks) {
                allRepos = allRepos.filter(repo => !repo.fork);
            }
            
            // 按更新时间排序
            allRepos.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
            
            console.log(`✅ 找到 ${allRepos.length} 个仓库`);
            
            return allRepos.map(repo => ({
                name: repo.name,
                full_name: repo.full_name,
                description: repo.description,
                language: repo.language,
                stargazers_count: repo.stargazers_count,
                forks_count: repo.forks_count,
                updated_at: repo.updated_at,
                html_url: repo.html_url,
                fork: repo.fork
            }));
        } catch (error) {
            throw new Error(`获取仓库列表失败: ${error.message}`);
        }
    }

    /**
     * 获取仓库的README文件内容
     * @param {string} owner - 仓库所有者
     * @param {string} repo - 仓库名
     * @returns {Promise<Object|null>} README文件信息
     */
    async getReadmeContent(owner, repo) {
        try {
            console.log(`   📄 获取README: ${owner}/${repo}`);
            
            // 获取仓库根目录文件列表
            const contents = await this.makeRequest(`/repos/${owner}/${repo}/contents`);
            
            // 查找README文件（不区分大小写）
            const readmeFile = contents.find(file => {
                const fileName = file.name.toLowerCase();
                return file.type === 'file' && 
                       (fileName.startsWith('readme') && 
                       (fileName.endsWith('.md') || 
                        fileName.endsWith('.txt') || 
                        fileName === 'readme'));
            });
            
            if (readmeFile) {
                // 获取README文件内容
                const response = await this.makeRequest(`/repos/${owner}/${repo}/contents/${readmeFile.name}`);
                if (response.content) {
                    // Base64解码
                    const content = Buffer.from(response.content, 'base64').toString('utf-8');
                    console.log(`   ✅ 找到README文件: ${readmeFile.name}`);
                    return {
                        filename: readmeFile.name,
                        content: content,
                        size: response.size
                    };
                }
            }
            
            console.log(`   ⚠️  未找到README文件`);
            return null;
            
        } catch (error) {
            console.log(`   ❌ 获取README失败: ${error.message}`);
            return null;
        }
    }

    /**
     * 延时函数
     * @param {number} ms - 延时毫秒数
     */
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 爬取用户所有项目的README文件
     * @param {string} userInput - GitHub用户名或用户主页URL
     * @param {Object} options - 配置选项
     * @returns {Promise<Object>} 爬取结果
     */
    async crawlUserReadmes(userInput, options = {}) {
        const {
            includeForks = false,
            maxRepos = 10,
            saveToFile = false
        } = options;

        try {
            console.log('🚀 开始爬取GitHub用户项目README文件');
            console.log(`📋 输入: ${userInput}`);
            console.log(`🍴 包含Fork: ${includeForks}`);
            console.log(`📊 最大仓库数: ${maxRepos}`);
            
            // 提取用户名
            const username = this.extractUsername(userInput);
            console.log(`👤 用户名: ${username}`);
            
            // 获取用户信息
            const userInfo = await this.getUserInfo(username);
            
            // 获取仓库列表
            let repositories = await this.getUserRepositories(username, includeForks);
            
            // 限制仓库数量
            if (maxRepos && repositories.length > maxRepos) {
                repositories = repositories.slice(0, maxRepos);
                console.log(`📊 限制为前${maxRepos}个仓库`);
            }
            
            console.log(`📦 将爬取${repositories.length}个仓库的README文件\n`);
            
            // 爬取每个仓库的README
            const results = [];
            for (let i = 0; i < repositories.length; i++) {
                const repo = repositories[i];
                console.log(`📊 进度: ${i + 1}/${repositories.length}`);
                console.log(`🔍 爬取仓库README: ${repo.full_name}`);
                
                const [owner, repoName] = repo.full_name.split('/');
                const readme = await this.getReadmeContent(owner, repoName);
                
                results.push({
                    repository: repo,
                    readme: readme
                });
                
                // 延时避免API限制
                if (i < repositories.length - 1) {
                    await this.sleep(this.delay);
                }
                
                console.log('');
            }
            
            // 统计信息
            const readmeCount = results.filter(r => r.readme !== null).length;
            const totalWords = results
                .filter(r => r.readme !== null)
                .reduce((sum, r) => sum + r.readme.content.length, 0);
            
            const crawlResult = {
                user_info: userInfo,
                crawl_time: new Date().toISOString(),
                total_repositories: repositories.length,
                readme_found: readmeCount,
                total_readme_characters: totalWords,
                repositories: results
            };
            
            console.log('🎉 爬取完成！');
            console.log(`📊 统计信息:`);
            console.log(`   - 总仓库数: ${repositories.length}`);
            console.log(`   - 找到README: ${readmeCount}`);
            console.log(`   - README总字符数: ${totalWords}`);
            
            return crawlResult;
            
        } catch (error) {
            console.error(`❌ 爬取失败: ${error.message}`);
            throw error;
        }
    }
}

export default GitHubReadmeCrawler;