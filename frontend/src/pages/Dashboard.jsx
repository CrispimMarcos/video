import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import TrainingList from "../components/TrainingList";
import ResourceViewer from "../components/ResourceViewer";
import AdminNavbar from "../components/AdminNavBar";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [turmas, setTurmas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchTurmas = async () => {
      try {
        const res = await api.get(`/turmas/usuario/${user.id}/`);
        setTurmas(res.data);
      } catch (err) {
        console.error("Erro ao carregar turmas do usuário:", err);
      }
    };

    fetchTurmas();
  }, [user]);

  const acessarTurma = (id) => {
    navigate(`/turmas/${id}/detalhes`); // ✅ Redireciona para a página da turma
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Bem-vindo, {user?.nome}!</h2>

      {user?.is_superuser && <AdminNavbar />}
      {user?.is_superuser && (
        <span
          style={{
            color: "white",
            background: "green",
            padding: "5px 10px",
            borderRadius: "8px",
          }}
        >
          Administrador
        </span>
      )}

      {/* 🔹 Lista de Turmas do Usuário */}
      <div className="mt-4">
        <h3>🎓 Minhas Turmas</h3>
        {turmas.length === 0 ? (
          <p>Você ainda não está matriculado em nenhuma turma.</p>
        ) : (
          <div className="table-responsive mt-3">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Treinamento</th>
                  <th>Data Início</th>
                  <th>Data Conclusão</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {turmas.map((t) => (
                  <tr key={t.id}>
                    <td>{t.nome}</td>
                    <td>{t.treinamento_nome || "—"}</td>
                    <td>{t.data_inicio}</td>
                    <td>{t.data_conclusao}</td>
                    <td>
                      <button
                        onClick={() => acessarTurma(t.id)}
                        className="btn btn-primary btn-sm"
                      >
                        Acessar Turma
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🔹 Seções extras */}
      <div className="mt-5">
        <TrainingList />
        <ResourceViewer />
      </div>
    </div>
  );
};

export default Dashboard;
