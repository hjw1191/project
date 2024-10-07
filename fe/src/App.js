import "./global.css";
import "./font.css";
import "./App.css";
import { Landing } from "./routes/Landing";
import { Main } from "./routes/Main";
import { Guide } from "./routes/Guide";
import { Login } from "./routes/Login";
import { Signup } from "./routes/Signup";
import { Mypage } from "./routes/Mypage";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";

function App() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (userName) => {
    setUserName(userName);
    setIsLoggedIn(true);
    navigate("/main");
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/main" element={<Main />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
      </Routes>
    </div>
  );
}

export default App;
