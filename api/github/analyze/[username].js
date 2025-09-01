import GitHubAnalysisService from '../../githubApi.js';

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
    
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        const { username } = req.query;
        
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
            error: error.message || '分析失败'
        });
    }
}