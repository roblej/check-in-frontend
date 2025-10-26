//브라우저 세션 기준으로 고유 SessionId를 하나만 발급함
//새로고침해도 동일하고 탭을 닫으면 초기화됨

export function getOrCreateSessionId() {
    if (typeof window === "undefined") return null; // SSR 보호

    let sessionId = sessionStorage.getItem("hotel_session_id");
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem("hotel_session_id", sessionId);
    }
    return sessionId;
}