import './ConfirmModal.css';


export function ConfirmModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal">
        <p>{message}</p>
        <div className="confirm-modal-buttons">
          <button onClick={onClose}>취소</button>
          <button onClick={onConfirm}>확인</button>
        </div>
      </div>
    </div>
  );
}