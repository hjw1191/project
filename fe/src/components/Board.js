import { FilterButtons } from './FilterButtons'

export function Board({
    isLoading,
    error,
    filteredTrips,
    handleEditClick,
    userId, activeFilter,
    onFilterChange,
    onWriteClick 
}) {
  return (
    <section id="Board">
      <FilterButtons
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        onWriteClick={onWriteClick}
      />
      {isLoading ? (
        <p className="Board">데이터를 불러오는 중...</p>
      ) : error ? (
        <p className="Board">에러: {error}</p>
      ) : (
        <div className="Board">
          {filteredTrips
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((trip, index) => {
              const titleParts = trip.title.split(" ");
              console.log("Trip title:", trip.title); // 타이틀 전체 로그
              console.log("Gender info from title:", titleParts[6]); // 성별 정보 로그

              const reservationCount = trip.reservations ? trip.reservations.length : 0;
              const isUserReserved = trip.reservations && trip.reservations.some(reservation => reservation.bookerId === userId);
              const isReservationClosed = trip.title.endsWith('[예약마감]');
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
                  key={trip.id || index}
                  id="Card"
                  onClick={() => handleEditClick(trip)}
                >
                  <div className="user-name">
                    {trip.author?.name || "알 수 없음"}{" "}
                  </div>
                  <div className="post-type"
                    style={{background : `url(${backgroundImage}) center/cover no-repeat`}}
                  >
                    <div className="Cover">
                      {isReservationClosed ? (
                        <img src="/img/finish.png" alt="예약 마감" />
                      ) : (
                        isUserReserved && userId === trip.reservations.find(res => res.bookerId === userId)?.bookerId ? (
                          <img src="/img/booking.png" alt="예약 중" />
                        ) : null
                      )}
                    </div>
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
                            <span className={`carpool ${!isSameGender ? 'switch-on' : ''}`}>
                              성별무관
                            </span>
                            <span className={`carpool ${isSameGender ? 'switch-on' : ''}`}>
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
                    <div className="promise-date">{trip.title.split(" ")[4]}{" "}</div>
                    <span>시간</span>
                    <div className="promise-time">{trip.title.split(" ")[5]}</div>
                  </div>
                  {(isReservationClosed || reservationCount > 0) && (
                    <div className="booking">
                      {isReservationClosed ? "예약 마감" :
                        (reservationCount > 0 ? `${reservationCount}명 예약 중` : "")
                      }
                    </div>
                  )}
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
