'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  Brush
} from 'recharts';
import AdminLayout from '@/components/admin/AdminLayout';
import { DollarSign, Calendar } from 'lucide-react';
import axiosInstance from '@/lib/axios';

const formatCurrency = (value) => `₩${(value || 0).toLocaleString()}`;

const RevenuePage = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ todayRevenue: 0, todayPayments: 0, monthlyRevenue: [], minYear: null });
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const currentYear = new Date().getFullYear();
  const minYear = summary.minYear || 2000; // 최소 연도 (매출 데이터가 있는 가장 오래된 연도)

  const fetchSummary = async (year) => {
      try {
        setLoading(true);
      const res = await axiosInstance.get('/admin/revenueSummary', {
        params: { year }
      });
      setSummary(res.data || { todayRevenue: 0, todayPayments: 0, monthlyRevenue: [], minYear: null });
      } catch (e) {
        console.error('매출 요약 조회 실패:', e);
      } finally {
        setLoading(false);
      }
    };

  const lastFetchedYear = useRef(null);

  // 초기 로딩 및 연도 변경 시 해당 연도 데이터 요청
  useEffect(() => {
    // 같은 연도를 중복 요청하지 않도록 체크
    if (lastFetchedYear.current === selectedYear) {
      return;
    }
    
    lastFetchedYear.current = selectedYear;
    fetchSummary(selectedYear);
  }, [selectedYear]);

  // 표 높이는 고정 max-height로 관리하여 월/일 전환 시 일관된 스크롤 동작 유지

  const monthlyRows = useMemo(() => {
    return (summary.monthlyRevenue || []).map((m) => {
      const ym = new Date(m.month);
      const monthNum = ym.getMonth() + 1;
      const year = ym.getFullYear();
      const label = `${monthNum}월`;
      return { label, revenue: m.revenue || 0, year, monthNum };
    });
  }, [summary.monthlyRevenue]);

  const chartData = useMemo(() => {
    if (!monthlyRows.length) return [];
    const enriched = monthlyRows
      .map((r) => ({
        ...r,
        monthIndex: r.year * 12 + (r.monthNum - 1),
      }))
      .sort((a, b) => a.monthIndex - b.monthIndex);

    const yearCandidates = enriched.filter((r) => r.year === selectedYear);
    const anchor = yearCandidates.length ? yearCandidates[yearCandidates.length - 1] : enriched[enriched.length - 1];
    const minIndex = anchor.monthIndex - 10;
    const windowData = enriched.filter((r) => r.monthIndex >= minIndex && r.monthIndex <= anchor.monthIndex);
    return windowData.map((row, idx) => {
      const prev = idx > 0 ? windowData[idx - 1] : null;
      // 전월이 없거나 전월 수익이 0원이거나 null/undefined이면 mom을 null로 설정 (차트에서 표시 안 함)
      // Number()로 변환하여 타입 안전성 확보
      const prevRevenue = prev ? Number(prev.revenue) : 0;
      const hasNoPrevRevenue = !prev || prevRevenue === 0 || isNaN(prevRevenue);
      const mom = hasNoPrevRevenue 
        ? null 
        : ((Number(row.revenue) - prevRevenue) / prevRevenue) * 100;
      return { ...row, mom, label: row.label };
    });
  }, [monthlyRows, selectedYear]);

  // 매출 통계가 없는지 확인 (HotelSettlement 테이블에 데이터가 없는 경우)
  const hasNoRevenueData = useMemo(() => {
    // minYear가 null이거나, monthlyRevenue가 비어있거나, 모든 매출이 0인 경우
    if (!summary.minYear && (!summary.monthlyRevenue || summary.monthlyRevenue.length === 0)) {
      return true;
    }
    // monthlyRevenue가 있지만 모든 매출이 0인 경우도 체크
    if (summary.monthlyRevenue && summary.monthlyRevenue.length > 0) {
      const hasAnyRevenue = summary.monthlyRevenue.some(m => m.revenue > 0);
      return !hasAnyRevenue && summary.todayRevenue === 0;
    }
    return false;
  }, [summary]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">매출 관리</h2>
            <p className="text-gray-600">매출 현황과 수익 분석을 확인하세요</p>
          </div>
        </div>

        {/* 매출 통계가 없을 때 메시지 표시 */}
        {!loading && hasNoRevenueData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <DollarSign className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">통계가 없습니다!</h3>
              <p className="text-gray-600">아직 매출 데이터가 없습니다. 예약이 발생하면 통계가 표시됩니다.</p>
            </div>
          </div>
        )}

        {/* 매출 통계가 있을 때만 기존 UI 표시 */}
        {!loading && !hasNoRevenueData && (
          <>

        {/* 레이아웃 통합: 좌측(월별 매출+연 선택), 우측 상단(카드 2개) + 우측 하단(차트) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* 좌측: 월별 매출 현황 패널 (연 선택 포함) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col min-h-[28rem] order-3 lg:row-span-2 lg:order-2">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">매출 현황</h3>
              <div className="flex items-center gap-3">
                <label htmlFor="yearPanel" className="text-sm text-gray-600">연 선택</label>
                <input
                  id="yearPanel"
                  type="number"
                  min={minYear}
                  max={currentYear}
                  value={selectedYear}
                  onChange={(e) => {
                    const inputValue = parseInt(e.target.value || `${currentYear}`, 10);
                    const year = Math.min(Math.max(inputValue, minYear), currentYear);
                    setSelectedYear(year);
                  }}
                  className="w-28 border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                />
              </div>
            </div>
          </div>

          <div
            className="overflow-x-auto overflow-y-auto flex-1 max-h-[38rem]"
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">월</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    매출액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{padding:'15px 0'}}>
                    예약건수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전월 대비</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyRows
                  .filter(r => r.year === selectedYear)
                  .sort((a, b) => b.monthNum - a.monthNum)
                  .map((row, index, arr) => {
                    const prev = index < arr.length - 1 ? arr[index + 1] : null;
                    // 전월이 없거나 전월 수익이 0원이거나 null/undefined이면 "수익 없음" 표시
                    // Number()로 변환하여 타입 안전성 확보
                    const prevRevenue = prev ? Number(prev.revenue) : 0;
                    const hasNoPrevRevenue = !prev || prevRevenue === 0 || isNaN(prevRevenue);
                    const change = hasNoPrevRevenue 
                      ? null 
                      : ((Number(row.revenue) - prevRevenue) / prevRevenue) * 100;
                    const avgRate = '-';
                    return (
                      <tr key={`m-${row.year}-${row.monthNum}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.label}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(row.revenue)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{avgRate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {change === null ? (
                            <span className="text-gray-500">수익 없음</span>
                          ) : (
                            <span className={`${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 우측 상단: 카드 2개 (오늘 매출/오늘 예약) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:col-span-2 order-1 lg:order-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-fit">
            <div className="flex items-center">
              <div className="text-green-600 mr-4"><DollarSign size={28} /></div>
              <div>
                <p className="text-sm font-medium text-gray-600">오늘 매출</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.todayRevenue)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-fit">
            <div className="flex items-center">
              <div className="text-blue-600 mr-4"><Calendar size={28} /></div>
              <div>
                <p className="text-sm font-medium text-gray-600">오늘 예약</p>
                <p className="text-2xl font-bold text-gray-900">{summary.todayPayments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 우측 하단: 매출 추이 차트 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full flex flex-col min-h-[32rem] lg:col-span-2 order-2 lg:order-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">매출 추이</h3>
          </div>
          <div className="flex-1 focus:outline-none outline-none" tabIndex={-1}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis yAxisId="left" tickFormatter={(v) => `₩${Number(v).toLocaleString()}`} width={70} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v.toFixed(0)}%`} width={50} />
                <Tooltip
                  cursor={false}  // 세로 가이드선 제거
                  formatter={(value, name) => {

                    if (name === 'revenue') return [`₩${Number(value).toLocaleString()}`, '매출'];
                    if (name === 'mom') return [`${Number(value).toFixed(1)}%`, '전월 대비'];
                    return [value, name];
                  }}

                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" name="매출" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="mom" name="전월 대비" stroke="#10B981" strokeWidth={2} dot={false} activeDot={false} />
                <Brush dataKey="label" height={20} travellerWidth={8} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <style jsx global>{`
            .recharts-wrapper:focus { outline: none; }
            .recharts-surface:focus { outline: none; }
            .recharts-brush:focus { outline: none; }
          `}</style>
        </div>
        </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default RevenuePage;
