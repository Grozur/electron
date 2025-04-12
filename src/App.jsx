import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SingleVideo from "./pages/SingleVideo";

function App() {
  return (
    <Router basename="/dartek">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* The new route for a single video */}
        <Route path="/:videoId" element={<SingleVideo />} />
      </Routes>
    </Router>
  );
}

export default App;
