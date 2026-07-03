FROM node:22-alpine

WORKDIR /app

# パッケージ管理ツールを最新化
RUN npm install -g npm@latest

# 依存関係をイメージ内へ事前インストールして、
# /app/node_modules ボリュームの初期化元にする
COPY package.json package-lock.json ./
RUN npm install

# Viteの開発サーバー用ポートを開放
EXPOSE 5173

CMD ["sh"]
