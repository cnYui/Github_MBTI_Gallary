export default async function handler(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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
                completed: progress >= 100
            }
        });
    } catch (error) {
        console.error('获取分析进度失败:', error);
        res.status(500).json({
            success: false,
            error: error.message || '获取进度失败'
        });
    }
}