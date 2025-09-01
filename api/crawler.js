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
        const { username, options = {} } = req.body;
        
        if (!username) {
            res.status(400).json({ error: 'Username is required' });
            return;
        }
        
        console.log(`🚀 开始爬取用户: ${username}`);
        
        // 创建爬虫实例
        const crawler = new GitHubReadmeCrawler();
        
        // 设置默认选项
        const crawlOptions = {
            includeForks: false,
            maxRepos: 10,
            saveToFile: false,
            ...options
        };
        
        // 执行爬取
        const result = await crawler.crawlUserReadmes(username, crawlOptions);
        
        console.log(`✅ 爬取完成: ${username}`);
        
        res.status(200).json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error(`❌ 爬取失败:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}