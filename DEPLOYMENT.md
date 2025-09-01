# Vercel 部署指南

## 项目概述

这是一个全栈 MBTI Gallery 项目，包含：
- 前端：React + Vite + TypeScript
- 后端：Vercel Functions (Node.js)
- 功能：GitHub 用户分析、MBTI 性格测试

## 部署步骤

### 1. 准备工作

确保你有以下账号和令牌：
- GitHub 账号
- Vercel 账号
- GitHub Personal Access Token
- Coze API Token 和 Workflow ID

### 2. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

```
GITHUB_TOKEN=your_github_personal_access_token
COZE_TOKEN=your_coze_api_token
COZE_WORKFLOW_ID=your_coze_workflow_id
```

#### 获取 GitHub Token：
1. 访问 GitHub Settings > Developer settings > Personal access tokens
2. 生成新的 token，选择 `repo` 和 `user` 权限
3. 复制生成的 token

#### 获取 Coze 配置：
1. 登录 Coze 平台
2. 获取 API Token
3. 找到你的 Workflow ID

### 3. 部署到 Vercel

#### 方法一：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel
```

#### 方法二：通过 GitHub 集成

1. 将代码推送到 GitHub 仓库
2. 在 Vercel 控制台中导入 GitHub 仓库
3. 配置环境变量
4. 部署

### 4. 验证部署

部署完成后，访问你的 Vercel 域名，确保：
- 前端页面正常加载
- API 端点正常工作
- GitHub 分析功能正常
- MBTI 分析功能正常

## API 端点

部署后的 API 端点：

- `POST /api/crawler` - GitHub 用户信息爬取
- `POST /api/analyze-mbti` - MBTI 分析
- `POST /api/github-crawl-readme` - GitHub README 爬取
- `GET /api/github/check/:username` - 检查用户状态
- `GET /api/github/analyze/:username` - 分析用户
- `GET /api/github/progress/:username` - 获取分析进度

## 项目结构

```
├── src/                 # 前端源码
├── api/                 # Vercel Functions
├── lib/                 # 共享库文件
├── dist/                # 构建输出
├── vercel.json          # Vercel 配置
├── .env.example         # 环境变量模板
└── DEPLOYMENT.md        # 部署说明
```

## 注意事项

1. **环境变量安全**：不要将真实的 API 密钥提交到代码仓库
2. **API 限制**：注意 GitHub API 和 Coze API 的调用限制
3. **函数超时**：Vercel Functions 有执行时间限制，确保 API 调用在限制时间内完成
4. **CORS 配置**：已在 API 函数中配置 CORS 头，支持跨域请求

## 故障排除

### 常见问题

1. **API 调用失败**：检查环境变量是否正确配置
2. **CORS 错误**：确保 API 函数中的 CORS 头设置正确
3. **构建失败**：检查依赖是否正确安装
4. **函数超时**：优化 API 调用逻辑，减少执行时间

### 调试方法

1. 查看 Vercel 函数日志
2. 使用浏览器开发者工具检查网络请求
3. 检查环境变量配置

## 支持

如果遇到问题，请检查：
1. Vercel 部署日志
2. 浏览器控制台错误
3. API 响应状态