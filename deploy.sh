#!/bin/bash

# MBTI Gallery 部署脚本
# 使用方法: ./deploy.sh [环境] [选项]
# 环境: dev, staging, production (默认: production)
# 选项: --build-only, --no-backup, --force

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认配置
ENVIRONMENT="production"
BUILD_ONLY=false
NO_BACKUP=false
FORCE=false
PROJECT_NAME="mbti-gallery"
BACKUP_DIR="./backups"
LOG_FILE="./deploy.log"

# 函数定义
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗${NC} $1" | tee -a "$LOG_FILE"
}

# 显示帮助信息
show_help() {
    echo "MBTI Gallery 部署脚本"
    echo ""
    echo "使用方法: $0 [环境] [选项]"
    echo ""
    echo "环境:"
    echo "  dev         开发环境部署"
    echo "  staging     预发布环境部署"
    echo "  production  生产环境部署 (默认)"
    echo ""
    echo "选项:"
    echo "  --build-only    仅构建，不部署"
    echo "  --no-backup     跳过备份步骤"
    echo "  --force         强制部署，跳过确认"
    echo "  --help          显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 production"
    echo "  $0 staging --no-backup"
    echo "  $0 dev --build-only"
}

# 解析命令行参数
while [[ $# -gt 0 ]]; do
    case $1 in
        dev|staging|production)
            ENVIRONMENT="$1"
            shift
            ;;
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        --no-backup)
            NO_BACKUP=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            log_error "未知参数: $1"
            show_help
            exit 1
            ;;
    esac
done

# 检查必要工具
check_requirements() {
    log "检查部署环境..."
    
    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    # 检查 Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    log_success "环境检查通过"
}

# 检查环境配置文件
check_env_file() {
    local env_file=".env.${ENVIRONMENT}"
    
    if [[ ! -f "$env_file" ]]; then
        log_warning "环境配置文件 $env_file 不存在"
        
        if [[ -f ".env.${ENVIRONMENT}.example" ]]; then
            log "复制示例配置文件..."
            cp ".env.${ENVIRONMENT}.example" "$env_file"
            log_warning "请编辑 $env_file 文件，填入正确的配置值"
            
            if [[ "$FORCE" != true ]]; then
                read -p "是否继续部署? (y/N): " -n 1 -r
                echo
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    log "部署已取消"
                    exit 1
                fi
            fi
        else
            log_error "找不到环境配置文件和示例文件"
            exit 1
        fi
    fi
}

# 创建备份
create_backup() {
    if [[ "$NO_BACKUP" == true ]]; then
        log "跳过备份步骤"
        return
    fi
    
    log "创建备份..."
    
    # 创建备份目录
    mkdir -p "$BACKUP_DIR"
    
    # 备份当前运行的容器数据
    local backup_name="${PROJECT_NAME}_$(date +%Y%m%d_%H%M%S)"
    
    # 如果容器正在运行，备份数据
    if docker-compose ps | grep -q "Up"; then
        log "备份容器数据到 ${BACKUP_DIR}/${backup_name}"
        mkdir -p "${BACKUP_DIR}/${backup_name}"
        
        # 备份日志
        if [[ -d "./logs" ]]; then
            cp -r ./logs "${BACKUP_DIR}/${backup_name}/"
        fi
        
        # 备份环境配置
        cp ".env.${ENVIRONMENT}" "${BACKUP_DIR}/${backup_name}/" 2>/dev/null || true
        
        log_success "备份完成: ${BACKUP_DIR}/${backup_name}"
    else
        log "没有运行中的容器，跳过数据备份"
    fi
}

# 构建应用
build_app() {
    log "开始构建应用..."
    
    # 安装依赖
    log "安装依赖..."
    npm ci
    
    # 构建前端
    log "构建前端应用..."
    npm run build
    
    # 构建 Docker 镜像
    log "构建 Docker 镜像..."
    docker-compose build --no-cache
    
    log_success "应用构建完成"
}

# 部署应用
deploy_app() {
    if [[ "$BUILD_ONLY" == true ]]; then
        log "仅构建模式，跳过部署"
        return
    fi
    
    log "开始部署应用..."
    
    # 停止现有容器
    log "停止现有容器..."
    docker-compose down
    
    # 启动新容器
    log "启动新容器..."
    docker-compose --env-file ".env.${ENVIRONMENT}" up -d
    
    # 等待服务启动
    log "等待服务启动..."
    sleep 10
    
    # 健康检查
    log "执行健康检查..."
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f http://localhost:3001/api/health &>/dev/null; then
            log_success "服务启动成功"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            log_error "服务启动失败，请检查日志"
            docker-compose logs
            exit 1
        fi
        
        log "等待服务启动... ($attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done
    
    log_success "部署完成"
}

# 显示部署信息
show_deployment_info() {
    log "部署信息:"
    echo "  环境: $ENVIRONMENT"
    echo "  项目: $PROJECT_NAME"
    echo "  访问地址: http://localhost:3001"
    echo "  API地址: http://localhost:3001/api"
    echo "  健康检查: http://localhost:3001/api/health"
    echo ""
    echo "常用命令:"
    echo "  查看日志: docker-compose logs -f"
    echo "  重启服务: docker-compose restart"
    echo "  停止服务: docker-compose down"
    echo "  查看状态: docker-compose ps"
}

# 清理旧备份
cleanup_old_backups() {
    if [[ -d "$BACKUP_DIR" ]]; then
        log "清理旧备份文件..."
        # 保留最近7天的备份
        find "$BACKUP_DIR" -type d -name "${PROJECT_NAME}_*" -mtime +7 -exec rm -rf {} + 2>/dev/null || true
        log_success "备份清理完成"
    fi
}

# 主函数
main() {
    log "开始 MBTI Gallery 部署流程"
    log "环境: $ENVIRONMENT"
    
    # 确认部署
    if [[ "$FORCE" != true && "$BUILD_ONLY" != true ]]; then
        echo -e "${YELLOW}即将部署到 $ENVIRONMENT 环境，是否继续? (y/N):${NC}"
        read -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "部署已取消"
            exit 1
        fi
    fi
    
    # 执行部署步骤
    check_requirements
    check_env_file
    create_backup
    build_app
    deploy_app
    cleanup_old_backups
    
    log_success "部署流程完成!"
    show_deployment_info
}

# 错误处理
trap 'log_error "部署过程中发生错误，请检查日志: $LOG_FILE"' ERR

# 执行主函数
main "$@"