import GitHubReadmeCrawler from './github-readme-crawler.js';

/**
 * GitHub README爬虫API端点
 * 限制爬取数量为10条README数据
 */
export default async function handler(req, res) {
    console.log(`🚀 README爬虫API调用开始: ${req.method} ${req.url}`);
    
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { username } = req.body;
        
        if (!username) {
            return res.status(400).json({ error: 'GitHub用户名是必需的' });
        }
        
        console.log(`📋 开始爬取用户README: ${username}`);
        
        // 初始化爬虫
        const crawler = new GitHubReadmeCrawler();
        
        // 爬取用户README数据，限制为10条
        const crawlResult = await crawler.crawlUserReadmes(username, {
            includeForks: false,
            maxRepos: 10,
            saveToFile: false
        });
        
        console.log(`✅ README爬取完成，找到${crawlResult.readme_found}个README文件`);
        
        // 转换为Coze工作流所需的格式
        const formattedData = crawlResult.