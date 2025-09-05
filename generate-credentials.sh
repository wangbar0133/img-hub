#!/bin/bash
# 生成安全的管理员凭据脚本

echo "======================================"
echo "ImgHub 生产环境凭据生成器"
echo "======================================"
echo

# 检查是否安装了openssl
if ! command -v openssl &> /dev/null; then
    echo "错误: 需要安装 openssl"
    exit 1
fi

# 生成随机用户名（可选）
echo "1. 管理员用户名设置"
read -p "请输入管理员用户名 (直接回车使用 'admin'): " username
username=${username:-admin}
echo "✓ 用户名: $username"
echo

# 生成安全密码
echo "2. 生成安全密码"
password=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
echo "✓ 生成的安全密码: $password"
echo

# 生成JWT密钥
echo "3. 生成JWT密钥"
jwt_secret=$(openssl rand -base64 32)
echo "✓ 生成的JWT密钥: $jwt_secret"
echo

# 创建.env.production文件
echo "4. 创建配置文件"
cat > .env.production << EOF
# ImgHub 生产环境配置
# 生成时间: $(date)

# 管理员账户配置
ADMIN_USERNAME=$username
ADMIN_PASSWORD=$password

# JWT 签名密钥
JWT_SECRET=$jwt_secret

# 环境设置
NODE_ENV=production
EOF

# 设置文件权限
chmod 600 .env.production

echo "✓ 配置文件已创建: .env.production"
echo "✓ 文件权限已设置: 600 (仅所有者可读写)"
echo

# 显示使用说明
echo "======================================"
echo "使用说明:"
echo "======================================"
echo "1. 立即备份这些凭据到安全位置"
echo "2. 使用以下命令启动生产环境:"
echo "   docker-compose --env-file .env.production up -d"
echo "3. 管理后台地址: http://你的服务器IP/admin"
echo "4. 登录凭据:"
echo "   用户名: $username"
echo "   密码: $password"
echo
echo "⚠️  安全提醒:"
echo "- 请立即备份并妥善保管这些凭据"
echo "- 不要将 .env.production 文件提交到版本控制系统"
echo "- 建议定期更换密码（每3-6个月）"
echo "- 在生产环境中启用HTTPS"
echo "======================================"