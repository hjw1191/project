import './Chat.css'

export function InputField({ message, setMessage, sendMessage }) {
  return (
    <form onSubmit={sendMessage} id="inputArea">
      {/* <button className="btn_payment">결제</button> */}
      <input
        type="text"
        placeholder="메세지를 입력하세요"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        multiline={false}
        rows={1}
      />
      <button
        disabled={message === ""}
        type="submit"
        className="btn_sendChatting"
      >
        전송
      </button>
    </form>
  )
}