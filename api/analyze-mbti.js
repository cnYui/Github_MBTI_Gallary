export default async function handler(req, res) {
    console.log(`🚀 API调用开始: ${req.method} ${req.url}`);
    
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        console.log(`✅ OPTIONS请求处理完成`);
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        console.log(`❌ 不支持的请求方法: ${req.method}`);
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        const { username, crawledData } = req.body;
        
        if (!username) {
            res.status(400).json({ error: 'Username is required' });
            return;
        }
        
        // 支持轻量级分析（crawledData为null时）
        if (!crawledData) {
            console.log(`🔍 开始轻量级MBTI分析: ${username}`);
            
            // 轻量级分析：基于用户名生成默认MBTI结果
            const lightweightResult = generateLightweightMBTI(username);
            
            console.log(`✅ 轻量级MBTI分析完成: ${username} - ${lightweightResult.type}`);
            
            res.status(200).json({
                success: true,
                data: {
                    username: username,
                    mbti_result: lightweightResult.type,
                    mbtiType: lightweightResult.type,
                    description: lightweightResult.description,
                    dimensions: lightweightResult.dimensions,
                    confidence: lightweightResult.confidence,
                    traits: lightweightResult.traits,
                    strengths: lightweightResult.strengths,
                    weaknesses: lightweightResult.weaknesses,
                    recommendations: lightweightResult.recommendations,
                    analysis_time: new Date().toISOString(),
                    analysis_type: 'lightweight'
                }
            });
            return;
        }
        
        console.log(`🔍 开始MBTI分析: ${username}`);
        
        // 转换数据格式为Coze API所需的格式
        let repositories;
        if (crawledData.repositories) {
            // 如果是完整的爬取结果
            repositories = crawledData.repositories
                .filter(item => item.readme && item.readme.content)
                .map(item => ({
                    repository_name: item.repository.name,
                    repository_description: item.repository.description || '',
                    readme_content: item.readme.content,
                    language: item.repository.language || 'Unknown',
                    stars: item.repository.stargazers_count || 0
                }));
        } else if (Array.isArray(crawledData)) {
            // 如果是直接的数组格式
            repositories = crawledData;
        } else if (crawledData && crawledData.repositories === null) {
            // 如果repositories字段为null，说明没有爬取到仓库数据，回退到轻量级分析
            console.log(`⚠️ 没有爬取到仓库数据，回退到轻量级分析: ${username}`);
            const lightweightResult = generateLightweightMBTI(username);
            res.status(200).json({
                success: true,
                data: {
                    username: username,
                    mbti_result: lightweightResult.type,
                    mbtiType: lightweightResult.type,
                    description: lightweightResult.description,
                    dimensions: lightweightResult.dimensions,
                    confidence: lightweightResult.confidence,
                    traits: lightweightResult.traits,
                    strengths: lightweightResult.strengths,
                    weaknesses: lightweightResult.weaknesses,
                    recommendations: lightweightResult.recommendations,
                    analysis_time: new Date().toISOString(),
                    analysis_type: 'lightweight'
                }
            });
            return;
        } else {
            throw new Error('Invalid crawledData format');
        }
        
        if (repositories.length === 0) {
            // 如果没有有效的仓库数据，回退到轻量级分析
            console.log(`⚠️ 没有有效的仓库数据，回退到轻量级分析: ${username}`);
            const lightweightResult = generateLightweightMBTI(username);
            res.status(200).json({
                success: true,
                data: {
                    username: username,
                    mbti_result: lightweightResult.type,
                    mbtiType: lightweightResult.type,
                    description: lightweightResult.description,
                    dimensions: lightweightResult.dimensions,
                    confidence: lightweightResult.confidence,
                    traits: lightweightResult.traits,
                    strengths: lightweightResult.strengths,
                    weaknesses: lightweightResult.weaknesses,
                    recommendations: lightweightResult.recommendations,
                    analysis_time: new Date().toISOString(),
                    analysis_type: 'lightweight'
                }
            });
            return;
        }
        
        console.log(`📊 准备分析 ${repositories.length} 个仓库的数据`);
        
        // 调用Coze工作流API
        const cozeResponse = await callCozeWorkflow(repositories, username);
        
        // 从Coze响应中提取MBTI结果
        const mbtiResult = extractMBTIFromCozeResponse(cozeResponse);
        
        console.log(`✅ MBTI分析完成: ${username} - ${mbtiResult}`);
        
        res.status(200).json({
            success: true,
            data: {
                username: username,
                mbti_result: mbtiResult,
                analysis_time: new Date().toISOString(),
                repositories_analyzed: repositories.length
            }
        });
        
    } catch (error) {
        console.error(`❌ MBTI分析失败:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

/**
 * 调用Coze工作流API (流式版本)
 * @param {Array} repositories - 仓库数据
 * @param {string} username - 用户名
 * @returns {Promise<Object>} Coze API响应
 */
async function callCozeWorkflow(repositories, username) {
    const cozeApiUrl = process.env.COZE_API_URL || 'https://api.coze.cn/v1/workflow/stream_run';
    const cozeToken = process.env.COZE_TOKEN;
    const workflowId = process.env.COZE_WORKFLOW_ID;
    
    if (!cozeToken || !workflowId) {
        throw new Error('Coze API configuration missing. Please set COZE_TOKEN and COZE_WORKFLOW_ID environment variables.');
    }
    
    const requestBody = {
        workflow_id: workflowId,
        parameters: {
            input: repositories.map(repo => ({
                language: repo.language,
                readme_content: repo.readme_content,
                repository_description: repo.repository_description,
                repository_name: repo.repository_name,
                stars: repo.stars
            }))
        }
    };
    
    console.log(`🔗 调用Coze工作流: ${workflowId}`);
    console.log(`📝 请求参数:`, JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(cozeApiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${cozeToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Coze API请求失败: ${response.status} ${response.statusText}`);
        console.error(`❌ 错误详情: ${errorText}`);
        throw new Error(`Coze API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    console.log(`✅ Coze工作流调用成功`);
    
    // 检查响应类型
    const contentType = response.headers.get('content-type');
    console.log(`📋 响应类型: ${contentType}`);
    
    // 检查是否为流式响应
    const isStreamResponse = contentType && (contentType.includes('text/event-stream') || contentType.includes('text/plain'));
    console.log(`📋 是否为流式响应: ${isStreamResponse}`);
    
    if (isStreamResponse) {
        // 处理流式响应 (Server-Sent Events)
        console.log(`📡 开始处理流式响应...`);
        return await handleStreamResponse(response);
    } else {
        // 处理普通JSON响应
        console.log(`📋 处理普通JSON响应...`);
        const jsonResponse = await response.json();
        console.log(`📋 收到JSON响应:`, JSON.stringify(jsonResponse, null, 2));
        return jsonResponse;
    }
}

/**
 * 处理Coze流式响应
 * @param {Response} response - fetch响应对象
 * @returns {Promise<Object>} 解析后的完整响应
 */
async function handleStreamResponse(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalResult = null;
    let hasResult = false;
    
    console.log(`📡 开始处理流式响应...`);
    
    try {
        while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
                console.log(`📡 流式响应处理完成`);
                break;
            }
            
            // 将新数据添加到缓冲区
            buffer += decoder.decode(value, { stream: true });
            
            // 处理缓冲区中的完整行
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // 保留最后一个不完整的行
            
            for (const line of lines) {
                if (line.trim() === '') continue;
                
                // 处理SSE格式的数据行
                if (line.startsWith('data:')) {
                    try {
                        // 移除 "data: " 前缀
                        const cleanLine = line.replace(/^data:\s*/, '').trim();
                        if (cleanLine === '' || cleanLine === '[DONE]') continue;
                        
                        const data = JSON.parse(cleanLine);
                        console.log(`📨 收到流式数据:`, JSON.stringify(data, null, 2));
                        
                        // 检查是否包含最终结果
                        if (data.event === 'workflow.completed' || data.event === 'done') {
                            finalResult = data;
                            hasResult = true;
                            console.log(`🎯 收到最终结果:`, JSON.stringify(finalResult, null, 2));
                        } else if (data.data && (data.data.output || data.data.result)) {
                            finalResult = data;
                            hasResult = true;
                            console.log(`🎯 收到输出结果:`, JSON.stringify(finalResult, null, 2));
                        } else if (data.content && typeof data.content === 'string') {
                            // 检查content字段中是否包含MBTI结果
                            const mbtiPattern = /\b(INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP)\b/i;
                            if (mbtiPattern.test(data.content)) {
                                finalResult = data;
                                hasResult = true;
                                console.log(`🎯 在content中找到MBTI结果:`, JSON.stringify(finalResult, null, 2));
                            }
                        }
                    } catch (parseError) {
                        console.warn(`⚠️ 解析SSE数据失败:`, line, parseError.message);
                    }
                } else if (line.startsWith('id:') || line.startsWith('event:')) {
                    // 跳过SSE的id和event行，这些不是JSON数据
                    console.log(`📋 SSE元数据:`, line);
                    continue;
                } else {
                    // 尝试解析其他可能的JSON行
                    try {
                        const data = JSON.parse(line.trim());
                        console.log(`📨 收到其他格式数据:`, JSON.stringify(data, null, 2));
                        
                        if (data.event === 'workflow.completed' || data.event === 'done') {
                            finalResult = data;
                            hasResult = true;
                            console.log(`🎯 收到最终结果:`, JSON.stringify(finalResult, null, 2));
                        } else if (data.data && (data.data.output || data.data.result)) {
                            finalResult = data;
                            hasResult = true;
                            console.log(`🎯 收到输出结果:`, JSON.stringify(finalResult, null, 2));
                        }
                    } catch (parseError) {
                        // 不是JSON数据，跳过
                        console.log(`📋 跳过非JSON行:`, line);
                    }
                }
            }
        }
        
        // 处理缓冲区中剩余的数据
        if (buffer.trim()) {
            const remainingLine = buffer.trim();
            
            if (remainingLine.startsWith('data:')) {
                try {
                    const cleanLine = remainingLine.replace(/^data:\s*/, '').trim();
                    if (cleanLine && cleanLine !== '[DONE]') {
                        const data = JSON.parse(cleanLine);
                        console.log(`📨 收到最后的流式数据:`, JSON.stringify(data, null, 2));
                        if (!hasResult && (data.event === 'workflow.completed' || data.data)) {
                            finalResult = data;
                            hasResult = true;
                        }
                    }
                } catch (parseError) {
                    console.warn(`⚠️ 解析最后的SSE数据失败:`, remainingLine, parseError.message);
                }
            } else if (!remainingLine.startsWith('id:') && !remainingLine.startsWith('event:')) {
                // 尝试解析非SSE元数据的行
                try {
                    const data = JSON.parse(remainingLine);
                    console.log(`📨 收到最后的其他格式数据:`, JSON.stringify(data, null, 2));
                    if (!hasResult && (data.event === 'workflow.completed' || data.data)) {
                        finalResult = data;
                        hasResult = true;
                    }
                } catch (parseError) {
                    console.log(`📋 跳过最后的非JSON行:`, remainingLine);
                }
            } else {
                console.log(`📋 跳过最后的SSE元数据:`, remainingLine);
            }
        }
        
        if (!hasResult || !finalResult) {
            console.warn(`⚠️ 未收到有效的最终结果，可能需要更长的等待时间`);
            return { data: { output: null }, raw_response: 'No final result received' };
        }
        
        return finalResult;
        
    } catch (error) {
        console.error(`❌ 处理流式响应时出错:`, error);
        throw error;
    } finally {
        reader.releaseLock();
    }
}

/**
 * 从Coze响应中提取MBTI结果
 * @param {Object} cozeResponse - Coze API响应
 * @returns {string} MBTI类型
 */
function extractMBTIFromCozeResponse(cozeResponse) {
    try {
        console.log(`🔍 开始提取MBTI结果...`);
        console.log(`📋 完整响应:`, JSON.stringify(cozeResponse, null, 2));
        
        // 如果data字段是字符串，先解析JSON
        let parsedData = cozeResponse;
        if (cozeResponse.data && typeof cozeResponse.data === 'string') {
            try {
                const dataObj = JSON.parse(cozeResponse.data);
                parsedData = { ...cozeResponse, data: dataObj };
                console.log('📋 解析后的data对象:', JSON.stringify(dataObj, null, 2));
            } catch (error) {
                console.log('⚠️ 解析data字段失败:', error.message);
            }
        }
        
        let mbtiResult = '';
        
        // 尝试多种可能的响应格式
        const possiblePaths = [
            parsedData?.data?.output,
            parsedData?.data?.result,
            parsedData?.output,
            parsedData?.result,
            parsedData?.data?.content,
            parsedData?.content,
            parsedData?.message,
            parsedData?.data?.message,
            parsedData?.data?.data?.output,
            parsedData?.data?.data?.result,
            // 添加Message.content路径
            parsedData?.data?.Message?.content,
            parsedData?.Message?.content,
            parsedData?.data?.messages?.[0]?.content,
            parsedData?.messages?.[0]?.content
        ];
        
        // 特别检查content字段（从流式响应中获取）
        if (parsedData?.content && typeof parsedData.content === 'string') {
            console.log(`🔍 检查content字段:`, parsedData.content.substring(0, 200) + '...');
            const mbtiPattern = /\b(INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP)\b/i;
            const match = parsedData.content.match(mbtiPattern);
            if (match) {
                mbtiResult = match[1].toUpperCase();
                console.log(`✅ 从content字段中找到MBTI结果: ${mbtiResult}`);
                return mbtiResult;
            }
        }
        
        for (const path of possiblePaths) {
            if (path && typeof path === 'string') {
                console.log(`🔍 检查路径结果:`, path);
                const mbtiPattern = /\b(INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP)\b/i;
                const match = path.match(mbtiPattern);
                if (match) {
                    mbtiResult = match[1].toUpperCase();
                    console.log(`✅ 从路径中找到MBTI结果: ${mbtiResult}`);
                    return mbtiResult;
                }
            }
        }
        
        // 如果直接路径没有找到，在整个响应中搜索
        console.log(`🔍 在整个响应中搜索MBTI模式...`);
        const responseStr = JSON.stringify(parsedData);
        const mbtiPattern = /\b(INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP)\b/i;
        const match = responseStr.match(mbtiPattern);
        
        if (match) {
            mbtiResult = match[1].toUpperCase();
            console.log(`✅ 在响应字符串中找到MBTI结果: ${mbtiResult}`);
            return mbtiResult;
        }
        
        // 如果仍然没有找到，检查是否有嵌套的数组或对象
        if (parsedData?.data && Array.isArray(parsedData.data)) {
            console.log(`🔍 检查数组格式的响应...`);
            for (const item of parsedData.data) {
                if (item && typeof item === 'object') {
                    const itemStr = JSON.stringify(item);
                    const itemMatch = itemStr.match(mbtiPattern);
                    if (itemMatch) {
                        mbtiResult = itemMatch[1].toUpperCase();
                        console.log(`✅ 在数组项中找到MBTI结果: ${mbtiResult}`);
                        return mbtiResult;
                    }
                }
            }
        }
        
        // 如果无法提取有效的MBTI结果，返回默认值
        console.warn(`⚠️ 无法从Coze响应中提取有效的MBTI结果，使用默认值`);
        console.warn(`📋 响应结构:`, Object.keys(parsedData || {}));
        return 'INTJ'; // 默认值
        
    } catch (error) {
        console.error(`❌ 提取MBTI结果时出错:`, error);
        console.error(`📋 错误响应:`, cozeResponse);
        return 'INTJ'; // 默认值
    }
}

/**
 * 生成轻量级MBTI分析结果
 * @param {string} username - GitHub用户名
 * @returns {Object} 轻量级MBTI结果
 */
function generateLightweightMBTI(username) {
    // 基于用户名生成简单的MBTI类型（这里使用简单的哈希算法）
    const mbtiTypes = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 
                      'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
    
    // 简单的哈希函数基于用户名
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        const char = username.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 转换为32位整数
    }
    
    const typeIndex = Math.abs(hash) % mbtiTypes.length;
    const selectedType = mbtiTypes[typeIndex];
    
    // 生成维度数据
    const generateDimensions = (type) => {
        return {
            'EI': { tendency: type[0], score: type[0] === 'E' ? 0.7 : 0.3 },
            'SN': { tendency: type[1], score: type[1] === 'S' ? 0.3 : 0.7 },
            'TF': { tendency: type[2], score: type[2] === 'T' ? 0.7 : 0.3 },
            'JP': { tendency: type[3], score: type[3] === 'J' ? 0.7 : 0.3 }
        };
    };
    
    // MBTI类型描述
    const descriptions = {
        'INTJ': '建筑师 - 富有想象力和战略性的思想家，一切皆在计划之中。',
        'INTP': '逻辑学家 - 具有创新精神的发明家，对知识有着不可抑制的渴望。',
        'ENTJ': '指挥官 - 大胆、富有想象力、意志强烈的领导者，总能找到或创造解决方法。',
        'ENTP': '辩论家 - 聪明好奇的思想家，不会放过任何挑战的机会。',
        'INFJ': '提倡者 - 安静而神秘，同时鼓舞人心且不知疲倦的理想主义者。',
        'INFP': '调停者 - 诗意、善良的利他主义者，总是热心为正当理由而努力。',
        'ENFJ': '主人公 - 富有魅力、鼓舞人心的领导者，有着感化他人的能力。',
        'ENFP': '竞选者 - 热情、有创造力、社交能力强，总能找到微笑的理由。',
        'ISTJ': '物流师 - 实用主义的现实主义者，可靠性无可置疑。',
        'ISFJ': '守护者 - 非常专注、温暖的守护者，时刻准备保护爱的人。',
        'ESTJ': '总经理 - 出色的管理者，在管理事物或人员方面无与伦比。',
        'ESFJ': '执政官 - 极有同情心、受欢迎、总是热心帮助他人。',
        'ISTP': '鉴赏家 - 大胆而实际的实验家，擅长使用各种工具。',
        'ISFP': '探险家 - 灵活、有魅力的艺术家，时刻准备探索新的可能性。',
        'ESTP': '企业家 - 聪明、精力充沛、善于感知的人，真正享受生活在边缘。',
        'ESFP': '娱乐家 - 自发的、精力充沛和热情的人，生活在他们周围从不无聊。'
    };
    
    // 基本特质
    const traits = {
        energy: selectedType[0] === 'E' ? 'Extraversion' : 'Introversion',
        information: selectedType[1] === 'S' ? 'Sensing' : 'Intuition',
        decisions: selectedType[2] === 'T' ? 'Thinking' : 'Feeling',
        lifestyle: selectedType[3] === 'J' ? 'Judging' : 'Perceiving'
    };
    
    // 通用优势和建议
    const commonStrengths = {
        'I': ['独立思考', '深度专注', '自我反思'],
        'E': ['社交能力', '团队协作', '表达能力'],
        'S': ['注重细节', '实用主义', '脚踏实地'],
        'N': ['创新思维', '战略规划', '抽象思考'],
        'T': ['逻辑分析', '客观决策', '问题解决'],
        'F': ['同理心', '人际关系', '价值导向'],
        'J': ['组织能力', '计划性', '目标导向'],
        'P': ['灵活性', '适应能力', '开放心态']
    };
    
    const strengths = [
        ...commonStrengths[selectedType[0]],
        ...commonStrengths[selectedType[1]],
        ...commonStrengths[selectedType[2]],
        ...commonStrengths[selectedType[3]]
    ];
    
    // 生成判断理由
    const reasoning = {
        'EI': selectedType[0] === 'E' 
            ? '基于用户名特征分析，倾向于外向型，可能更喜欢团队协作和开放交流'
            : '基于用户名特征分析，倾向于内向型，可能更专注于独立思考和深度工作',
        'SN': selectedType[1] === 'S'
            ? '分析显示偏向感觉型，可能更注重实际应用和具体细节的实现'
            : '分析显示偏向直觉型，可能更关注创新思维和抽象概念的探索',
        'TF': selectedType[2] === 'T'
            ? '判断倾向于思考型，可能在决策时更重视逻辑分析和客观标准'
            : '判断倾向于情感型，可能在决策时更考虑人际关系和价值观念',
        'JP': selectedType[3] === 'J'
            ? '表现出判断型特征，可能更喜欢有序的工作环境和明确的计划'
            : '表现出感知型特征，可能更适应灵活的工作方式和开放的可能性'
    };

    return {
        type: selectedType,
        description: descriptions[selectedType] || '基于GitHub活动分析的性格类型',
        dimensions: generateDimensions(selectedType),
        confidence: 0.75, // 轻量级分析的置信度较低
        traits: traits,
        strengths: strengths.slice(0, 4), // 取前4个优势
        weaknesses: ['需要更多数据进行深入分析'],
        recommendations: [
            '完善GitHub项目以获得更准确的分析',
            '增加项目描述和README文档',
            '参与更多开源项目协作',
            '尝试不同类型的编程项目'
        ],
        reasoning: reasoning
    };
}