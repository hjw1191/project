import "./Mypage.css";
import { ChangeInfo } from "../components/MyPage/ChangeInfo.js";
import { MyPoint } from "../components/MyPage/MyPoint.js";
import { MyPost } from "../components/MyPage/MyPost.js";
import { MyReserve } from "../components/MyPage/Myreserve.js";
import { Withdrawal } from "../components/MyPage/Withdrawal.js";
import { useState, useEffect } from "react";
import axios from "../api/axios.js";
import { useLocation } from 'react-router-dom';

export function Mypage() {
  const location = useLocation();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState("MyPoint");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/users/me", {
          headers:
          {
            Authorization: token,
          },
        });
        setUser(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load user data.");
        setLoading(false);
      }
    };

    fetchUserData();

    // location.state에서 activeSection을 확인
    if (location.state && location.state.activeSection) {
      setSelectedMenu(location.state.activeSection);
    }
  }, [location]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!user) return <p>No user data available.</p>;

  const getProfileImage = (gender) => {
    switch (gender) {
      case "MALE":
        return "url(/img/man.png)";
      case "FEMALE":
        return "url(/img/woman.png)";
      default:
        return "url(/img/default.png)";
    }
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case "ChangeInfo":
        return <ChangeInfo user={user} />;
      case "MyPoint":
        return <MyPoint user={user} />;
      case "MyPost":
        return <MyPost user={user} />;
      case "Withdrawal":
        return <Withdrawal />;
      case "MyReserve":
        return <MyReserve user={user} />;
      default:
        return null;
    }
  };

  return (
    <div id="Mypage">
      <aside id="SNB" className="left">
        <div className="myProfile">
          <img src="/img/leaf.png" alt="leaf" className="leaf" />
          <div
            className="myImg"
            style={{
              background: `${getProfileImage(
                user.gender
              )} center/cover no-repeat`,
            }}
          >
          </div>
          <div className="myName">{user.name}</div>
        </div>
        <details open>
          <summary>내 정보 관리</summary>
          <ul>
            <li onClick={() => setSelectedMenu("ChangeInfo")}>회원정보변경</li>
            <li onClick={() => setSelectedMenu("MyPoint")}>내 포인트</li>
            <li onClick={() => setSelectedMenu("Withdrawal")}>회원 탈퇴</li>
          </ul>
        </details>
        <details open>
          <summary>글 관리</summary>
          <ul>
            <li onClick={() => setSelectedMenu("MyPost")}>내가 작성한 글</li>
            <li onClick={() => setSelectedMenu("MyReserve")}>내가 예약한 글</li>
          </ul>
        </details>
      </aside>
      <div className="right">{renderContent()}</div>
    </div>
  );
}
