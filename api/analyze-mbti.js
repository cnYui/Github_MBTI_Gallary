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
        const { readmeData, crawledData, analysisType = 'mbti' } = req.body;
        
        // 支持两种参数名称：readmeData 或 crawledData
        const dataToAnalyze = readmeData || crawledData;
        
        if (!dataToAnalyze) {
            res.status(400).json({ error: 'README data is required' });
            return;
        }
        
        console.log(`🔍 开始分析 MBTI，类型: ${analysisType}`);
        
        // 检查环境变量
        const cozeToken = process.env.COZE_TOKEN;
        const workflowId = process.env.COZE_WORKFLOW_ID;
        
        if (!cozeToken || !workflowId) {
            throw new Error('Missing COZE_TOKEN or COZE_WORKFLOW_ID environment variables');
        }
        
        // 准备分析数据
        const analysisData = {
            readme_content: typeof dataToAnalyze === 'string' ? dataToAnalyze : JSON.stringify(dataToAnalyze),
            analysis_type: analysisType,
            timestamp: new Date().toISOString()
        };
        
        // 调用 Coze API
        const response = await fetch('https://api.coze.cn/v1/workflow/run', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${cozeToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                workflow_id: workflowId,
                parameters: analysisData
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Coze API error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        
        console.log(`✅ MBTI 分析完成`);
        
        res.status(200).json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error(`❌ MBTI 分析失败:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}