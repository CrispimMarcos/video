import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";
import AdminNavbar from "../components/AdminNavBar";

const TurmaDetalhe = () => {
  const { user } = useContext(AuthContext);
  const { id } = useParams();

  const [turma, setTurma] = useState(null);
  const [recursos, setRecursos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [erro, setErro] = useState("");
  const [formRecurso, setFormRecurso] = useState({
    nome: "",
    descricao: "",
    tipo_recurso: "video",
    arquivo: null,
  });
  const [alunosSelecionados, setAlunosSelecionados] = useState([]);

  const fetchTurma = async () => {
    try {
      const res = await api.get(`/turmas/${id}/detalhes/`);
      setTurma(res.data.turma);
      setRecursos(res.data.recursos);
    } catch (err) {
      console.error(err);
      setErro("Erro ao carregar turma.");
    }
  };

  const fetchAlunos = async () => {
    try {
      const res = await api.get("/alunos/");
      setAlunos(res.data);
    } catch (err) {
      console.error("Erro ao buscar alunos:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTurma();
      fetchAlunos();
    }
  }, [id, user]);

  if (!turma) return <p>Carregando...</p>;
  const isCriador = user && turma.criado_por === user.id;

  // ------------------- Funções -------------------

  const handleAddAlunos = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/turmas/${id}/editar/`, {
        alunos_ids: alunosSelecionados.map(Number),
      });
      alert("Alunos adicionados com sucesso!");
      fetchTurma();
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar alunos.");
    }
  };

  const handleAddRecurso = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("nome", formRecurso.nome);
      formData.append("descricao", formRecurso.descricao);
      formData.append("tipo_recurso", formRecurso.tipo_recurso);
      if (formRecurso.arquivo) formData.append("arquivo", formRecurso.arquivo);
      formData.append("turma", id);

      await api.post("/recursos/cadastro/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Recurso adicionado com sucesso!");
      setFormRecurso({
        nome: "",
        descricao: "",
        tipo_recurso: "video",
        arquivo: null,
      });
      fetchTurma();
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar recurso.");
    }
  };

  const handleSelectAlunos = (e) => {
    const selected = Array.from(e.target.selectedOptions, (opt) =>
      parseInt(opt.value)
    );
    setAlunosSelecionados(selected);
  };

  // ------------------- JSX -------------------

  return (
    <div className="container py-4">
      {user?.is_superuser && <AdminNavbar />}
      <h2 className="mb-3">📘 {turma.nome}</h2>
      <p>
        <b>Treinamento:</b> {turma.treinamento}
      </p>
      <p>
        <b>Período:</b> {turma.data_inicio} → {turma.data_conclusao}
      </p>

      {isCriador && (
        <>
          {/* --- Adicionar Alunos --- */}
          <div className="mt-5 mb-4">
            <h4>👥 Adicionar Alunos à Turma</h4>
            <form onSubmit={handleAddAlunos}>
              <select
                multiple
                className="form-select"
                value={alunosSelecionados}
                onChange={handleSelectAlunos}
                style={{ height: "200px" }}
              >
                {alunos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome} ({a.email})
                  </option>
                ))}
              </select>
              <small className="text-muted">
                Segure <b>Ctrl</b> (ou <b>Cmd</b>) para selecionar vários.
              </small>
              <div className="mt-3">
                <button type="submit" className="btn btn-primary">
                  ➕ Adicionar Alunos
                </button>
              </div>
            </form>
          </div>

          {/* --- Adicionar Recursos --- */}
          <div className="mt-5 mb-4">
            <h4>🧩 Adicionar Recurso</h4>
            <form onSubmit={handleAddRecurso} encType="multipart/form-data">
              <div className="row g-3">
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nome do Recurso"
                    value={formRecurso.nome}
                    onChange={(e) =>
                      setFormRecurso({ ...formRecurso, nome: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Descrição"
                    value={formRecurso.descricao}
                    onChange={(e) =>
                      setFormRecurso({
                        ...formRecurso,
                        descricao: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={formRecurso.tipo_recurso}
                    onChange={(e) =>
                      setFormRecurso({
                        ...formRecurso,
                        tipo_recurso: e.target.value,
                      })
                    }
                  >
                    <option value="video">Vídeo</option>
                    <option value="documento">Documento</option>
                    <option value="link">Link</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) =>
                      setFormRecurso({
                        ...formRecurso,
                        arquivo: e.target.files[0],
                      })
                    }
                  />
                </div>
              </div>
              <div className="mt-3">
                <button type="submit" className="btn btn-success">
                  💾 Adicionar Recurso
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* --- Recursos --- */}
      <h4>📚 Recursos da Turma</h4>
      {recursos.length === 0 ? (
        <p>Nenhum recurso disponível.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered mt-3">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Arquivo / Link</th>
              </tr>
            </thead>
            <tbody>
              {recursos.map((r) => (
                <tr key={r.id}>
                  <td>{r.nome}</td>
                  <td>{r.descricao}</td>
                  <td>{r.tipo_recurso}</td>
                  <td>
                    {r.arquivo ? (
                      <a
                        href={r.arquivo}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        📎 Abrir Arquivo
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TurmaDetalhe;
