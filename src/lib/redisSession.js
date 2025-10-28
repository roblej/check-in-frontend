//브라우저 세션 기준으로 고유 SessionId를 하나만 발급함
//새로고침해도 동일하고 탭을 닫으면 초기화됨

//crypto안쓰고 수동으로 UUID 생성
export function getOrCreateSessionId() {
    if (typeof window === "undefined") return null; // SSR 보호

    let sessionId = sessionStorage.getItem("hotel_session_id");
    if (!sessionId) {
        // 안전하게 UUID 생성 (crypto 지원 안 해도 동작)
        if (window.crypto && typeof window.crypto.randomUUID === "function") {
            sessionId = window.crypto.randomUUID();
        } else {
            // fallback: 수동 UUID 생성
            sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = (Math.random() * 16) | 0,
                    v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
        }
        sessionStorage.setItem("hotel_session_id", sessionId);
    }
    return sessionId;
}
