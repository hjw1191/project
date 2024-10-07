import './Chat.css'
import socket from "../../server"
import { InputField } from './Chat_InputField'
import { MessageContainer } from "./Chat_MessageContainer";
import { useState, useEffect } from "react"

export function Chat(postId) {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // console.log(postId.postId)

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      socket.emit("login", token, (res) => {
        if (res?.ok) {
          setUser(res.data);
          socket.emit("join_room", { roomId: postId.postId });
        } else {
          setError(res.error || "로그인에 실패했습니다.");
          console.error("로그인 실패:", res.error);
        }
        setIsLoading(false);
      });
    } else {
      setError("토큰이 없습니다. 다시 로그인해주세요.");
      setIsLoading(false);
    }
    const messageHandler = (message) => {
      setMessageList((prevState) => [...prevState, message]);
    };
    socket.on('receive_message', messageHandler);
    return () => {
      socket.off('receive_message', messageHandler);
    };
  }, [messageList]);

  const sendMessage = (event) => {
    event.preventDefault()
    if (message.trim() && user) {
      socket.emit("send_message", { chat: message, roomId: postId.postId }, (res) => {
        if (res.ok) {
          setMessage('');
        } else {
          console.error("메시지 전송 실패:", res.error);
          alert("메시지 전송에 실패했습니다: " + res.error);
        }
      })
    }
  }

  if (isLoading) {
    return <div className="Chat-loading">로딩 중...</div>;
  }

  if (error) {
    return <div className="Chat-error">{error}</div>;
  }

  if (!user) {
    return <div className="Chat-unauthorized">인증에 실패했습니다. 다시 로그인해주세요.</div>;
  }

  return (
    <div id="Chat">
      <h2>환영합니다. {user.name}님!</h2>
      <MessageContainer messageList={messageList} user={user} postId={postId.postId} />
      <InputField
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
      />
    </div>
  );
}