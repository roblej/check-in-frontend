import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

// SendGrid 설정
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { paymentKey, orderId, amount, type, hotelInfo, customerInfo } = body;

    // 백엔드 API로 결제 검증 요청
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/payments/verify`,
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
          customerIdx: 1, // 임시 고객 ID (실제로는 로그인된 사용자 ID 사용)
          contentId: hotelInfo?.contentId || hotelInfo?.hotelId?.toString(),
          roomId: hotelInfo?.roomId,
          checkIn: hotelInfo?.checkIn,
          checkOut: hotelInfo?.checkOut,
          guests: hotelInfo?.guests,
          nights: hotelInfo?.nights,
          roomPrice: hotelInfo?.roomPrice,
          totalPrice: hotelInfo?.totalPrice,
          customerName: customerInfo?.name,
          customerEmail: customerInfo?.email,
          customerPhone: customerInfo?.phone,
          specialRequests: customerInfo?.specialRequests,
          method: "card",
          pointsUsed: 0,
          cashUsed: 0,
        }),
      }
    );

    if (!backendResponse.ok) {
      throw new Error("백엔드 결제 검증 실패");
    }

    const backendResult = await backendResponse.json();

    if (!backendResult.success) {
      throw new Error(backendResult.message || "백엔드 결제 검증 실패");
    }

    // 이메일 발송
    if (type === "hotel_reservation") {
      await sendHotelReservationEmail(hotelInfo, customerInfo, orderId, amount);
    } else if (type === "used_hotel") {
      await sendUsedHotelPurchaseEmail(
        hotelInfo,
        customerInfo,
        orderId,
        amount
      );
    }

    return NextResponse.json({
      success: true,
      message: "결제가 성공적으로 완료되었습니다.",
      orderId,
      qrUrl: backendResult.qrUrl,
      receiptUrl: backendResult.receiptUrl,
    });
  } catch (error) {
    console.error("결제 처리 오류:", error);
    return NextResponse.json(
      { success: false, message: "결제 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 호텔 예약 이메일 발송
async function sendHotelReservationEmail(
  hotelInfo,
  customerInfo,
  orderId,
  amount
) {
  const msg = {
    to: customerInfo.email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: `[체크인] 호텔 예약 완료 - ${hotelInfo.hotelName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 예약 완료!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">체크인 호텔 예약이 성공적으로 완료되었습니다.</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">예약 정보</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #667eea; margin-top: 0;">${
              hotelInfo.hotelName
            }</h3>
            <p style="color: #666; margin: 5px 0;">${hotelInfo.roomName}</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
              <div>
                <strong>체크인:</strong><br>
                <span style="color: #333;">${hotelInfo.checkIn}</span>
              </div>
              <div>
                <strong>체크아웃:</strong><br>
                <span style="color: #333;">${hotelInfo.checkOut}</span>
              </div>
              <div>
                <strong>숙박 일수:</strong><br>
                <span style="color: #333;">${hotelInfo.nights}박</span>
              </div>
              <div>
                <strong>게스트:</strong><br>
                <span style="color: #333;">${hotelInfo.guests}명</span>
              </div>
            </div>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #667eea; margin-top: 0;">예약자 정보</h3>
            <p><strong>이름:</strong> ${customerInfo.name}</p>
            <p><strong>이메일:</strong> ${customerInfo.email}</p>
            <p><strong>전화번호:</strong> ${customerInfo.phone}</p>
            ${
              customerInfo.specialRequests
                ? `<p><strong>특별 요청사항:</strong> ${customerInfo.specialRequests}</p>`
                : ""
            }
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h3 style="color: #667eea; margin-top: 0;">결제 정보</h3>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
              <span>객실 가격</span>
              <span>₩${hotelInfo.roomPrice.toLocaleString()}/박</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
              <span>숙박 일수</span>
              <span>${hotelInfo.nights}박</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
              <span>세금 및 수수료</span>
              <span>포함</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; font-size: 18px; font-weight: bold; color: #667eea;">
              <span>총 결제 금액</span>
              <span>₩${amount.toLocaleString()}</span>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 10px;">
              주문번호: ${orderId}
            </p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 14px;">
            체크인 서비스 | 고객센터: 1588-0000 | 이메일: support@checkin.com
          </p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #ccc;">
            이 이메일은 발신 전용입니다. 문의사항이 있으시면 고객센터로 연락해주세요.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log("호텔 예약 이메일 발송 완료:", customerInfo.email);
  } catch (error) {
    console.error("이메일 발송 실패:", error);
  }
}

// 중고 호텔 구매 이메일 발송
async function sendUsedHotelPurchaseEmail(
  hotelInfo,
  customerInfo,
  orderId,
  amount
) {
  const msg = {
    to: customerInfo.email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: `[체크인] 중고 호텔 구매 완료 - ${hotelInfo.hotelName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 구매 완료!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">중고 호텔 구매가 성공적으로 완료되었습니다.</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">구매 정보</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #ff6b6b; margin-top: 0;">${
              hotelInfo.hotelName
            }</h3>
            <p style="color: #666; margin: 5px 0;">${hotelInfo.roomType}</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
              <div>
                <strong>체크인:</strong><br>
                <span style="color: #333;">${hotelInfo.checkIn}</span>
              </div>
              <div>
                <strong>체크아웃:</strong><br>
                <span style="color: #333;">${hotelInfo.checkOut}</span>
              </div>
              <div>
                <strong>숙박 일수:</strong><br>
                <span style="color: #333;">${hotelInfo.nights}박</span>
              </div>
              <div>
                <strong>게스트:</strong><br>
                <span style="color: #333;">${hotelInfo.guests}명</span>
              </div>
            </div>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #ff6b6b; margin-top: 0;">구매자 정보</h3>
            <p><strong>이름:</strong> ${customerInfo.name}</p>
            <p><strong>이메일:</strong> ${customerInfo.email}</p>
            <p><strong>전화번호:</strong> ${customerInfo.phone}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h3 style="color: #ff6b6b; margin-top: 0;">결제 정보</h3>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
              <span>원가</span>
              <span style="text-decoration: line-through; color: #999;">₩${hotelInfo.originalPrice.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
              <span>할인 금액</span>
              <span style="color: #ff6b6b;">-₩${hotelInfo.discountAmount.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
              <span>세금 및 수수료</span>
              <span>₩${Math.round(
                hotelInfo.salePrice * 0.1
              ).toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; font-size: 18px; font-weight: bold; color: #ff6b6b;">
              <span>총 결제 금액</span>
              <span>₩${amount.toLocaleString()}</span>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 10px;">
              주문번호: ${orderId}
            </p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 14px;">
            체크인 서비스 | 고객센터: 1588-0000 | 이메일: support@checkin.com
          </p>
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #ccc;">
            이 이메일은 발신 전용입니다. 문의사항이 있으시면 고객센터로 연락해주세요.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log("중고 호텔 구매 이메일 발송 완료:", customerInfo.email);
  } catch (error) {
    console.error("이메일 발송 실패:", error);
  }
}
