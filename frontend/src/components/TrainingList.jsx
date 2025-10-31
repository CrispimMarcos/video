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
  {trainings.map((treinamento) => (
    <div key={treinamento.id}>
      <h3>{treinamento.nome}</h3>
      {treinamento.turmas.map((turma) => (
        <div key={turma.id}>
          <h4>Turma: {turma.nome}</h4>
          <ul>
            {turma.recursos.map((r) =>
              canAccessResource(turma, r) ? (
                <li key={r.id}>
                  <ResourceViewer resource={r} />
                </li>
              ) : (
                <li key={r.id} style={{ color: "#888" }}>
                  🔒 Recurso indisponível até o início da turma
                </li>
              )
            )}
          </ul>
        </div>
      ))}
    </div>
  ))}
</div>

  );
};

export default TrainingList;
