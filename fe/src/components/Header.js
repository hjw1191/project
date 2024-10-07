import "./Header.css";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from '../api/axios';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const inMainPage = location.pathname === "/";
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [userPoint, setUserPoint] = useState(null);
  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const invert = inMainPage ? "invert" : "";

  useEffect(() => {
    const controlHeader = () => {
      if (window.scrollY > lastScrollY) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener('scroll', controlHeader);
    return () => {
      window.removeEventListener('scroll', controlHeader);
    };
  }, [lastScrollY]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get('/users/me', {
            headers: { Authorization: token }
          });
          const userName = response.data.data.name;
          setUserName(userName);
          setIsLoggedIn(true);
          setUserPoint(response.data.data.point);
        } catch (error) {
          console.error('사용자 정보를 가져오는 데 실패했습니다:', error);
          handleLogout();
        }
      };
      fetchUserData();
    }
  }, []);

  const handleLogout = () => {
    setUserName("");
    setIsLoggedIn(false);
    navigate("/main");
    localStorage.removeItem("token");
  };

  const goLandingPage = () => {
    window.location.href = "/";
  };

  return (
    <header>
      <Link to="/" id="logo" className={invert} onClick={goLandingPage}>당근마차</Link>
      <Link to="/main" className={invert}>홈</Link>
      {isLoggedIn && userPoint !== null && (
        <span className={invert}>포인트: {userPoint}</span>
      )}
      {isLoggedIn && (
        <Link className={`user-menu ${invert}`}>
          {userName} 님 안녕하세요
          <nav>
            <Link to='/mypage'>마이페이지</Link>
            <Link to='/guide'>이용가이드</Link>
          </nav>
        </Link>
      )}
      {isLoggedIn ? (
        <button onClick={handleLogout} className={invert}>로그아웃</button>
      ) : (
        <Link to="/login" className={invert}>로그인</Link>
      )}
      {!isLoggedIn && (
        <Link to="/signup" className={invert}>회원가입</Link>
      )}
    </header>
  );
}
