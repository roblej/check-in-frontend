
import { cookies } from 'next/headers';

export default function ReadToken() {
    function readAccessToken(accessToken) {
            const payloadBase64 = accessToken.split('.')[1];
            
            // Base64 디코딩 후 UTF-8 디코딩
            const decodedPayload = atob(payloadBase64);
            const utf8Payload = decodeURIComponent(escape(decodedPayload));
            const userInfo = JSON.parse(utf8Payload);
            
            return userInfo;
    }
    // 1. 요청 헤더에서 쿠키 객체를 가져옵니다.
    const cookieStore = cookies();
    
    // 2. 쿠키 이름(예: 'accessToken')을 사용하여 값을 읽어옵니다.
    // 백엔드에서 HttpOnly 쿠키로 Access Token을 저장했다고 가정합니다.
    const accessToken = cookieStore.get('accessToken')?.value;
    console.log("readToken_accessToken:"+accessToken);
    if (!accessToken) {
        // Access Token이 없거나 만료되었으면 로그인 페이지로 리다이렉트
        // (Next.js에서는 'redirect' 함수 사용)
        // redirect('/login'); 
    }
    const userData = readAccessToken(accessToken);
    console.log(userData);
    // 3. 읽어온 Access Token을 사용하거나 유효성 검사를 진행합니다.
    
}