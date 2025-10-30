'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { DollarSign, Calendar, Building2, TrendingUp } from 'lucide-react';
import axiosInstance from '@/lib/axios';

const formatCurrency = (value) => `₩${(value || 0).toLocaleString()}`;

const RevenuePage = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ todayRevenue: 0, todayPayments: 0, monthlyRevenue: [], revenueByRoom: [] });

  useEffect(() => {
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
    fetchSummary();
  }, []);

  const monthlyRows = useMemo(() => {
    return (summary.monthlyRevenue || []).slice(-6).map((m) => {
      const ym = new Date(m.month);
      const label = `${ym.getMonth() + 1}월`;
      return { label, revenue: m.revenue || 0 };
    });
  }, [summary.monthlyRevenue]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">매출 관리</h2>
          <p className="text-gray-600">매출 현황과 수익 분석을 확인하세요</p>
        </div>

        {/* 오늘의 매출 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-green-600 mr-4"><DollarSign size={32} /></div>
              <div>
                <p className="text-sm font-medium text-gray-600">오늘 매출</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.todayRevenue)}</p>
                <p className="text-xs text-green-600">+15% 전일 대비</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-blue-600 mr-4"><Calendar size={32} /></div>
              <div>
                <p className="text-sm font-medium text-gray-600">오늘 예약</p>
                <p className="text-2xl font-bold text-gray-900">{summary.todayPayments}</p>
                <p className="text-xs text-green-600">+8% 전일 대비</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-purple-600 mr-4"><Building2 size={32} /></div>
              <div>
                <p className="text-sm font-medium text-gray-600">투숙률</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
                <p className="text-xs text-green-600">+3% 전일 대비</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="text-orange-600 mr-4"><TrendingUp size={32} /></div>
              <div>
                <p className="text-sm font-medium text-gray-600">평균 객실료</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
                <p className="text-xs text-green-600">+5% 전일 대비</p>
              </div>
            </div>
          </div>
        </div>

        {/* 월별 매출 현황 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">월별 매출 현황</h3>
            <p className="text-sm text-gray-600">최근 6개월간의 매출 데이터</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    월
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    매출액
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    예약건수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    투숙률
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    평균 객실료
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    전월 대비
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyRows.map((row, index) => {
                  const prev = index > 0 ? monthlyRows[index - 1] : null;
                  const change = prev ? ((row.revenue - prev.revenue) / (prev.revenue || 1)) * 100 : 0;
                  const avgRate = '-';
                  return (
                    <tr key={row.label} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.label}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(row.revenue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{avgRate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>{change >= 0 ? '+' : ''}{change.toFixed(1)}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 매출 분석 차트 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">매출 추이</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">차트 영역 (Chart.js 또는 다른 차트 라이브러리 사용)</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">객실 타입별 매출</h3>
            <div className="space-y-4">
              {(summary.revenueByRoom || []).map((r) => {
                return (
                  <div key={r.roomName} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{r.roomName}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-900">{r.count}건</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(r.revenue)}</span>
                    </div>
                  </div>
                );
              })}
              {(!summary.revenueByRoom || summary.revenueByRoom.length === 0) && (
                <p className="text-sm text-gray-500">데이터가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default RevenuePage;
