import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserIcon, LockClosedIcon, IdentificationIcon } from "@heroicons/react/outline"; // Add Heroicons import

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/dartek-local/api/auth/verify", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setMessage("✅ Jesteś już zalogowany");
            setTimeout(() => navigate("/"), 1500);
          } else {
            localStorage.removeItem("token");
          }
        })
        .catch(() => localStorage.removeItem("token"));
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(null);

    const res = await fetch("/dartek-local/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
      // Store the token and username in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username); // Store the username in localStorage

      setMessage("✅ Pomyślnie zalogowano.");
      setTimeout(() => navigate("/dashboard"), 1500);
    } else {
      setMessage("❌ Niepoprawne dane logowania.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <form className="bg-gray-800 p-6 shadow-lg rounded-lg w-80" onSubmit={handleLogin}>
        <h2 className="text-2xl font-bold mb-4 text-center flex items-center justify-center">
          <UserIcon className="h-6 w-6 text-white mr-2" /> Logowanie
        </h2>
        {message && <p className="text-yellow-400 text-sm text-center mb-4">{message}</p>}
        <div className="flex items-center">
        <IdentificationIcon className="h-5 w-5 text-white mr-2" />
        <input
          type="text"
          placeholder="Nazwa użytkownika"
          className="border p-2 w-full mb-2 bg-gray-700 text-white"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        </div>
        <div className="flex items-center mb-4">
          <LockClosedIcon className="h-5 w-5 text-white mr-2" /> {/* Key icon for password */}
          <input
            type="password"
            placeholder="Hasło"
            className="border p-2 w-full bg-gray-700 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 w-full rounded">
          Logowanie
        </button>
        <Link to="/" className="block text-center text-gray-400 mt-4 hover:underline">
          Powrót do strony startowej
        </Link>
      </form>
    </div>
  );
};

export default Login;
