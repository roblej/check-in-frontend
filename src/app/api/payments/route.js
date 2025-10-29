import { NextResponse } from "next/server";

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
      const errorMsg = `필수 파라미터 누락: paymentKey=${!!paymentKey}, orderId=${!!orderId}, amount=${!!amount}`;
      console.error(errorMsg);
      return NextResponse.json(
        { success: false, message: errorMsg },
        { status: 400 }
      );
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

    // 호텔 예약 또는 다이닝 예약인 경우 백엔드로 전달
    try {
      let backendRequestData;

      if (body.type === "dining_reservation") {
        // 다이닝 예약 데이터 구성
        backendRequestData = {
          paymentKey,
          orderId,
          amount,
          type: "dining_reservation",
          customerIdx: body.customerInfo?.customerIdx || body.customerIdx || 1,
          diningIdx: body.diningIdx,
          diningDate: body.diningDate,
          diningTime: body.diningTime,
          guests: body.guests,
          totalPrice: body.totalPrice || amount,
          customerName: body.customerInfo?.name || body.customerName,
          customerEmail: body.customerInfo?.email || body.customerEmail,
          customerPhone: body.customerInfo?.phone || body.customerPhone,
          specialRequests: body.customerInfo?.specialRequests || body.specialRequests,
          method: body.method || "card",
          pointsUsed: body.paymentInfo?.pointAmount || body.pointsUsed || 0,
          cashUsed: body.paymentInfo?.cashAmount || body.cashUsed || 0,
        };
      } else {
        // 호텔 예약 데이터 구성
        // roomId를 Integer로 변환 (백엔드에서 Integer 타입 요구)
        // roomId가 "1003654-1" 형식일 경우 마지막 부분만 추출
        let roomIdValue = body.hotelInfo?.roomId || body.roomId;

        // 문자열이고 "-"를 포함하면 마지막 부분을 추출
        if (typeof roomIdValue === "string" && roomIdValue.includes("-")) {
          const parts = roomIdValue.split("-");
          roomIdValue = parts[parts.length - 1]; // 마지막 부분 (roomIdx)
        }

        const roomIdInt =
          typeof roomIdValue === "string"
            ? parseInt(roomIdValue, 10)
            : roomIdValue;

        backendRequestData = {
          paymentKey,
          orderId,
          amount,
          type: "hotel_reservation",
          customerIdx: body.customerInfo?.customerIdx || body.customerIdx || 1, // 실제 고객 ID
          contentId: body.hotelInfo?.contentId || body.contentId, // String 타입
          roomId: roomIdInt, // Integer 타입으로 변환
          checkIn: body.hotelInfo?.checkIn || body.checkIn,
          checkOut: body.hotelInfo?.checkOut || body.checkOut,
          guests: body.hotelInfo?.guests || body.guests,
          nights: body.hotelInfo?.nights || body.nights,
          roomPrice: body.hotelInfo?.roomPrice || body.roomPrice,
          totalPrice: body.hotelInfo?.totalPrice || body.totalPrice,
          customerName: body.customerInfo?.name || body.customerName,
          customerEmail: body.customerInfo?.email || body.customerEmail,
          customerPhone: body.customerInfo?.phone || body.customerPhone,
          specialRequests:
            body.customerInfo?.specialRequests || body.specialRequests,
          method: body.method || "card",
          pointsUsed: body.paymentInfo?.pointAmount || body.pointsUsed || 0,
          cashUsed: body.paymentInfo?.cashAmount || body.cashUsed || 0,
        };
      }

      console.log("백엔드로 전송할 데이터 (민감정보 제외):", {
        paymentKey: backendRequestData.paymentKey ? "***" : undefined,
        orderId: backendRequestData.orderId,
        amount: backendRequestData.amount,
        type: backendRequestData.type,
        diningIdx: backendRequestData.diningIdx,
        contentId: backendRequestData.contentId,
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

    // 이메일 발송은 백엔드에서 처리하므로 프론트엔드에서는 로그만 남김
    console.log("결제 완료 - 백엔드에서 이메일 발송 처리됨:", orderId);

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
