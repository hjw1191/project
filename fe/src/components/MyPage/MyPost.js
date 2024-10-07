import { Editor } from "../Editor.js";
import { useState, useEffect } from "react";
import axios from "../../api/axios.js";

export function MyPost({ user }) {
  const [myPosts, setMyPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    fetchMyPosts();
  }, [user]);

  const fetchMyPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/posts/gets", {
        headers: { Authorization: token },
      });

      if (response.data && Array.isArray(response.data.data)) {
        const filteredPosts = response.data.data.filter((post) => post.authorId === user.id);
        setMyPosts(filteredPosts);
      } else {
        throw new Error("서버에서 받은 데이터 구조가 예상과 다릅니다.");
      }
    } catch (error) {
      console.error("내 게시글을 가져오는 데 실패했습니다:", error);
      setError(error.message || "데이터를 불러오는 데 실패했습니다.");
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
    fetchMyPosts();
  };

  return (
    <div id="MyPost">
      <h2>내가 작성한 글</h2>
      {isLoading && <div className="Board">로딩 중...</div>}
      {error && <div className="Board">{error}</div>}
      {myPosts.length === 0 && !isLoading && !error && (
        <div className="Board">작성한 게시글이 없습니다</div>
      )}
      <div className="Board">
        {myPosts.map((post) => {
          const titleParts = post.title.split(" ");
          const reservationCount = post.reservations ? post.reservations.length : 0;
          const isReservationClosed = post.title.endsWith('[예약마감]');
          const genderInfo = titleParts[6];
          const isSameGender = genderInfo === "동성";
          const stopover = titleParts[7];

          let backgroundImage = '';
          if (titleParts[3] === "운전자") {
            backgroundImage = '/img/driver.png';
          } else if (titleParts[3] === "탑승자") {
            backgroundImage = '/img/carpooler.png';
          } else if (titleParts[3] === "택시") {
            backgroundImage = '/img/taxi-driver.png';
          }

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
                  {isReservationClosed ? "예약 마감" :
                    (reservationCount > 0 ? `${reservationCount}명 예약 중` : "")
                  }
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Editor
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        editData={selectedPost}
        refreshPosts={fetchMyPosts}
        postId={selectedPost?.id}
        userReservation={null} // MyPost에서는 사용자의 예약 정보가 필요 없을 수 있습니다.
        userId={user.id}
        isReservationEnded={selectedPost?.title.endsWith('[예약마감]')}
      />
    </div>
  );
}