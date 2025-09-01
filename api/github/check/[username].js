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
        
        // 检查GitHub用户是否存在
        const response = await fetch(`https://api.github.com/users/${username}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                return res.status(404).json({
                    success: false,
                    error: 'GitHub用户不存在'
                });
            }
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const userData = await response.json();
        
        res.json({
            success: true,
            data: {
                username: userData.login,
                name: userData.name,
                avatar_url: userData.avatar_url,
                public_repos: userData.public_repos,
                followers: userData.followers,
                following: userData.following,
                created_at: userData.created_at,
                exists: true
            }
        });
    } catch (error) {
        console.error('检查用户失败:', error);
        res.status(500).json({
            success: false,
            error: error.message || '检查用户失败'
        });
    }
}