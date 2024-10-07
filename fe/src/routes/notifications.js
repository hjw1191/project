import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const notify = (message, type = 'info') => {
  toast[type](message, {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const setupNotifications = () => {
  // 알림 설정을 여기에 추가할 수 있습니다.
  // 예: toast.configure({ /* 설정 */ });
  console.log('알림 시스템이 설정되었습니다.');
};