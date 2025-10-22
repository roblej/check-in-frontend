import { NextResponse } from "next/server";

/**
 * 결제 처리 API 라우트
 * 호텔 예약은 백엔드로 전달, 중고 호텔은 직접 처리합니다.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      paymentKey,
      orderId,
      amount,
      type,
      // 중고 호텔 관련 필드들
      usedItemIdx,
      usedTradeIdx,
      totalAmount,
      paymentInfo,
      hotelInfo,
      customerInfo,
    } = body;

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ message: "invalid params" }, { status: 400 });
    }

    // 중고 호텔 결제인 경우 직접 처리 (팀원 기능 보존)
    if (type === "used_hotel" || usedTradeIdx) {
      return await handleUsedHotelPayment({
        paymentKey,
        orderId,
        amount,
        usedTradeIdx,
        totalAmount,
        paymentInfo,
        hotelInfo,
        customerInfo,
      });
    }

    // 호텔 예약인 경우 백엔드로 전달 (당신 기능)
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/payments/confirm`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
          type,
        }),
      }
    );

    if (!backendResponse.ok) {
      throw new Error("백엔드 결제 검증 실패");
    }

    const result = await backendResponse.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("결제 처리 오류:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/**
 * 중고 호텔 결제 처리 (팀원 기능 보존)
 */
async function handleUsedHotelPayment({
  paymentKey,
  orderId,
  amount,
  usedTradeIdx,
  totalAmount,
  paymentInfo,
  hotelInfo,
  customerInfo,
}) {
  try {
    console.log("중고 호텔 결제 처리 시작:", {
      usedTradeIdx,
      paymentKey,
      orderId,
      amount,
    });

    const now = new Date();
    const orderIdx =
      Number(orderId.replace(/\D/g, "").slice(-5)) ||
      Math.floor(Math.random() * 100000);

    // Create QR via Google Chart API
    const qrPayload = JSON.stringify({
      orderId,
      paymentKey,
      amount,
      usedTradeIdx,
    });
    const qrUrl = `https://chart.googleapis.com/chart?chs=240x240&cht=qr&chl=${encodeURIComponent(
      qrPayload
    )}`;

    // 중고 호텔 결제인 경우 UsedPay 테이블에 저장
    if (usedTradeIdx) {
      try {
        const paymentData = {
          usedTradeIdx: usedTradeIdx,
          paymentKey: paymentKey,
          orderId: orderId,
          totalAmount: totalAmount || amount,
          cashAmount: paymentInfo?.useCash || 0,
          pointAmount: paymentInfo?.usePoint || 0,
          cardAmount: paymentInfo?.actualPaymentAmount || amount,
          paymentMethod: paymentInfo?.paymentMethod || "card",
          status: 1, // 결제 완료
          receiptUrl: `https://toss.im/payments/receipt/${orderId}`,
          qrUrl: qrUrl,
          approvedAt: now.toISOString(),
        };

        // 백엔드 API 호출하여 UsedPay 테이블에 저장
        const backendUrl = "http://localhost:8888/api/used-hotels/payment";
        const backendResponse = await fetch(backendUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        });

        if (!backendResponse.ok) {
          const errorData = await backendResponse.json();
          console.error("UsedPay 저장 실패:", errorData.message);
          throw new Error(`결제 내역 저장 실패: ${errorData.message}`);
        }

        const savedPayment = await backendResponse.json();
        console.log("UsedPay 저장 완료:", savedPayment);
      } catch (dbError) {
        console.error("데이터베이스 저장 오류:", dbError);
        // DB 저장 실패해도 결제는 완료된 상태이므로 계속 진행
      }
    }

    // Send email via SendGrid SMTP (using nodemailer) - 선택적 실행
    try {
      const smtpUser = process.env.SENDGRID_SMTP_USER;
      const smtpPass = process.env.SENDGRID_SMTP_PASS;
      const mailTo = process.env.PAYMENT_NOTIFY_TO || "admin@checkin.com";

      if (
        smtpUser &&
        smtpPass &&
        smtpUser !== "apikey" &&
        smtpPass !== "your_sendgrid_api_key_here"
      ) {
        const transporter = nodemailer.createTransporter({
          host: "smtp.sendgrid.net",
          port: 587,
          secure: false,
          auth: { user: smtpUser, pass: smtpPass },
        });

        const subject = `🎉 중고 호텔 결제 완료 - ${orderId}`;

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">🎉 중고 호텔 결제 완료</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
              <p><strong>주문번호:</strong> ${orderId}</p>
              <p><strong>거래번호:</strong> ${usedTradeIdx}</p>
              <p><strong>호텔명:</strong> ${hotelInfo?.hotelName || "N/A"}</p>
              <p><strong>총 결제금액:</strong> <span style="color: #3b82f6; font-size: 18px;">${totalAmount?.toLocaleString()}원</span></p>
              <p><strong>캐시 사용:</strong> ${paymentInfo?.useCash?.toLocaleString()}원</p>
              <p><strong>포인트 사용:</strong> ${paymentInfo?.usePoint?.toLocaleString()}P</p>
              <p><strong>카드 결제:</strong> ${paymentInfo?.actualPaymentAmount?.toLocaleString()}원</p>
              <p><strong>결제시간:</strong> ${now.toLocaleString("ko-KR")}</p>
            </div>
            <div style="text-align: center; margin: 20px 0;">
              <img src="${qrUrl}" alt="QR 코드" style="max-width: 200px;">
              <p style="font-size: 12px; color: #666;">QR 코드로 예약 확인이 가능합니다.</p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: "Check-In <noreply@checkin.local>",
          to: mailTo,
          subject: subject,
          html: emailHtml,
        });
        console.log("이메일 발송 완료:", mailTo);
      } else {
        console.log("이메일 설정이 없어서 이메일 발송을 건너뜁니다.");
      }
    } catch (emailError) {
      console.error("이메일 발송 실패:", emailError.message);
      // 이메일 발송 실패해도 결제는 계속 진행
    }

    // 중고 호텔 결제 응답
    const response = {
      success: true,
      usedTradeIdx,
      orderId,
      paymentKey,
      totalAmount: totalAmount || amount,
      cashAmount: paymentInfo?.useCash || 0,
      pointAmount: paymentInfo?.usePoint || 0,
      cardAmount: paymentInfo?.actualPaymentAmount || amount,
      paymentMethod: paymentInfo?.paymentMethod || "card",
      receiptUrl: `https://toss.im/payments/receipt/${orderId}`,
      qrUrl,
      approvedAt: now.toISOString(),
      message: "중고 호텔 결제가 완료되었습니다.",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("중고 호텔 결제 처리 오류:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
