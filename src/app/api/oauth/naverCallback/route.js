// 네이버 OAuth 콜백 처리 API
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  
  const client_id = 'VqsbzJuI12KsWAz74De4';
  const client_secret = 'm8w_WdJpNi';
  const redirectURI = encodeURIComponent("http://localhost:3333/api/oauth/naverCallback");
  
  // 네이버에 토큰 요청 (서버에서만 가능 - CORS 문제 없음)
  const tokenUrl = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirectURI}&code=${code}&state=${state}`;
  
  try {
    const response = await fetch(tokenUrl, {
      method: 'GET',
      headers: {
        'X-Naver-Client-Id': client_id,
        'X-Naver-Client-Secret': client_secret,
      },
    });
    
    if (response.ok) {
      // 네이버 API 응답 body를 JSON으로 파싱
      const tokenData = await response.json();
      
      // TODO: 여기서 백엔드 API에 토큰 전달하여 로그인 처리
      // 예: await axios.post('/api/login/naver', { accessToken });
      
      // 임시로 토큰 데이터를 JSON으로 반환
      return Response.json({
        success: true,
        token: tokenData,
        
      });
    } else {
      const errorText = await response.text();
      console.error('네이버 토큰 요청 실패:', response.status, errorText);
      return Response.json({
        success: false,
        error: '토큰 받기 실패',
      }, { status: response.status });
    }
  } catch (error) {
    console.error('네이버 토큰 요청 실패:', error);
    return Response.json({
      success: false,
      error: '네트워크 오류',
    }, { status: 500 });
  }
}

