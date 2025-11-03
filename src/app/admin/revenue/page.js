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
import { DollarSign, Calendar, Building2, TrendingUp } from 'lucide-react';
import axiosInstance from '@/lib/axios';

const formatCurrency = (value) => `₩${(value || 0).toLocaleString()}`;

const RevenuePage = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ todayRevenue: 0, todayPayments: 0, monthlyRevenue: [], revenueByRoom: [] });
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [granularity, setGranularity] = useState('day'); // 'month' | 'day'
  const [dailySeries, setDailySeries] = useState([]); // [{ date: 'YYYY-MM-DD', revenue: number, payments?: number }]
  const [yesterday, setYesterday] = useState({ revenue: null, payments: null });

  const didFetch = useRef(false);

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/admin/revenueSummary');
        setSummary(res.data || { todayRevenue: 0, todayPayments: 0, monthlyRevenue: [], revenueByRoom: [] });
      } catch (e) {
        console.error('매출 요약 조회 실패:', e);
      } finally {
        setLoading(false);
      }
    };
    const fetchDaily = async () => {
      try {
        // 최근 60일 일별 데이터 요청 (차트/표/전일 계산용)
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 60);
        const pad = (n) => `${n}`.padStart(2, '0');
        const toYmd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        const resp = await axiosInstance.get('/admin/revenueDaily', {
          params: { start: toYmd(start), end: toYmd(end) }
        });
        const rows = Array.isArray(resp.data) ? resp.data : (resp.data?.rows || []);
        setDailySeries(rows);

        // 전일 값 계산
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const ymd = toYmd(yesterdayDate);
        const yRow = rows.find(r => (r.date === ymd || r.day === ymd));
        setYesterday({
          revenue: yRow?.revenue ?? null,
          payments: yRow?.payments ?? null,
        });
      } catch (e) {
        // 일별 API 미구현/실패 시 조용히 무시 (UI는 '-' 처리)
        console.warn('일별 매출 조회 실패:', e);
      }
    };

    fetchSummary();
    fetchDaily();
  }, []);

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
    if (granularity === 'month') {
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
        const mom = prev ? ((row.revenue - prev.revenue) / (prev.revenue || 1)) * 100 : 0;
        return { ...row, mom, label: row.label };
      });
    }

    // day
    if (!dailySeries.length) return [];
    const sorted = [...dailySeries].map(d => {
      const dt = new Date(d.date || d.day);
      return {
        date: dt,
        label: `${dt.getMonth() + 1}/${dt.getDate()}`,
        revenue: d.revenue || 0,
      };
    }).sort((a, b) => a.date - b.date);
    const last30 = sorted.slice(-30);
    return last30.map((row, idx) => {
      const prev = idx > 0 ? last30[idx - 1] : null;
      const mom = prev ? ((row.revenue - prev.revenue) / (prev.revenue || 1)) * 100 : 0; // day에서는 전일 대비
      return { ...row, mom };
    });
  }, [monthlyRows, selectedYear, granularity, dailySeries]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">매출 관리</h2>
            <p className="text-gray-600">매출 현황과 수익 분석을 확인하세요</p>
          </div>
          <div className="inline-flex rounded-md border border-gray-300 overflow-hidden h-9" role="group" aria-label="단위 선택">
            <button type="button" onClick={() => setGranularity('day')} className={`px-3 py-1.5 text-sm border-l border-gray-300 ${granularity === 'day' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} aria-pressed={granularity === 'day'}>
              일별
            </button>
            <button type="button" onClick={() => setGranularity('month')} className={`px-3 py-1.5 text-sm ${granularity === 'month' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} aria-pressed={granularity === 'month'}>
              월별
            </button>
          </div>
        </div>

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
                  min="2000"
                  max="2100"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value || `${new Date().getFullYear()}`, 10))}
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
                  {granularity === 'month' ? (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">월</th>
                  ) : (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">일자</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    매출액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{padding:'15px 0'}}>
                    예약건수
                  </th>

                  {granularity === 'month' ? (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전월 대비</th>
                  ) : (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전일 대비</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {granularity === 'month' ? (
                  monthlyRows
                    .filter(r => r.year === selectedYear)
                    .sort((a, b) => b.monthNum - a.monthNum)
                    .map((row, index, arr) => {
                      const prev = index < arr.length - 1 ? arr[index + 1] : null;
                      const change = prev ? ((row.revenue - prev.revenue) / (prev.revenue || 1)) * 100 : 0;
                      const avgRate = '-';
                      return (
                        <tr key={`m-${row.year}-${row.monthNum}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.label}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(row.revenue)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{avgRate}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span>
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  [...dailySeries]
                    .map(d => {
                      const dt = new Date(d.date || d.day);
                      return { date: dt, label: `${dt.getMonth() + 1}/${dt.getDate()}`, revenue: d.revenue || 0, payments: d.payments };
                    })
                    .sort((a, b) => b.date - a.date)
                    .slice(0, 30)
                    .map((row, index, arr) => {
                      const prev = index < arr.length - 1 ? arr[index + 1] : null;
                      const change = prev ? ((row.revenue - prev.revenue) / (prev.revenue || 1)) * 100 : 0;
                      const paymentsText = row.payments ?? '-';
                      return (
                        <tr key={`d-${row.label}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.label}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(row.revenue)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{paymentsText}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 우측 상단: 카드 2개 (오늘 매출/오늘 예약) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:col-span-2 order-1 lg:order-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-green-600 mr-4"><DollarSign size={32} /></div>
              <div>
                <p className="text-sm font-medium text-gray-600">오늘 매출</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.todayRevenue)}</p>
                <p className="text-xs text-gray-600">전일: {yesterday.revenue != null ? formatCurrency(yesterday.revenue) : '-'}</p>
                <p className={`text-xs ${yesterday.revenue != null ? ((summary.todayRevenue - yesterday.revenue) >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}`}>
                  {yesterday.revenue != null ? `${(yesterday.revenue === 0 ? 0 : ((summary.todayRevenue - yesterday.revenue) / (yesterday.revenue || 1) * 100)).toFixed(1)}% 전일 대비` : '전일 데이터 없음'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-blue-600 mr-4"><Calendar size={32} /></div>
              <div>
                <p className="text-sm font-medium text-gray-600">오늘 예약</p>
                <p className="text-2xl font-bold text-gray-900">{summary.todayPayments}</p>
                <p className="text-xs text-gray-600">전일: {yesterday.payments != null ? yesterday.payments : '-'}</p>
                <p className={`text-xs ${yesterday.payments != null ? ((summary.todayPayments - yesterday.payments) >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}`}>
                  {yesterday.payments != null ? `${(yesterday.payments === 0 ? 0 : ((summary.todayPayments - yesterday.payments) / (yesterday.payments || 1) * 100)).toFixed(1)}% 전일 대비` : '전일 데이터 없음'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 우측 하단: 매출 추이 차트 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full flex flex-col min-h-[28rem] lg:col-span-2 order-2 lg:order-3">
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
                    if (name === 'mom') return [`${Number(value).toFixed(1)}%`, granularity === 'month' ? '전월 대비' : '전일 대비'];
                    return [value, name];
                  }}

                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" name="매출" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="mom" name={granularity === 'month' ? '전월 대비' : '전일 대비'} stroke="#10B981" strokeWidth={2} dot={false} activeDot={false} />
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
      </div>
    </AdminLayout>
  );
};

export default RevenuePage;
