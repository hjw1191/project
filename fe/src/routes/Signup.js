import './Login.css';
import { Header } from "../components/Header";
import { Footer } from "../components/Footer"
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "../api/axios.js"


export function Signup({ onLogin }) {

  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userMail, setUserMail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [userGender, setUserGender] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      const signupResponse = await axios.post('/users/signup', {
        name: userName,
        email: userMail,
        password,
        gender: userGender,
      });

      if (signupResponse.status !== 201) {
        throw new Error('회원가입에 실패했습니다.');
      }

      const loginResponse = await axios.post('/users/signin', {
        email: userMail,
        password
      });

      const token = loginResponse.headers['authorization'];
      
      if (token) {
        localStorage.setItem('token', token);
        const userResponse = await axios.get('/users/me', {
          headers: { Authorization: token }
        });
        const loggedInUserName = userResponse.data.data.name;
        onLogin(loggedInUserName);
        alert('회원가입 및 로그인 성공!');
        navigate('/main');
      } else {
        throw new Error('로그인 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error(err);
      if (err.response) {
        alert(`오류: ${err.response.data.message || '알 수 없는 오류가 발생했습니다.'}`);
      } else if (err.request) {
        alert('서버와의 통신에 실패했습니다. 네트워크 연결을 확인해주세요.');
      } else {
        alert(err.message || '회원가입 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div id="Login">
      <Header />
      <img src="/img/logo.svg" alt="logo" />
      <h2>당신 근처의 마차</h2>
      <p>동네라서 가능한 모든 것<br/>지금 내 동네에서 카풀을 시작해 보세요</p>
      <form onSubmit={handleSubmit} id="form_signup">
        <span>
          <label>이름</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="이름을 입력해 주세요"
            required
          />
        </span>
        <span>
          <label>이메일</label>
          <input
            type="email"
            value={userMail}
            onChange={(e) => setUserMail(e.target.value)}
            placeholder="이메일을 입력해 주세요"
            required
          />
        </span>
        <span>
          <label>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력해 주세요"
            required
          />
        </span>
        <span>
          <label>비밀번호</label>
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            placeholder="비밀번호를 확인해 주세요"
            required
          />
        </span>
        <div>
          <label>성별</label>
          <span>
            <label htmlFor="man" id="label-man" className={userGender === 'MALE' ? 'selected' : ''}>
              <input 
                type="radio" 
                id="man" 
                name="gender" 
                value="MALE"
                onChange={(e) => setUserGender(e.target.value)}
              />
              남성
            </label>
            <label htmlFor="woman" id="label-woman" className={userGender === 'FEMALE' ? 'selected' : ''}>
              <input
                type="radio"
                id="woman"
                name="gender"
                value="FEMALE"
                onChange={(e) => setUserGender(e.target.value)}
              />
              여성
            </label>
          </span>
        </div>
        <button type="submit" className='btn_signup'>회원가입</button>
      </form>
      <Footer />
    </div>
  );
}
