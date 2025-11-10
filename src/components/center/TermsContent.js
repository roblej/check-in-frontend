"use client";

const Section = ({ title, children }) => (
  <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
    <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
    <div className="space-y-3 text-sm leading-6 text-gray-700">{children}</div>
  </section>
);

const TermsContent = () => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-2">
          서비스 이용 약관
        </h2>
        <p className="text-blue-800 text-sm">
          본 약관은 호텔 예약 플랫폼(이하 &ldquo;서비스&rdquo;)의 이용과
          관련하여 회원과 (주)체크인(대표이사: 장태인, 고객센터: 1588-0000,
          help@check-in.co.kr) 간의 권리, 의무 및 책임사항을 규정합니다. 약관이
          개정되는 경우 최소 7일 전에 서비스 공지사항 및 이메일을 통해 안내해
          드립니다.
        </p>
      </div>

      <Section title="1. 총칙">
        <p>
          본 약관은 서비스 이용에 필요한 기본 사항과 회원 및 회사가 지켜야 할
          절차를 규정합니다. 회사는 관련 법령을 준수하며, 약관을 변경할 경우
          서비스 내 공지 및 이메일을 통해 회원에게 알립니다. 변경된 약관은
          공지된 날로부터 효력이 발생하며, 회원이 변경된 약관에 동의하지 않을
          경우 서비스 이용을 중단하고 회원 탈퇴를 요청할 수 있습니다.
        </p>
      </Section>

      <Section title="2. 회원가입 및 계정 관리">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            만 14세 이상 개인 또는 법인이라면 서비스 회원으로 가입할 수
            있습니다.
          </li>
          <li>
            회원은 본인의 계정 정보(ID, 비밀번호)를 안전하게 관리할 책임이
            있으며, 유출 또는 도용으로 발생한 손해는 회원에게 책임이 있습니다.
          </li>
          <li>
            타인의 명의를 도용하거나 허위 정보를 제공하는 경우, 회사는 회원
            자격을 제한 또는 상실시킬 수 있습니다.
          </li>
          <li>
            공공질서를 해치거나 범죄 행위에 이용되는 계정은 사전 통보 없이
            이용이 제한될 수 있습니다.
          </li>
        </ul>
      </Section>

      <Section title="3. 서비스 내용 및 예약 관련">
        <p>
          본 서비스는 호텔 정보를 제공하고 예약 및 결제 중개를 수행하는
          플랫폼입니다. 예약이 완료되면 호텔이 직접 숙박 서비스를 제공하며,
          숙박에 관한 의무와 책임은 해당 호텔에 있습니다. 예약 변경 및 취소는 각
          호텔 또는 서비스의 취소 정책을 따르며, 예약 시 사전 공지된 규정이 우선
          적용됩니다.
        </p>
        <p className="font-medium text-gray-900">
          ※ 서비스 수수료 안내: 회사는 플랫폼 이용에 따른 서비스 수수료를 호텔
          또는 이용자에게 부과할 수 있으며, 수수료율은 별도로 공지합니다.
        </p>
      </Section>

      <Section title="4. 결제 및 환불 규정">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            결제 수단은 신용/체크카드, 간편결제, 포인트, 캐시 등으로 구성되며,
            결제 시점에 안내된 수단이 적용됩니다.
          </li>
          <li>
            취소 및 환불은 예약 상태와 취소 시점에 따라 차등 적용되며, 각 호텔의
            환불 정책이 우선합니다.
          </li>
          <li>
            환불 진행 시 결제 대행 수수료와 플랫폼 수수료는 환불 금액에서 차감될
            수 있습니다.
          </li>
          <li>부가가치세 등 법령상 의무는 관계 법령에 따라 처리됩니다.</li>
        </ul>
      </Section>

      <Section title="5. 이용자 의무 및 금지사항">
        <ul className="list-disc pl-5 space-y-2">
          <li>허위 예약 및 중복 예약, 노쇼 행위는 금지됩니다.</li>
          <li>
            호텔 시설을 고의로 훼손하거나 타인에게 피해를 주는 행위를 해서는 안
            됩니다.
          </li>
          <li>
            다른 이용자의 계정을 무단으로 사용하거나 정보를 도용해서는 안
            됩니다.
          </li>
          <li>
            스크래핑, 해킹, 자동화 프로그램 사용 등 서비스의 정상적인 운영을
            방해하는 행위는 금지됩니다.
          </li>
        </ul>
      </Section>

      <Section title="6. 면책 조항">
        <p>
          회사는 호텔이 제공하는 정보(가격, 시설, 사진 등)에 대한 정확성을
          보장하지 않으며, 호텔과 이용자 간에 발생하는 분쟁은 당사자간에
          해결해야 합니다. 또한 천재지변, 정전, 통신 장애 등 불가항력적인 사유로
          서비스를 제공할 수 없는 경우, 회사는 해당 책임을 지지 않습니다.
        </p>
      </Section>

      <Section title="7. 개인정보 보호">
        <p>
          회사는 개인정보보호법 등 관계 법령을 준수하며, 서비스 제공을 위해
          필요한 최소한의 개인정보를 수집합니다. 상세한 수집 항목, 이용 목적,
          보관 기간 및 위탁 처리 현황은 별도의 개인정보 처리방침에서 확인할 수
          있습니다.
        </p>
      </Section>

      <Section title="8. 분쟁 해결 및 관할 법원">
        <p>
          본 약관과 관련하여 회사와 회원 간 분쟁이 발생할 경우, 우선적으로 상호
          협의를 통해 해결하도록 노력합니다. 협의가 이루어지지 않을 경우, 회사의
          본사 소재지를 관할하는 법원을 전속 관할 법원으로 합니다. 본 약관에
          명시되지 않은 사항은 관련 법령과 상관례를 따릅니다.
        </p>
      </Section>

      <Section title="부가 정책">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-semibold text-gray-900">쿠폰 및 포인트:</span>{" "}
            적립 및 사용 기준은 이벤트별로 안내되며, 유효 기간 종료 시 자동
            소멸됩니다.
          </li>
          <li>
            <span className="font-semibold text-gray-900">리뷰 정책:</span> 허위
            리뷰 작성, 타인의 권리를 침해하는 리뷰는 사전 통보 없이 삭제될 수
            있습니다.
          </li>
          <li>
            <span className="font-semibold text-gray-900">호텔 이용 수칙:</span>{" "}
            위험물 반입, 무단 흡연, 반려동물 동반 등은 각 호텔 규정을 따르며,
            위반 시 추가 요금이 부과될 수 있습니다.
          </li>
          <li>
            <span className="font-semibold text-gray-900">수수료 안내:</span>{" "}
            호텔 수수료와 사용자 수수료는 서비스 운영 정책에 따라 책정되며, 변경
            시 사전 고지합니다.
          </li>
        </ul>
      </Section>
    </div>
  );
};

export default TermsContent;
