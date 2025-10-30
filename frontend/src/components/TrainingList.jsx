import { useEffect, useState, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import dayjs from "dayjs";
import ResourceViewer from "./ResourceViewer";

const TrainingList = () => {
  const { user } = useContext(AuthContext);
  const [trainings, setTrainings] = useState([]);

  useEffect(() => {
    if (user) {
      api.get(`/alunos/${user.id}/treinamentos/`).then((res) => setTrainings(res.data));
    }
  }, [user]);

  const canAccessResource = (turma, recurso) => {
    const today = dayjs();
    const startDate = dayjs(turma.data_inicio);

    // Regra 2
    if (today.isBefore(startDate)) {
      return recurso.acesso_previo;
    }
    // Regra 3
    return !recurso.draft;
  };

  return (
    <div>
      <h2>Meus Treinamentos</h2>
      {trainings.map((t) => (
        <div key={t.id}>
          <h3>{t.treinamento.nome} - {t.nome}</h3>
          <ul>
            {t.recursos.map((r) => (
              canAccessResource(t, r) ? (
                <li key={r.id}>
                  <ResourceViewer resource={r} />
                </li>
              ) : (
                <li key={r.id} style={{ color: "#888" }}>
                  🔒 Recurso indisponível até o início da turma
                </li>
              )
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default TrainingList;
