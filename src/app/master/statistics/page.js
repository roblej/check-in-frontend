'use client';

import { useState, useEffect, useMemo } from 'react';
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
import MasterLayout from '@/components/master/MasterLayout';
import { DollarSign, Calendar, Building2, Users, Star } from 'lucide-react';
import axiosInstance from '@/lib/axios';

const Statistics = () => {
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalReservationCount: 0,
    activeHotels: 0,
    newHotelsThisMonth: 0,
    newCustomersThisMonth: 0
  });
  const [monthlyCommissionData, setMonthlyCommissionData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [hotelRankings, setHotelRankings] = useState([]);

  // 통계 데이터 조회
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/master/statistics', {
          params: { dateRange }
        });
        
        if (response.data) {
          setStatistics({
            totalRevenue: response.data.totalRevenue || 0,
            totalReservationCount: response.data.totalReservationCount || 0,
            activeHotels: response.data.activeHotels || 0,
            newHotelsThisMonth: response.data.newHotelsThisMonth || 0,
            newCustomersThisMonth: response.data.newCustomersThisMonth || 0
          });
        }
      } catch (error) {
        console.error('통계 데이터 조회 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [dateRange]);

  // 월별 수수료 수익 데이터 조회
  useEffect(() => {
    const fetchMonthlyCommission = async () => {
      try {
        const response = await axiosInstance.get('/master/statistics/monthlyCommission');
        if (response.data) {
          setMonthlyCommissionData(response.data || []);
        }
      } catch (error) {
        console.error('월별 수수료 수익 조회 오류:', error);
      }
    };

    fetchMonthlyCommission();
  }, []);

  // 호텔별 매출 순위 데이터 조회
  useEffect(() => {
    const fetchHotelRanking = async () => {
      try {
        const response = await axiosInstance.get('/master/statistics/hotelRanking');
        if (response.data) {
          setHotelRankings(response.data || []);
        }
      } catch (error) {
        console.error('호텔별 매출 순위 조회 오류:', error);
      }
    };

    fetchHotelRanking();
  }, []);

  // 차트 데이터 가공
  const chartData = useMemo(() => {
    if (!monthlyCommissionData.length) return [];
    
    const enriched = monthlyCommissionData.map((m) => {
      const date = new Date(m.month);
      const monthNum = date.getMonth() + 1;
      const year = date.getFullYear();
      const label = `${monthNum}월`;
      return {
        label,
        revenue: m.revenue || 0,
        year,
        monthNum,
        monthIndex: year * 12 + (monthNum - 1)
      };
    }).sort((a, b) => a.monthIndex - b.monthIndex);

    // 선택된 연도에 해당하는 데이터 필터링 (최근 12개월 중)
    const yearCandidates = enriched.filter((r) => r.year === selectedYear);
    const anchor = yearCandidates.length ? yearCandidates[yearCandidates.length - 1] : enriched[enriched.length - 1];
    const minIndex = anchor.monthIndex - 10;
    const windowData = enriched.filter((r) => r.monthIndex >= minIndex && r.monthIndex <= anchor.monthIndex);
    
    return windowData.map((row, idx) => {
      const prev = idx > 0 ? windowData[idx - 1] : null;
      const mom = prev ? ((row.revenue - prev.revenue) / (prev.revenue || 1)) * 100 : 0;
      return { ...row, mom, label: row.label };
    });
  }, [monthlyCommissionData, selectedYear]);

  // 금액 포맷팅 함수
  const formatCurrency = (amount) => {
    if (amount >= 100000000) {
      return `₩${(amount / 100000000).toFixed(1)}억`;
    } else if (amount >= 10000) {
      return `₩${(amount / 10000).toFixed(0)}만`;
    } else {
      return `₩${amount.toLocaleString()}`;
    }
  };

  // 호텔 매출 포맷팅 함수 (큰 금액용)
  const formatHotelRevenue = (amount) => {
    if (!amount) return '₩0';
    return `₩${Number(amount).toLocaleString()}`;
  };

  // 날짜 범위 설명
  const getDateRangeDescription = () => {
    switch (dateRange) {
      case 'week':
        return '최근 7일';
      case 'month':
        return '최근 30일';
      case 'quarter':
        return '최근 3개월';
      case 'year':
        return '최근 1년';
      default:
        return '최근 30일';
    }
  };

  // 통계 데이터
  const overallStats = [
    {
      title: '총 매출',
      value: formatCurrency(statistics.totalRevenue),
      change: '+0%',
      changeType: 'positive',
      icon: <DollarSign size={40} />,
      description: `${getDateRangeDescription()} 총 매출액`
    },
    {
      title: '총 예약',
      value: statistics.totalReservationCount.toLocaleString(),
      change: '+0%',
      changeType: 'positive',
      icon: <Calendar size={40} />,
      description: `${getDateRangeDescription()} 총 예약 건수`
    },
    {
      title: '활성 호텔',
      value: statistics.activeHotels.toLocaleString(),
      change: `+${statistics.newHotelsThisMonth}`,
      changeType: 'positive',
      icon: <Building2 size={40} />,
      description: `이번달 신규: ${statistics.newHotelsThisMonth}개`
    },
    {
      title: '신규 회원',
      value: statistics.newCustomersThisMonth.toLocaleString(),
      change: '+0%',
      changeType: 'positive',
      icon: <Users size={40} />,
      description: '이번 달 신규 가입자'
    }
  ];


  // 지역별 통계
  const regionStats = [
    {
      region: '서울',
      hotels: 45,
      reservations: 5420,
      revenue: '₩98,000,000',
      share: '41%'
    },
    {
      region: '부산',
      hotels: 28,
      reservations: 3210,
      revenue: '₩67,000,000',
      share: '28%'
    },
    {
      region: '제주',
      hotels: 32,
      reservations: 2890,
      revenue: '₩45,000,000',
      share: '19%'
    },
    {
      region: '강원',
      hotels: 22,
      reservations: 1912,
      revenue: '₩29,000,000',
      share: '12%'
    }
  ];

  // 회원 등급별 통계
  const memberGradeStats = [
    {
      grade: 'VIP',
      count: 1250,
      percentage: '8%',
      avgSpending: '₩2,450,000',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      grade: 'GOLD',
      count: 4580,
      percentage: '30%',
      avgSpending: '₩890,000',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      grade: 'SILVER',
      count: 6890,
      percentage: '45%',
      avgSpending: '₩320,000',
      color: 'bg-gray-100 text-gray-800'
    },
    {
      grade: 'BRONZE',
      count: 2612,
      percentage: '17%',
      avgSpending: '₩150,000',
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  return (
    <MasterLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">통계 분석</h2>
            <p className="text-gray-600">사이트 전체 운영 현황과 성과를 분석하세요</p>
          </div>
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="week">최근 7일</option>
              <option value="month">최근 30일</option>
              <option value="quarter">최근 3개월</option>
              <option value="year">최근 1년</option>
            </select>
            <button className="bg-[#7C3AED] text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              리포트 다운로드
            </button>
          </div>
        </div>

        {/* 전체 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // 로딩 상태
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            overallStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{stat.icon}</div>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    stat.changeType === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 차트 영역 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">월별 수수료 수익 추이</h3>
            <div className="flex items-center gap-3">
              <label htmlFor="yearSelect" className="text-sm text-gray-600">연 선택</label>
              <input
                id="yearSelect"
                type="number"
                min="2000"
                max="2100"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value || `${new Date().getFullYear()}`, 10))}
                className="w-28 border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-right"
              />
            </div>
          </div>
          
          <div className="h-96 focus:outline-none outline-none" tabIndex={-1}>
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-pulse text-gray-400">데이터를 불러오는 중...</div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-gray-400">데이터가 없습니다.</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis yAxisId="left" tickFormatter={(v) => `₩${Number(v).toLocaleString()}`} width={70} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v.toFixed(0)}%`} width={50} />
                  <Tooltip
                    cursor={false}
                    formatter={(value, name) => {
                      if (name === 'revenue') return [`₩${Number(value).toLocaleString()}`, '수수료 수익'];
                      if (name === 'mom') return [`${Number(value).toFixed(1)}%`, '전월 대비'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" name="수수료 수익" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="mom" name="전월 대비" stroke="#10B981" strokeWidth={2} dot={false} activeDot={false} />
                  <Brush dataKey="label" height={20} travellerWidth={8} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
          <style jsx global>{`
            .recharts-wrapper:focus { outline: none; }
            .recharts-surface:focus { outline: none; }
            .recharts-brush:focus { outline: none; }
          `}</style>
        </div>

        {/* 호텔 순위와 지역별 통계 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 호텔별 매출 순위 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">호텔별 매출 순위</h3>
              <p className="text-sm text-gray-600">이번 달 기준</p>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : hotelRankings.length === 0 ? (
                <div className="text-center text-gray-400 py-8">데이터가 없습니다.</div>
              ) : (
                <div className="space-y-4">
                  {hotelRankings.map((hotel) => (
                    <div key={hotel.rank} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {hotel.rank}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                          <div className="text-xs text-gray-500">
                            예약 {hotel.reservations?.toLocaleString() || 0}건 • <Star className="inline w-3 h-3 text-yellow-400 fill-current" /> {hotel.rating ? hotel.rating.toFixed(1) : '0.0'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{formatHotelRevenue(hotel.revenue)}</div>
                        <div className={`text-xs ${
                          hotel.growth?.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {hotel.growth || '+0%'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 지역별 통계 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">지역별 통계</h3>
              <p className="text-sm text-gray-600">호텔 분포 및 매출 현황</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {regionStats.map((region, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{region.region}</span>
                      <span className="text-sm text-gray-600">{region.share}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: region.share }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>호텔 {region.hotels}개</span>
                      <span>예약 {region.reservations}건</span>
                      <span>{region.revenue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 회원 등급별 통계 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">회원 등급별 통계</h3>
            <p className="text-sm text-gray-600">등급별 회원 분포 및 평균 지출액</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {memberGradeStats.map((grade, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full mb-3 ${grade.color}`}>
                    {grade.grade}
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-900">{grade.count.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">{grade.percentage}</div>
                    <div className="text-xs text-gray-500">평균 지출</div>
                    <div className="text-sm font-medium text-gray-900">{grade.avgSpending}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 주요 지표 요약 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">주요 지표 요약</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">94.2%</div>
              <div className="text-sm text-gray-600">고객 만족도</div>
              <div className="text-xs text-green-600 mt-1">+2.1% ↗</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">68.5%</div>
              <div className="text-sm text-gray-600">재방문율</div>
              <div className="text-xs text-green-600 mt-1">+5.3% ↗</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">₩1.8M</div>
              <div className="text-sm text-gray-600">평균 주문액</div>
              <div className="text-xs text-green-600 mt-1">+12.7% ↗</div>
            </div>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default Statistics;
