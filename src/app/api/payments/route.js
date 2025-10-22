import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const body = await req.json();
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
      customerInfo
    } = body || {};

    if (!paymentKey || !orderId || !amount) {
      return new Response(JSON.stringify({ message: "invalid params" }), {
        status: 400,
      });
    }

    // TODO: Verify with Toss Payments server API here (omitted/mocked)
    const now = new Date();
    const orderIdx =
      Number(orderId.replace(/\D/g, "").slice(-5)) ||
      Math.floor(Math.random() * 100000);

    // Create QR via Google Chart API
    const qrPayload = JSON.stringify({ orderId, paymentKey, amount, usedTradeIdx });
    const qrUrl = `https://chart.googleapis.com/chart?chs=240x240&cht=qr&chl=${encodeURIComponent(qrPayload)}`;

    // 중고 호텔 결제인 경우 UsedPay 테이블에 저장
    if (usedTradeIdx) {
      try {
        console.log('중고 호텔 결제 처리 시작:', { usedTradeIdx, paymentKey, orderId, amount });

        const paymentData = {
          usedTradeIdx: usedTradeIdx,
          paymentKey: paymentKey,
          orderId: orderId,
          totalAmount: totalAmount || amount,
          cashAmount: paymentInfo?.useCash || 0,
          pointAmount: paymentInfo?.usePoint || 0,
          cardAmount: paymentInfo?.actualPaymentAmount || amount,
          paymentMethod: paymentInfo?.paymentMethod || 'card',
          status: 1, // 결제 완료
          receiptUrl: `https://toss.im/payments/receipt/${orderId}`,
          qrUrl: qrUrl,
          approvedAt: now.toISOString()
        };

        // 백엔드 API 호출하여 UsedPay 테이블에 저장
        const backendUrl = 'http://localhost:8888/api/used-hotels/payment';

        const backendResponse = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData)
        });

        if (!backendResponse.ok) {
          const errorData = await backendResponse.json();
          console.error('UsedPay 저장 실패:', errorData.message);
          throw new Error(`결제 내역 저장 실패: ${errorData.message}`);
        }

        const savedPayment = await backendResponse.json();

      } catch (dbError) {
        console.error('데이터베이스 저장 오류:', dbError);
        // DB 저장 실패해도 결제는 완료된 상태이므로 계속 진행
      }
    }

    // Send email via SendGrid SMTP (using nodemailer) - 선택적 실행
    try {
      const smtpUser = process.env.SENDGRID_SMTP_USER;
      const smtpPass = process.env.SENDGRID_SMTP_PASS;
      const mailTo = process.env.PAYMENT_NOTIFY_TO || "admin@checkin.com";
      
      if (smtpUser && smtpPass && smtpUser !== "apikey" && smtpPass !== "your_sendgrid_api_key_here") {
        const transporter = nodemailer.createTransport({
          host: "smtp.sendgrid.net",
          port: 587,
          secure: false,
          auth: { user: smtpUser, pass: smtpPass },
        });

        // 중고 호텔과 일반 호텔 이메일 구분
        const isUsedHotel = !!usedTradeIdx;
        const subject = isUsedHotel ? `🎉 중고 호텔 결제 완료 - ${orderId}` : `결제 완료 안내 - ${orderId}`;
        
        const emailHtml = isUsedHotel ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">🎉 중고 호텔 결제 완료</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
              <p><strong>주문번호:</strong> ${orderId}</p>
              <p><strong>거래번호:</strong> ${usedTradeIdx}</p>
              <p><strong>호텔명:</strong> ${hotelInfo?.hotelName || 'N/A'}</p>
              <p><strong>총 결제금액:</strong> <span style="color: #3b82f6; font-size: 18px;">${totalAmount?.toLocaleString()}원</span></p>
              <p><strong>캐시 사용:</strong> ${paymentInfo?.useCash?.toLocaleString()}원</p>
              <p><strong>포인트 사용:</strong> ${paymentInfo?.usePoint?.toLocaleString()}P</p>
              <p><strong>카드 결제:</strong> ${paymentInfo?.actualPaymentAmount?.toLocaleString()}원</p>
              <p><strong>결제시간:</strong> ${now.toLocaleString('ko-KR')}</p>
            </div>
            <div style="text-align: center; margin: 20px 0;">
              <img src="${qrUrl}" alt="QR 코드" style="max-width: 200px;">
              <p style="font-size: 12px; color: #666;">QR 코드로 예약 확인이 가능합니다.</p>
            </div>
          </div>
        ` : `
          <p>결제가 완료되었습니다.</p>
          <p>주문번호: <b>${orderId}</b></p>
          <p>금액: <b>${amount.toLocaleString()}원</b></p>
          <p><img src="${qrUrl}" alt="QR" /></p>
        `;

        await transporter.sendMail({
          from: "Check-In <noreply@checkin.local>",
          to: mailTo,
          subject: `결제 완료 안내 - ${orderId}`,
          html: `<p>결제가 완료되었습니다.</p><p>주문번호: <b>${orderId}</b></p><p>금액: <b>${amount.toLocaleString()}원</b></p><p><img src="${qrUrl}" alt="QR" /></p>`,
        });
        console.log('이메일 발송 완료:', mailTo);
      } else {
        console.log('이메일 설정이 없어서 이메일 발송을 건너뜁니다.');
      }
    } catch (emailError) {
      console.error('이메일 발송 실패:', emailError.message);
      // 이메일 발송 실패해도 결제는 계속 진행
    }

    // 응답 데이터 구성 (중고 호텔과 일반 호텔 구분)
    const isUsedHotel = !!usedTradeIdx;
    
    const response = isUsedHotel ? {
      // 중고 호텔 결제 응답
      success: true,
      usedTradeIdx,
      orderId,
      paymentKey,
      totalAmount: totalAmount || amount,
      cashAmount: paymentInfo?.useCash || 0,
      pointAmount: paymentInfo?.usePoint || 0,
      cardAmount: paymentInfo?.actualPaymentAmount || amount,
      paymentMethod: paymentInfo?.paymentMethod || 'card',
      receiptUrl: `https://toss.im/payments/receipt/${orderId}`,
      qrUrl,
      approvedAt: now.toISOString(),
      message: "중고 호텔 결제가 완료되었습니다."
    } : {
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

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error('결제 처리 오류:', e);
    return new Response(
      JSON.stringify({ message: e?.message || "server error" }),
      { status: 500 }
    );
  }
}
