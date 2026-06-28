FROM node:22-alpine

WORKDIR /app

# パッケージ管理ツールを最新化
RUN npm install -g npm@latest

# Viteの開発サーバー用ポートを開放
EXPOSE 5173

CMD ["sh"]
