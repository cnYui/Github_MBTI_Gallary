import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GitHubAnalysisResult } from '../services/githubService';

export interface VirtualGalleryProps {
  githubData: GitHubAnalysisResult;
}

const VirtualGallery: React.FC<VirtualGalleryProps> = ({ githubData }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const frameId = useRef<number | null>(null);

  // 定义画作数组 - 调整Z坐标使画布贴近墙壁，增加画作间距
  const artworks = [
    // 后墙 - 原有6幅画布
    { id: 1, title: '基本信息', type: 'userInfo', position: [-6, 2.25, -9.9] },
    { id: 2, title: '语言分布', type: 'languages', position: [-2, 2.25, -9.9] },
    { id: 3, title: '项目分析', type: 'projects', position: [2, 2.25, -9.9] },
    { id: 4, title: '协作网络', type: 'network', position: [6, 2.25, -9.9] },
    { id: 5, title: 'MBTI分析', type: 'mbti', position: [-4, 2.25, 9.9] },
    { id: 6, title: '开发习惯', type: 'habits', position: [4, 2.25, 9.9] },
    
    // 左墙 - 4个项目展示画布（一行四列，间距调整为4个单位）
    { id: 7, title: '项目展示1', type: 'project1', position: [-9.8, 2.25, -8] },
    { id: 8, title: '项目展示2', type: 'project2', position: [-9.8, 2.25, -4] },
    { id: 9, title: '项目展示3', type: 'project3', position: [-9.8, 2.25, 0] },
    { id: 10, title: '项目展示4', type: 'project4', position: [-9.8, 2.25, 4] },
    
    // 右墙 - 4个项目展示画布（一行四列，间距调整为4个单位）
    { id: 11, title: '项目展示5', type: 'project5', position: [9.8, 2.25, -8] },
    { id: 12, title: '项目展示6', type: 'project6', position: [9.8, 2.25, -4] },
    { id: 13, title: '项目展示7', type: 'project7', position: [9.8, 2.25, 0] },
    { id: 14, title: '项目展示8', type: 'project8', position: [9.8, 2.25, 4] }
  ];

  // 创建艺术抽象花纹纹理
  const createArtTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // 渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    // 添加抽象图案
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * 512,
        Math.random() * 512,
        Math.random() * 30 + 10,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `hsla(${Math.random() * 360}, 70%, 60%, 0.3)`;
      ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
  };

  // 创建项目展示可视化
  const createProjectShowcaseVisualization = (projectIndex: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;

    // 背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 800, 600);

    // 获取项目数据
    const projects = [
      ...githubData.projectAnalysis.topStarred,
      ...githubData.projectAnalysis.mostActive
    ];
    
    const project = projects[projectIndex] || {
      name: `示例项目 ${projectIndex + 1}`,
      description: '这是一个示例项目，展示了开发者的技术能力和创新思维。',
      language: 'JavaScript',
      stargazers_count: Math.floor(Math.random() * 100),
      html_url: '#',
      full_name: `user/project-${projectIndex + 1}`
    };

    // 标题
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('项目展示', 400, 50);

    // 项目名称
    ctx.fillStyle = '#4fc3f7';
    ctx.font = 'bold 32px Arial';
    const projectName = project.name.length > 20 ? project.name.substring(0, 20) + '...' : project.name;
    ctx.fillText(projectName, 400, 120);

    // 项目完整名称
    if (project.full_name) {
      ctx.fillStyle = '#96ceb4';
      ctx.font = '18px Arial';
      ctx.fillText(project.full_name, 400, 150);
    }

    // 统计信息
    const stats = [
      { icon: '⭐', label: '星标', value: ('stargazers_count' in project ? project.stargazers_count?.toString() : '0') || '0' },
      { icon: '🔧', label: '语言', value: project.language || 'Unknown' },
      { icon: '📁', label: '类型', value: '开源项目' },
      { icon: '🚀', label: '状态', value: '活跃' }
    ];

    stats.forEach((stat, index) => {
      const x = 150 + (index % 2) * 300;
      const y = 220 + Math.floor(index / 2) * 80;

      // 图标
      ctx.fillStyle = '#ffd700';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(stat.icon, x - 50, y);

      // 标签
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(stat.label, x - 20, y - 10);

      // 值
      ctx.fillStyle = '#4fc3f7';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(stat.value, x - 20, y + 15);
    });

    // 项目描述
    if (project.description) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('项目描述', 400, 400);

      ctx.fillStyle = '#e0e0e0';
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      
      // 处理长文本换行
      const description = project.description || '暂无描述';
      const maxWidth = 700;
      const words = description.split(' ');
      let line = '';
      let y = 430;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, 50, y);
          line = words[i] + ' ';
          y += 25;
          if (y > 550) break; // 防止文本超出画布
        } else {
          line = testLine;
        }
      }
      
      if (line.trim() && y <= 550) {
        ctx.fillText(line, 50, y);
      }
    }

    // 技术标签
    const techTags = [project.language, 'Open Source', 'GitHub'].filter(Boolean);
    techTags.forEach((tag, index) => {
      const x = 50 + index * 120;
      const y = 570;
      
      // 标签背景
      ctx.fillStyle = '#4fc3f7';
      ctx.fillRect(x, y - 15, 100, 25);
      
      // 标签文字
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(tag, x + 50, y);
    });

    return new THREE.CanvasTexture(canvas);
  };

  // 创建用户基本信息可视化
  const createUserInfoVisualization = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;

    // 背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 800, 600);

    // 标题
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GitHub 用户信息', 400, 60);

    // 用户名
    ctx.fillStyle = '#4fc3f7';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(githubData.userInfo.login, 400, 120);

    // 真实姓名
    if (githubData.userInfo.name) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.fillText(githubData.userInfo.name, 400, 150);
    }

    // 统计数据
    const stats = [
      { label: '公开仓库', value: githubData.userInfo.public_repos.toString() },
      { label: '关注者', value: githubData.userInfo.followers.toString() },
      { label: '关注中', value: githubData.userInfo.following.toString() },
      { label: '总星标', value: githubData.projectAnalysis.totalStars.toString() }
    ];

    stats.forEach((stat, index) => {
      const x = 200 + (index % 2) * 400;
      const y = 250 + Math.floor(index / 2) * 120;

      // 数值
      ctx.fillStyle = '#4fc3f7';
      ctx.font = 'bold 42px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(stat.value, x, y);

      // 标签
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px Arial';
      ctx.fillText(stat.label, x, y + 30);
    });

    // 个人简介
    if (githubData.userInfo.bio) {
      ctx.fillStyle = '#cccccc';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      const bio = githubData.userInfo.bio.length > 60 ? 
        githubData.userInfo.bio.substring(0, 60) + '...' : 
        githubData.userInfo.bio;
      ctx.fillText(bio, 400, 520);
    }

    // 位置信息
    if (githubData.userInfo.location) {
      ctx.fillStyle = '#96ceb4';
      ctx.font = '14px Arial';
      ctx.fillText(`📍 ${githubData.userInfo.location}`, 400, 550);
    }

    return new THREE.CanvasTexture(canvas);
  };

  // 创建编程语言分布可视化
  const createLanguagesVisualization = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;

    // 背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 800, 600);

    // 标题
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('编程语言分布', 400, 50);

    const languages = Object.entries(githubData.languageStats);
    if (languages.length === 0) {
      ctx.fillStyle = '#888888';
      ctx.font = '24px Arial';
      ctx.fillText('暂无数据', 400, 300);
      return new THREE.CanvasTexture(canvas);
    }

    // 饼图
    const centerX = 300;
    const centerY = 300;
    const radius = 120;
    let currentAngle = 0;

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#a8e6cf', '#ffd93d'];

    languages.slice(0, 8).forEach(([language, stats], index) => {
      const percentage = parseFloat(stats.percentage);
      const sliceAngle = (percentage / 100) * 2 * Math.PI;
      
      // 绘制扇形
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      
      // 标签
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius + 50);
      const labelY = centerY + Math.sin(labelAngle) * (radius + 50);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(language, labelX, labelY);
      ctx.fillText(`${stats.percentage}%`, labelX, labelY + 16);
      
      currentAngle += sliceAngle;
    });

    // 图例
    const legendStartY = 100;
    languages.slice(0, 8).forEach(([language, stats], index) => {
      const x = 550;
      const y = legendStartY + index * 30;
      
      // 颜色块
      ctx.fillStyle = colors[index % colors.length];
      ctx.fillRect(x, y - 10, 20, 15);
      
      // 文字
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${language} (${stats.percentage}%)`, x + 30, y);
    });

    return new THREE.CanvasTexture(canvas);
  };

  // 创建项目分析可视化
  const createProjectsVisualization = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;

    // 背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 800, 600);

    // 标题
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('项目分析', 400, 50);

    // 总体统计
    ctx.fillStyle = '#4fc3f7';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`总项目数: ${githubData.projectAnalysis.totalProjects}`, 50, 100);
    ctx.fillText(`总星标数: ${githubData.projectAnalysis.totalStars}`, 300, 100);
    ctx.fillText(`总Fork数: ${githubData.projectAnalysis.totalForks}`, 550, 100);

    // 热门项目排行
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('🌟 热门项目', 50, 150);

    if (githubData.projectAnalysis.topStarred.length === 0) {
      ctx.fillStyle = '#888888';
      ctx.font = '18px Arial';
      ctx.fillText('暂无数据', 50, 200);
    } else {
      githubData.projectAnalysis.topStarred.slice(0, 4).forEach((repo, index) => {
        const y = 180 + index * 70;
        
        // 排名
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`#${index + 1}`, 70, y);
        
        // 项目名
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'left';
        const projectName = repo.name.length > 25 ? repo.name.substring(0, 25) + '...' : repo.name;
        ctx.fillText(projectName, 100, y - 15);
        
        // 星标数和语言
        ctx.fillStyle = '#4fc3f7';
        ctx.font = '14px Arial';
        ctx.fillText(`⭐ ${repo.stargazers_count}`, 100, y + 5);
        
        if (repo.language) {
          ctx.fillStyle = '#96ceb4';
          ctx.fillText(`📝 ${repo.language}`, 200, y + 5);
        }
        
        // 描述
        if (repo.description) {
          ctx.fillStyle = '#cccccc';
          ctx.font = '12px Arial';
          const desc = repo.description.length > 50 ? repo.description.substring(0, 50) + '...' : repo.description;
          ctx.fillText(desc, 100, y + 25);
        }
      });
    }

    // 项目类型分布
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('📊 项目类型', 450, 150);

    const projectTypes = Object.entries(githubData.projectAnalysis.projectTypes);
    if (projectTypes.length > 0) {
      projectTypes.slice(0, 6).forEach(([type, count], index) => {
        const y = 180 + index * 35;
        
        // 类型名称
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(type, 450, y);
        
        // 数量
        ctx.fillStyle = '#4fc3f7';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(count.toString(), 750, y);
        
        // 进度条
        const maxCount = Math.max(...Object.values(githubData.projectAnalysis.projectTypes));
        const barWidth = (count / maxCount) * 200;
        ctx.fillStyle = '#4fc3f7';
        ctx.fillRect(450, y + 5, barWidth, 8);
      });
    }

    return new THREE.CanvasTexture(canvas);
  };

  // 创建协作网络可视化
  const createNetworkVisualization = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;

    // 背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 800, 600);

    // 标题
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('协作网络', 400, 50);

    // 社交统计
    ctx.fillStyle = '#4fc3f7';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`关注者: ${githubData.userInfo.followers}`, 200, 100);
    ctx.fillText(`关注中: ${githubData.userInfo.following}`, 600, 100);

    // 中心用户节点
    const centerX = 400;
    const centerY = 300;
    const centerRadius = 40;
    
    // 绘制中心节点
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6b6b';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 中心用户名
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(githubData.userInfo.login, centerX, centerY + 5);

    // 关注者节点（左侧）
    const followersToShow = Math.min(githubData.socialNetwork.followers.length, 6);
    for (let i = 0; i < followersToShow; i++) {
      const angle = (i / followersToShow) * Math.PI * 2 - Math.PI / 2;
      const radius = 120;
      const x = centerX - radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      // 节点
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#4ecdc4';
      ctx.fill();
      
      // 连接线
      ctx.beginPath();
      ctx.moveTo(centerX - centerRadius, centerY);
      ctx.lineTo(x + 20, y);
      ctx.strokeStyle = '#4ecdc4';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 用户名
      if (githubData.socialNetwork.followers[i]) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        const username = githubData.socialNetwork.followers[i].login;
        const displayName = username.length > 8 ? username.substring(0, 8) + '...' : username;
        ctx.fillText(displayName, x, y + 35);
      }
    }

    // 关注中节点（右侧）
    const followingToShow = Math.min(githubData.socialNetwork.following.length, 6);
    for (let i = 0; i < followingToShow; i++) {
      const angle = (i / followingToShow) * Math.PI * 2 - Math.PI / 2;
      const radius = 120;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      // 节点
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#96ceb4';
      ctx.fill();
      
      // 连接线
      ctx.beginPath();
      ctx.moveTo(centerX + centerRadius, centerY);
      ctx.lineTo(x - 20, y);
      ctx.strokeStyle = '#96ceb4';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 用户名
      if (githubData.socialNetwork.following[i]) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        const username = githubData.socialNetwork.following[i].login;
        const displayName = username.length > 8 ? username.substring(0, 8) + '...' : username;
        ctx.fillText(displayName, x, y + 35);
      }
    }

    // 图例
    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(50, 500, 20, 15);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('关注者', 80, 512);
    
    ctx.fillStyle = '#96ceb4';
    ctx.fillRect(200, 500, 20, 15);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('关注中', 230, 512);

    return new THREE.CanvasTexture(canvas);
  };

  // 创建MBTI性格分析可视化
  const createMBTIVisualization = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;

    // 背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 800, 600);

    // 标题
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('MBTI 性格分析', 400, 50);

    if (!githubData.mbtiAnalysis) {
      ctx.fillStyle = '#888888';
      ctx.font = '24px Arial';
      ctx.fillText('暂无数据', 400, 300);
      return new THREE.CanvasTexture(canvas);
    }

    // MBTI类型
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(githubData.mbtiAnalysis.type, 400, 120);

    // 描述
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    const description = githubData.mbtiAnalysis.description || '暂无描述';
    const maxLineLength = 50;
    const lines = [];
    let currentLine = '';
    
    description.split(' ').forEach(word => {
      if ((currentLine + word).length <= maxLineLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);
    
    lines.slice(0, 3).forEach((line, index) => {
      ctx.fillText(line, 400, 160 + index * 25);
    });

    // 维度分析 - 适配新的数据结构
    const dimensions = githubData.mbtiAnalysis.dimensions ? Object.entries(githubData.mbtiAnalysis.dimensions) : [];

    dimensions.forEach(([key, value], index) => {
      const x = 150 + (index % 2) * 300;
      const y = 280 + Math.floor(index / 2) * 80;
      
      // 维度名称
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(key, x, y);
      
      // 分数
      ctx.fillStyle = '#4fc3f7';
      ctx.font = 'bold 16px Arial';
      const score = value.score || 0;
      const tendency = value.tendency || '';
      ctx.fillText(`${tendency} (${Math.round(score * 100)}%)`, x + 80, y);
      
      // 进度条背景
      ctx.fillStyle = '#333333';
      ctx.fillRect(x, y + 10, 200, 20);
      
      // 进度条
      const normalizedScore = Math.min(Math.max(score, 0), 1);
      ctx.fillStyle = '#4fc3f7';
      ctx.fillRect(x, y + 10, 200 * normalizedScore, 20);
    });

    // 特征描述 - 适配新的数据结构
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    const strengths = githubData.mbtiAnalysis.strengths || [];
    strengths.slice(0, 3).forEach((strength, index) => {
      ctx.fillText(`• ${strength}`, 100, 430 + index * 25);
    });

    // 判断理由 - 新增部分
    if (githubData.mbtiAnalysis.reasoning) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('判断理由', 400, 520);
      
      const reasoning = githubData.mbtiAnalysis.reasoning;
      ctx.fillStyle = '#e0e0e0';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      
      let yPosition = 545;
      Object.entries(reasoning).forEach(([dimension, reason]) => {
        // 维度标签
        ctx.fillStyle = '#4fc3f7';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`${dimension}:`, 50, yPosition);
        
        // 理由文本 - 处理长文本换行
        ctx.fillStyle = '#e0e0e0';
        ctx.font = '12px Arial';
        const maxWidth = 680;
        const words = reason.split('');
        let line = '';
        let lineHeight = 16;
        
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i];
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && line !== '') {
            ctx.fillText(line, 90, yPosition);
            line = words[i];
            yPosition += lineHeight;
          } else {
            line = testLine;
          }
        }
        
        if (line !== '') {
          ctx.fillText(line, 90, yPosition);
        }
        
        yPosition += 20; // 维度间距
      });
    }

    return new THREE.CanvasTexture(canvas);
  };

  // 创建技术栈云图可视化
  const createSkillsVisualization = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;

    // 背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 800, 600);

    // 标题
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('技术栈云图', 400, 50);

    const languages = Object.entries(githubData.languageStats);
    if (languages.length === 0) {
      ctx.fillStyle = '#888888';
      ctx.font = '24px Arial';
      ctx.fillText('暂无数据', 400, 300);
      return new THREE.CanvasTexture(canvas);
    }

    // 技能云图
    languages.forEach(([name, data], index) => {
      const x = 150 + (index % 3) * 200;
      const y = 150 + Math.floor(index / 3) * 100;
      const percentage = parseFloat(data.percentage.replace('%', ''));
      const fontSize = 16 + (percentage / 100) * 20;
      
      ctx.fillStyle = `hsl(${(index * 60) % 360}, 70%, 60%)`;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(name, x, y);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial';
      ctx.fillText(data.percentage, x, y + 25);
    });

    return new THREE.CanvasTexture(canvas);
  };

  // 创建开发习惯可视化
  const createHabitsVisualization = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d')!;

    // 背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 800, 600);

    // 标题
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('开发习惯分析', 400, 50);

    if (!githubData.habitAnalysis) {
      ctx.fillStyle = '#888888';
      ctx.font = '24px Arial';
      ctx.fillText('暂无数据', 400, 300);
      return new THREE.CanvasTexture(canvas);
    }

    const habits = githubData.habitAnalysis;

    // 基本统计
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`平均每日提交: ${habits.avgCommitsPerDay}`, 50, 100);
    ctx.fillText(`最活跃时间: ${habits.mostActiveTime}`, 50, 130);
    ctx.fillText(`工作模式: ${habits.workPattern}`, 50, 160);

    // 每小时提交分布
    ctx.fillStyle = '#4fc3f7';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('每小时提交分布', 200, 220);

    const hourlyData = habits.hourlyDistribution;
    const maxHourlyCommits = Math.max(...Object.values(hourlyData));
    const barWidth = 15;
    const barSpacing = 20;
    const startX = 50;
    const startY = 350;
    const maxBarHeight = 80;

    Object.entries(hourlyData).forEach(([hour, commits], index) => {
      const x = startX + index * barSpacing;
      const barHeight = (commits / maxHourlyCommits) * maxBarHeight;
      
      // 绘制柱状图
      ctx.fillStyle = '#4fc3f7';
      ctx.fillRect(x, startY - barHeight, barWidth, barHeight);
      
      // 小时标签
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(hour, x + barWidth / 2, startY + 15);
    });

    // 每周提交分布
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('每周提交分布', 600, 220);

    const weeklyData = habits.weeklyDistribution;
    const maxWeeklyCommits = Math.max(...Object.values(weeklyData));
    const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    
    Object.entries(weeklyData).forEach(([day, commits], index) => {
      const x = 500;
      const y = 250 + index * 30;
      const barWidth = (commits / maxWeeklyCommits) * 150;
      
      // 绘制水平柱状图
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(x, y, barWidth, 20);
      
      // 星期标签
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(weekDays[index] || day, x - 10, y + 15);
      
      // 提交数量
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(commits.toString(), x + barWidth + 5, y + 15);
    });

    return new THREE.CanvasTexture(canvas);
  };

  // 根据画板类型生成对应纹理
  const generateArtworkTexture = (type: string) => {
    switch (type) {
      case 'userInfo':
        return createUserInfoVisualization();
      case 'languages':
        return createLanguagesVisualization();
      case 'projects':
        return createProjectsVisualization();
      case 'network':
        return createNetworkVisualization();
      case 'mbti':
        return createMBTIVisualization();
      case 'habits':
        return createHabitsVisualization();
      case 'project1':
        return createProjectShowcaseVisualization(0);
      case 'project2':
        return createProjectShowcaseVisualization(1);
      case 'project3':
        return createProjectShowcaseVisualization(2);
      case 'project4':
        return createProjectShowcaseVisualization(3);
      case 'project5':
        return createProjectShowcaseVisualization(4);
      case 'project6':
        return createProjectShowcaseVisualization(5);
      case 'project7':
        return createProjectShowcaseVisualization(6);
      case 'project8':
        return createProjectShowcaseVisualization(7);
      default:
        return createArtTexture();
    }
  };

  // 创建深色木纹地板纹理
  const createFloorTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // 深色木纹背景
    ctx.fillStyle = '#2d1810';
    ctx.fillRect(0, 0, 512, 512);

    // 添加木纹纹理
    for (let i = 0; i < 20; i++) {
      ctx.strokeStyle = `rgba(139, 69, 19, ${0.1 + Math.random() * 0.2})`;
      ctx.lineWidth = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.moveTo(0, Math.random() * 512);
      ctx.lineTo(512, Math.random() * 512);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // 初始化场景
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 设置摄像机（固定高度为2.2米，模拟人眼高度）
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // 将摄像机放置在房间中央，面向后墙的画作
    camera.position.set(0, 2.2, 0);
    camera.lookAt(0, 2.25, -9.9); // 看向后墙画作的中心
    cameraRef.current = camera;

    // 设置渲染器（优化视觉效果）
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      powerPreference: 'high-performance',
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // 移除过时的Three.js属性设置
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 添加环境光 - 柔和的基础照明
    const ambientLight = new THREE.AmbientLight(0xf5f5f5, 0.3);
    scene.add(ambientLight);

    // 主要从上往下的方向光 - 模拟自然光
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(0, 20, 0);
    mainLight.target.position.set(0, 0, 0);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 4096;
    mainLight.shadow.mapSize.height = 4096;
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -15;
    mainLight.shadow.camera.right = 15;
    mainLight.shadow.camera.top = 15;
    mainLight.shadow.camera.bottom = -15;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);
    scene.add(mainLight.target);

    // 顶部补充照明 - 从上往下的柔和光线
    const topLight1 = new THREE.DirectionalLight(0xf8f8ff, 0.4);
    topLight1.position.set(-5, 15, -5);
    topLight1.target.position.set(0, 0, 0);
    scene.add(topLight1);
    scene.add(topLight1.target);

    const topLight2 = new THREE.DirectionalLight(0xf8f8ff, 0.4);
    topLight2.position.set(5, 15, 5);
    topLight2.target.position.set(0, 0, 0);
    scene.add(topLight2);
    scene.add(topLight2.target);

    // 天花板反射光 - 模拟天花板反射的柔和光线
    const ceilingReflectLight = new THREE.PointLight(0xfafafa, 0.2, 25);
    ceilingReflectLight.position.set(0, 4.3, 0);
    scene.add(ceilingReflectLight);

    // 创建地板 - 深色木纹地板
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    
    // 创建木纹纹理
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // 绘制深色木纹纹理
    const gradient = ctx.createLinearGradient(0, 0, 512, 0);
    gradient.addColorStop(0, '#2d1810');
    gradient.addColorStop(0.3, '#3d2418');
    gradient.addColorStop(0.6, '#4a2c1a');
    gradient.addColorStop(1, '#2d1810');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // 添加木纹线条
    for (let i = 0; i < 20; i++) {
      ctx.strokeStyle = `rgba(20, 10, 5, ${0.3 + Math.random() * 0.4})`;
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 512, 0);
      ctx.lineTo(Math.random() * 512, 512);
      ctx.stroke();
    }
    
    const floorTexture = new THREE.CanvasTexture(canvas);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(4, 4);
    
    const floorMaterial = new THREE.MeshLambertMaterial({ 
      map: floorTexture,
      transparent: false
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // 创建天花板 - 调整高度为4.5米
    const ceilingGeometry = new THREE.PlaneGeometry(20, 20);
    const ceilingMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x1a1a1a,
      transparent: true,
      opacity: 0.95
    });
    const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 4.5;
    scene.add(ceiling);

    // 创建墙壁 - 纯白色调，与图片风格一致
    const wallMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,
      transparent: false,
      shininess: 5,
      specular: 0x111111
    });

    // 后墙
    const backWallGeometry = new THREE.PlaneGeometry(20, 4.5);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, 2.25, -10);
    scene.add(backWall);

    // 左墙
    const leftWallGeometry = new THREE.PlaneGeometry(20, 4.5);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-10, 2.25, 0);
    scene.add(leftWall);

    // 右墙
    const rightWallGeometry = new THREE.PlaneGeometry(20, 4.5);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(10, 2.25, 0);
    scene.add(rightWall);

    // 前墙（入口，部分墙壁）
    const frontWallGeometry = new THREE.PlaneGeometry(20, 4.5);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.rotation.y = Math.PI;
    frontWall.position.set(0, 2.25, 10);
    scene.add(frontWall);

    // 创建画框和艺术品
    artworks.forEach((artwork) => {
      const [x, y, z] = artwork.position;
      // 根据位置确定旋转角度
      let rotY = 0;
      if (Math.abs(x) > Math.abs(z)) {
        // 左墙或右墙
        if (x < 0) {
          rotY = Math.PI / 2; // 左墙，面向房间内部
        } else {
          rotY = -Math.PI / 2; // 右墙，面向房间内部
        }
      } else {
        // 前墙或后墙
        if (z < 0) {
          rotY = 0; // 后墙
        } else {
          rotY = Math.PI; // 前墙
        }
      }
      
      // 画框 - 深色木质画框
      const frameGeometry = new THREE.BoxGeometry(3.25, 2.45, 0.08);
      const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x2d1810 });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.set(x, y, z);
      frame.rotation.y = rotY;
      frame.castShadow = true;
      scene.add(frame);
      
      // 艺术品 - 确保画布悬挂在墙壁上，添加逼真的光线反射效果
      const artworkGeometry = new THREE.PlaneGeometry(3, 2.2);
      const artworkTexture = generateArtworkTexture(artwork.type);
      const artworkMaterial = new THREE.MeshPhongMaterial({ 
        map: artworkTexture,
        shininess: 15,
        specular: 0x222222,
        transparent: false,
        side: THREE.FrontSide
      });
      const artworkMesh = new THREE.Mesh(artworkGeometry, artworkMaterial);
      
      // 设置画布位置 - 确保画布贴在墙面上
      artworkMesh.position.set(
        x + Math.sin(rotY) * 0.06,
        y,
        z + Math.cos(rotY) * 0.06
      );
      artworkMesh.rotation.y = rotY;
      scene.add(artworkMesh);
      
      // 为每件艺术品添加从上往下的聚光灯照明
      const spotLight = new THREE.SpotLight(0xffffff, 0.6, 10, Math.PI / 6, 0.2);
      spotLight.position.set(
        x,
        y + 2.5,
        z + Math.cos(rotY) * 0.8
      );
      spotLight.target = artworkMesh;
      spotLight.castShadow = true;
      spotLight.shadow.mapSize.width = 2048;
      spotLight.shadow.mapSize.height = 2048;
      spotLight.shadow.camera.near = 0.1;
      spotLight.shadow.camera.far = 15;
      spotLight.shadow.bias = -0.0001;
      scene.add(spotLight);
      
      // 为艺术品添加顶部柔和补光
      const artworkTopLight = new THREE.PointLight(0xf8f8ff, 0.15, 8);
      artworkTopLight.position.set(
        x,
        y + 1.5,
        z + Math.cos(rotY) * 0.3
      );
      scene.add(artworkTopLight);
    });

    // 添加踢脚线 - 深色木质踢脚线
    const skirtingHeight = 0.15;
    const skirtingGeometry = new THREE.BoxGeometry(20, skirtingHeight, 0.08);
    const skirtingMaterial = new THREE.MeshLambertMaterial({ color: 0x2d1810 });
    
    // 后墙踢脚线
    const backSkirting = new THREE.Mesh(skirtingGeometry, skirtingMaterial);
    backSkirting.position.set(0, skirtingHeight / 2, -9.96);
    scene.add(backSkirting);
    
    // 前墙踢脚线
    const frontSkirting = new THREE.Mesh(skirtingGeometry, skirtingMaterial);
    frontSkirting.position.set(0, skirtingHeight / 2, 9.96);
    scene.add(frontSkirting);
    
    // 左墙踢脚线
    const leftSkirtingGeometry = new THREE.BoxGeometry(0.08, skirtingHeight, 20);
    const leftSkirting = new THREE.Mesh(leftSkirtingGeometry, skirtingMaterial);
    leftSkirting.position.set(-9.96, skirtingHeight / 2, 0);
    scene.add(leftSkirting);
    
    // 右墙踢脚线
    const rightSkirting = new THREE.Mesh(leftSkirtingGeometry, skirtingMaterial);
    rightSkirting.position.set(9.96, skirtingHeight / 2, 0);
    scene.add(rightSkirting);

    // 创建用户头像纹理
    const createUserAvatar = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      
      // 背景
      ctx.fillStyle = '#4fc3f7';
      ctx.fillRect(0, 0, 256, 256);
      
      // 简单的头像图形
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(128, 128, 80, 0, Math.PI * 2);
      ctx.fill();
      
      // 脸部
      ctx.fillStyle = '#ffdbac';
      ctx.beginPath();
      ctx.arc(128, 120, 60, 0, Math.PI * 2);
      ctx.fill();
      
      // 眼睛
      ctx.beginPath();
      ctx.arc(118, 95, 3, 0, Math.PI * 2);
      ctx.arc(138, 95, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
      
      // 嘴巴
      ctx.beginPath();
      ctx.arc(128, 110, 8, 0, Math.PI);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 添加GitHub用户名
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(githubData.userInfo.login, 128, 230);
      
      if (githubData.userInfo.name) {
        ctx.font = '12px Arial';
        ctx.fillText(githubData.userInfo.name, 128, 250);
      }
      
      return new THREE.CanvasTexture(canvas);
    };

    // 用户头像几何体和材质
    const avatarGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.8, 8);
    const avatarTexture = createUserAvatar();
    const avatarMaterial = new THREE.MeshLambertMaterial({ map: avatarTexture });
    const avatar = new THREE.Mesh(avatarGeometry, avatarMaterial);
    avatar.position.set(0, 0.9, 0);
    avatar.castShadow = true;
    scene.add(avatar);

    // 添加发光边框
    const glowGeometry = new THREE.CylinderGeometry(0.35, 0.35, 1.85, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x4fc3f7, 
      transparent: true, 
      opacity: 0.3 
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.set(0, 0.9, 0);
    scene.add(glow);

    // 装饰性底座
    const baseGeometry = new THREE.CylinderGeometry(0.5, 0.6, 0.2, 16);
    const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.set(0, 0.1, 0);
    base.castShadow = true;
    scene.add(base);

    // 用户控制
    const keys = { w: false, s: false, a: false, d: false };
    let isPointerLocked = false;
    let yaw = 0;
    let pitch = 0;

    // 键盘事件
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW': keys.w = true; break;
        case 'KeyS': keys.s = true; break;
        case 'KeyA': keys.a = true; break;
        case 'KeyD': keys.d = true; break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW': keys.w = false; break;
        case 'KeyS': keys.s = false; break;
        case 'KeyA': keys.a = false; break;
        case 'KeyD': keys.d = false; break;
      }
    };

    // 鼠标点击锁定指针
    const onClick = () => {
      renderer.domElement.requestPointerLock();
    };

    // 指针锁定状态变化
    const onPointerLockChange = () => {
      isPointerLocked = document.pointerLockElement === renderer.domElement;
    };

    // 鼠标移动控制视角
    const onMouseMove = (event: MouseEvent) => {
      if (!isPointerLocked) return;

      yaw -= event.movementX * 0.002;
      pitch -= event.movementY * 0.002;
      pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));

      camera.rotation.order = 'YXZ';
      camera.rotation.y = yaw;
      camera.rotation.x = pitch;
    };

    // 窗口大小调整
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // 添加事件监听器
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    renderer.domElement.addEventListener('click', onClick);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);

    // 动画循环
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);

      // 头像自动旋转
      avatar.rotation.y += 0.01;
      glow.rotation.y += 0.01;

      // 摄像机移动
      const moveSpeed = 0.1;
      const direction = new THREE.Vector3();
      
      if (keys.w) direction.z -= 1;
      if (keys.s) direction.z += 1;
      if (keys.a) direction.x -= 1;
      if (keys.d) direction.x += 1;
      
      if (direction.length() > 0) {
        direction.normalize();
        direction.applyQuaternion(camera.quaternion);
        direction.y = 0; // 保持水平移动
        direction.normalize();
        
        camera.position.add(direction.multiplyScalar(moveSpeed));
        
        // 限制移动范围
        camera.position.x = Math.max(-8, Math.min(8, camera.position.x));
        camera.position.z = Math.max(-8, Math.min(8, camera.position.z));
        camera.position.y = 2.2; // 固定高度
      }

      renderer.render(scene, camera);
    };

    animate();

    // 清理函数
    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
      
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      renderer.domElement.removeEventListener('click', onClick);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onWindowResize);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, [githubData]);

  return (
    <div className="relative w-full h-screen">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* 控制说明 */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
        <h3 className="text-lg font-bold mb-2">控制说明</h3>
        <p className="text-sm mb-1">WASD: 移动</p>
        <p className="text-sm mb-1">鼠标: 点击锁定视角</p>
        <p className="text-sm">移动鼠标: 环顾四周</p>
      </div>
      
      {/* 用户信息 */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
        <h3 className="text-lg font-bold mb-2">{githubData.userInfo.name || githubData.userInfo.login}</h3>
        <p className="text-sm mb-1">仓库: {githubData.projectAnalysis.totalProjects}</p>
        <p className="text-sm mb-1">星标: {githubData.projectAnalysis.totalStars}</p>
        <p className="text-sm">MBTI: {githubData.mbtiAnalysis?.type || '未知'}</p>
      </div>
    </div>
  );
};

export default VirtualGallery;