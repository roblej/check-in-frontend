'use client';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalElements, 
  pageSize, 
  onPageChange 
}) => {
  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // 최대 표시할 페이지 수
    
    if (totalPages <= maxVisiblePages) {
      // 전체 페이지가 5개 이하인 경우 모든 페이지 표시
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 페이지를 중심으로 페이지 번호 생성
      let startPage = Math.max(0, currentPage - 2);
      let endPage = Math.min(totalPages - 1, currentPage + 2);
      
      // 시작 페이지가 0에 가까우면 끝 페이지 조정
      if (startPage <= 2) {
        endPage = Math.min(totalPages - 1, maxVisiblePages - 1);
      }
      
      // 끝 페이지가 마지막에 가까우면 시작 페이지 조정
      if (endPage >= totalPages - 3) {
        startPage = Math.max(0, totalPages - maxVisiblePages);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  if (totalPages <= 1) {
    return null; // 페이지가 1개 이하면 페이지네이션 숨김
  }

  return (
    <div className="flex flex-col items-center justify-center mt-8 space-y-4">
      {/* 페이지 정보 */}
      <div className="text-sm text-gray-600">
        총 <span className="font-semibold text-orange-600">{totalElements}</span>개 중{' '}
        <span className="font-semibold">{startItem}-{endItem}</span>개 표시
      </div>

      {/* 페이지네이션 버튼 */}
      <div className="flex items-center space-x-2">
        {/* 첫 페이지로 */}
        <button
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
          }`}
        >
          처음
        </button>

        {/* 이전 페이지 */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
          }`}
        >
          이전
        </button>

        {/* 페이지 번호들 */}
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pageNum === currentPage
                ? 'bg-orange-600 text-white'
                : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
            }`}
          >
            {pageNum + 1}
          </button>
        ))}

        {/* 다음 페이지 */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === totalPages - 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
          }`}
        >
          다음
        </button>

        {/* 마지막 페이지로 */}
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage === totalPages - 1}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentPage === totalPages - 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
          }`}
        >
          마지막
        </button>
      </div>

      {/* 페이지 점프 */}
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-gray-600">페이지로 이동:</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
          placeholder="1"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const page = parseInt(e.target.value) - 1;
              if (page >= 0 && page < totalPages) {
                onPageChange(page);
                e.target.value = '';
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default Pagination;
