import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { postLogin } from "../api";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const form = new FormData();
    form.append("username", username);
    form.append("password", password);

    const res = await postLogin(form);

    setPassword("");

    if (res.status >= 400) {
      alert("incorrect username/password");
      return;
    }

    setUsername("");

    navigate("/admin");
  };

  return (
    <div>
      <h1>Login</h1>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />
      <button onClick={login}>Log in</button>
    </div>
  );
};
