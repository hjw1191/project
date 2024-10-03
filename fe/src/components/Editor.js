import "./Post.css";
import { Chat } from "./Chat/Chat";
import { useState, useEffect } from "react";
import Map from "../api/Map";
import axios from '../api/axios';
import { toast } from 'react-toastify';

export function Editor({
  isOpen,
  onClose,
  onEdit,
  postId,
  onDelete,
  editData,
  refreshPosts,
  userReservation,
  isReservationLoading,
  userId,
  isReservationEnded,
  showNotification,
}) {
  const [showChat, setShowChat] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [user, setUser] = useState(null);
  const [messageList, setMessageList] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") { onClose(); }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const fetchData = async () => {
      if (isOpen && editData && editData.id) {
        setIsLoading(true);
        await fetchUserEmail();
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen, editData]);

  useEffect(() => {
    if (isOpen && editData) {
      console.log('Editor - 받은 editData:', editData);
      console.log('Editor - 예약 마감 여부:', isReservationEnded);
    }
  }, [isOpen, editData, isReservationEnded]);

  const fetchUserEmail = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.get('/users/me', {
        headers: {
          Authorization: token,
        },
      });
      const email = response.data.data.email;
      setUserEmail(email);
      setUser(response.data.data);
    } catch (error) {
      console.error('사용자 정보를 가져오는 데 실패했습니다:', error);
    }
  };

  const handleMapSubmit = (data) => {
    setMapData(data);
  };

  if (!isOpen) return null;

  const titleParts = editData.title.split(" ");
  const initialDeparture = titleParts[0];
  const initialArrival = titleParts[2];

  const authorEmail = editData.author.email;

  const isSameUser = userEmail === authorEmail;

  const handleEdit = async (editedTrip) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해 주세요.');
      }

      console.log('서버로 전송되는 데이터:', editedTrip);

      const response = await axios.patch(`/posts/patch/${editData.id}`, editedTrip, {
        headers: { 'Authorization': `${token}` }
      });

      if (response.status) {
        onClose();
        refreshPosts();
        toast.success('게시물이 성공적으로 수정되었습니다.');
      }
    } catch (error) {
      console.error('게시물 수정 중 오류 발생:', error);
      toast.error('게시물을 수정하는 데 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해 주세요.');
      }

      const response = await axios.delete(`/posts/delete/${editData.id}`, {
        headers: { 'Authorization': `${token}` }
      });

      if (response.status) {
        onClose();
        refreshPosts();
        toast.success('게시물이 성공적으로 삭제되었습니다.');
      }
    } catch (error) {
      console.error('게시물 삭제 중 오류 발생:', error);
      toast.error('게시물을 삭제하는 데 실패했습니다.');
    }
  };

  const handleReserve = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해 주세요.');
      }

      const reserveData = {
        from: formData.departure,
        to: formData.arrival,
        date: `${formData.date}T${formData.time}:00.000Z`,
        postId: editData.id,
        bookerId: userId,
      };

      console.log('예약 데이터 (서버로 전송 전):', reserveData);

      const response = await axios.post('/reserve/reserve', reserveData, {
        headers: { 'Authorization': `${token}` }
      });

      if (response.status === 201) {
        console.log('예약 성공:', response.data);
        toast.success('예약이 완료되었습니다.');
        onClose();
        refreshPosts();
      }
    } catch (error) {
      console.error('예약 중 오류 발생:', error);
      toast.error('예약에 실패했습니다.');
    }
  };

  const handleCancelReservation = async () => {
    const token = localStorage.getItem('token');
    if (!token || !userReservation) {
      console.log('토큰이 없거나 예약 정보가 없습니다.');
      return;
    }

    try {
      // 먼저 예약 정보를 조회합니다.
      const checkResponse = await axios.get(`/reserve/get/${userReservation.id}`, {
        headers: { 'Authorization': `${token}` }
      });

      console.log('Reservation check response:', checkResponse.data);

      
      const cancelResponse = await axios.delete(`/reserve/delete/${userReservation.id}`, {
        headers: { 'Authorization': `${token}` }
      });

      if (cancelResponse.status) {
        console.log('예약 취소 성공:', cancelResponse.data);
        toast.success('예약이 취소되었습니다.');
        onClose();
        refreshPosts();
      }
    } catch (error) {
      console.error('예약 취소 중 오류 발생:', error);
      toast.error('예약 취소에 실패했습니다. 예약이 이미 취소되었거나 존재하지 않을 수 있습니다.');
    }
  };

  return (
    <div id="Editing">
      {!isLoading && !isReservationLoading && (
        <>
          <Map
            onMapSubmit={handleMapSubmit}
            initialTitle={editData?.title}
          />
          <PostingForm
            isOpen={isOpen}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClose={onClose}
            editData={editData}
            userEmail={userEmail}
            mapData={mapData}
            initialDeparture={initialDeparture}
            initialArrival={initialArrival}
            isSameUser={isSameUser}
            setShowChat={setShowChat}
            userReservation={userReservation}
            onReserve={handleReserve}
            onCancelReservation={handleCancelReservation}
            user={user}
            userId={userId}
            refreshPosts={refreshPosts}
            isReservationEnded={isReservationEnded}
            showNotification={showNotification}
          />
          {showChat && <Chat postId={postId} user={user} messageList={messageList} setMessageList={setMessageList} />}
        </>
      )}
    </div>
  );
}

function PostingForm({
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
      setGender(editData.gender || "성별무관");
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
      <button onClick={handleCloseModal} className="btn_close"/>
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
