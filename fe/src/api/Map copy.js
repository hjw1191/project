import '../components/Post.css'
import { useEffect, useRef, useState, useCallback } from 'react';

const KakaoMap = ({ onMapSubmit, initialTitle }) => {


  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [kakaoLoaded, setKakaoLoaded] = useState(false);
  const [startMarker, setStartMarker] = useState(null);
  const [endMarker, setEndMarker] = useState(null);
  const [polyline, setPolyline] = useState(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fuelCost, setFuelCost] = useState('');
  const [taxiCost, setTaxiCost] = useState('');

  const [startName, setStartName] = useState("");
  const [endName, setEndName] = useState("");
  const [waypointName, setWaypointName] = useState("");

  const [bounds, setBounds] = useState(null);

  const [waypoints, setWaypoints] = useState([]);
  const [showWaypointInput, setShowWaypointInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedData, setLastSubmittedData] = useState(null);
  const [title, setTitle] = useState(initialTitle || '');
  
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=c2828d7dee20f4b50bd4e887a055a84b&libraries=services&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        console.log('Kakao Maps API loaded');
        setKakaoLoaded(true);
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.kakao || !window.kakao.maps) return;

    const mapOption = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 3
    };
    const newMap = new window.kakao.maps.Map(mapRef.current, mapOption);
    setMap(newMap);
  }, []);

  useEffect(() => {
    if (kakaoLoaded && !map) {
      initMap();
    }
  }, [kakaoLoaded, map, initMap]);

  const searchPlaceByName = useCallback((placeName, markerType, callback) => {
    if (!map || !window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      console.error('카카오맵 서비스가 로드되지 않았습니다.');
      return;
    }

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(placeName, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const place = data[0];
        const coords = new window.kakao.maps.LatLng(place.y, place.x);
        map.setCenter(coords);
        setMarker(coords, markerType);
        if (callback) callback(coords);
      } else {
        alert(`${placeName}을(를) 찾을 수 없습니다. 다른 이름을 시도해 보세요.`);
      }
    });
  }, [map]);

  const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const calculateCosts = useCallback((distance) => {
    const distanceKm = distance / 1000;
    const fuelPrice = 1800;
    const fuelEfficiency = 10;
    const fuelCost = (distanceKm / fuelEfficiency) * fuelPrice;
    setFuelCost(`기름값 : 약 ${numberWithCommas(fuelCost.toFixed(0))}원`);

    const baseFare = 4000;
    const per100mFare = 132;
    const taxiCost = baseFare + (distance / 100 * per100mFare);
    setTaxiCost(`택시비 : 약 ${numberWithCommas(taxiCost.toFixed(0))}원`);
  }, []);

  const clearMarkers = useCallback(() => {
    if (startMarker) {
      startMarker.setMap(null);
      setStartMarker(null);
    }
    if (endMarker) {
      endMarker.setMap(null);
      setEndMarker(null);
    }
    waypoints.forEach(waypoint => {
      if (waypoint.marker) {
        waypoint.marker.setMap(null);
      }
    });
    setWaypoints([]);
  }, [startMarker, endMarker, waypoints]);

  const setMarker = useCallback((coords, type) => {
    if (!map) return;

    let markerColor, markerText;
    switch(type) {
      case 'S':
        markerColor = '#ff7f00'; // 초록색
        markerText = '출';
        break;
      case 'E':
        markerColor = '#FF0000'; // 빨간색
        markerText = '도';
        break;
      default:
        markerColor = '#0000FF'; // 파란색
        markerText = '경';
    }

    const content = `
      <div style="
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      ">
        <div style="
          background-color: ${markerColor};
          border: 2px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          width: 15px;
          height: 15px;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        ">
          <span style="
            color: white;
            transform: rotate(45deg);
            font-weight: bold;
            font-size: 10px;
          ">${markerText}</span>
        </div>
      </div>
    `;

    const customOverlay = new window.kakao.maps.CustomOverlay({
      position: coords,
      content: content,
      zIndex: 3
    });

    customOverlay.setMap(map);

    if (type === 'S') {
      if (startMarker) startMarker.setMap(null);
      setStartMarker(customOverlay);
    } else if (type === 'E') {
      if (endMarker) endMarker.setMap(null);
      setEndMarker(customOverlay);
    } else {
      setWaypoints(prev => [...prev, { coords, marker: customOverlay }]);
    }

    // 모든 마커의 경계를 업데이트합니다
    const newBounds = new window.kakao.maps.LatLngBounds();
    [startMarker, endMarker, ...waypoints.map(wp => wp.marker)].forEach(marker => {
      if (marker) newBounds.extend(marker.getPosition());
    });
    newBounds.extend(coords);
    setBounds(newBounds);
    map.setBounds(newBounds);
  }, [map, startMarker, endMarker, waypoints]);

  const drawRoute = useCallback((startCoords, endCoords, currentWaypoints) => {
    if (!map) return;

    // 기존 폴리라인 제거
    if (polyline) {
      (Array.isArray(polyline) ? polyline : [polyline]).forEach(line => {
        if (line && typeof line.setMap === 'function') {
          line.setMap(null);
        }
      });
    }

    const tmapKey = 'wqfQUHgfrF9iw5X1Csutj9uNrAyZqVmU5xZbXapt';
    let tmapUrl = `https://apis.openapi.sk.com/tmap/routes?version=1&format=json&startX=${startCoords.getLng()}&startY=${startCoords.getLat()}&endX=${endCoords.getLng()}&endY=${endCoords.getLat()}&appKey=${tmapKey}`;

    // 경유지 추가
    const validWaypoints = currentWaypoints.filter(waypoint => waypoint.coords && waypoint.coords.getLat && waypoint.coords.getLng);
    if (validWaypoints.length > 0) {
      const passList = validWaypoints.map(wp => `${wp.coords.getLng()},${wp.coords.getLat()}`).join('_');
      tmapUrl += `&passList=${passList}`;
    }

    fetch(tmapUrl)
      .then(response => response.json())
      .then(data => {
        const paths = [];
        let newDistance = 0;
        let newDuration = 0;
        if (data.features && data.features.length > 0) {
          data.features.forEach(feature => {
            if (feature.geometry.type === "LineString") {
              const path = feature.geometry.coordinates.map(coord => 
                new window.kakao.maps.LatLng(coord[1], coord[0])
              );
              paths.push(path);
            }
            if (feature.properties) {
              if (feature.properties.totalDistance) {
                newDistance = feature.properties.totalDistance;
              }
              if (feature.properties.totalTime) {
                newDuration = feature.properties.totalTime;
              }
            }
          });

          // 기존 폴리라인 제거
          if (Array.isArray(polyline)) {
            polyline.forEach(line => line.setMap(null));
          } else if (polyline) {
            polyline.setMap(null);
          }

          // 새로운 폴리라인 생성
          const newPolylines = paths.map(path => 
            new window.kakao.maps.Polyline({
              path: path,
              strokeWeight: 5,
              strokeColor: '#FF0000',
              strokeOpacity: 0.8,
              strokeStyle: 'solid'
            })
          );

          newPolylines.forEach(line => line.setMap(map));
          setPolyline(newPolylines);  // 항상 배열로 설정
          setDistance(newDistance);
          setDuration(newDuration);
          calculateCosts(newDistance);

          // 경로가 그려진 후 경계를 업데이트합니다
          const routeBounds = new window.kakao.maps.LatLngBounds();
          paths.flat().forEach(coord => routeBounds.extend(coord));
          routeBounds.extend(new window.kakao.maps.LatLng(startCoords.getLat(), startCoords.getLng()));
          routeBounds.extend(new window.kakao.maps.LatLng(endCoords.getLat(), endCoords.getLng()));
          validWaypoints.forEach(wp => routeBounds.extend(new window.kakao.maps.LatLng(wp.coords.getLat(), wp.coords.getLng())));
          setBounds(routeBounds);
          map.setBounds(routeBounds);
        } else {
          alert('경로를 찾을 수 없습니다. 입력한 주소를 확인해 주세요.');
        }
      })
      .catch(error => {
        console.error('경로 가져오기 실패:', error);
        alert('경로를 찾을 수 없습니다. 입력한 주소를 확인해 주세요.');
      });
  }, [map, polyline, calculateCosts]);

  const resetState = useCallback(() => {
    setDistance(0);
    setDuration(0);
    setFuelCost('');
    setTaxiCost('');
    if (polyline) {
      (Array.isArray(polyline) ? polyline : [polyline]).forEach(line => {
        if (line && typeof line.setMap === 'function') {
          line.setMap(null);
        }
      });
    }
    setPolyline(null);
    clearMarkers();
  }, [polyline, clearMarkers]);

  const removeWaypoint = (index) => {
    setWaypoints(prev => prev.filter((_, i) => i !== index));
    updateTitle(startName, endName, waypoints.filter((_, i) => i !== index));
  };

  const updateTitle = useCallback((start, end, currentWaypoints) => {
    let newTitle = `${start} -> ${end}`;
    if (currentWaypoints.length > 0) {
      const waypointsString = currentWaypoints.map(wp => wp.name).join(" -> ");
      newTitle += ` ${waypointsString}`;
    }
    setTitle(newTitle);
  }, []);

  useEffect(() => {
    updateTitle(startName, endName, waypoints);
  }, [startName, endName, waypoints, updateTitle]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const start = startName.trim();
    const end = endName.trim();

    if (!start || !end) {
      alert('출발지와 도착지 이름을 모두 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    resetState();

    const searchAllPlaces = async () => {
      const startCoords = await new Promise(resolve => searchPlaceByName(start, 'S', resolve));
      const endCoords = await new Promise(resolve => searchPlaceByName(end, 'E', resolve));

      const updatedWaypoints = [];
      for (let i = 0; i < waypoints.length; i++) {
        if (waypoints[i].name) {
          const coords = await new Promise(resolve => 
            searchPlaceByName(waypoints[i].name, `W${i}`, resolve)
          );
          if (coords) {
            updatedWaypoints.push({ name: waypoints[i].name, coords });
          }
        }
      }

      updateTitle(start, end, updatedWaypoints);
      return { startCoords, endCoords, updatedWaypoints };
    };

    searchAllPlaces().then(({ startCoords, endCoords, updatedWaypoints }) => {
      setWaypoints(updatedWaypoints);
      if (startCoords && endCoords) {
        drawRoute(startCoords, endCoords, updatedWaypoints);
      }
    }).finally(() => {
      setIsSubmitting(false);
    });
  }, [searchPlaceByName, drawRoute, startName, endName, waypoints, resetState, isSubmitting, updateTitle]);

  useEffect(() => {
    if (distance && duration && fuelCost && taxiCost && onMapSubmit) {
      const routeData = {
        startName,
        endName,
        waypoints: waypoints.map(wp => wp.name),  // 경유지 이름들
        distance,
        duration,
        fuelCost,
        taxiCost,
        title // 업데이트된 title 포함
      };
      
      // 콘솔에 저장된 데이터 출력
      if (JSON.stringify(routeData) !== JSON.stringify(lastSubmittedData)) {
        console.log('저장된 경로 데이터:', routeData);
        onMapSubmit(routeData);
        setLastSubmittedData(routeData);
      }
    }
  }, [distance, duration, fuelCost, taxiCost, onMapSubmit, startName, endName, waypoints, title]);

  useEffect(() => {
    if (initialTitle) {
      const titleParts = initialTitle.split(" ");
    
      
      setStartName(titleParts[0]);
      setEndName(titleParts[2]);
      
      // 경유지 확인 로직
      if (titleParts[7] && titleParts[7] !== '[예약마감]' && titleParts[7] !== '[결제완료]' && titleParts[7] !== "") {
        setWaypoints([{ name: titleParts[7] }]);
      } else {
        setWaypoints([]);
      }
    }
  }, [initialTitle]);

  const toggleWaypoint = () => {
    if (waypoints.length > 0) {
      setWaypoints([]);
      updateTitle(startName, endName, []);
    } else {
      setWaypoints([{ name: '' }]);
    }
  };

  const handleWaypointChange = (value) => {
    setWaypoints([{ name: value }]);
    updateTitle(startName, endName, [{ name: value }]);
  };

  if (!kakaoLoaded) {
    return <div>카카오맵을 로딩 중입니다...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="PostingForm">
      <div className="row">
        <div id="Map" ref={mapRef}></div>
      </div>
      <div className="row">
        <div className="outline input-grid">
          <input 
            type="text" 
            id="startName" 
            name="startName" 
            placeholder="출발지 이름을 입력하세요" 
            value={startName}
            onChange={(e) => setStartName(e.target.value)}
            required 
            className="location-input"
          />
          {waypoints.length > 0 && (
            <input
              type="text"
              placeholder="경유지"
              value={waypoints[0].name}
              onChange={(e) => handleWaypointChange(e.target.value)}
              className="location-input"
            />
          )}
          <input 
            type="text" 
            id="endName" 
            name="endName" 
            placeholder="도착지 이름을 입력하세요" 
            value={endName}
            onChange={(e) => setEndName(e.target.value)}
            required 
            className="location-input"
          />
          <button type="button" onClick={toggleWaypoint} className="toggle-waypoint">
            {waypoints.length > 0 ? '경유지 삭제' : '경유지 추가'}
          </button>
        </div>
      </div>
      
      <div className="row">
       
        <div className="costResult"> 
          <p>거리 : {(distance / 1000).toFixed(2)} km</p>
          <p>예상 시간 : {Math.round(duration / 60)} 분</p>
        </div>
        <div className="costResult">
          <p>{fuelCost}</p>
          <p>{taxiCost}</p>
        </div>
      </div>
      <div className="wrap_btn">
        <button type="submit">경로 검색</button>
      </div>
    </form>
  );
};

export default KakaoMap; 