import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoginIcon, UserAddIcon, DesktopComputerIcon, LogoutIcon, DocumentTextIcon } from "@heroicons/react/outline";

const Home = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [changelog, setChangelog] = useState([]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showChangelogModal, setShowChangelogModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUpdated, setAvatarUpdated] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showDiscordLinkInput, setShowDiscordLinkInput] = useState(false);
  const [discordTag, setDiscordTag] = useState("");
  const [discordLinkMsg, setDiscordLinkMsg] = useState("");
  
  // Ref for avatar modal to detect clicks outside
  const avatarModalRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    if (token && username) {
      setIsLoggedIn(true);
      setUsername(username);
      fetchAvatar(username);
    }
  }, []);

  useEffect(() => {
    fetch("/dartek/front/src/components/webchangelog.json")
      .then((response) => response.json())
      .then((data) => setChangelog(data))
      .catch((error) => console.error("Error loading changelog:", error));
  }, []);

  const fetchAvatar = async (username) => {
    const res = await fetch(`/dartek-local/users/${username}/avatar.png`);
    if (res.ok) {
      const data = await res.blob();
      setAvatarPreview(URL.createObjectURL(data));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleAvatarChange = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const res = await fetch(`/dartek-local/api/user/${username}/avatar/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setAvatarPreview(data.avatarPath);
      setAvatarUpdated(true);
      setTimeout(() => setAvatarUpdated(false), 3000);
    } else {
      alert("Error uploading avatar.");
    }
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Close modal if clicked outside of it
  const handleClickOutside = (e) => {
    if (avatarModalRef.current && !avatarModalRef.current.contains(e.target)) {
      setShowAvatarModal(false);
    }
  };

  useEffect(() => {
    if (showAvatarModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAvatarModal]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white relative">
      
      {/* Top Bar with Logo */}
      <div className="absolute top-4 left-4 flex items-center space-x-4">
        <img src="https://stronasoxa.pl/dartek/front/src/img/logo.png" alt="Logo" className="h-24 w-24" />
      </div>

      {/* Avatar and User Options */}
      {isLoggedIn && (
        <div className="absolute top-4 right-4 flex items-center space-x-4">
          
          {/* Panel Button */}
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-200">Zalogowany jako: {username}</p>
            <Link
              to="/dashboard"
              className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md transition-all transform hover:scale-105 hover:bg-indigo-700 hover:shadow-xl"
            >
              <DesktopComputerIcon className="w-5 h-5 mr-2" /> Panel
            </Link>
          </div>

          {/* Avatar */}
          <img
            src={avatarPreview || "../img/avatar.png"}
            alt="User Avatar"
            className="h-16 w-16 rounded-full cursor-pointer"
            onClick={() => setShowAvatarMenu(!showAvatarMenu)}
          />

          {/* Avatar Menu */}
          {/* Avatar Menu */}
{showAvatarMenu && (
  <div className="absolute top-20 right-0 bg-gray-800 p-4 rounded-lg shadow-lg">
    <button
      className="text-white text-sm mb-2 w-full p-2 bg-indigo-600 rounded"
      onClick={() => setShowAvatarModal(true)}
    >
      Zmień awatar
    </button>
    <button
      className="text-white text-sm w-full p-2 bg-red-600 rounded flex items-center justify-center"
      onClick={handleLogout}
    >
      <LogoutIcon className="w-5 h-5 mr-2" /> {/* Logout Icon */}
      Wyloguj się {/* Text next to the icon */}
    </button>
  </div>
  
)}

          {/* Avatar Modal Menu */}
          {showAvatarModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div
                ref={avatarModalRef}
                className="bg-gray-800 p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-bold mb-4">Zmień awatar</h2>

                {/* Drag and Drop Area */}
                <div
                  className="w-full p-6 border-2 border-dashed border-blue-500 bg-gray-700 text-center text-blue-400 rounded-lg cursor-pointer hover:bg-gray-600 transition mt-2"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("fileInput").click()}
                >
                  <p className="text-lg">
                    {avatarFile ? avatarFile.name : "Wybierz lub upuść pliki"}
                  </p>
                  <input
                    id="fileInput"
                    type="file"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                    accept="image/*"
                    required
                  />
                </div>

                <button
                  className="text-white text-sm mt-2 bg-indigo-600 px-3 py-1 rounded"
                  onClick={handleAvatarChange}
                >
                  Zmień awatar
                </button>

                {/* Success Message */}
                {avatarUpdated && (
                  <p className="text-green-400 text-sm mt-2">Pomyslnie zmieniono awatar!</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center w-full mt-20">
        {!isLoggedIn && (
          <>
            <p className="text-lg mb-6">Zaloguj się lub zarejestruj, by przesyłać filmy.</p>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md transition-all transform hover:scale-105 hover:bg-indigo-700 hover:shadow-xl"
              >
                <LoginIcon className="w-5 h-5 mr-2" /> Logowanie
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md transition-all transform hover:scale-105 hover:bg-indigo-700 hover:shadow-xl"
              >
                <UserAddIcon className="w-5 h-5 mr-2" /> Rejestracja
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Changelog Button */}
      <button
        className="fixed bottom-4 right-4 flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md transition-all transform hover:scale-105 hover:bg-indigo-700 hover:shadow-xl"
        onClick={() => setShowChangelogModal(true)}
      >
        <DocumentTextIcon className="w-5 h-5 mr-2" /> Lista zmian
      </button>

      {/* Changelog Modal */}
      {showChangelogModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Lista zmian</h2>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
              onClick={() => setShowChangelogModal(false)}
            >
              ✖
            </button>
            {changelog.length > 0 ? (
              changelog.map((entry, index) => (
                <div key={index} className="mb-4 border-b border-gray-700 pb-2">
                  <p className="text-sm text-gray-400">{new Date(entry.timestamp).toLocaleString()}</p>
                  {entry.pros.length > 0 && (
                    <div>
                      <h3>✔ Zmiany:</h3>
                      <ul className="list-disc pl-4">
                        {entry.pros.map((pro, i) => <li className="text-green-400" key={i}>{pro}</li>)}
                        {entry.cons.map((con, i) => <li className="text-red-400" key={i}>{con}</li>)}
                      </ul>
                    </div>
                  )}
                  {entry.fixes.length > 0 && (
                    <div>
                      <h3>🔧 Poprawki:</h3>
                      <ul className="list-disc pl-4">
                        {entry.fixes.map((fix, i) => <li className="text-yellow-400" key={i}>{fix}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>Brak zmian.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
