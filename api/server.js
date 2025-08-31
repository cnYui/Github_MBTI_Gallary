import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置dotenv指向项目根目录的.env文件
dotenv.config({ path: path.join(__dirname, '../.env') });
import express from 'express';
import cors from 'cors';
import crawlerHandler from './crawler.js';
import analyzeMbtiHandler from './analyze-mbti.js';
import githubCrawlReadmeHandler from './github-crawl-readme.js';
import { githubApiHandlers } from './githubApi.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// API路由
app.post('/api/crawler', async (req, res) => {
    try {
        await crawlerHandler(req, res);
    } catch (error) {
        console.error('Crawler API error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/analyze-mbti', async (req, res) => {
    try {
        await analyzeMbtiHandler(req, res);
    } catch (error) {
        console.error('Analyze MBTI API error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/github-crawl-readme', async (req, res) => {
    try {
        await githubCrawlReadmeHandler(req, res);
    } catch (error) {
        console.error('GitHub crawl README API error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GitHub API路由
app.get('/api/github/check/:username', async (req, res) => {
    try {
        await githubApiHandlers.checkUser(req, res);
    } catch (error) {
        console.error('GitHub check user error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/github/analyze/:username', async (req, res) => {
    try {
        await githubApiHandlers.analyzeUser(req, res);
    } catch (error) {
        console.error('GitHub analyze user error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/github/progress/:username', async (req, res) => {
    try {
        await githubApiHandlers.getAnalysisProgress(req, res);
    } catch (error) {
        console.error('GitHub progress error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'MBTI Gallery API'
    });
});

// 环境变量检查（调试用）
app.get('/api/env-check', (req, res) => {
    res.json({
        hasCozeToken: !!process.env.COZE_TOKEN,
        hasWorkflowId: !!process.env.COZE_WORKFLOW_ID,
        hasGithubToken: !!process.env.GITHUB_TOKEN,
        cozeTokenLength: process.env.COZE_TOKEN ? process.env.COZE_TOKEN.length : 0,
        workflowId: process.env.COZE_WORKFLOW_ID || 'not set'
    });
});

// 根路径
app.get('/', (req, res) => {
    res.json({ 
        message: 'MBTI Gallery API Server',
        version: '1.0.0',
        endpoints: [
            'POST /api/crawler - GitHub README爬虫',
            'POST /api/analyze-mbti - MBTI分析',
            'POST /api/github-crawl-readme - GitHub README数据爬取',
            'GET /api/github/check/:username - 检查GitHub用户',
            'GET /api/github/analyze/:username - 分析GitHub用户数据',
            'GET /api/github/progress/:username - 获取分析进度',
            'GET /api/health - 健康检查'
        ]
    });
});

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        success: false, 
        error: 'Internal server error',
        message: error.message 
    });
});

// 404处理
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        error: 'Endpoint not found',
        path: req.originalUrl 
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 MBTI Gallery API Server running on port ${PORT}`);
    console.log(`📋 Available endpoints:`);
    console.log(`   - POST http://localhost:${PORT}/api/crawler`);
    console.log(`   - POST http://localhost:${PORT}/api/analyze-mbti`);
    console.log(`   - POST http://localhost:${PORT}/api/github-crawl-readme`);
    console.log(`   - GET  http://localhost:${PORT}/api/github/check/:username`);
    console.log(`   - GET  http://localhost:${PORT}/api/github/analyze/:username`);
    console.log(`   - GET  http://localhost:${PORT}/api/github/progress/:username`);
    console.log(`   - GET  http://localhost:${PORT}/api/health`);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully');
    process.exit(0);
});

export default app;