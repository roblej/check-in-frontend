import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const body = await req.json();
    const { paymentKey, orderId, amount } = body || {};
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
    const qrPayload = JSON.stringify({ orderId, paymentKey, amount });
    const qrUrl = `https://chart.googleapis.com/chart?chs=240x240&cht=qr&chl=${encodeURIComponent(
      qrPayload
    )}`;

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

    const response = {
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
    return new Response(
      JSON.stringify({ message: e?.message || "server error" }),
      { status: 500 }
    );
  }
}
