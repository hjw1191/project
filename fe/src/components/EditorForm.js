import { useState, useEffect } from "react";
import axios from '../api/axios';


export function EditorForm({
  isOpen,
  onEdit,
  onDelete,
  onClose,
  editData,
  userEmail,
  initialDeparture,
  initialArrival,
  isSameUser,
  setShowChat,
  userReservation,
  onReserve,
  onCancelReservation,
  user,
  userId,
  refreshPosts,
  isReservationEnded,
  mapData,
  showNotification,
}) {
  const [type, setType] = useState("탑승자");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [departure, setDeparture] = useState(initialDeparture);
  const [arrival, setArrival] = useState(initialArrival);
  const [gender, setGender] = useState("성별무관");
  const [taxiCapacity, setTaxiCapacity] = useState("2");
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isReservationCompleted, setIsReservationCompleted] = useState(isReservationEnded);

  useEffect(() => {
    if (editData) {
      const titleParts = editData.title.split(" ");
      setType(titleParts[3] || "");
      setTime(titleParts[5] || "");
      setDate(titleParts[4] || "");
      const genderInfo = titleParts[6];
    setGender(genderInfo === "동성" ? "동성" : "성별무관");
    }
  }, [editData]);

  useEffect(() => {
    console.log('PostingForm - 예약 마감 여부:', isReservationEnded);
  }, [isReservationEnded]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!mapData || !mapData.startName || !mapData.endName) {
      alert("지도에서 경로를 먼저 검색해주세요.");
      return;
    }

    // 기본 경로 문자열 생성
    let title = `${mapData.startName} -> ${mapData.endName} ${type} ${date} ${time} ${type === "택시" ? `${taxiCapacity}인` : gender}`;

    // 경유지 처리
    if (mapData.waypoints && mapData.waypoints.length > 0) {
      const waypointsString = mapData.waypoints
        .map(wp => wp.replace(/[\[\]]/g, '').trim())
        .filter(name => name !== '')
        .join(" -> ");
      if (waypointsString) {
        title += ` ${waypointsString}`;
      }
    }

    const editedTrip = {
      title: title,
    };

    console.log('수정된 데이터 (서버로 전송 전):', editedTrip);
    onEdit(editedTrip);
  };

  const handleCloseModal = () => {
    onClose();
  }

  if (!isOpen) return null;

  const isReservationOwner = userReservation && userId && userReservation.bookerId === userId;

  const handleReservationComplete = async () => {
    const isConfirmed = window.confirm("예약을 마감하시겠습니까?");
    if (isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('인증 토큰이 없습니다. 다시 로그인해 주세요.');
        }

        const updatedTitle = `${editData.title} [예약마감]`;
        console.log(updatedTitle);
        const response = await axios.patch(`/posts/patch/${editData.id}`,
          { title: updatedTitle },
          { headers: { 'Authorization': `${token}` } }
        );

        if (response.status === 200) {
          setIsReservationCompleted(true);
          showNotification("예약이 마감되었습니다.", 'success');
          refreshPosts();
        }
      } catch (error) {
        console.error('예약 마감 처리 중 오류 발생:', error);
        showNotification('예약 마감 처리에 실패했습니다.', 'error');
      }
    }
  };

  const handleReserveClick = () => {
    if (isReservationOwner) {
      onCancelReservation();
    } else {
      const formData = {
        departure,
        arrival,
        date,
        time,
        type,
        gender: type === "택시" ? `${taxiCapacity}인` : gender,
      };
      onReserve(formData);
    }
  };

  const handlePayment = async () => {
    if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) {
      showNotification('올바른 결제 금액을 입력해주세요.', 'error');
      return;
    }

    if (editData.title.includes('탑승자') && (!editData.reservations || editData.reservations.length === 0)) {
      showNotification('예약이 없어 결제를 진행할 수 없습니다.', 'error');
      return;
    }

    setIsPaymentProcessing(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해 주세요.');
      }

      let payer, receiver;
      if (editData.title.includes('운전자') || editData.title.includes('택시')) {
        payer = userId;
        receiver = editData.authorId;
      } else if (editData.title.includes('탑승자')) {
        payer = editData.authorId;
        receiver = editData.reservations[0].bookerId;
      } else {
        throw new Error('게시물 유형을 확인할 수 없습니다.');
      }

      const paymentData = {
        payerId: payer,
        receiverId: receiver,
        reservationId: editData.reservations[0].id,
        cost: parseInt(paymentAmount)
      };

      console.log('결제 요청 데이터:', paymentData);

      const response = await axios.post('/point/payment', paymentData, {
        headers: { 'Authorization': `${token}` }
      });


      console.log('결제 응답:', response.data);

      if (response.status) {
        console.log('결제 성공:', response.data);
        showNotification(`${paymentAmount}원 결제가 완료되었습니다.`, 'success');
        setPaymentAmount('');
        window.location.reload()
      }
    } catch (error) {
      console.error('결제 처리 중 오류 발생:', error);
      if (error.response && error.response.data && error.response.data.message) {
        showNotification(`결제 실패: ${error.response.data.message}`, 'error');
      } else {
        showNotification('이미 결제되었습니다.', 'error');
      }
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const showPaymentSection =
    (type === "탑승자" && isSameUser && isReservationCompleted) ||
    ((type === "운전자" || type === "택시") && isReservationOwner);

  return (
    <form onSubmit={handleSubmit} className="PostingForm">
      <button onClick={handleCloseModal} className="btn_close" />
      <div className="row">
        <h2>유형을 선택해 주세요</h2>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={!isSameUser}
        >
          <option value="탑승자">탑승자</option>
          <option value="운전자">운전자</option>
          <option value="택시">택시</option>
        </select>
      </div>
      {type === '택시' && (
        <div className="row">
          <h2>몇 명이 탑승하나요?</h2>
          <select
            value={taxiCapacity}
            onChange={(e) => setTaxiCapacity(Number(e.target.value))}
            disabled={!isSameUser}
          >
            <option value={2}>2인</option>
            <option value={3}>3인</option>
            <option value={4}>4인</option>
          </select>
        </div>
      )}
      <div className="row">
        <h2>몇 시에 출발하시나요?</h2>
        <input
          type="time"
          className="cnt_time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          disabled={!isSameUser}
        />
      </div>
      <div className="row">
        <h2>언제 출발하시나요?</h2>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          disabled={!isSameUser}
        />
      </div>
      {type !== '택시' && (
        <div className="row">
          <h2>어떤 분과 탑승하시나요?</h2>
          <div className="wrap_label">
            <label>
              <input
                type="radio"
                id="anyone"
                name="gender"
                value="성별무관"
                checked={gender === "성별무관"}
                onChange={(e) => setGender(e.target.value)}
                disabled={!isSameUser}
              />
              성별무관
            </label>
            <label>
              <input
                type="radio"
                id="same"
                name="gender"
                value="동성"
                checked={gender === "동성"}
                onChange={(e) => setGender(e.target.value)}
                disabled={!isSameUser}
              />
              동성
            </label>
          </div>
        </div>
      )}
      {showPaymentSection && (
        <div className="row">
          <h2>결제 금액을 입력해 주세요</h2>
          <div className="wrap_payment">
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="결제 금액"
              disabled={isPaymentProcessing}
            />
            <button
              type="button"
              onClick={handlePayment}
              disabled={isPaymentProcessing}
            >
              {isPaymentProcessing ? '처리 중...' : '결제하기'}
            </button>
          </div>
        </div>
      )}
      {isSameUser ? (
        <div className="wrap_btn">
          {!isReservationCompleted && (
            <button type="button" onClick={handleReservationComplete}>
              예약 마감
            </button>
          )}
          <button type="button" onClick={() => setShowChat(true)}>채팅하기</button>
          <button type="submit" className="btn_modify">수정하기</button>
          <button type="button" onClick={onDelete} className="btn_delete">삭제하기</button>
        </div>
      ) : (
        <div className="wrap_btn">
          {!isReservationCompleted && (
            <button
              type="button"
              onClick={handleReserveClick}
              disabled={editData.isReservationCompleted}
            >
              {isReservationOwner ? "예약 취소하기" : "예약하기"}
            </button>
          )}
          <button type="button" onClick={() => setShowChat(true)}>채팅하기</button>
        </div>
      )}
    </form>
  );
}