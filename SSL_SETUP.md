# SSL/HTTPS 설정 가이드

## 개요
이 가이드는 `checkinn.store` 도메인에 HTTPS를 설정하는 방법을 설명합니다.

## 방법 1: Cloudflare Origin 인증서 (권장)

Cloudflare를 사용하는 경우, Cloudflare Origin 인증서를 사용하는 것이 가장 간단하고 안전합니다.

### 1단계: Cloudflare Origin 인증서 생성

1. Cloudflare 대시보드에 로그인
2. `checkinn.store` 도메인 선택
3. **SSL/TLS** 메뉴로 이동
4. **Origin Server** 탭 클릭
5. **Create Certificate** 버튼 클릭
6. 다음 설정으로 인증서 생성:
   - **Hostnames**: `checkinn.store`, `*.checkinn.store` (와일드카드)
   - **Validity**: 15년 (최대)
   - **Private key type**: RSA (2048)
7. **Create** 클릭

### 2단계: 인증서 파일 다운로드

생성된 인증서에서:
- **Origin Certificate** (인증서 내용) 복사
- **Private Key** (개인 키) 복사

### 3단계: EC2 서버에 인증서 파일 저장

EC2 서버에 SSH 접속 후:

```bash
# SSL 디렉토리 생성
mkdir -p /home/ubuntu/frontend/ssl

# 인증서 파일 생성
cd /home/ubuntu/frontend/ssl

# certificate.crt 파일 생성 (Origin Certificate 내용 붙여넣기)
nano certificate.crt
# 또는
cat > certificate.crt << 'EOF'
# 여기에 Origin Certificate 내용 붙여넣기
EOF

# private.key 파일 생성 (Private Key 내용 붙여넣기)
nano private.key
# 또는
cat > private.key << 'EOF'
# 여기에 Private Key 내용 붙여넣기
EOF

# 파일 권한 설정 (보안)
chmod 600 private.key
chmod 644 certificate.crt
```

### 4단계: Cloudflare SSL 모드 변경

1. Cloudflare 대시보드 > **SSL/TLS** > **Overview**
2. SSL/TLS encryption mode를 **Full** 또는 **Full (strict)** 로 변경
   - **Full**: 자체 서명 인증서도 허용
   - **Full (strict)**: 유효한 인증서만 허용 (Cloudflare Origin 인증서 사용 시 권장)

### 5단계: 배포 및 확인

```bash
# Docker Compose 재시작
cd /home/ubuntu/frontend
sudo docker-compose --env-file .env.production down
sudo docker-compose --env-file .env.production up -d

# SSL 인증서 확인
sudo docker exec checkin-nginx nginx -t

# 로그 확인
sudo docker logs checkin-nginx
```

---

## 방법 2: Let's Encrypt 인증서 (Cloudflare 미사용 시)

Cloudflare를 사용하지 않는 경우, Let's Encrypt를 사용하여 무료 SSL 인증서를 발급받을 수 있습니다.

### 1단계: Certbot 설치

EC2 서버에 SSH 접속 후:

```bash
# Certbot 설치
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# 또는 Docker를 사용하는 경우 certbot/certbot 이미지 사용
```

### 2단계: 인증서 발급

```bash
# Certbot으로 인증서 발급 (Nginx 자동 설정)
sudo certbot --nginx -d checkinn.store -d www.checkinn.store

# 또는 수동으로 인증서만 발급
sudo certbot certonly --standalone -d checkinn.store -d www.checkinn.store
```

### 3단계: 인증서 파일 위치 확인

Let's Encrypt 인증서는 다음 위치에 저장됩니다:
- 인증서: `/etc/letsencrypt/live/checkinn.store/fullchain.pem`
- 개인 키: `/etc/letsencrypt/live/checkinn.store/privkey.pem`

### 4단계: docker-compose.yml 수정

Let's Encrypt 인증서를 사용하려면 `docker-compose.yml`의 볼륨 마운트를 수정해야 합니다:

```yaml
volumes:
  - ./nginx/default.conf.template:/etc/nginx/templates/default.conf.template:ro
  - /etc/letsencrypt:/etc/letsencrypt:ro  # Let's Encrypt 인증서 디렉토리
```

### 5단계: nginx 설정 수정

`nginx/default.conf.template` 파일에서:

```nginx
ssl_certificate /etc/letsencrypt/live/checkinn.store/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/checkinn.store/privkey.pem;
```

### 6단계: 자동 갱신 설정

Let's Encrypt 인증서는 90일마다 갱신해야 합니다:

```bash
# Certbot 자동 갱신 테스트
sudo certbot renew --dry-run

# Cron 작업 추가 (매일 자동 갱신 확인)
sudo crontab -e
# 다음 줄 추가:
0 0 * * * certbot renew --quiet --deploy-hook "docker exec checkin-nginx nginx -s reload"
```

---

## 방법 3: 자체 서명 인증서 (테스트용)

프로덕션 환경에서는 권장하지 않지만, 테스트 목적으로 자체 서명 인증서를 사용할 수 있습니다.

### 1단계: 자체 서명 인증서 생성

```bash
# SSL 디렉토리 생성
mkdir -p /home/ubuntu/frontend/ssl

# 자체 서명 인증서 생성
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /home/ubuntu/frontend/ssl/private.key \
  -out /home/ubuntu/frontend/ssl/certificate.crt \
  -subj "/C=KR/ST=Seoul/L=Seoul/O=CheckIn/CN=checkinn.store"

# 파일 권한 설정
chmod 600 /home/ubuntu/frontend/ssl/private.key
chmod 644 /home/ubuntu/frontend/ssl/certificate.crt
```

### 2단계: Cloudflare SSL 모드

Cloudflare를 사용하는 경우 SSL 모드를 **Full**로 설정해야 합니다 (자체 서명 인증서 허용).

---

## 설정 확인

### SSL 인증서 확인

```bash
# Nginx 설정 테스트
sudo docker exec checkin-nginx nginx -t

# SSL 인증서 정보 확인
sudo docker exec checkin-nginx openssl x509 -in /etc/nginx/ssl/certificate.crt -text -noout

# HTTPS 연결 테스트
curl -vI https://checkinn.store
```

### 브라우저에서 확인

1. `https://checkinn.store` 접속
2. 브라우저 주소창의 자물쇠 아이콘 확인
3. 인증서 정보 확인 (자물쇠 아이콘 클릭)

---

## 문제 해결

### SSL handshake failed 에러

- 인증서 파일 경로 확인
- 파일 권한 확인 (`private.key`는 600, `certificate.crt`는 644)
- Cloudflare SSL 모드 확인 (Full 또는 Full (strict))

### 인증서 만료

- Cloudflare Origin 인증서: 15년 유효 (자동 갱신 불필요)
- Let's Encrypt: 90일마다 갱신 필요 (자동 갱신 설정 권장)

### Nginx 재시작 후 인증서 인식 안 됨

```bash
# Docker 컨테이너 재시작
sudo docker-compose --env-file .env.production restart nginx

# 또는 전체 재시작
sudo docker-compose --env-file .env.production down
sudo docker-compose --env-file .env.production up -d
```

---

## 보안 권장사항

1. **HSTS 활성화**: 이미 설정되어 있음 (`Strict-Transport-Security` 헤더)
2. **강력한 암호화**: TLS 1.2 이상 사용 (설정됨)
3. **인증서 보안**: `private.key` 파일 권한은 600으로 설정
4. **정기적 갱신**: Let's Encrypt 사용 시 자동 갱신 설정

---

## 참고 자료

- [Cloudflare Origin 인증서 가이드](https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/)
- [Let's Encrypt 문서](https://letsencrypt.org/docs/)
- [Nginx SSL 설정 가이드](https://nginx.org/en/docs/http/configuring_https_servers.html)

