import React, { useEffect, useState, useContext } from "react";
import AdminNavbar from "../../components/AdminNavBar";
import api from "../../api/api";
import { AuthContext } from "../../context/AuthContext";

const Recursos = () => {
  const { user } = useContext(AuthContext);
  const [recursos, setRecursos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    tipo_recurso: "video",
    url: "",
    turma: "",
    arquivo: null,
    acesso_previo: false,
    draft: false,
  });

  const fetchRecursos = async () => {
    try {
      const res = await api.get("/recursos/");
      setRecursos(res.data);
    } catch (error) {
      console.error("Erro ao buscar recursos:", error);
    }
  };

  const fetchTurmas = async () => {
    try {
      const res = await api.get("/turmas/");
      setTurmas(res.data);
    } catch (error) {
      console.error("Erro ao buscar turmas:", error);
    }
  };

  useEffect(() => {
    fetchTurmas();
    fetchRecursos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("tipo_recurso", form.tipo_recurso);
      formData.append("nome", form.nome);
      formData.append("descricao", form.descricao);
      formData.append("turma", form.turma);
      formData.append("acesso_previo", form.acesso_previo);
      formData.append("draft", form.draft);

      if (form.url) formData.append("url", form.url);
      if (form.arquivo) formData.append("arquivo", form.arquivo);

      await api.post("/recursos/cadastro/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm({
        nome: "",
        descricao: "",
        tipo_recurso: "video",
        url: "",
        turma: "",
        arquivo: null,
        acesso_previo: false,
        draft: false,
      });
      fetchRecursos();
    } catch (error) {
      console.error("Erro ao cadastrar recurso:", error);
    }
  };

  return (
    <>
      <h2>{user?.nome}!</h2>

      <AdminNavbar />
      <div className="container py-4">
        <h2 className="mb-4">📂 Cadastrar Recurso</h2>

        <form onSubmit={handleSubmit} className="mb-5">
          <div className="row g-3">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                required
              />
            </div>

            <div className="col-md-4">
              <textarea
                className="form-control"
                placeholder="Descrição"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                rows={1}
              />
            </div>

            <div className="col-md-2">
              <select
                className="form-select"
                value={form.tipo_recurso}
                onChange={(e) => setForm({ ...form, tipo_recurso: e.target.value })}
              >
                <option value="video">Vídeo</option>
                <option value="pdf">PDF</option>
                <option value="zip">ZIP</option>
                <option value="link">Link</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            {(form.tipo_recurso === "video" || form.tipo_recurso === "link") && (
              <div className="col-md-4">
                <input
                  type="url"
                  className="form-control"
                  placeholder="URL (ex: YouTube)"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                />
              </div>
            )}

            {form.tipo_recurso !== "link" && (
              <div className="col-md-4">
                <input
                  type="file"
                  className="form-control"
                  accept={
                    form.tipo_recurso === "video"
                      ? "video/*"
                      : form.tipo_recurso === "pdf"
                      ? "application/pdf"
                      : form.tipo_recurso === "zip"
                      ? ".zip"
                      : "*/*"
                  }
                  onChange={(e) =>
                    setForm({ ...form, arquivo: e.target.files[0] })
                  }
                />
              </div>
            )}

            <div className="col-md-3">
              <select
                className="form-select"
                value={form.turma}
                onChange={(e) => setForm({ ...form, turma: e.target.value })}
                required
              >
                <option value="">Selecione a Turma</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ Checkbox de Acesso Prévio */}
            <div className="col-md-2 form-check mt-2">
              <input
                type="checkbox"
                className="form-check-input"
                id="acessoPrevio"
                checked={form.acesso_previo}
                onChange={(e) =>
                  setForm({ ...form, acesso_previo: e.target.checked })
                }
              />
              <label htmlFor="acessoPrevio" className="form-check-label">
                Acesso Prévio
              </label>
            </div>

            {/* ✅ Checkbox de Rascunho (draft) */}
            <div className="col-md-2 form-check mt-2">
              <input
                type="checkbox"
                className="form-check-input"
                id="draft"
                checked={form.draft}
                onChange={(e) =>
                  setForm({ ...form, draft: e.target.checked })
                }
              />
              <label htmlFor="draft" className="form-check-label">
                Rascunho (Draft)
              </label>
            </div>

            <div className="col-md-2 d-grid">
              <button type="submit" className="btn btn-primary">
                Salvar
              </button>
            </div>
          </div>
        </form>

        <h3>📘 Recursos Cadastrados</h3>
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Tipo</th>
                <th>Pré-visualização</th>
                <th>Turma</th>
                <th>Acesso Prévio</th>
                <th>Draft</th>
              </tr>
            </thead>
            <tbody>
              {recursos.map((r) => (
                <tr key={r.id}>
                  <td>{r.nome}</td>
                  <td>{r.descricao || "—"}</td>
                  <td>{r.tipo_recurso}</td>
                  <td>
                    {r.tipo_recurso === "video" && r.arquivo ? (
                      <video width="220" height="140" controls src={r.arquivo} />
                    ) : r.tipo_recurso === "video" && r.url ? (
                      <div className="ratio ratio-16x9">
                        <iframe
                          src={r.url.replace("watch?v=", "embed/")}
                          title={r.nome}
                          allowFullScreen
                        ></iframe>
                      </div>
                    ) : r.tipo_recurso === "pdf" && r.arquivo ? (
                      <a href={r.arquivo} target="_blank" rel="noopener noreferrer">
                        📄 Abrir PDF
                      </a>
                    ) : r.tipo_recurso === "zip" && r.arquivo ? (
                      <a href={r.arquivo} download>
                        📦 Baixar ZIP
                      </a>
                    ) : r.tipo_recurso === "link" && r.url ? (
                      <a href={r.url} target="_blank" rel="noopener noreferrer">
                        🔗 Acessar Link
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{turmas.find((t) => t.id === r.turma)?.nome || "—"}</td>
                  <td>{r.acesso_previo ? "✅" : "❌"}</td>
                  <td>{r.draft ? "📝" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Recursos;
