'use client';

import { useState } from 'react';
import MasterLayout from '@/components/master/MasterLayout';
import { DollarSign, Calendar, Building2, Users, Star } from 'lucide-react';

const Statistics = () => {
  const [dateRange, setDateRange] = useState('month');
  const [chartType, setChartType] = useState('revenue');

  // 통계 데이터
  const overallStats = [
    {
      title: '총 매출',
      value: '₩2.4억',
      change: '+18.2%',
      changeType: 'positive',
      icon: <DollarSign size={40} />,
      description: '이번 달 총 매출액'
    },
    {
      title: '총 예약',
      value: '15,432',
      change: '+12.5%',
      changeType: 'positive',
      icon: <Calendar size={40} />,
      description: '이번 달 총 예약 건수'
    },
    {
      title: '활성 호텔',
      value: '127',
      change: '+8',
      changeType: 'positive',
      icon: <Building2 size={40} />,
      description: '현재 운영중인 호텔'
    },
    {
      title: '신규 회원',
      value: '2,845',
      change: '+23.1%',
      changeType: 'positive',
      icon: <Users size={40} />,
      description: '이번 달 신규 가입자'
    }
  ];

  // 호텔별 매출 순위
  const hotelRankings = [
    {
      rank: 1,
      name: '부산 오션뷰 리조트',
      revenue: '₩89,000,000',
      reservations: 2100,
      rating: 4.8,
      growth: '+15%'
    },
    {
      rank: 2,
      name: '서울 그랜드 호텔',
      revenue: '₩45,000,000',
      reservations: 1250,
      rating: 4.5,
      growth: '+8%'
    },
    {
      rank: 3,
      name: '강릉 바다뷰 호텔',
      revenue: '₩28,000,000',
      reservations: 890,
      rating: 4.3,
      growth: '+12%'
    },
    {
      rank: 4,
      name: '제주 힐링 펜션',
      revenue: '₩8,500,000',
      reservations: 340,
      rating: 4.2,
      growth: '-3%'
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

  // 월별 트렌드 데이터 (예시)
  const monthlyTrends = [
    { month: '1월', revenue: 180, reservations: 1200, newMembers: 450 },
    { month: '2월', revenue: 220, reservations: 1450, newMembers: 520 },
    { month: '3월', revenue: 280, reservations: 1680, newMembers: 680 },
    { month: '4월', revenue: 240, reservations: 1520, newMembers: 590 },
    { month: '5월', revenue: 320, reservations: 1890, newMembers: 720 },
    { month: '6월', revenue: 380, reservations: 2100, newMembers: 850 }
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
          {overallStats.map((stat, index) => (
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
          ))}
        </div>

        {/* 차트 영역 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">월별 트렌드</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setChartType('revenue')}
                className={`px-3 py-1 text-sm rounded ${
                  chartType === 'revenue' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                매출
              </button>
              <button
                onClick={() => setChartType('reservations')}
                className={`px-3 py-1 text-sm rounded ${
                  chartType === 'reservations' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                예약
              </button>
              <button
                onClick={() => setChartType('members')}
                className={`px-3 py-1 text-sm rounded ${
                  chartType === 'members' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                회원
              </button>
            </div>
          </div>
          
          {/* 간단한 차트 표현 (실제 프로젝트에서는 Chart.js나 다른 라이브러리 사용) */}
          <div className="h-64 flex items-end justify-between gap-2 bg-gray-50 p-4 rounded">
            {monthlyTrends.map((data, index) => {
              let value, maxValue, color;
              
              if (chartType === 'revenue') {
                value = data.revenue;
                maxValue = 400;
                color = 'bg-purple-500';
              } else if (chartType === 'reservations') {
                value = data.reservations;
                maxValue = 2500;
                color = 'bg-blue-500';
              } else {
                value = data.newMembers;
                maxValue = 1000;
                color = 'bg-green-500';
              }
              
              const height = (value / maxValue) * 100;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex justify-center mb-2">
                    <div
                      className={`w-8 ${color} rounded-t`}
                      style={{ height: `${height}%` }}
                      title={`${data.month}: ${value}`}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{data.month}</span>
                </div>
              );
            })}
          </div>
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
                          예약 {hotel.reservations}건 • <Star className="inline w-3 h-3 text-yellow-400 fill-current" /> {hotel.rating}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{hotel.revenue}</div>
                      <div className={`text-xs ${
                        hotel.growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {hotel.growth}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
