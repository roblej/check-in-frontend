'use client';

const FilterSection = ({ 
  sortBy, 
  setSortBy, 
  filterPrice, 
  setFilterPrice, 
  totalCount,
  pageSize,
  setPageSize,
  onReset
}) => {
  const getSortLabel = (sortValue) => {
    switch (sortValue) {
      case 'date': return '체크인 빠른 순';
      case 'date-desc': return '체크인 늦은 순';
      case 'price': return '가격 낮은 순';
      case 'price-desc': return '가격 높은 순';
      case 'discount': return '할인율 높은 순';
      case 'urgent': return '긴급 매물 우선';
      case 'rating': return '평점 높은 순';
      default: return '기본 정렬';
    }
  };
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-200">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          {/* 정렬 필터 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">정렬:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent min-w-[150px]">
              <option value="date">체크인 빠른 순</option>
              <option value="date-desc">체크인 늦은 순</option>
              <option value="price">가격 낮은 순</option>
              <option value="price-desc">가격 높은 순</option>
              <option value="discount">할인율 높은 순</option>
              <option value="urgent">긴급 매물 우선</option>
              <option value="rating">평점 높은 순</option>
            </select>
          </div>

          {/* 가격 필터 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">가격:</label>
            <select
              value={filterPrice}
              onChange={(e) => setFilterPrice(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent min-w-[120px]">
              <option value="all">전체</option>
              <option value="under200">20만원 이하</option>
              <option value="200-300">20-30만원</option>
              <option value="300-400">30-40만원</option>
              <option value="over400">40만원 이상</option>
            </select>
          </div>

          {/* 페이지 크기 선택 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">표시 개수:</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent min-w-[80px]">
              <option value={5}>5개</option>
              <option value={10}>10개</option>
              <option value={20}>20개</option>
              <option value={50}>50개</option>
            </select>
          </div>
        </div>

        {/* 결과 개수 및 정렬 상태 */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {totalCount > 0 ? (
              <span>총 <span className="font-semibold text-[#3B82F6]">{totalCount}</span>개의 양도 예약</span>
            ) : (
              <span className="text-gray-400">검색 결과가 없습니다</span>
            )}
          </div>
          
          {/* 정렬 상태 표시 */}
          {totalCount > 0 && (
            <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              {getSortLabel(sortBy)}
            </div>
          )}
          
          {/* 필터 초기화 버튼 */}
          <button
            onClick={onReset}
            className="px-3 py-2 text-sm text-gray-600 hover:text-[#3B82F6] hover:bg-blue-50 rounded-lg transition-colors border border-gray-300 hover:border-blue-300"
          >
            필터 초기화
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default FilterSection;
