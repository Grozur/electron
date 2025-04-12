import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VideoPlayer from "./VideoPlayer";
import UploadProgressBar from "../components/UploadProgress"
import { CloudUploadIcon, PencilIcon, TrashIcon, LinkIcon, CodeIcon, CogIcon, ArrowLeftIcon } from "@heroicons/react/solid";
const Dashboard = () => {
  const [videos, setVideos] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editVideoId, setEditVideoId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, []);

  // Fetch videos
  const fetchVideos = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ Nie zalogowany, przenoszenie na strone logowania!");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    try {
      const res = await fetch("/dartek-local/api/videos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        console.log("🔴 Unauthorized! Redirecting...");
        setMessage("❌ Sesja wygasła! Prosze zalogować się ponownie.");
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      const data = await res.json();
      setVideos(data);
    } catch (err) {
      console.error("⚠️ Error fetching videos:", err);
      setMessage("❌ Could not fetch videos. Try again later.");
    }
  };

  // Upload new video with progress tracking
  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage(null);
    setUploadProgress(0); // Reset progress
    setUploadSpeed(0); // Reset speed

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ Musisz być zalogowany by przesyłać filmy.");
      return;
    }

    const formData = new FormData();
    formData.append("video", file);
    formData.append("title", title);
    formData.append("description", description);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/dartek-local/api/videos/upload", true);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);

          const elapsedTime = event.timeStamp / 1000; // Convert ms to seconds
          const speed = (event.loaded / 1024 / 1024) / elapsedTime; // Speed in MB/s
          setUploadSpeed(speed.toFixed(2));
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 201) {
          setMessage("✅ Film przesłany pomyślnie!");
          setTitle("");
          setDescription("");
          setFile(null);
          setIsModalOpen(false);
          setUploadProgress(0); // Reset after completion
          fetchVideos();
          resolve();
        } else {
          const errorMsg = JSON.parse(xhr.responseText).msg || "Błąd przesyłu.";
          setMessage(`❌ ${errorMsg}`);
          reject();
        }
      };

      xhr.onerror = () => {
        setMessage("❌ Błąd przesyłu. Spróbuj ponownie.");
        reject();
      };

      xhr.send(formData);
    });
  };

  // Delete video
  const handleDelete = async (videoId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ Nie zalogowany!");
      return;
    }

    try {
      const res = await fetch(`/dartek-local/api/videos/${videoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete video.");

      setMessage("✅ Film usunięty pomyślnie!");
      fetchVideos();
    } catch (error) {
      console.error(error);
      setMessage("❌ Nie da się usunąć filmu.");
    }
  };

  // Open the edit modal with existing video info
  const openEditModal = (video) => {
    setEditVideoId(video._id);
    setEditTitle(video.title);
    setEditDescription(video.description);
    setIsEditModalOpen(true);
    setTimeout(() => setOpenMenuId(null), 100);
  };

  // Save changes (PUT request)
  const handleEditSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("❌ Nie zalogowany!");
      return;
    }
    
    try {
      const res = await fetch(`/dartek-local/api/videos/${editVideoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.msg || "Failed to update video.");
      }
      
      setMessage("✅ Film zaaktualizowany pomyśnie!");
      setIsEditModalOpen(false);
      fetchVideos();
    } catch (error) {
      console.error("Update Error:", error);
      setMessage(error.message);
    }
  };
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    // Check if the file is one of the allowed types
    const allowedTypes = ['audio/mp3', 'video/mp4', 'video/x-matroska', 'audio/wav'];
    if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
      alert("Użyj poprawnego formatu pliku (mp3, mp4, mkv, wav).");
      setFile(null); // Reset the file input
      return;
    }
    
    setFile(selectedFile); // If valid file, set it
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-4"> Twoje filmy.</h1>

      <button
        onClick={() => navigate("/")}
        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center mb-4"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
         Powrót do strony startowej
      </button>

      {message && <p className="text-yellow-400 text-sm mb-4">{message}</p>}

      {/* Upload Button (Opens Modal) */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg z-20 flex items-center justify-center"
      >
        <CloudUploadIcon className="w-6 h-6" />
        Prześlij!
      </button>

      {/* Upload Modal */}
{isModalOpen && (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20"
    onClick={() => setIsModalOpen(false)}
  >
    <div
      className="bg-gray-800 p-6 rounded-lg shadow-lg w-96"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-xl font-bold mb-4">Prześlij film.</h2>

      <form onSubmit={handleUpload}>
        {/* Title Input */}
        <input
          type="text"
          placeholder="Wprowadź tytuł filmu"
          className="p-2 w-full bg-gray-700 text-white rounded mt-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Description Input */}
        <textarea
          placeholder="Wprowadź opis filmu"
          className="p-2 w-full bg-gray-700 text-white rounded mt-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {/* Drag & Drop Upload */}
        <div
          className="w-full p-6 border-2 border-dashed border-blue-500 bg-gray-700 text-center text-blue-400 rounded-lg cursor-pointer hover:bg-gray-600 transition mt-2"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setFile(e.dataTransfer.files[0]);
          }}
          onClick={() => document.getElementById("fileInput").click()}
        >
          <p className="text-lg">
            {file ? file.name : "Select or drop files"}
          </p>
          <input
            id="fileInput"
            type="file"
            className="hidden"
            onChange={(e) => handleFileChange(e)}
            accept=".mp3, .mp4, .mkv, .wav"
            required
          />
        </div>

        {/* Upload Button */}
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 w-full mt-4 rounded"
        >
          Prześlij
        </button>
      </form>
      {/* Upload Progress Bar */}
      {uploadProgress > 0 && <UploadProgressBar progress={uploadProgress} speed={uploadSpeed} />}
    </div>
  </div>
)}


            

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-lg w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Edytuj film</h2>
            <form onSubmit={handleEditSave}>
              <input
                type="text"
                className="p-2 w-full bg-gray-700 text-white rounded mt-2"
                value={editTitle}
                placeholder="Wprowadź tytuł filmu"
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
              <textarea
                className="p-2 w-full bg-gray-700 text-white rounded mt-2"
                value={editDescription}
                placeholder="Wprowadź opis filmu"
                onChange={(e) => setEditDescription(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white p-2 w-full mt-4 rounded"
              >
                Zapisz zmiany
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Display Uploaded Videos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 w-full z-10">
        {videos.map((video) => (
          <div
            key={video._id}
            className="relative border p-4 bg-gray-800 rounded-lg shadow-lg"
          >
            {/* Gear Icon in corner */}
            <button
              onClick={() =>
                openMenuId === video._id ? setOpenMenuId(null) : setOpenMenuId(video._id)
              }
              className="absolute bottom-2 right-2 text-gray-400 hover:text-white focus:outline-none"
            >
              <CogIcon className="w-6 h-6" />
            </button>

            {/* Dropdown Menu */}
            {openMenuId === video._id && (
              <div
                className={`absolute top-8 right-2 bg-gray-700 text-white rounded shadow-lg p-2 z-10 
                ${openMenuId === video._id ? "block" : "hidden"}`}
              >
                <button
                  onClick={() => openEditModal(video)}
                  className="block w-full text-left px-2 py-1 hover:bg-gray-600 flex items-center justify-center"
                >
                  <PencilIcon className="w-5 h-5 mr-2" />
                  Edytuj
                </button>
                <button
                  onClick={() => handleDelete(video._id)}
                  className="block w-full text-left px-2 py-1 hover:bg-gray-600 flex items-center justify-center"
                >
                  <TrashIcon className="w-5 h-5 mr-2" />
                  Usuń
                </button>
                <button
                  onClick={() => {
                    const videoLink = `${window.location.origin}/dartek/${video._id}`;
                    navigator.clipboard.writeText(videoLink);
                    setMessage("✅ Link skopiowany do schowka!");
                    setOpenMenuId(null);
                  }}
                  className="block w-full text-left px-2 py-1 hover:bg-gray-600 flex items-center justify-center"
                >
                  <LinkIcon className="w-5 h-5 mr-2" />
                  Skopiuj link
                </button>
                <button
                  onClick={() => {
                    const videoLink = `${window.location.origin}${video.filePath}`;
                    navigator.clipboard.writeText(videoLink);
                    setMessage("✅ Link skopiowany do schowka!");
                    setOpenMenuId(null);
                  }}
                  className="block w-full text-left px-2 py-1 hover:bg-gray-600 flex items-center justify-center"
                >
                  <CodeIcon className="w-5 h-5 mr-2" />
                  Skopiuj link embedded
                </button>
                
              </div>
            )}

            <div className="video-wrapper">
              <VideoPlayer 
                src={video.filePath}
                playerConfig={{ controls: true }}
                sourceConfig={{ sourceTypes: ['mp4'] }}
              />
            </div>

            <p className="mt-2 font-bold">{video.title}</p>
            <p className="text-gray-400">{video.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
