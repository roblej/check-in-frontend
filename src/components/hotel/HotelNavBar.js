"use client";

/**
 * 호텔 네비게이션 바 컴포넌트 - Sticky 네비게이션
 * @param {Object} props
 * @param {Array} props.sections - 섹션 목록
 * @param {string} props.activeSection - 활성화된 섹션 ID
 * @param {Function} props.onSectionClick - 섹션 클릭 핸들러
 * @param {boolean} props.isModal - 모달 모드 여부
 */
const HotelNavBar = ({ sections, activeSection, onSectionClick, isModal }) => {
  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-hide">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionClick(section.id)}
          className={`${
            isModal ? "px-3 py-2" : "px-6 py-3"
          } font-medium transition-colors whitespace-nowrap ${
            activeSection === section.id
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
          aria-label={`${section.label} 섹션으로 이동`}
          aria-current={activeSection === section.id ? "true" : undefined}
        >
          {section.label}
        </button>
      ))}
    </div>
  );
};

export default HotelNavBar;
