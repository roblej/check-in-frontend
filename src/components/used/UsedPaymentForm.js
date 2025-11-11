"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import TossPaymentsWidget from '@/components/payment/TossPaymentsWidget';
import { usedAPI } from '@/lib/api/used';
import axios from '@/lib/axios';

/**
 * 중고 호텔 결제 폼 (페이지 이탈 시 거래 취소)
 */
const UsedPaymentForm = ({ initialData }) => {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false); // 결제 완료 여부 추적
  const isPaymentCompletedRef = useRef(false); // 결제 완료 여부 ref (동기적 접근용)
  const isUnloadingRef = useRef(false); // 새로고침 여부 추적
  const hasCancelledRef = useRef(false); // 이미 취소 요청을 보냈는지 추적
  const beforeUnloadHandlerRef = useRef(null); // beforeunload 핸들러 참조
  const visibilityChangeHandlerRef = useRef(null); // visibilitychange 핸들러 참조

  // 사용자 정보 로드
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const customerData = await usedAPI.getCustomerInfo();
        setCustomer(customerData);
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
        if (error.response?.status === 401) {
          router.push('/login');
          return;
        }
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserInfo();
  }, [router]);

  // 세션 스토리지에서 결제 정보 가져오기 및 업데이트 감지
  const loadPaymentInfo = useCallback(() => {
    try {
      const storageKeyCurrent = 'used_payment_current';
      const currentTradeIdx = sessionStorage.getItem(storageKeyCurrent);
      
      console.log('🔍 loadPaymentInfo 호출:', {
        storageKey: storageKeyCurrent,
        value: currentTradeIdx,
        allKeys: Object.keys(sessionStorage).filter(k => k.startsWith('used_payment_'))
      });
      
      if (!currentTradeIdx) {
        console.warn('결제 정보를 찾을 수 없습니다. used_payment_current가 없습니다.');
        return;
      }

      const usedTradeIdx = parseInt(currentTradeIdx, 10);
      const storageKeyTrade = `used_payment_${usedTradeIdx}`;
      const storedData = sessionStorage.getItem(storageKeyTrade);
      
      console.log('🔍 loadPaymentInfo - 거래 정보 읽기:', {
        storageKey: storageKeyTrade,
        usedTradeIdx,
        hasData: !!storedData,
      });
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const finalTradeIdx = parsedData.usedTradeIdx || usedTradeIdx;
        
        setPaymentInfo(prev => {
          // 이미 같은 거래 ID면 업데이트하지 않음 (무한 루프 방지)
          if (prev.usedTradeIdx === finalTradeIdx) {
            console.log('⏭️ loadPaymentInfo - 같은 거래 ID이므로 업데이트 스킵:', {
              storageKeyCurrent,
              storageKeyTrade,
              usedTradeIdx: finalTradeIdx,
              currentTradeIdx,
              prevUsedTradeIdx: prev.usedTradeIdx,
              willUpdate: false
            });
            return prev;
          }
          
          console.log('✅ loadPaymentInfo - 결제 정보 로드 및 업데이트:', {
            storageKeyCurrent,
            storageKeyTrade,
            usedTradeIdx: finalTradeIdx,
            currentTradeIdx,
            prevUsedTradeIdx: prev.usedTradeIdx,
            willUpdate: true
          });
          
          console.log('🔄 loadPaymentInfo - 결제 정보 업데이트:', {
            from: prev.usedTradeIdx,
            to: finalTradeIdx
          });
          
          return {
            ...prev,
            ...parsedData,
            usedTradeIdx: finalTradeIdx,
            nights: Math.ceil((new Date(parsedData.checkOut) - new Date(parsedData.checkIn)) / (1000 * 60 * 60 * 24)),
            discountAmount: (parsedData.originalPrice || 0) - (parsedData.salePrice || 0)
          };
        });
      } else {
        console.warn(`결제 정보를 찾을 수 없습니다. ${storageKeyTrade}가 없습니다.`);
      }
    } catch (error) {
      console.error('세션 스토리지 데이터 읽기 실패:', error);
    }
  }, []);

  // 결제 정보 상태
  const [paymentInfo, setPaymentInfo] = useState({
    ...initialData,
    usedTradeIdx: initialData.usedTradeIdx,
    customerIdx: null,
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerCash: 0,
    customerPoint: 0,
    useCash: 0,
    usePoint: 0,
    agreeTerms: false,
    agreePrivacy: false,
  });

  // 초기 로드 및 세션 스토리지 변경 감지
  useEffect(() => {
    // 초기 로드
    const currentTradeIdx = sessionStorage.getItem('used_payment_current');
    if (!currentTradeIdx) {
      alert('결제 정보를 찾을 수 없습니다. 다시 시도해주세요.');
      router.push('/used');
      return;
    }
    
    loadPaymentInfo();

    // storage 이벤트 리스너 등록 (다른 탭/창에서 변경 감지)
    const handleStorageChange = (e) => {
      if (e.key === 'used_payment_current' || e.key?.startsWith('used_payment_')) {
        console.log('🔔 storage 이벤트로 세션 스토리지 변경 감지:', e.key);
        loadPaymentInfo();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // 페이지 포커스 시 세션 스토리지 확인 (같은 탭에서의 변경 감지)
    const handleFocus = () => {
      console.log('🔔 focus 이벤트로 세션 스토리지 확인');
      loadPaymentInfo();
    };

    window.addEventListener('focus', handleFocus);
    
    // 페이지 가시성 변경 감지 (탭 전환 등)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔔 visibilitychange 이벤트로 세션 스토리지 확인');
        loadPaymentInfo();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 같은 탭에서의 sessionStorage 변경 감지를 위한 주기적 체크
    // (storage 이벤트는 같은 탭에서는 발생하지 않음)
    let lastCheckedValue = sessionStorage.getItem('used_payment_current');
    const intervalId = setInterval(() => {
      const currentValue = sessionStorage.getItem('used_payment_current');
      if (currentValue !== lastCheckedValue) {
        console.log('🔔 주기적 체크로 세션 스토리지 변경 감지:', {
          from: lastCheckedValue,
          to: currentValue
        });
        lastCheckedValue = currentValue;
        loadPaymentInfo();
      }
    }, 500); // 500ms마다 체크

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [router, loadPaymentInfo]);

  // 거래 취소 함수 (페이지 이탈 시 호출)
  const cancelTradeOnExit = useCallback(async (usedTradeIdx) => {
    // 이미 취소 요청을 보냈거나 결제 완료된 경우 무시 (ref 사용으로 최신 값 보장)
    if (hasCancelledRef.current || isPaymentCompletedRef.current) {
      console.log('⏭️ 거래 취소 요청 무시:', {
        hasCancelled: hasCancelledRef.current,
        isPaymentCompleted: isPaymentCompletedRef.current,
        usedTradeIdx
      });
      return;
    }

    // usedTradeIdx가 없으면 무시
    if (!usedTradeIdx) {
      return;
    }

    try {
      hasCancelledRef.current = true;
      console.log('🔙 페이지 이탈: 거래 취소 요청', { usedTradeIdx });
      
      const reason = '사용자 페이지 이탈';
      const timestamp = new Date().toISOString();
      
      // Beacon API 사용 (비동기 요청이 완료되지 않아도 전송 보장)
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888'}/api/used/trade/${usedTradeIdx}/delete`;
      const data = JSON.stringify({ reason, timestamp });
      
      if (navigator.sendBeacon) {
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon(apiUrl, blob);
        console.log('✅ Beacon으로 거래 취소 요청 전송');
      } else {
        // Beacon 미지원 브라우저는 동기 XHR
        const xhr = new XMLHttpRequest();
        xhr.open('POST', apiUrl, false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(data);
        console.log('✅ XHR로 거래 취소 요청 전송');
      }
    } catch (error) {
      console.warn('거래 취소 요청 실패 (무시):', error);
    }
  }, []); // ref를 사용하므로 dependency 불필요

  // 페이지 이탈 시 거래 취소 로직
  useEffect(() => {
    // paymentInfo가 없거나 결제 완료된 경우 무시 (ref 사용으로 최신 값 보장)
    if (!paymentInfo.usedTradeIdx || isPaymentCompletedRef.current) {
      return;
    }

    // 성공 페이지로 이동한 경우 확인 (sessionStorage에 결제 완료 플래그가 있는지 확인)
    const checkPaymentCompleted = () => {
      const usedTradeIdx = paymentInfo.usedTradeIdx;
      
      // 1. 결제 완료 플래그 확인 (가장 확실한 방법)
      const completedFlag = sessionStorage.getItem(`used_payment_completed_${usedTradeIdx}`);
      if (completedFlag === '1') {
        console.log('✅ 결제 완료 플래그 확인:', {
          usedTradeIdx,
          flag: `used_payment_completed_${usedTradeIdx}`
        });
        isPaymentCompletedRef.current = true;
        setIsPaymentCompleted(true);
        hasCancelledRef.current = true;
        return true;
      }
      
      // 2. 성공 페이지 데이터 확인 (보조 방법)
      const successData = sessionStorage.getItem('used_payment_success_data');
      if (successData) {
        try {
          const parsed = JSON.parse(successData);
          // 결제 성공 데이터가 있고, 현재 거래 ID와 일치하면 결제 완료로 간주
          if (parsed.tradeIdx === usedTradeIdx || 
              parsed.usedTradeIdx === usedTradeIdx) {
            console.log('✅ 성공 페이지 데이터 확인:', {
              tradeIdx: parsed.tradeIdx || parsed.usedTradeIdx,
              currentTradeIdx: usedTradeIdx
            });
            isPaymentCompletedRef.current = true;
            setIsPaymentCompleted(true);
            hasCancelledRef.current = true;
            // 플래그도 함께 설정
            sessionStorage.setItem(`used_payment_completed_${usedTradeIdx}`, '1');
            return true;
          }
        } catch (e) {
          // 파싱 실패는 무시
        }
      }
      return false;
    };

    // 초기 체크
    if (checkPaymentCompleted()) {
      return;
    }

    const usedTradeIdx = paymentInfo.usedTradeIdx;

    // beforeunload 이벤트 핸들러 (브라우저 탭/창 닫기)
    const handleBeforeUnload = (e) => {
      // 새로고침으로 인한 이탈인지 확인
      isUnloadingRef.current = true;
      
      // 성공 페이지로 이동한 경우 확인
      if (checkPaymentCompleted()) {
        console.log('✅ beforeunload: 결제 완료 플래그 확인됨, 취소 요청 안 함');
        return;
      }
      
      // 결제 완료되지 않은 경우에만 취소 요청 (ref 사용으로 최신 값 보장)
      if (!isPaymentCompletedRef.current && !hasCancelledRef.current) {
        cancelTradeOnExit(usedTradeIdx);
      }
    };

    // visibilitychange 이벤트 핸들러 (탭 전환 등)
    const handleVisibilityChange = () => {
      // 성공 페이지로 이동한 경우 확인
      if (checkPaymentCompleted()) {
        console.log('✅ visibilitychange: 결제 완료 플래그 확인됨, 취소 요청 안 함');
        return;
      }
      
      // 페이지가 숨겨질 때 (다른 탭으로 전환)
      if (document.hidden && !isPaymentCompletedRef.current && !hasCancelledRef.current) {
        cancelTradeOnExit(usedTradeIdx);
      }
    };

    // 핸들러 참조 저장
    beforeUnloadHandlerRef.current = handleBeforeUnload;
    visibilityChangeHandlerRef.current = handleVisibilityChange;

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 컴포넌트 언마운트 시 (뒤로가기 등)
    return () => {
      if (beforeUnloadHandlerRef.current) {
        window.removeEventListener('beforeunload', beforeUnloadHandlerRef.current);
      }
      if (visibilityChangeHandlerRef.current) {
        document.removeEventListener('visibilitychange', visibilityChangeHandlerRef.current);
      }
      
      // 성공 페이지로 이동한 경우 확인
      if (checkPaymentCompleted()) {
        console.log('✅ cleanup: 결제 완료 플래그 확인됨, 취소 요청 안 함');
        return;
      }
      
      // 새로고침이 아닌 경우에만 취소 요청 (ref 사용으로 최신 값 보장)
      if (!isUnloadingRef.current && !isPaymentCompletedRef.current && !hasCancelledRef.current) {
        cancelTradeOnExit(usedTradeIdx);
      }
    };
  }, [paymentInfo.usedTradeIdx, cancelTradeOnExit]);

  // 사용자 정보가 로드되면 paymentInfo 업데이트
  useEffect(() => {
    if (customer) {
      setPaymentInfo(prev => ({
        ...prev,
        customerIdx: customer.customerIdx,
        customerName: customer.name || "",
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerCash: parseInt(customer.cash) || 0,
        customerPoint: parseInt(customer.point) || 0,
      }));
    }
  }, [customer]);

  // 결제 금액 계산
  const paymentAmounts = useMemo(() => {
    const totalAmount = paymentInfo.salePrice + Math.round(paymentInfo.salePrice * 0.1);
    const maxCash = Math.min(paymentInfo.useCash, paymentInfo.customerCash);
    const maxPoint = Math.min(paymentInfo.usePoint, paymentInfo.customerPoint);
    const availableCashPoint = maxCash + maxPoint;
    const actualPaymentAmount = Math.max(0, totalAmount - availableCashPoint);

    return {
      totalAmount,
      useCash: maxCash,
      usePoint: maxPoint,
      actualPaymentAmount,
      availableCashPoint,
    };
  }, [
    paymentInfo.salePrice,
    paymentInfo.useCash,
    paymentInfo.usePoint,
    paymentInfo.customerCash,
    paymentInfo.customerPoint,
  ]);

  // 폼 유효성 검사
  const isFormValid = useMemo(() => {
    if (!paymentInfo.customerName) return false;
    if (!paymentInfo.customerEmail) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentInfo.customerEmail)) return false;
    if (!paymentInfo.customerPhone) return false;
    if (!/^[0-9-+\s]+$/.test(paymentInfo.customerPhone)) return false;
    if (!paymentInfo.agreeTerms) return false;
    if (!paymentInfo.agreePrivacy) return false;
    return true;
  }, [
    paymentInfo.customerName,
    paymentInfo.customerEmail,
    paymentInfo.customerPhone,
    paymentInfo.agreeTerms,
    paymentInfo.agreePrivacy,
  ]);

  // 입력 필드 변경 핸들러
  const handleInputChange = (field, value) => {
    setPaymentInfo((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // 폼 유효성 검사 (에러 메시지 포함)
  const validateForm = () => {
    const newErrors = {};

    if (!paymentInfo.customerName.trim()) {
      newErrors.customerName = "구매자 이름을 입력해주세요.";
    }

    if (!paymentInfo.customerEmail.trim()) {
      newErrors.customerEmail = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentInfo.customerEmail)) {
      newErrors.customerEmail = "올바른 이메일 형식을 입력해주세요.";
    }

    if (!paymentInfo.customerPhone.trim()) {
      newErrors.customerPhone = "전화번호를 입력해주세요.";
    } else if (!/^[0-9-+\s]+$/.test(paymentInfo.customerPhone)) {
      newErrors.customerPhone = "올바른 전화번호 형식을 입력해주세요.";
    }

    if (!paymentInfo.agreeTerms) {
      newErrors.agreeTerms = "이용약관에 동의해주세요.";
    }

    if (!paymentInfo.agreePrivacy) {
      newErrors.agreePrivacy = "개인정보처리방침에 동의해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 캐시 사용량 변경
  const handleCashChange = (value) => {
    const cashAmount = Math.max(
      0,
      Math.min(parseInt(value) || 0, paymentInfo.customerCash)
    );
    setPaymentInfo((prev) => ({
      ...prev,
      useCash: cashAmount,
    }));
  };

  // 포인트 사용량 변경
  const handlePointChange = (value) => {
    const pointAmount = Math.max(
      0,
      Math.min(parseInt(value) || 0, paymentInfo.customerPoint)
    );
    setPaymentInfo((prev) => ({
      ...prev,
      usePoint: pointAmount,
    }));
  };

  // 결제 성공 처리
  const handlePaymentSuccess = async (paymentResult) => {
    console.log("🟢 handlePaymentSuccess 호출됨:", paymentResult);
    
    // 결제 완료 플래그 설정 (페이지 이탈 시 취소하지 않도록)
    // ref를 먼저 설정하여 동기적으로 접근 가능하도록 함
    isPaymentCompletedRef.current = true;
    setIsPaymentCompleted(true);
    hasCancelledRef.current = true; // 취소 요청 방지
    
    console.log("✅ 결제 완료 플래그 설정 완료:", {
      isPaymentCompletedRef: isPaymentCompletedRef.current,
      hasCancelled: hasCancelledRef.current
    });
    
    // 페이지 이탈 이벤트 리스너 제거 (결제 완료 후에는 취소하지 않음)
    if (beforeUnloadHandlerRef.current) {
      window.removeEventListener('beforeunload', beforeUnloadHandlerRef.current);
      beforeUnloadHandlerRef.current = null;
      console.log("✅ beforeunload 이벤트 리스너 제거 완료");
    }
    if (visibilityChangeHandlerRef.current) {
      document.removeEventListener('visibilitychange', visibilityChangeHandlerRef.current);
      visibilityChangeHandlerRef.current = null;
      console.log("✅ visibilitychange 이벤트 리스너 제거 완료");
    }
    
    let requestData = null;
    let usedTradeIdx = null;
    
    try {
      // 최신 세션 스토리지에서 결제 정보 다시 읽기 (클로저 이슈 방지)
      const storageKeyCurrent = 'used_payment_current';
      const currentTradeIdx = sessionStorage.getItem(storageKeyCurrent);
      
      console.log('🔍 세션 스토리지 확인:', {
        storageKey: storageKeyCurrent,
        value: currentTradeIdx,
        allKeys: Object.keys(sessionStorage).filter(k => k.startsWith('used_payment_'))
      });
      
      if (!currentTradeIdx) {
        console.error('결제 정보를 찾을 수 없습니다. used_payment_current가 없습니다.');
        alert('결제 정보를 찾을 수 없습니다. 고객센터에 문의해주세요.');
        router.push('/used');
        return;
      }

      usedTradeIdx = parseInt(currentTradeIdx, 10);
      const storageKeyTrade = `used_payment_${usedTradeIdx}`;
      const storedData = sessionStorage.getItem(storageKeyTrade);
      
      console.log('🔍 세션 스토리지에서 거래 정보 읽기:', {
        storageKey: storageKeyTrade,
        usedTradeIdx,
        hasData: !!storedData,
        allKeys: Object.keys(sessionStorage).filter(k => k.startsWith('used_payment_'))
      });
      
      if (!storedData) {
        console.error(`결제 정보를 찾을 수 없습니다. ${storageKeyTrade}가 없습니다.`);
        alert('결제 정보를 찾을 수 없습니다. 고객센터에 문의해주세요.');
        router.push('/used');
        return;
      }

      const latestPaymentInfo = JSON.parse(storedData);
      console.log('✅ 최신 세션 스토리지에서 읽은 결제 정보:', {
        storageKeyCurrent,
        storageKeyTrade,
        usedTradeIdx,
        latestPaymentInfo
      });

      // 최신 정보로 결제 금액 재계산
      const latestTotalAmount = latestPaymentInfo.salePrice + Math.round((latestPaymentInfo.salePrice || 0) * 0.1);
      const latestMaxCash = Math.min(paymentInfo.useCash || 0, paymentInfo.customerCash || 0);
      const latestMaxPoint = Math.min(paymentInfo.usePoint || 0, paymentInfo.customerPoint || 0);
      const latestActualPaymentAmount = Math.max(0, latestTotalAmount - latestMaxCash - latestMaxPoint);

      // 결제 성공 정보를 먼저 세션 스토리지에 저장 (백엔드 검증 전에 저장)
      const successData = {
        orderId: paymentResult.orderId,
        paymentKey: paymentResult.paymentKey,
        amount: latestTotalAmount,
        type: "used_hotel",
        cash: latestMaxCash,
        point: latestMaxPoint,
        card: latestActualPaymentAmount,
        tradeIdx: usedTradeIdx, // 호환성을 위해 유지
        usedTradeIdx: usedTradeIdx, // 백엔드 검증에 필수
        usedItemIdx: latestPaymentInfo.usedItemIdx,
        customerIdx: paymentInfo.customerIdx,
        customerName: paymentInfo.customerName,
        customerEmail: paymentInfo.customerEmail,
        customerPhone: paymentInfo.customerPhone,
        hotelName: latestPaymentInfo.hotelName,
        hotelImage: latestPaymentInfo.hotelImage,
        hotelAddress: latestPaymentInfo.hotelAddress,
        roomType: latestPaymentInfo.roomType,
        checkIn: latestPaymentInfo.checkIn,
        checkOut: latestPaymentInfo.checkOut,
        guests: latestPaymentInfo.guests,
        nights: Math.ceil((new Date(latestPaymentInfo.checkOut) - new Date(latestPaymentInfo.checkIn)) / (1000 * 60 * 60 * 24)),
        seller: latestPaymentInfo.seller,
        originalPrice: latestPaymentInfo.originalPrice,
        salePrice: latestPaymentInfo.salePrice,
        discountAmount: (latestPaymentInfo.originalPrice || 0) - (latestPaymentInfo.salePrice || 0),
      };
      
      // 백엔드 검증 전에 먼저 저장 (검증 실패해도 성공 페이지에서 정보 확인 가능)
      sessionStorage.setItem('used_payment_success_data', JSON.stringify(successData));
      // 결제 완료 플래그도 함께 저장 (모바일 리다이렉트 플로우 대비)
      sessionStorage.setItem(`used_payment_completed_${usedTradeIdx}`, '1');
      console.log("세션 스토리지에 결제 정보 저장 완료:", successData);

      // 백엔드 검증 API 호출 (/api/payments)
      requestData = {
        paymentKey: paymentResult.paymentKey,
        orderId: paymentResult.orderId,
        amount: latestActualPaymentAmount, // 카드 결제 금액
        totalPrice: latestTotalAmount, // 총 결제 금액 (캐시+포인트+카드)
        type: "used_hotel",
        customerIdx: paymentInfo.customerIdx,
        usedTradeIdx: usedTradeIdx, // 최신 세션 스토리지에서 읽은 값 사용
        usedItemIdx: latestPaymentInfo.usedItemIdx,
        hotelName: latestPaymentInfo.hotelName,
        roomType: latestPaymentInfo.roomType,
        salePrice: latestPaymentInfo.salePrice,
        customerName: paymentInfo.customerName,
        customerEmail: paymentInfo.customerEmail,
        customerPhone: paymentInfo.customerPhone,
        method: latestActualPaymentAmount > 0 ? "mixed" : "cash_point_only",
        pointsUsed: latestMaxPoint,
        cashUsed: latestMaxCash,
      };

      console.log("📤 결제 검증 요청 (백엔드 전송):", {
        orderId: requestData.orderId,
        amount: requestData.amount,
        type: requestData.type,
        usedTradeIdx: requestData.usedTradeIdx,
        usedItemIdx: requestData.usedItemIdx,
        storageKeyCurrent: 'used_payment_current',
        storageKeyTrade: `used_payment_${requestData.usedTradeIdx}`,
        sessionStorageCurrentValue: sessionStorage.getItem('used_payment_current'),
        sessionStorageTradeValue: sessionStorage.getItem(`used_payment_${requestData.usedTradeIdx}`) ? 'exists' : 'not found',
      });

      // 백엔드 검증 API 호출 (Next.js API 라우트를 통해 백엔드로 전달)
      const response = await axios.post('/payments', requestData);
      
      if (!response.data.success) {
        console.error("백엔드 검증 실패:", response.data.message);
        // 검증 실패해도 세션 스토리지는 이미 저장되어 있음
        alert("결제 검증에 실패했습니다. 고객센터에 문의해주세요.");
        // 성공 페이지로 이동 (정보는 이미 세션 스토리지에 있음)
        router.replace('/used-payment/success');
        return;
      }

      console.log("결제 검증 및 저장 성공:", response.data);
      console.log("✅ DB 업데이트 완료:");
      console.log("  - UsedPay 저장 완료");
      console.log("  - UsedTrade 상태 업데이트 완료 (ststus=1)");
      console.log("  - UsedItem 상태 업데이트 완료 (status=2)");
      
      // 기존 결제 페이지 데이터 정리 (최신 usedTradeIdx 사용)
      if (usedTradeIdx) {
        sessionStorage.removeItem(`used_payment_${usedTradeIdx}`);
        sessionStorage.removeItem('used_payment_current');
      }

      // 성공 페이지로 이동 (페이지 이탈 이벤트는 이미 제거됨)
      // replace를 사용하여 뒤로가기 방지
      router.replace('/used-payment/success2');
    } catch (error) {
      console.error("결제 완료 처리 오류:", error);
      console.error("에러 상세:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        requestData: requestData,
        usedTradeIdx: usedTradeIdx,
      });
      
      // 에러가 발생해도 세션 스토리지는 이미 저장되어 있음
      alert(
        error.response?.data?.message || 
        error.message || 
        "결제 처리 중 오류가 발생했습니다. 고객센터에 문의해주세요."
      );
      // 성공 페이지로 이동 (정보는 이미 세션 스토리지에 있음)
      router.replace('/used-payment/success2');
    }
  };

  // 결제 실패 처리
  const handlePaymentFail = (error) => {
    console.error('결제 실패:', error);
    alert('결제가 취소되었습니다.');
    
    // 결제 실패 시 거래 취소 (페이지 이탈과 동일하게 처리)
    if (paymentInfo.usedTradeIdx && !hasCancelledRef.current) {
      cancelTradeOnExit(paymentInfo.usedTradeIdx);
    }
    
    // 결제 실패 시 세션 스토리지 정리
    if (paymentInfo.usedTradeIdx) {
      sessionStorage.removeItem(`used_payment_${paymentInfo.usedTradeIdx}`);
      sessionStorage.removeItem('used_payment_current');
    }
    
    router.push('/used');
  };

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto mb-4"></div>
          <p className="text-gray-600">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 사용자 정보가 없으면 로그인 페이지로
  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
          <button 
            onClick={() => router.push('/login')}
            className="bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            중고 호텔 결제
          </h1>
          <p className="text-gray-600">
            중고 호텔 예약 정보를 확인하고 결제를 진행해주세요.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 호텔 정보 및 구매자 정보 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 중고 호텔 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                중고 호텔 정보
              </h2>
              <div className="flex gap-4">
                {paymentInfo.hotelImage ? (
                  <img
                    src={paymentInfo.hotelImage}
                    alt={paymentInfo.hotelName}
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-sm">이미지 없음</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {paymentInfo.hotelName}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {paymentInfo.hotelAddress}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">객실 타입:</span>{" "}
                      {paymentInfo.roomType}
                    </div>
                    <div>
                      <span className="font-medium">게스트:</span>{" "}
                      {paymentInfo.guests}명
                    </div>
                    <div>
                      <span className="font-medium">체크인:</span>{" "}
                      {paymentInfo.checkIn}
                    </div>
                    <div>
                      <span className="font-medium">체크아웃:</span>{" "}
                      {paymentInfo.checkOut}
                    </div>
                    <div>
                      <span className="font-medium">숙박 일수:</span>{" "}
                      {paymentInfo.nights}박
                    </div>
                    <div>
                      <span className="font-medium">판매자:</span>{" "}
                      {paymentInfo.seller}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 구매자 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                구매자 정보
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    구매자 이름 *
                  </label>
                  <input
                    type="text"
                    value={paymentInfo.customerName}
                    onChange={(e) =>
                      handleInputChange("customerName", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.customerName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="구매자 이름을 입력하세요"
                  />
                  {errors.customerName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customerName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    value={paymentInfo.customerEmail}
                    onChange={(e) =>
                      handleInputChange("customerEmail", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.customerEmail
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="이메일을 입력하세요"
                  />
                  {errors.customerEmail && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customerEmail}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호 *
                  </label>
                  <input
                    type="tel"
                    value={paymentInfo.customerPhone}
                    onChange={(e) =>
                      handleInputChange("customerPhone", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.customerPhone
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="전화번호를 입력하세요"
                  />
                  {errors.customerPhone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customerPhone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 약관 동의 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                약관 동의
              </h2>
              <div className="space-y-3">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={paymentInfo.agreeTerms}
                    onChange={(e) =>
                      handleInputChange("agreeTerms", e.target.checked)
                    }
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    <span className="text-red-500">*</span> 중고 호텔 이용약관에
                    동의합니다.
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-red-500 text-sm">{errors.agreeTerms}</p>
                )}

                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={paymentInfo.agreePrivacy}
                    onChange={(e) =>
                      handleInputChange("agreePrivacy", e.target.checked)
                    }
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    <span className="text-red-500">*</span> 개인정보처리방침에
                    동의합니다.
                  </span>
                </label>
                {errors.agreePrivacy && (
                  <p className="text-red-500 text-sm">
                    {errors.agreePrivacy}
                  </p>
                )}
              </div>
              <p className="mt-4 text-xs text-gray-600">
                포인트 악용 시 계정 정지 및 환불 불가합니다. 쿠폰은
                환불 시 복구되지 않습니다.
              </p>
            </div>

            {/* 토스페이먼츠 결제 위젯 */}
            {isFormValid && paymentAmounts.actualPaymentAmount > 0 && (
              <TossPaymentsWidget
                clientKey={process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY}
                customerKey={`customer_${paymentInfo.usedItemIdx || "default"}`}
                amount={paymentAmounts.actualPaymentAmount}
                orderId={`used_hotel_${paymentInfo.usedTradeIdx || paymentInfo.usedItemIdx || Date.now()}_${Math.random().toString(36).substr(2, 9)}`}
                orderName={`${paymentInfo.hotelName} - ${paymentInfo.roomType}`}
                customerName={paymentInfo.customerName}
                customerEmail={paymentInfo.customerEmail}
                customerMobilePhone={paymentInfo.customerPhone}
                paymentType="used_hotel"
                successUrl="/used-payment/success"
                failUrl="/used-payment/fail"
                hotelInfo={{
                  usedItemIdx: paymentInfo.usedItemIdx,
                  usedTradeIdx: paymentInfo.usedTradeIdx,
                  hotelName: paymentInfo.hotelName,
                  roomType: paymentInfo.roomType,
                  checkIn: paymentInfo.checkIn,
                  checkOut: paymentInfo.checkOut,
                  guests: paymentInfo.guests,
                  salePrice: paymentInfo.salePrice,
                  totalPrice: paymentAmounts.totalAmount,
                }}
                customerInfo={{
                  customerIdx: paymentInfo.customerIdx,
                  name: paymentInfo.customerName,
                  email: paymentInfo.customerEmail,
                  phone: paymentInfo.customerPhone,
                  useCash: paymentInfo.useCash,
                  usePoint: paymentInfo.usePoint,
                  actualPaymentAmount: paymentAmounts.actualPaymentAmount,
                }}
                onSuccess={handlePaymentSuccess}
                onFail={handlePaymentFail}
              />
            )}
          </div>

          {/* 가격 요약 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                가격 요약
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">원가</span>
                  <span className="line-through text-gray-400">
                    {paymentInfo.originalPrice?.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">할인 금액</span>
                  <span className="text-red-500">
                    -{paymentInfo.discountAmount?.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">세금 및 수수료</span>
                  <span>
                    {Math.round(paymentInfo.salePrice * 0.1).toLocaleString()}원
                  </span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>총 결제 금액</span>
                  <span className="text-blue-600">
                    {paymentAmounts.totalAmount.toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* 캐시 및 포인트 사용 */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  결제 방식
                </h3>

                {/* 캐시 사용 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    캐시 사용 (보유: {paymentInfo.customerCash.toLocaleString()}원)
                  </label>
                  <input
                    type="number"
                    value={paymentInfo.useCash}
                    onChange={(e) => handleCashChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="사용할 캐시 금액"
                    min="0"
                    max={paymentInfo.customerCash}
                  />
                </div>

                {/* 포인트 사용 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    포인트 사용 (보유: {paymentInfo.customerPoint.toLocaleString()}P)
                  </label>
                  <input
                    type="number"
                    value={paymentInfo.usePoint}
                    onChange={(e) => handlePointChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="사용할 포인트"
                    min="0"
                    max={paymentInfo.customerPoint}
                  />
                </div>

                {/* 결제 내역 요약 */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">총 결제 금액</span>
                    <span className="text-gray-900 font-semibold">
                      {paymentAmounts.totalAmount.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">캐시 결제</span>
                    <span className="text-blue-600">
                      {paymentAmounts.useCash.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">포인트 결제</span>
                    <span className="text-blue-600">
                      {paymentAmounts.usePoint.toLocaleString()}P
                    </span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>실제 결제 금액</span>
                    <span className="text-blue-600">
                      {paymentAmounts.actualPaymentAmount.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>

              {/* 결제 버튼 */}
              <button
                onClick={async () => {
                  if (isFormValid && paymentAmounts.actualPaymentAmount > 0) {
                    // 토스페이먼츠 결제 핸들러 직접 호출
                    if (window.tossPaymentHandler) {
                      try {
                        await window.tossPaymentHandler();
                      } catch (error) {
                        console.error("결제 요청 실패:", error);
                        alert("결제 요청 중 오류가 발생했습니다.");
                      }
                    } else {
                      alert(
                        "토스페이먼츠가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요."
                      );
                    }
                  } else {
                    // 폼 유효성 검사 실행 (에러 메시지 표시)
                    if (!validateForm()) {
                      alert("입력 정보를 확인해주세요.");
                      return;
                    }
                    if (paymentAmounts.actualPaymentAmount <= 0) {
                      alert("카드 결제가 필요합니다. (최소 10%)");
                      return;
                    }
                  }
                }}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors mb-4 ${
                  isFormValid && paymentAmounts.actualPaymentAmount > 0
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                disabled={!isFormValid || paymentAmounts.actualPaymentAmount <= 0}
              >
                {isFormValid && paymentAmounts.actualPaymentAmount > 0
                  ? `${paymentAmounts.actualPaymentAmount.toLocaleString()}원 카드 결제하기`
                  : paymentAmounts.actualPaymentAmount <= 0
                  ? "카드 결제 필요 (최소 10%)"
                  : "구매자 정보를 입력하세요"}
              </button>

              <div className="text-xs text-gray-500 text-center">
                결제 완료 후 중고 호텔 예약이 자동으로 확정됩니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsedPaymentForm;

