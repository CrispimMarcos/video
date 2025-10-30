import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import TrainingList from "../components/TrainingList";
import ResourceViewer from "../components/ResourceViewer";
import AdminNavbar from "../components/AdminNavBar";
const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Bem-vindo, {user?.nome}!</h2>
      {user?.is_superuser && (<AdminNavbar />)}
      {user?.is_superuser && (
        <span style={{ color: "white", background: "green", padding: "5px 10px", borderRadius: "8px" }}>
          Administrador
        </span>
      )}
      <TrainingList />
      <ResourceViewer />
    </div>
  );
};


export default Dashboard;
