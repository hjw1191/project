import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios.js";

export function Withdrawal() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleWithdrawal = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');

      // 사용자 정보 가져오기
      const response = await axios.get('/users/me', {
        headers: {
          Authorization: token
        }
      });

      const userId = response.data.data.id;

      await axios.delete(`/users/delete/${userId}`, {
        headers: {
          Authorization: token
        }
      });

      localStorage.removeItem('token');

      navigate('/', { replace: true });
      window.location.reload();

    } catch (err) {
      console.error(err);
      setError('계정 삭제에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div id="Withdrawal">
      <h2>회원탈퇴</h2>
      <div>
        <p>
          앗, 정말 탈퇴하시겠어요?
          <br />
          출퇴근길이 힘들어질지도 몰라요😥
        </p>
      </div>
      {error && <div className="error-message">{error}</div>}
      <button
        className="btn_confirm"
        onClick={handleWithdrawal}
        disabled={isDeleting}
      >
        {isDeleting ? '처리 중...' : '탈퇴'}
      </button>
    </div>
  );
}