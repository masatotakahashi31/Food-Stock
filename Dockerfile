# ベースとなるDockerイメージ
FROM node:22-trixie-slim

# 開発に必要な OS パッケージ
# 開発に必要となる git と curl というOSパッケージをインストールし、不要なキャッシュを削除
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# pnpm を有効化
RUN corepack enable && corepack prepare pnpm@latest --activate

# コンテナ内部の「作業ディレクトリ（カレントディレクトリ）」を /app に移動・指定
WORKDIR /app