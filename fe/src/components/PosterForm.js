import { useState, useEffect } from "react";
import axios from "../api/axios.js";


export function PosterForm({ onSubmit, onClose, mapData }) {
  const [type, setType] = useState("운전자");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [gender, setGender] = useState("성별무관");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taxiCapacity, setTaxiCapacity] = useState(2); // 새로운 상태 추가

  useEffect(() => {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];
    const formattedTime = currentDate.toTimeString().slice(0, 5);

    setDate(formattedDate);
    setTime(formattedTime);
  }, []);

  useEffect(() => {
    console.log('mapData 변경됨:', mapData);
  }, [mapData]);

  const createTitle = (mapData, type, date, time, taxiCapacity, gender) => {
    let routePart = `${mapData.startName} -> ${mapData.endName}`;

    const typePart = type;
    const datePart = date;
    const timePart = time;
    const capacityOrGenderPart = type === '택시' ? `${taxiCapacity}인` : gender;

    let title = `${routePart} ${typePart} ${datePart} ${timePart} ${capacityOrGenderPart}`;

    // 경유지 정보를 맨 뒤에 추가
    if (mapData.waypoints && mapData.waypoints.length > 0) {
      const waypointsString = mapData.waypoints
        .map(wp => wp.replace(/[\[\]]/g, '').trim())
        .filter(name => name !== '')
        .join(" -> ");
      title += ` ${waypointsString}`;
    }

    return title;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!mapData || !mapData.startName || !mapData.endName) {
      alert("지도에서 경로를 먼저 검색해주세요.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        return;
      }

      const config = {
        headers: {
          'Authorization': `${token}`,
          'Content-Type': 'application/json'
        }
      };

      const title = createTitle(mapData, type, date, time, taxiCapacity, gender);

      const postData = {
        title: title,
        from: mapData.startName,
        to: mapData.endName,
        waypoints: mapData.waypoints.map(wp => wp.replace(/[\[\]]/g, '').trim()).filter(name => name !== ''),
        distance: mapData.distance,
        duration: mapData.duration,
        fuelCost: mapData.fuelCost,
        taxiCost: mapData.taxiCost,
        date: date,
        time: time,
        type: type,
        taxiCapacity: type === '택시' ? taxiCapacity : undefined,
        gender: type !== '택시' ? gender : undefined
      };
      console.log('Sending post data:', postData);

      const postResponse = await axios.post('/posts/post', postData, config);
      console.log('Post가 성공적으로 생성되었습니다:', postResponse.data);

      onSubmit({ ...postResponse.data, ...postData });
      onClose();
    } catch (error) {
      console.error('데이터 저장 중 오류 발생:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="PostingForm">
      <button onClick={handleCloseModal} className="btn_close" />
      <div className="row">
        <h2>유형을 선택해 주세요</h2>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="운전자">운전자</option>
          <option value="탑승자">탑승자</option>
          <option value="택시">택시</option>
        </select>
      </div>
      {type === '택시' && (
        <div className="row">
          <h2>몇 명이 탑승하나요?</h2>
          <select
            value={taxiCapacity}
            onChange={(e) => setTaxiCapacity(Number(e.target.value))}
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
          className="cont_time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
      </div>
      <div className="row">
        <h2>언제 출발하시나요?</h2>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
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
                name="type"
                value="성별무관"
                checked={gender === "성별무관"}
                onChange={(e) => setGender(e.target.value)}
              />
              성별무관
            </label>
            <label>
              <input
                type="radio"
                id="same"
                name="type"
                value="동성"
                checked={gender === "동성"}
                onChange={(e) => setGender(e.target.value)}
              />
              동성
            </label>
          </div>
        </div>
      )}
      <div className="wrap_btn">
        <button type="submit">작성</button>
      </div>
    </form>
  );
}
