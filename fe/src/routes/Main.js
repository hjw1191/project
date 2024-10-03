import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./Main.css";
import { Post } from "../components/Post.js";
import { Editor } from "../components/Editor.js";
import axios from "../api/axios.js";
import ConfirmModal from "./ConfirmModal.js"; 

export function Main() {
  const navigate = useNavigate();
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
  const [viewedReservations, setViewedReservations] = useState(() => {
    const stored = localStorage.getItem('viewedReservations');
    return stored ? JSON.parse(stored) : [];
  });
  const [searchInputs, setSearchInputs] = useState({
    departure: "",
    arrival: "",
    date: "",
  });

  useEffect(() => {
    fetchUserEmail();
    fetchTrips();
  }, []);

  useEffect(() => {
    if (userId !== null) {
      fetchTrips();
    }
  }, [userId]);

  useEffect(() => {
    localStorage.setItem('viewedReservations', JSON.stringify(viewedReservations));
  }, [viewedReservations]);

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
        console.log('Fetched trips:', tripsWithReservationStatus); // 추가된 로그
        setTrips(tripsWithReservationStatus);
        applyFiltersAndSearch(); // 필터와 검색 조건을 다시 적용합니다.
        checkForNewReservations(tripsWithReservationStatus);
      } else {
        throw new Error("서버에서 받은 데이터 구조가 예상과 다릅니다.");
      }
    } catch (error) {

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

  const showNotification = (message, type = 'info', options = {}) => {
    toast[type](message, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      ...options
    });
  };

  const handleWriteSubmit = (newTrip) => {
    setTrips((prevTrips) => [newTrip, ...prevTrips]);
    fetchTrips();
    showNotification('새 게시물이 작성되었습니다.', 'success');
  };

  const fetchUserReservation = async (postId) => {
    setIsReservationLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/reserve/gets', {
        headers: { 'Authorization': `${token}` }
      });
      const userReservation = response.data.data.find(
        reservation => reservation.post && reservation.post.id === postId && reservation.bookerId === userId
      );
      return userReservation || null;
    } catch (error) {

    } finally {
      setIsReservationLoading(false);
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
      showNotification('예약 정보를 가져오는 데 실패했습니다. 다시 시도해 주세요.', 'error');
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
      // 검색 조건 및 입력 필드 초기화
      setSearchParams({ departure: "", arrival: "", date: "" });
      setSearchInputs({ departure: "", arrival: "", date: "" });
    } else {
      const filtered = trips.filter(
        (trip) => trip.title.split(" ")[3] === filterType
      );
      setFilteredTrips(filtered);
    }
  };

  const handleSearch = (newSearchParams) => {
    setSearchParams(newSearchParams);
    const searchResults = applyFiltersAndSearch(newSearchParams);
    
    if (searchResults.length === 0) {
      setPendingSearchParams(newSearchParams);
      setShowConfirmModal(true);
    }
  };

  const handleConfirmWrite = async () => {
    setShowConfirmModal(false);
    if (pendingSearchParams) {
      try {
        await createNewTrip(pendingSearchParams);
        showNotification('검색 결과를 바탕으로 새 게시물이 작성되었습니다.', 'success');
        setPendingSearchParams(null);
      } catch (error) {
        showNotification('게시물 작성에 실패했습니다.', 'error');
      }
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
        showNotification('로그인이 필요합니다.', 'error');
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
      throw error; // 에러를 상위로 전파하여 handleConfirmWrite에서 처리할 수 있게 합니다.
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
        toast.info(`새로운 예약이 있습니다`, {
          position: "bottom-right",
          autoClose: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          onClick: () => handleReservationClick(reservation.id)
        });
        setViewedReservations(prev => [...prev, reservation.id]);
      }
    });
  };

  const handleReservationClick = async (reservationId) => {
    toast.dismiss();
    await new Promise(resolve => setTimeout(resolve, 1000));
    navigate('/mypage', { state: { activeSection: 'MyPost', reservationId: reservationId } });
  };

  const handleSearchInputChange = (e) => {
    const { id, value } = e.target;
    setSearchInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(searchInputs);
    const searchResults = applyFiltersAndSearch(searchInputs);
    
    if (searchResults.length === 0) {
      setPendingSearchParams(searchInputs);
      setShowConfirmModal(true);
    }
  };

  return (
    <div id="Main">
      <ToastContainer position="bottom-right"/>
      <Search 
        searchInputs={searchInputs}
        onInputChange={handleSearchInputChange}
        onSubmit={handleSearchSubmit}
      />
      <FilterButtons
        activeFilter={activeFilter}
        onFilterChange={filterTrips}
        onWriteClick={() => setIsWriteModalOpen(true)}
      />
      <h1>최근 게시글</h1>
      <Board
        isLoading={isLoading}
        error={error}
        filteredTrips={filteredTrips}
        handleEditClick={handleEditClick}
        userId={userId}
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
        showNotification={showNotification}
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

export function Board({ isLoading, error, filteredTrips, handleEditClick, userId }) {
  return (
    <section id="Board">
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
                  className={`Card ${trip.isNewlyCreated ? 'newly-created' : ''}`}
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
}

function Search({ searchInputs, onInputChange, onSubmit }) {
  return (
    <section id="Search">
      <form onSubmit={onSubmit}>
        <input
          type="text"
          id="departure"
          placeholder="출발지"
          value={searchInputs.departure}
          onChange={onInputChange}
        />
        <input
          type="text"
          id="arrival"
          placeholder="도착지"
          value={searchInputs.arrival}
          onChange={onInputChange}
        />
        <input
          type="date"
          id="date"
          value={searchInputs.date}
          onChange={onInputChange}
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
