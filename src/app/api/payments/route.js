import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("결제 API 요청 받음 (민감정보 제외):", {
      paymentKey: body.paymentKey ? "***" : undefined,
      orderId: body.orderId,
      amount: body.amount,
      type: body.type,
    });

    const {
      paymentKey,
      orderId,
      amount,
      // 중고 호텔 관련 필드들
      usedItemIdx,
      usedTradeIdx,
      totalAmount,
      paymentInfo,
      hotelInfo,
      customerInfo,
    } = body || {};

    console.log("파싱된 데이터 (민감정보 제외):", {
      paymentKey: paymentKey ? "***" : undefined,
      orderId,
      amount,
      usedItemIdx,
      usedTradeIdx,
      totalAmount,
      type: body.type,
    });

    if (!paymentKey || !orderId || !amount) {
      console.error("필수 파라미터 누락:", { paymentKey, orderId, amount });
      return NextResponse.json({ message: "invalid params" }, { status: 400 });
    }

    // 중고 호텔 결제인 경우 직접 처리 (팀원 기능 보존)
    if (usedTradeIdx) {
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
    try {
      const backendRequestData = {
        paymentKey,
        orderId,
        amount,
        type: "hotel_reservation",
        customerIdx: body.customerIdx || 1, // 기본값 설정
        contentId: body.contentId,
        roomId: body.roomId,
        checkIn: body.checkIn,
        checkOut: body.checkOut,
        guests: body.guests,
        nights: body.nights,
        roomPrice: body.roomPrice,
        totalPrice: body.totalPrice,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        customerPhone: body.customerPhone,
        specialRequests: body.specialRequests,
        method: body.method || "card",
        pointsUsed: body.pointsUsed || 0,
        cashUsed: body.cashUsed || 0,
      };

      console.log("백엔드로 전송할 데이터 (민감정보 제외):", {
        paymentKey: backendRequestData.paymentKey ? "***" : undefined,
        orderId: backendRequestData.orderId,
        amount: backendRequestData.amount,
        type: backendRequestData.type,
      });
      console.log(
        "백엔드 URL:",
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888"
        }/api/payments/confirm`
      );

      const backendResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8888"
        }/api/payments/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(backendRequestData),
        }
      );

      console.log("백엔드 응답 상태:", backendResponse.status);
      console.log(
        "백엔드 응답 헤더:",
        Object.fromEntries(backendResponse.headers.entries())
      );

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error("백엔드 오류 응답:", errorText);
        throw new Error(`백엔드 결제 검증 실패: ${errorText}`);
      }

      const result = await backendResponse.json();
      console.log("백엔드 응답 데이터:", result);
      return NextResponse.json(result);
    } catch (error) {
      console.error("호텔 예약 결제 처리 오류:", error);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }
  } catch (e) {
    console.error("결제 처리 오류:", e);
    return NextResponse.json(
      { message: e?.message || "server error" },
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
    // TODO: Verify with Toss Payments server API here (omitted/mocked)
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

    // 중고 호텔 결제인 경우 로그만 남기고 백엔드에서 처리하도록 함
    if (usedTradeIdx) {
      console.log("중고 호텔 결제 완료 - 백엔드에서 UsedPay 저장 처리:", {
        usedTradeIdx,
        paymentKey,
        orderId,
        amount,
        totalAmount: totalAmount || amount,
        cashAmount: paymentInfo?.useCash || 0,
        pointAmount: paymentInfo?.usePoint || 0,
        cardAmount: paymentInfo?.actualPaymentAmount || amount,
      });
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
        const transporter = nodemailer.createTransport({
          host: "smtp.sendgrid.net",
          port: 587,
          secure: false,
          auth: { user: smtpUser, pass: smtpPass },
        });

        // 중고 호텔과 일반 호텔 이메일 구분
        const isUsedHotel = !!usedTradeIdx;
        const subject = isUsedHotel
          ? `🎉 중고 호텔 결제 완료 - ${orderId}`
          : `결제 완료 안내 - ${orderId}`;

        const emailHtml = isUsedHotel
          ? `
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
        `
          : `
          <p>결제가 완료되었습니다.</p>
          <p>주문번호: <b>${orderId}</b></p>
          <p>금액: <b>${amount.toLocaleString()}원</b></p>
          <p><img src="${qrUrl}" alt="QR" /></p>
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

    // 응답 데이터 구성 (중고 호텔과 일반 호텔 구분)
    const isUsedHotel = !!usedTradeIdx;

    const response = isUsedHotel
      ? {
          // 중고 호텔 결제 응답
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
        }
      : {
          // 일반 호텔 결제 응답 (기존)
          orderIdx,
          customerIdx: "userA01",
          promotionPayIdx: 15,
          couponIdx: 32,
          price: amount,
          status: 1,
          paymentKey,
          pointsUsed: 3000,
          createdAt: now.toISOString(),
          method: "카드",
          receiptUrl: `https://toss.im/payments/receipt/${orderIdx}`,
          approvedAt: now.toISOString(),
          updatedAt: now.toISOString(),
          adminIdx: 3,
          orderId,
          qrUrl,
        };

    return NextResponse.json(response);
  } catch (e) {
    console.error("결제 처리 오류:", e);
    return NextResponse.json(
      { message: e?.message || "server error" },
      { status: 500 }
    );
  }
}
