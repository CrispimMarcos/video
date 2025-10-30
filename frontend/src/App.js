import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Treinamentos from "./pages/admin/Treinamentos";
import Turmas from "./pages/admin/Turmas";
import Recursos from "./pages/admin/Recursos";

// Rota protegida
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/admin/treinamentos" element={<Treinamentos />} />
      <Route path="/admin/turmas" element={<Turmas />} />
      <Route path="/admin/recursos" element={<Recursos />} />
    </Routes>
  );
}

export default App;
