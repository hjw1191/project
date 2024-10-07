import './Login.css';
import { Header } from "../components/Header";
import { Footer } from "../components/Footer"
import { useState, useEffect } from 'react';
import axios from '../api/axios.js'


export function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/users/signin', { email, password });

      const token = response.headers['authorization']
      
      if (token) {
        localStorage.setItem('token', token);
        const userResponse = await axios.get('/users/me', {
          headers: { Authorization: token }
        });
        const userName = userResponse.data.data.name;
        onLogin(userName);

        if (rememberMe) {
          localStorage.setItem('savedEmail', email);
        } else {
          localStorage.removeItem('savedEmail');
        }
      } else {
        alert('No token received.');
      }
      console.log("successfully logged in");
    } catch (error) {
      console.error('Login error:', error);
      alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    }
  };

  return (
    <div id="Login">
      <Header />
      <img src="/img/logo.svg" alt="logo" />
      <h2>당신 근처의 마차</h2>
      <p>동네라서 가능한 모든 것<br/>지금 내 동네에서 카풀을 시작해 보세요</p>
      <form onSubmit={handleSubmit} id="form_login">
        <span>
          <label>이메일</label>
          <input
            type="text"
            placeholder="이메일을 입력해 주세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </span>
        <span>
          <label>비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호를 입력해 주세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </span>
        <span>
          <label className="check_remember">
            <input
              type="checkbox"
              className="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            아이디 저장
          </label>
        </span>
        <button type="submit" className="btn_login">로그인</button>
      </form>
      <Footer />
    </div>
  );
}
