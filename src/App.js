import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Poll from "./Poll";

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/poll"
          element={token ? <Poll /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
