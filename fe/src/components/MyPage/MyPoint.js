import { useState, useEffect } from "react";
import axios from "../../api/axios.js";

export function MyPoint({ user }) {
  const [pointTransactions, setPointTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPointTransactions();
  }, [user]);

  const fetchPointTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/point/get/${user.id}`);
      if (response.data && Array.isArray(response.data.data)) {
        // Exclude password and keep only necessary user information
        const transactions = response.data.data.map(transaction => ({
          id: transaction.id,
          amount: transaction.amount,
          description: transaction.description,
          createdAt: transaction.createdAt,
          reservation: transaction.reservation,
          user: {
            id: transaction.user.id,
            email: transaction.user.email,
            name: transaction.user.name,
            gender: transaction.user.gender,
            point: transaction.user.point,
            role: transaction.user.role,
          }
        }));
        setPointTransactions(transactions);
      } else {
        throw new Error("서버에서 받은 데이터 구조가 예상과 다릅니다.");
      }
    } catch (error) {
      console.error("포인트 내역을 가져오는 데 실패했습니다:", error);
      setError(error.message || "데이터를 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTransaction = (transaction) => {
    const date = new Date(transaction.createdAt);
    const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const formattedTime = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

    let description;
    if (transaction.amount < 0) {
      const recipient = transaction.description.split(' ')[4];
      description = `${recipient} 님에게 ${Math.abs(transaction.amount)}원을 결제하셨습니다.`;
    } else {
      const sender = transaction.description.split(' ')[4];
      description = `${sender} 님으로부터 ${transaction.amount}원을 받으셨습니다.`;
    }

    return (
      <li key={transaction.id} className="pointHistory">
        <p>{description}</p>
        {transaction.reservation && (
          <p>{transaction.reservation.from}→{transaction.reservation.to}</p>
        )}
        <p>{formattedDate}<span>{formattedTime}</span></p>
      </li>
    );
  };
  
  return (
    <div id="MyPoint">
      <h2>내 포인트</h2>
      <div className="currentPoint">{user.point}</div>
      <h2>포인트 내역</h2>
      {isLoading && <p>로딩 중...</p>}
      {error && <p>{error}</p>}
      {pointTransactions.length === 0 && !isLoading && !error && (
        <div><p>포인트 내역이 없습니다</p></div>
      )}
      <ul>
        {pointTransactions.map(formatTransaction)}
      </ul>
    </div>
  );
}
