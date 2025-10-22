# TossPayments 결제 프로세스 구현

## 개요

TossPayments SDK를 이용한 결제 프로세스를 구현했습니다. 결제 성공 시 백엔드에서 검증 후 DB 저장 및 QR 코드 첨부 이메일 발송까지 처리합니다.

## 구현된 기능

### Frontend (Next.js + Tailwind)

- ✅ TossPayments SDK 사용 (`tossPayments.requestPayment`)
- ✅ 결제 성공 시 `/payment/complete` 페이지로 이동
- ✅ 결제 실패 시 `/checkout/fail` 페이지로 이동
- ✅ 성공 시 URL 파라미터를 백엔드로 POST 전송 (`/api/payments/confirm`)
- ✅ 모든 fetch/axios는 try-catch로 감싸고 에러 시 toast 표시

### Backend (Spring Boot + JPA/MyBatis + MySQL)

- ✅ `/api/payments/confirm` API 구현
- ✅ Toss API(`/v1/payments/confirm`)로 결제 검증 (서버 시크릿키 사용)
- ✅ 검증 성공 시 `roomPayment` 테이블에 결제정보 저장
- ✅ QR 코드 생성 (Google Chart API)
- ✅ 이메일 발송 (JavaMailSender 이용, HTML 본문 + QR 첨부)
- ✅ SLF4J 로그 사용
- ✅ Swagger 어노테이션 및 ResponseEntity 구조 포함

### 이메일 전송 요구사항

- ✅ Gmail SMTP 사용 (`spring.mail` 설정)
- ✅ 제목: `[Check-In] 결제가 완료되었습니다`
- ✅ 본문: 예약정보 + 결제금액 + QR 코드 이미지 포함 (HTML)
- ✅ 실패 시 로그(`log.error`) 남기고 응답에는 `"emailSent": false`

## 파일 구조

### Backend 파일들

```
check-in-backend/src/main/java/com/sist/backend/
├── controller/
│   └── PaymentController.java          # 결제 API 컨트롤러
├── service/
│   ├── PaymentService.java             # 결제 서비스 (통합)
│   ├── TossPaymentsService.java        # TossPayments 검증 서비스
│   └── MailService.java                # 이메일 발송 서비스
├── util/
│   └── QRCodeGenerator.java            # QR 코드 생성 유틸리티
├── dto/
│   ├── PaymentRequestDto.java          # 결제 요청 DTO
│   └── PaymentResponseDto.java         # 결제 응답 DTO
└── entity/
    └── RoomPayment.java                # 결제 엔티티
```

### Frontend 파일들

```
check-in-frontend/src/
├── components/payment/
│   └── TossPaymentsWidget.js           # TossPayments 위젯
├── app/
│   ├── payment/complete/
│   │   └── page.js                     # 결제 완료 페이지
│   ├── checkout/success/
│   │   └── page.js                     # 결제 성공 페이지
│   └── checkout/fail/
│       └── page.js                     # 결제 실패 페이지
└── env.example                         # 환경 변수 예시
```

## 설정 방법

### 1. 환경 변수 설정

프론트엔드 `.env.local` 파일에 다음 변수들을 설정하세요:

```env
# TossPayments 설정
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq
TOSS_SECRET_KEY=test_sk_4vOrk2RZbz5oVn3xMQ1gLzN97Eoq

# 백엔드 API URL
NEXT_PUBLIC_API_URL=http://localhost:8888

# Gmail SMTP 설정
GMAIL_USERNAME=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

### 2. Gmail 앱 비밀번호 설정

1. Google 계정 설정에서 2단계 인증 활성화
2. 앱 비밀번호 생성
3. 생성된 비밀번호를 `GMAIL_APP_PASSWORD`에 설정

### 3. TossPayments 테스트 키

- 테스트 환경에서는 제공된 테스트 키 사용
- 운영 환경에서는 실제 키로 교체 필요

## API 엔드포인트

### POST `/api/payments/confirm`

결제 확인 및 검증 API

**요청 본문:**

```json
{
  "paymentKey": "string",
  "orderId": "string",
  "amount": 10000,
  "type": "hotel_reservation",
  "customerIdx": 1,
  "contentId": "string",
  "roomId": 1,
  "checkIn": "2024-01-01",
  "checkOut": "2024-01-02",
  "guests": 2,
  "nights": 1,
  "roomPrice": 50000,
  "totalPrice": 50000,
  "customerName": "홍길동",
  "customerEmail": "test@example.com",
  "customerPhone": "010-1234-5678",
  "specialRequests": "string",
  "method": "card",
  "pointsUsed": 0,
  "cashUsed": 0
}
```

**응답:**

```json
{
  "success": true,
  "message": "결제가 성공적으로 완료되었습니다.",
  "orderId": "string",
  "paymentKey": "string",
  "amount": 10000,
  "status": "DONE",
  "approvedAt": "2024-01-01T12:00:00",
  "receiptUrl": "string",
  "qrUrl": "string",
  "emailSent": true
}
```

## 사용 방법

### 1. 결제 위젯 사용

```jsx
import TossPaymentsWidget from "@/components/payment/TossPaymentsWidget";

<TossPaymentsWidget
  clientKey={process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY}
  customerKey="customer_123"
  amount={50000}
  orderId="order_123"
  orderName="호텔 예약"
  customerName="홍길동"
  customerEmail="test@example.com"
  customerMobilePhone="010-1234-5678"
  hotelInfo={{
    contentId: "12345",
    roomId: 1,
    checkIn: "2024-01-01",
    checkOut: "2024-01-02",
    guests: 2,
    nights: 1,
    roomPrice: 50000,
    totalPrice: 50000,
  }}
  customerInfo={{
    name: "홍길동",
    email: "test@example.com",
    phone: "010-1234-5678",
    specialRequests: "조용한 방 부탁드립니다",
  }}
  onSuccess={(result) => console.log("결제 성공:", result)}
  onFail={(error) => console.error("결제 실패:", error)}
/>;
```

### 2. 결제 플로우

1. 사용자가 결제 버튼 클릭
2. TossPayments 결제창 열림
3. 결제 완료 후 백엔드로 검증 요청
4. TossPayments API로 결제 검증
5. DB에 결제 정보 저장
6. QR 코드 생성
7. 이메일 발송
8. 결제 완료 페이지로 이동

## 주요 특징

### 보안

- 서버에서 TossPayments API 검증
- 시크릿 키는 서버에서만 사용
- 클라이언트 키는 환경 변수로 관리

### 에러 처리

- 모든 API 호출에 try-catch 적용
- 상세한 에러 로깅
- 사용자 친화적인 에러 메시지

### 이메일 발송

- HTML 템플릿 사용
- QR 코드 이미지 첨부
- 발송 실패 시 로그 기록

### QR 코드

- Google Chart API 사용
- 주문 ID 기반 생성
- 이메일 첨부 및 페이지 표시

## 테스트

### 1. 결제 테스트

- TossPayments 테스트 카드 사용
- 테스트 키로 결제 진행
- 실제 결제는 발생하지 않음

### 2. 이메일 테스트

- Gmail SMTP 설정 확인
- 테스트 이메일 발송
- 첨부파일 확인

### 3. QR 코드 테스트

- QR 코드 URL 접근 가능 여부 확인
- 이미지 다운로드 테스트

## 문제 해결

### 일반적인 문제들

1. **Gmail SMTP 연결 실패**

   - 2단계 인증 활성화 확인
   - 앱 비밀번호 사용 확인
   - 방화벽 설정 확인

2. **TossPayments 검증 실패**

   - 시크릿 키 확인
   - API 엔드포인트 확인
   - 요청 데이터 형식 확인

3. **QR 코드 생성 실패**
   - Google Chart API 접근 가능 여부 확인
   - 주문 ID 형식 확인

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
