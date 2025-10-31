// src/pages/admin/Turmas.js
import React, { useEffect, useState, useContext } from "react";
import api from "../../api/api";
import AdminNavbar from "../../components/AdminNavBar";
import { AuthContext } from "../../context/AuthContext";

const Turmas = () => {
  const { user } = useContext(AuthContext);

  const [turmas, setTurmas] = useState([]);
  const [treinamentos, setTreinamentos] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    treinamento: "",
    data_inicio: "",
    data_conclusao: "",
    alunos: [],
  });

  // 🔹 Buscar dados iniciais
  const fetchTurmas = async () => {
    const res = await api.get("/turmas/");
    setTurmas(res.data);
  };

  const fetchTreinamentos = async () => {
    const res = await api.get("/treinamentos/");
    setTreinamentos(res.data);
  };

  const fetchAlunos = async () => {
    const res = await api.get("/alunos/"); // <-- rota que lista alunos
    setAlunos(res.data);
  };

  useEffect(() => {
    fetchTreinamentos();
    fetchTurmas();
    fetchAlunos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/turmas/cadastro/", form);
      setForm({
        nome: "",
        treinamento: "",
        data_inicio: "",
        data_conclusao: "",
        alunos: [],
      });
      fetchTurmas();
    } catch (err) {
      console.error(err);
      alert("Erro ao criar turma!");
    }
  };

  // 🔹 Atualizar seleção de alunos
  const handleSelectAlunos = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (opt) =>
      parseInt(opt.value)
    );
    setForm({ ...form, alunos: selectedOptions });
  };

  return (
    <>
      <h2>{user?.nome}!</h2>
      <AdminNavbar />

      <div className="container py-4">
        <h2 className="mb-4">🏫 Cadastrar Turma</h2>

        <form onSubmit={handleSubmit} className="mb-5">
          <div className="row g-3">
            {/* Nome da turma */}
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Nome da Turma"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
            </div>

            {/* Treinamento */}
            <div className="col-md-3">
              <select
                className="form-select"
                value={form.treinamento}
                onChange={(e) =>
                  setForm({ ...form, treinamento: e.target.value })
                }
                required
              >
                <option value="">Selecione o Treinamento</option>
                {treinamentos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Datas */}
            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                value={form.data_inicio}
                onChange={(e) =>
                  setForm({ ...form, data_inicio: e.target.value })
                }
                required
              />
            </div>

            <div className="col-md-2">
              <input
                type="date"
                className="form-control"
                value={form.data_conclusao}
                onChange={(e) =>
                  setForm({ ...form, data_conclusao: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-2 d-grid">
              <button type="submit" className="btn btn-primary">
                Salvar
              </button>
            </div>
          </div>
          <div className="mt-4">
            <label className="form-label">Alunos</label>
            <select
              multiple
              className="form-select"
              value={form.alunos}
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
              Segure <b>Ctrl</b> (ou <b>Cmd</b> no Mac) para selecionar vários.
            </small>
          </div>
        </form>

        {/* Lista de turmas */}
        <h3>Lista de Turmas</h3>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Treinamento</th>
                <th>Alunos</th>
                <th>Data Início</th>
                <th>Data Fim</th>
              </tr>
            </thead>
            <tbody>
              {turmas.map((t) => (
                <tr key={t.id}>
                  <td>{t.nome}</td>
                  <td>
                    {treinamentos.find((tr) => tr.id === t.treinamento)?.nome ||
                      "—"}
                  </td>
                  <td>
                    {(t.alunos_matriculados || []).map((a) => (
                      <div key={a.id}>{a.nome}</div>
                    ))}
                  </td>
                  <td>{t.data_inicio}</td>
                  <td>{t.data_conclusao}</td>
                  <td>
                    <a href={`/turmas/${t.id}/detalhes`} className="btn btn-outline-primary btn-sm">
                      Ver Detalhes
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Turmas;
