FROM node:18-alpine

WORKDIR /app

# 타임존 설정 (한국 시간)
ENV TZ=Asia/Seoul
RUN apk add --no-cache tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# package.json과 package-lock.json만 먼저 복사 (레이어 캐싱 최적화)
COPY package.json package-lock.json ./

# 의존성 설치
RUN npm ci

# 나머지 파일 복사
COPY . .

# Next.js 빌드
# RUN npm run build

EXPOSE 3333

CMD ["npm", "start"]

