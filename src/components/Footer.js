'use client';

import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* 상단 영역 */}
        <div className="flex flex-col lg:flex-row justify-between gap-8 mb-8">
          {/* 좌측 링크 */}
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="/center?tab=terms" className="font-semibold text-gray-900 hover:text-[#3B82F6] transition-colors">
              개인정보처리방침
            </a>
            <a href="/center?tab=terms" className="text-gray-600 hover:text-gray-900 transition-colors">
              이용약관
            </a>
            <a href="/center" className="text-gray-600 hover:text-gray-900 transition-colors">
              고객센터
            </a>
            <a href="/center?tab=terms" className="text-gray-600 hover:text-gray-900 transition-colors">
              사업자정보 공개
            </a>
          </div>

          {/* 우측 사업자 정보 */}
          <div className="text-xs text-gray-500 space-y-1">
            <div className="font-semibold text-gray-900 mb-2 text-sm">체크인(주) 사업자 정보</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <span>대표이사: 장태인</span>
              <span>사업자 등록번호: 123-45-67890</span>
              <span>전화: 1111-2222</span>
              <span>통신판매번호: 2025-서울강남-1234</span>
            </div>
            <div className="mt-2">주소: 서울특별시 강남구 테헤란로 123</div>
            <div>이메일: checkin@checkin.com</div>
            <div>호스팅 서비스 제공: Checkin Cloud</div>
          </div>
        </div>

        {/* 하단 법적 고지 */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500 leading-relaxed">
            체크인 호텔은 제휴사에서 제공하는 호텔정보 및 가격정보를 비교, 중개하는 서비스로서, 
            체크인(주)는 통신판매의 당사자가 아닙니다. 호텔 검색 결과 및 거래에 관한 의무와 책임은 
            판매자에게 있습니다. 외국인 관광 도시민박법에 따라 지정된 제주지역 외 국내 게스트하우스는 
            외국인만 투숙 가능합니다.
          </p>
        </div>

        {/* 체크인 로고 */}
        <div className="mt-8 text-center">
          <Link
            href="/admin-login"
            className="text-2xl font-bold text-gray-300 hover:text-gray-500 transition-colors cursor-pointer inline-block"
          >
            체크인
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
