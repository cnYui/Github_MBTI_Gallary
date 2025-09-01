import { GitHubReadmeCrawler } from '../lib/github-readme-crawler.js';

export default async function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        const { username } = req.body;
        
        if (!username) {
            res.status(400).json({ error: 'Username is required' });
            return;
        }
        
        console.log(`🔍 开始爬取 GitHub README: ${username}`);
        
        // 检查环境变量
        const githubToken = process.env.GITHUB_TOKEN;
        
        if (!githubToken) {
            console.warn('⚠️ GITHUB_TOKEN not found, using public API with rate limits');
        }
        
        // 创建爬虫实例
        const crawler = new GitHubReadmeCrawler(githubToken);
        
        // 爬取用户的README数据
        const result = await crawler.crawlUserReadmes(username);
        
        console.log(`✅ GitHub README 爬取完成: ${username}`);
        
        res.status(200).json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error(`❌ GitHub README 爬取失败:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}