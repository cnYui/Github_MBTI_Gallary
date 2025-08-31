# MBTI Gallery Integrated

一个基于GitHub数据分析的3D虚拟展厅项目，通过分析用户的GitHub活动数据来推断MBTI人格类型，并在沉浸式3D环境中展示分析结果。

## 🌟 项目特色

### 核心功能
- **GitHub数据分析**: 智能爬取用户GitHub仓库、README文件和贡献数据
- **MBTI人格分析**: 基于AI工作流分析编程习惯和项目特征，推断MBTI人格类型
- **3D虚拟展厅**: 沉浸式3D环境展示分析结果，包含6个主题画布和8个项目展示
- **实时数据可视化**: 动态图表展示语言分布、项目分析、协作网络等

### 技术亮点
- 🎨 **Three.js 3D渲染**: 逼真的虚拟展厅体验
- 🤖 **AI驱动分析**: 集成Coze工作流进行智能MBTI分析
- 📊 **数据可视化**: 使用Recharts创建交互式图表
- 🚀 **现代化技术栈**: React 18 + TypeScript + Vite
- 🎯 **响应式设计**: 支持多设备访问

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **3D渲染**: Three.js
- **UI组件**: Radix UI + Tailwind CSS
- **图表库**: Recharts
- **路由**: React Router DOM
- **状态管理**: Zustand
- **样式**: Tailwind CSS

### 后端
- **运行时**: Node.js
- **框架**: Express.js
- **API集成**: GitHub API, Coze AI工作流
- **数据处理**: 自定义爬虫和分析引擎

### 开发工具
- **代码规范**: ESLint + TypeScript
- **包管理**: npm
- **并发运行**: Concurrently

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装依赖
```bash
# 克隆项目
git clone <repository-url>
cd MBTI-Gallery-Integrated

# 安装依赖
npm install
```

### 环境配置
在项目根目录创建 `.env` 文件：
```env
# GitHub API Token (用于数据爬取)
GITHUB_TOKEN=your_github_token_here

# Coze AI工作流配置 (用于MBTI分析)
COZE_TOKEN=your_coze_token_here
COZE_WORKFLOW_ID=your_workflow_id_here

# 服务器端口 (可选)
PORT=3001
```

### 运行项目

#### 开发模式 (推荐)
```bash
# 同时启动前端和后端
npm run dev:full
```

#### 分别启动
```bash
# 启动前端开发服务器 (端口: 5173)
npm run dev

# 启动后端API服务器 (端口: 3001)
npm run dev:api
```

#### 生产构建
```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview
```

### 访问应用
- 前端应用: http://localhost:5173
- 后端API: http://localhost:3001
- API文档: http://localhost:3001/api

## 📖 使用指南

### 基本流程
1. **访问首页**: 了解项目介绍和功能特色
2. **输入GitHub用户名**: 在分析页面输入要分析的GitHub用户名
3. **MBTI分析**: 系统自动爬取GitHub数据并进行AI分析
4. **查看结果**: 在结果页面查看MBTI分析报告
5. **3D展厅体验**: 进入沉浸式3D虚拟展厅查看详细分析

### 3D展厅功能
- **6个主题画布**:
  - 基本信息展示
  - 编程语言分布
  - 项目分析统计
  - 协作网络图
  - MBTI分析结果
  - 开发习惯分析

- **8个项目展示**: 展示用户最具代表性的GitHub项目

- **交互控制**:
  - 鼠标拖拽: 旋转视角
  - 滚轮: 缩放视图
  - 点击画布: 查看详细内容

## 📁 项目结构

```
MBTI-Gallery-Integrated/
├── api/                    # 后端API服务
│   ├── server.js          # Express服务器主文件
│   ├── crawler.js         # GitHub数据爬虫
│   ├── analyze-mbti.js    # MBTI分析服务
│   ├── github-crawl-readme.js  # README爬虫
│   └── githubApi.js       # GitHub API处理
├── src/                   # 前端源码
│   ├── components/        # React组件
│   ├── pages/            # 页面组件
│   │   ├── HomePage.tsx   # 首页
│   │   ├── AnalyzePage.tsx # 分析页面
│   │   ├── ResultPage.tsx  # 结果页面
│   │   └── GitHubGallery.tsx # 3D展厅
│   ├── services/         # API服务
│   ├── types/           # TypeScript类型定义
│   └── lib/             # 工具库
├── public/              # 静态资源
└── package.json         # 项目配置
```

## 🔌 API接口文档

### 基础信息
- **Base URL**: `http://localhost:3001/api`
- **Content-Type**: `application/json`

### 主要接口

#### 1. GitHub用户检查
```http
GET /github/check/:username
```
检查GitHub用户是否存在并获取基本信息。

#### 2. GitHub数据分析
```http
GET /github/analyze/:username
```
分析指定用户的GitHub数据，包括仓库、语言分布、贡献统计等。

#### 3. MBTI分析
```http
POST /analyze-mbti
```
**请求体**:
```json
{
  "username": "github_username",
  "crawledData": {
    "user": {},
    "repositories": [],
    "languages": {},
    "contributions": []
  }
}
```

#### 4. README数据爬取
```http
POST /github-crawl-readme
```
**请求体**:
```json
{
  "username": "github_username",
  "limit": 10
}
```

#### 5. 分析进度查询
```http
GET /github/progress/:username
```
获取数据分析的实时进度。

#### 6. 健康检查
```http
GET /health
```
检查API服务状态。

## 🎨 3D展厅技术细节

### Three.js集成
- **场景设置**: 创建虚拟房间环境
- **光照系统**: 统一的顶部光照设计
- **材质渲染**: 逼真的墙面和画框材质
- **交互控制**: 鼠标和触摸设备支持

### 数据可视化
- **动态图表**: 基于Recharts的响应式图表
- **Canvas渲染**: 将React组件渲染到3D纹理
- **实时更新**: 数据变化时自动更新显示

## 🚀 生产环境部署

### 部署方式

#### 方式一：Docker 容器化部署 (推荐)

**1. 环境准备**
```bash
# 安装 Docker 和 Docker Compose
# macOS
brew install docker docker-compose

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose

# CentOS/RHEL
sudo yum install docker docker-compose
```

**2. 配置环境变量**
```bash
# 复制生产环境配置模板
cp .env.production.example .env.production

# 编辑配置文件，填入实际值
vim .env.production
```

**3. 一键部署**
```bash
# 使用部署脚本 (推荐)
./deploy.sh production

# 或手动部署
docker-compose --env-file .env.production up -d
```

**4. 验证部署**
```bash
# 检查服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f

# 健康检查
curl http://localhost:3001/api/health
```

#### 方式二：传统服务器部署

**1. 服务器环境准备**
```bash
# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2 进程管理器
npm install -g pm2
```

**2. 项目部署**
```bash
# 克隆项目
git clone <repository-url>
cd MBTI-Gallery-Integrated

# 安装依赖
npm ci --only=production

# 构建项目
npm run build

# 配置环境变量
cp .env.production.example .env.production
vim .env.production

# 启动服务
pm2 start api/server.js --name "mbti-gallery"
```

**3. Nginx 反向代理配置**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 生产环境配置

#### 必需环境变量
```env
# 应用基本配置
NODE_ENV=production
PORT=3001
APP_URL=https://your-domain.com

# API密钥 (必需)
GITHUB_TOKEN=ghp_your-github-token
OPENAI_API_KEY=sk-your-openai-key
COZE_API_KEY=your-coze-api-key
COZE_WORKFLOW_ID=your-workflow-id

# 安全配置
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret
CORS_ORIGIN=https://your-domain.com
```

#### 可选配置
```env
# 性能优化
CACHE_TTL=3600
RATE_LIMIT_MAX_REQUESTS=100

# 监控和日志
LOG_LEVEL=info
ENABLE_METRICS=true

# 云存储 (可选)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-bucket
```

### 部署脚本使用

#### 快速启动
```bash
# 启动生产环境
./start-production.sh

# 查看服务状态
./start-production.sh --status

# 查看日志
./start-production.sh --logs

# 重启服务
./start-production.sh --restart

# 停止服务
./start-production.sh --stop
```

#### 完整部署流程
```bash
# 生产环境部署
./deploy.sh production

# 预发布环境部署
./deploy.sh staging

# 仅构建不部署
./deploy.sh production --build-only

# 强制部署 (跳过确认)
./deploy.sh production --force

# 跳过备份
./deploy.sh production --no-backup
```

### 监控和维护

#### 服务监控
```bash
# 查看容器状态
docker-compose ps

# 查看资源使用
docker stats

# 查看服务日志
docker-compose logs -f mbti-gallery

# 进入容器调试
docker-compose exec mbti-gallery sh
```

#### 备份和恢复
```bash
# 创建备份
mkdir -p backups
cp -r logs backups/logs_$(date +%Y%m%d)
cp .env.production backups/

# 数据库备份 (如果使用)
pg_dump $DATABASE_URL > backups/db_$(date +%Y%m%d).sql
```

#### 更新部署
```bash
# 拉取最新代码
git pull origin main

# 重新部署
./deploy.sh production

# 或使用 Docker
docker-compose pull
docker-compose up -d
```

### 性能优化

#### 前端优化
- 启用 Gzip 压缩
- 配置 CDN 加速
- 优化图片资源
- 启用浏览器缓存

#### 后端优化
- 配置 Redis 缓存
- 启用 API 限流
- 优化数据库查询
- 配置负载均衡

#### 安全配置
```bash
# 配置防火墙
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# SSL 证书 (使用 Let's Encrypt)
sudo certbot --nginx -d your-domain.com
```

### 故障排除

#### 常见问题

**Q: 容器启动失败？**
```bash
# 查看详细日志
docker-compose logs mbti-gallery

# 检查配置文件
docker-compose config

# 重建镜像
docker-compose build --no-cache
```

**Q: API 请求失败？**
```bash
# 检查环境变量
curl http://localhost:3001/api/env-check

# 测试 GitHub API
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user

# 检查网络连接
telnet api.github.com 443
```

**Q: 3D 展厅加载缓慢？**
- 检查服务器带宽
- 优化 Three.js 资源加载
- 配置 CDN 加速
- 启用 Gzip 压缩

**Q: 内存使用过高？**
```bash
# 监控内存使用
docker stats

# 调整容器内存限制
# 在 docker-compose.yml 中添加:
# mem_limit: 512m
```

## 🔧 开发指南

### 代码规范
```bash
# 运行代码检查
npm run lint

# TypeScript类型检查
npm run check
```

### 调试技巧
1. **API调试**: 访问 `http://localhost:3001/api/env-check` 检查环境变量
2. **前端调试**: 使用浏览器开发者工具
3. **3D场景调试**: 在控制台查看Three.js对象

### 常见问题

**Q: 3D展厅加载缓慢？**
A: 检查网络连接，确保GitHub API响应正常。

**Q: MBTI分析失败？**
A: 验证Coze工作流配置和API密钥是否正确。

**Q: GitHub数据爬取受限？**
A: 检查GitHub Token权限和API调用频率限制。

## 🤝 贡献指南

### 贡献流程
1. Fork项目到个人仓库
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -m 'Add new feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 创建Pull Request

### 开发规范
- 遵循TypeScript严格模式
- 使用ESLint代码规范
- 编写清晰的提交信息
- 添加必要的注释和文档

### 功能建议
- [ ] 支持更多编程语言分析
- [ ] 添加团队协作分析功能
- [ ] 集成更多AI分析模型
- [ ] 支持自定义3D场景主题
- [ ] 添加数据导出功能

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- [Three.js](https://threejs.org/) - 3D图形库
- [React](https://reactjs.org/) - 前端框架
- [GitHub API](https://docs.github.com/en/rest) - 数据源
- [Coze](https://www.coze.com/) - AI工作流平台
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架

---

**开发团队**: MBTI Gallery Team  
**项目版本**: 1.0.0  
**最后更新**: 2024年1月

如有问题或建议，欢迎提交Issue或联系开发团队。
