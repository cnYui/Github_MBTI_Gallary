#!/bin/bash

# MBTI Gallery 生产环境启动脚本
# 用于快速启动生产环境服务

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 配置
PROJECT_NAME="mbti-gallery"
ENV_FILE=".env.production"
COMPOSE_FILE="docker-compose.yml"

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] ✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ✗${NC} $1"
}

# 检查环境配置
check_environment() {
    log "检查生产环境配置..."
    
    if [[ ! -f "$ENV_FILE" ]]; then
        log_error "生产环境配置文件 $ENV_FILE 不存在"
        
        if [[ -f "${ENV_FILE}.example" ]]; then
            log "复制示例配置文件..."
            cp "${ENV_FILE}.example" "$ENV_FILE"
            log_warning "请编辑 $ENV_FILE 文件，填入正确的配置值"
            echo "按任意键继续..."
            read -n 1
        else
            log_error "找不到配置文件模板"
            exit 1
        fi
    fi
    
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        log_error "Docker Compose 配置文件不存在"
        exit 1
    fi
    
    log_success "环境配置检查完成"
}

# 检查 Docker 服务
check_docker() {
    log "检查 Docker 服务..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker 服务未运行，请启动 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装"
        exit 1
    fi
    
    log_success "Docker 服务检查完成"
}

# 创建必要目录
setup_directories() {
    log "创建必要目录..."
    
    mkdir -p logs
    mkdir -p ssl
    
    log_success "目录创建完成"
}

# 启动服务
start_services() {
    log "启动生产环境服务..."
    
    # 停止现有服务
    log "停止现有服务..."
    docker-compose down 2>/dev/null || true
    
    # 启动服务
    log "启动新服务..."
    docker-compose --env-file "$ENV_FILE" up -d
    
    log_success "服务启动完成"
}

# 等待服务就绪
wait_for_services() {
    log "等待服务就绪..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f http://localhost:3001/api/health &>/dev/null; then
            log_success "服务已就绪"
            return 0
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            log_error "服务启动超时"
            log "查看服务日志:"
            docker-compose logs --tail=20
            return 1
        fi
        
        log "等待服务启动... ($attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done
}

# 显示服务状态
show_status() {
    log "服务状态:"
    docker-compose ps
    
    echo ""
    log_success "MBTI Gallery 生产环境已启动"
    echo ""
    echo "访问地址:"
    echo "  前端应用: http://localhost:3001"
    echo "  API接口: http://localhost:3001/api"
    echo "  健康检查: http://localhost:3001/api/health"
    
    if docker-compose ps | grep -q nginx; then
        echo "  Nginx代理: http://localhost:80"
    fi
    
    echo ""
    echo "常用命令:"
    echo "  查看日志: docker-compose logs -f"
    echo "  重启服务: docker-compose restart"
    echo "  停止服务: docker-compose down"
    echo "  查看状态: docker-compose ps"
    echo "  进入容器: docker-compose exec mbti-gallery sh"
}

# 显示帮助
show_help() {
    echo "MBTI Gallery 生产环境启动脚本"
    echo ""
    echo "使用方法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  --help      显示帮助信息"
    echo "  --status    仅显示服务状态"
    echo "  --stop      停止所有服务"
    echo "  --restart   重启所有服务"
    echo "  --logs      查看服务日志"
}

# 停止服务
stop_services() {
    log "停止生产环境服务..."
    docker-compose down
    log_success "服务已停止"
}

# 重启服务
restart_services() {
    log "重启生产环境服务..."
    docker-compose restart
    wait_for_services
    show_status
}

# 查看日志
show_logs() {
    log "显示服务日志..."
    docker-compose logs -f
}

# 主函数
main() {
    case "${1:-start}" in
        --help)
            show_help
            exit 0
            ;;
        --status)
            docker-compose ps
            exit 0
            ;;
        --stop)
            stop_services
            exit 0
            ;;
        --restart)
            restart_services
            exit 0
            ;;
        --logs)
            show_logs
            exit 0
            ;;
        start|"")
            log "启动 MBTI Gallery 生产环境"
            check_environment
            check_docker
            setup_directories
            start_services
            wait_for_services
            show_status
            ;;
        *)
            log_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
}

# 错误处理
trap 'log_error "启动过程中发生错误"' ERR

# 执行主函数
main "$@"