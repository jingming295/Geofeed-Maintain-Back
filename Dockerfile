# 使用 Node.js 官方镜像
FROM node:22

# 设置工作目录
WORKDIR /app

# 复制必要的文件和目录
COPY package.json package-lock.json ./
COPY dist ./dist
COPY frontend ./frontend
# 安装依赖
RUN npm install

# 暴露后端服务的端口（假设服务运行在 3000）
EXPOSE 3000

# 启动后端服务
CMD ["npm", "start"]
