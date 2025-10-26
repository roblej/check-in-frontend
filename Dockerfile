FROM node:18-alpine

WORKDIR /app

# package.json과 package-lock.json만 먼저 복사 (레이어 캐싱 최적화)
COPY package.json package-lock.json ./

# 의존성 설치
RUN npm ci

# 나머지 파일 복사
COPY . .

# Next.js 빌드
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]

