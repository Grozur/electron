import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserIcon, LockClosedIcon, IdentificationIcon } from "@heroicons/react/outline"; // Add Heroicons import

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage(null);

    const res = await fetch("/dartek-local/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      setMessage("✅ Rejestracja pomyślna, przenoszenie do strony logowania");
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setMessage("❌ Rejestracja niepomyślna, spróbuj ponownie");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <form className="bg-gray-800 p-6 shadow-lg rounded-lg w-80" onSubmit={handleRegister}>
        <h2 className="text-2xl font-bold mb-4 text-center flex items-center justify-center">
          <UserIcon className="h-6 w-6 text-white mr-2" /> Rejestracja
        </h2>
        {message && <p className="text-yellow-400 text-sm text-center">{message}</p>}
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
        <button className="bg-green-500 hover:bg-green-600 text-white p-2 w-full rounded">
          Rejestacja
        </button>
        <Link to="/" className="block text-center text-gray-400 mt-4 hover:underline">
          Powrót do strony startowej
        </Link>
      </form>
    </div>
  );
};

export default Register;
