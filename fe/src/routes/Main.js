import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Main.css";
import { Post } from "../components/Post.js";
import { Editor } from "../components/Editor.js";
import axios from "../api/axios.js";
import ConfirmModal from "./ConfirmModal.js"; 

export function Main() {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [activeFilter, setActiveFilter] = useState("전체");
  const [searchParams, setSearchParams] = useState({
    departure: "",
    arrival: "",
    date: "",
  });
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userReservation, setUserReservation] = useState(null);
  const [isReservationLoading, setIsReservationLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSearchParams, setPendingSearchParams] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const boardRef = useRef(null);
  const [viewedReservations, setViewedReservations] = useState(() => {
    const stored = localStorage.getItem('viewedReservations');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    fetchUserEmail();
    fetchTrips();
  }, []);

  useEffect(() => {
    localStorage.setItem('viewedReservations', JSON.stringify(viewedReservations));
  }, [viewedReservations]);

  useEffect(() => {
    if (userId !== null) {
      fetchTrips();
    }
  }, [userId]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [trips, activeFilter, searchParams]);

  const fetchTrips = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/posts/gets');
      
      if (response.data && Array.isArray(response.data.data)) {
        const tripsWithReservationStatus = response.data.data.map(trip => ({
          ...trip,
          isReservationCompleted: trip.isReservationCompleted || false
        }));
        console.log('Fetched trips:', tripsWithReservationStatus);
        setTrips(tripsWithReservationStatus);
        applyFiltersAndSearch();
        if (userId !== null) {
          checkForNewReservations(tripsWithReservationStatus);
        }
      } else {
        throw new Error("서버에서 받은 데이터 구조가 예상과 다릅니다.");
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      setError(error.message || "데이터를 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserEmail = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get('/users/me', {
        headers: { 'Authorization': `${token}` }
      });
      setUserId(response.data.data.id);
    } catch (error) {
      console.error('사용자 정보를 가져오는데 실패했습니다:', error);
    }
  };

  const checkForNewReservations = (trips) => {
    console.log('Checking for new reservations. User ID:', userId);
    const userPosts = trips.filter(trip => trip.authorId === userId);
    console.log('User posts:', userPosts);
    const newReservations = userPosts.flatMap(post => 
      (post.reservations || []).filter(reservation => 
        !viewedReservations.includes(reservation.id)
      )
    );
    console.log('New reservations:', newReservations);

    if (newReservations.length > 0) {
      showNewReservationNotification(newReservations);
    }
  };

  const showNewReservationNotification = (newReservations) => {
    newReservations.forEach(reservation => {
      if (reservation && reservation.id) {
        toast.info(`새로운 예약이 있습니다: ${reservation.from}에서 ${reservation.to}로`, {
          position: "bottom-right",
          //autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          onClick: () => handleReservationClick(reservation.postId)
          
        });
        setViewedReservations(prev => [...prev, reservation.id]);
      }
    });
  };

  const handleReservationClick = async (postId) => {
    console.log(`게시물 ID ${postId}로 이동합니다.`);
    console.log('현재 trips 상태:', trips);
    setSelectedPostId(postId);
    
    try {
      console.log('예약 정보 로딩 시작');
      setIsReservationLoading(true);
      const selectedTrip = trips.find(trip => trip.id === postId);
      console.log('선택된 여행:', selectedTrip);

      if (selectedTrip) {
        console.log('사용자 예약 정보 가져오기 시작');
        const reservation = await fetchUserReservation(postId);
        console.log('가져온 예약 정보:', reservation);

        const isReservationEnded = selectedTrip.title.endsWith('[예약마감]');
        console.log('예약 마감 여부:', isReservationEnded);

        const updatedTrip = {
          ...selectedTrip,
          isReservationEnded: isReservationEnded
        };

        console.log('상태 업데이트 시작');
        setUserReservation(reservation);
        setSelectedTrip(updatedTrip);
        setIsEditModalOpen(true);
        console.log('isEditModalOpen 상태 변경됨:', true);

        if (reservation) {
          setViewedReservations(prev => [...prev, reservation.id]);
        }
      } else {
        console.log('선택된 여행을 찾을 수 없습니다. postId:', postId);
        alert('해당 게시물을 찾을 수 없습니다. 페이지를 새로고침 해주세요.');
      }
    } catch (error) {
      console.error('예약 정보를 가져오는 데 실패했습니다:', error);
      alert('예약 정보를 가져오는 데 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsReservationLoading(false);
      console.log('예약 정보 로딩 완료');
    }

    // 게시물로 스크롤
    if (boardRef.current) {
      setTimeout(() => {
        const postElement = boardRef.current.querySelector(`[data-post-id="${postId}"]`);
        if (postElement) {
          postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          console.log('게시물로 스크롤 완료');
        } else {
          console.log('해당 게시물 요소를 찾을 수 없습니다.');
        }
      }, 100);
    }
  };

  const applyFiltersAndSearch = () => {
    let result = trips;

    if (searchParams.departure || searchParams.arrival || searchParams.date) {
      result = result.filter((trip) => {
        const titleParts = trip.title.split(" ");
        const fromMatch = titleParts[0]
          .toLowerCase()
          .includes(searchParams.departure.toLowerCase());
        const toMatch = titleParts[2]
          .toLowerCase()
          .includes(searchParams.arrival.toLowerCase());
        const dateMatch =
          !searchParams.date || titleParts[4] === searchParams.date;
        return fromMatch && toMatch && dateMatch;
      });
    }

    if (activeFilter !== "전체") {
      result = result.filter(
        (trip) => trip.title.split(" ")[3] === activeFilter
      );
    }

    setFilteredTrips(result);
    return result;
  };

  const handleWriteSubmit = (newTrip) => {
    setTrips((prevTrips) => [newTrip, ...prevTrips]);
    fetchTrips(); // 게시물 추가 후 목록 새로고침
  };

  const fetchUserReservation = async (postId) => {
    console.log('fetchUserReservation 시작. postId:', postId);
    setIsReservationLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('토큰 확인:', token ? '존재함' : '존재하지 않음');
      const response = await axios.get('/reserve/gets', {
        headers: { 'Authorization': `${token}` }
      });
      console.log('예약 정보 응답:', response.data);
      const userReservation = response.data.data.find(
        reservation => reservation.post && reservation.post.id === postId && reservation.bookerId === userId
      );
      console.log('찾은 사용자 예약:', userReservation);
      return userReservation || null;
    } catch (error) {
      console.error('예약 정보 가져오기 실패:', error);
      throw error;
    } finally {
      setIsReservationLoading(false);
      console.log('fetchUserReservation 종료');
    }
  };

  const handleEditClick = async (trip) => {
    setIsReservationLoading(true);
    try {
      const reservation = await fetchUserReservation(trip.id);
      const isReservationEnded = trip.title.endsWith('[예약마감]');

      const updatedTrip = {
        ...trip,
        isReservationEnded: isReservationEnded
      };

      setUserReservation(reservation);
      setSelectedTrip(updatedTrip);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('예약 정보를 가져오는 데 실패했습니다:', error);
      alert('예약 정보를 가져오는 데 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsReservationLoading(false);
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTrip(null);
    setUserReservation(null);
    fetchTrips(); // 모달이 닫힐 때 목록 새로고침
  };

  const filterTrips = (filterType) => {
    setActiveFilter(filterType);
    if (filterType === "전체") {
      setFilteredTrips(trips);
    } else {
      const filtered = trips.filter(
        (trip) => trip.title.split(" ")[3] === filterType
      );
      setFilteredTrips(filtered);
    }

    // 검색 조건 초기화
    setSearchParams({ departure: "", arrival: "", date: "" });
    // 입력 필드 초기화
    document.getElementById("departure").value = "";
    document.getElementById("arrival").value = "";
    document.getElementById("tripDate").value = "";
  };

  const handleSearch = (newSearchParams) => {
    setSearchParams(newSearchParams);
    const searchResults = applyFiltersAndSearch();
    
    if (searchResults.length === 0) {
      setPendingSearchParams(newSearchParams);
      setShowConfirmModal(true);
    }
  };

  const handleConfirmWrite = async () => {
    setShowConfirmModal(false);
    if (pendingSearchParams) {
      await createNewTrip(pendingSearchParams);
      setPendingSearchParams(null);
    }
  };

  const createNewTrip = async (params) => {
    const currentDate = new Date();
    const formattedDate = params.date || currentDate.toISOString().split('T')[0];
    const formattedTime = currentDate.toTimeString().slice(0, 5);

    const newTripData = {
      title: `${params.departure} -> ${params.arrival} 탑승자 ${formattedDate} ${formattedTime} 성별무관`,
      from: params.departure,
      to: params.arrival,
      date: formattedDate,
      time: formattedTime,
      type: "탑승자",
      gender: "성별무관"
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      await axios.post('/posts/post', newTripData, {
        headers: { 'Authorization': token }
      });

      console.log('새 게시물이 생성되었습니다.');
      // 전체 게시물 목록을 다시 불러옵니다.
      await fetchTrips();
    } catch (error) {
      console.error('게시물 생성 중 오류 발생:', error);
      alert('게시물 생성에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <div id="Main">
      <ToastContainer />
      <Search onSearch={handleSearch} />
      <FilterButtons
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onWriteClick={() => setIsWriteModalOpen(true)}
      />
      <h1>최근 게시글</h1>
      <Board
        ref={boardRef}
        isLoading={isLoading}
        error={error}
        filteredTrips={filteredTrips}
        handleEditClick={handleEditClick}
        userId={userId}
        selectedPostId={selectedPostId}
      />
      <Post
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        onSubmit={handleWriteSubmit}
        initialDeparture={searchParams.departure}
        initialArrival={searchParams.arrival}
        initialDate={searchParams.date}
      />
      <Editor
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        editData={selectedTrip}
        refreshPosts={fetchTrips}
        postId={selectedTrip?.id}
        userReservation={userReservation}
        userId={userId}
        isReservationEnded={selectedTrip?.isReservationEnded}
      />
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmWrite}
        message="검색 결과가 없습니다. 새로운 게시물을 작성하시겠습니까?"
      />
    </div>
  );
}

export const Board = React.forwardRef(({ isLoading, error, filteredTrips, handleEditClick, userId, selectedPostId }, ref) => {
  return (
    <section id="Board" ref={ref}>
      {isLoading ? (
        <p>데이터를 불러오는 중...</p>
      ) : error ? (
        <p>에러: {error}</p>
      ) : (
        <div className="Board">
          {filteredTrips
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((trip, index) => {

              const reservationCount = trip.reservations ? trip.reservations.length : 0;
              const isUserReserved = trip.reservations &&
                trip.reservations.some(reservation => reservation.bookerId === userId);
              const isReservationClosed = trip.title.endsWith('[예약마감]');

              const titleParts = trip.title.split(" ");
              const genderInfo = titleParts[6];
              const isSameGender = genderInfo === "동성";
              const tripType = titleParts[3].toLowerCase();

              return (
                <div
                  key={trip.id || index}
                  data-post-id={trip.id}
                  className={`Card ${trip.isNewlyCreated ? 'newly-created' : ''} ${selectedPostId === trip.id ? 'selected' : ''}`}
                  onClick={() => handleEditClick(trip)}
                >
                  <div className="row1">
                    <div className="user-name">
                      <span>{trip.author?.name || "알 수 없음"}{" "}</span>
                    </div>
                    <div className="card-title">
                      <div className="user-type">
      
                        <span className={`type type-${tripType}`}>
                          {titleParts[3]}
                        </span>
                        <span style={{ color: isSameGender ? 'blue' : 'inherit' }}>
                          {titleParts[3] === "택시" ? titleParts[6] : genderInfo}
                        </span>
                      </div>
                      <div 
                        className={`switch ${isSameGender ? 'switch-on' : ''}`}
                      >
                        <div className="gear"></div>
                      </div>
                    </div>
                  </div>
                  <div className="row2">
                    <div className="route">
                    <p>경로
                    <span>
                      {trip.title.split(" ")[0]} → 
                      {trip.title.split(" ")[7] && 
                      trip.title.split(" ")[7] !== '[예약마감]' &&
                      trip.title.split(" ")[7] !== '[결제완료]' &&
                      trip.title.split(" ")[7] !== "" &&
                      trip.title.split(" ")[7] !== "undefined"
                        ? `${trip.title.split(" ")[7]} → ` 
                        : ''}
                      {trip.title.split(" ")[2]}
                    </span>
                    </p>
                      
                    </div>
                    <div className="date">
                    <p>날짜<span>{trip.title.split(" ")[4]}{" "}</span></p>
                    <p>출발<span>{trip.title.split(" ")[5]}</span></p>
                    </div>
                  </div>
                  {(isReservationClosed || reservationCount > 0) && (
                    <div 
                      className={`row3 ${
                        isReservationClosed 
                          ? 'booking'
                          : reservationCount > 0 
                            ? 'booking-finished'
                            : ''
                      }`}
                    >
                      {isReservationClosed ? "예약 마감" :
                        (reservationCount > 0 ? `${reservationCount}명 예약 중` : "")
                      }
                    </div>
                  )}
                  <div className="Cover">
                    {isReservationClosed ? (
                      <img src="/img/finish.png" alt="예약 마감" />
                    ) : (
                      isUserReserved && userId === trip.reservations.find(res => res.bookerId === userId)?.bookerId ? (
                        <img src="/img/booking.png" alt="예약 중" />
                      ) : null
                    )}
                  </div>
                  {trip.isNewlyCreated && (
                    <div className="new-trip-indicator">새로 생성된 게시물</div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </section>
  );
});

function Search({ onSearch }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    const newSearchParams = {
      departure: event.target.departure.value,
      arrival: event.target.arrival.value,
      date: event.target.tripDate.value,
    };
    onSearch(newSearchParams);
  };

  return (
    <section id="Search">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          id="departure"
          placeholder="출발지"
        />
        <input
          type="text"
          id="arrival"
          placeholder="도착지"
        />
        <input
          type="date"
          id="tripDate"
        />
        <button
          type="submit"
          className="butn_search"
        >
          검색
        </button>
      </form>
    </section>
  );
}

function FilterButtons({ onFilterChange, onWriteClick }) {
  const filters = ["전체", "택시", "운전자", "탑승자"];
  const filtersClass = ["butn_all", "butn_taxi", "butn_driver", "butn_passenger"];
  const filterImages = [null, "/img/taxi.png", "/img/wheel.png", "/img/siren.png"];

  return (
    <div id="FilterButtons">
      {filters.map((filter, index) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={filtersClass[index]}
        >
          {filterImages[index] && <img src={filterImages[index]} />}
          {filter}
        </button>
      ))}
      <button className="butn_write" onClick={onWriteClick}>
        <img src="/img/plus.png" />
      </button>
    </div>
  );
}
