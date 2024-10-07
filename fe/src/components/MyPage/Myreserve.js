import { Editor } from "../Editor.js";
import { useState, useEffect } from 'react';
import axios from '../../api/axios.js';


export function MyReserve() {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetchUserIdAndReservations();
  }, []);

  const fetchUserIdAndReservations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');

      // 사용자 ID 가져오기
      const userResponse = await axios.get('/users/me', {
        headers: { 'Authorization': `${token}` }
      });

      const currentUserId = userResponse.data.data.id;
      setUserId(currentUserId);

      // 예약 정보 가져오기
      const reserveResponse = await axios.get('/posts/gets', {
        headers: { 'Authorization': `${token}` }
      });

      // 사용자의 예약만 필터링
      const userReservations = reserveResponse.data.data.filter(post =>
        post.reservations.some(reservation => reservation.bookerId === currentUserId)
      );

      setReservations(userReservations);
    } catch (error) {
      console.error('정보를 가져오는 데 실패했습니다:', error);
      setError('정보를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (post) => {
    setSelectedPost(post);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedPost(null);
    fetchUserIdAndReservations();
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <div id="MyReserve">
      <h2>내 예약 목록</h2>
      {reservations.length === 0 ? (
        <div className="Board">예약된 내역이 없습니다.</div>
      ) : (
        <div className="Board">
          {reservations.map((post) => {
            const titleParts = post.title.split(" ");
            const reservationCount = post.reservations ? post.reservations.length : 0;
            const isReservationClosed = post.title.endsWith('[예약마감]');
            const genderInfo = titleParts[6];
            const isSameGender = genderInfo === "동성";
            const stopover = titleParts[7];

            const getStatusText = (status) => {
              if (status === "PENDING") return "예약중";
              if (status === "COMPLETED") return "결제완료";
              return status || "알 수 없음";
            };

            return (
              <div
                key={post.id}
                id="Card"
                onClick={() => handleEditClick(post)}
              >
                <div className="user-name">
                  {post.author?.name || "알 수 없음"}{" "}
                </div>
                <div className="carpool-type">
                  {
                    titleParts[3] === "택시"
                      ? (
                        <>
                          <span>{titleParts[3]}</span>
                          <span className="taxi-party">{genderInfo}</span>
                        </>
                      )
                      : (
                        <>
                          <span className={`carpool ${isSameGender ? 'switch-on' : ''}`}>
                            성별무관
                          </span>
                          <span className={`carpool ${isSameGender ? '' : 'switch-on'}`}>
                            동성끼리
                          </span>
                        </>
                      )
                  }
                </div>
                <div className="journey">
                  <div className="journey-departure">
                    <span>출발지</span>
                    <span>{titleParts[0]}</span>
                  </div>
                  {stopover && stopover !== '[예약마감]' && stopover !== '[결제완료]' && stopover !== "" && stopover !== "undefined" && (
                    <div className="journey-stopover">
                      <span>경유지</span>
                      <span>{stopover}</span>
                    </div>
                  )}
                  <div className="journey-arrival">
                    <span>도착지</span>
                    <span>{titleParts[2]}</span>
                  </div>
                </div>
                <div className="promise">
                  <span>날짜</span>
                  <div className="promise-date">{post.title.split(" ")[4]}{" "}</div>
                  <span>시간</span>
                  <div className="promise-time">{post.title.split(" ")[5]}</div>
                </div>
                {(isReservationClosed || reservationCount > 0) && (
                  <div className="booking">
                    {getStatusText(post.reservations[0]?.status)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <Editor
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        editData={selectedPost}
        refreshPosts={fetchUserIdAndReservations}
        postId={selectedPost?.id}
        userReservation={selectedPost?.reservations[0]}
        userId={userId}
        isReservationEnded={selectedPost?.title.endsWith('[예약마감]')}
      />
    </div>
  );
}