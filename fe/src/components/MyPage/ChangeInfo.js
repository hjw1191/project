import React, { useState } from 'react';
import axios from "../../api/axios";


export function ChangeInfo({ user }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(''); // Add this line

    const displayGender = (gender) => {
      switch (gender) {
        case "MALE":
          return "남성";
        case "FEMALE":
          return "여성";
        default:
          return gender;
      }
    };

    const handlePasswordChange = async () => {
      if (password !== confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('인증 토큰이 없습니다. 다시 로그인해 주세요.');
        }
        
        const response = await axios.patch(`/users/update/${user.id}`, 
          { password },  
          { 
            headers: { 'Authorization': token } 
          }
        );

        if (response.status === 200) {
          setSuccess('비밀번호가 성공적으로 변경되었습니다.');
          setPassword('');
          setConfirmPassword('');
          setError('');
          
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          setError('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
        }
      } catch (error) {
        if (error.message === '인증 토큰이 없습니다. 다시 로그인해 주세요.') {
          setError(error.message);
        } else if (error.response && error.response.status === 401) {
          setError('인증에 실패했습니다. 다시 로그인해주세요.');
        } else {
          setError('서버 오류가 발생했습니다. 나중에 다시 시도해주세요.');
        }
        console.error('Error:', error);
      }
    };

    return (
      <div id="ChangeInfo">
        <h2>회원정보변경</h2>
        <div className="cont">
          <div className="wrap">
            <span>이름</span>
            <div>{user.name}</div>
          </div>
          <div className="wrap">
            <span>성별</span>
            <div>{displayGender(user.gender)}</div>
          </div>
          <div className="wrap">
            <span>이메일</span>
            <div>{user.email}</div>
          </div>
          <div className="wrap">
            <span>비밀번호</span>
            <input
              type="password"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="wrap">
            <span>비밀번호 확인</span>
            <input
              type="password"
              placeholder="******"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          <button className="btn_change" onClick={handlePasswordChange}>변경</button>
        </div>
      </div>
    );
}