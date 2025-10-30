import React, { useEffect, useState, useContext } from "react";
import axios from "../../api/api";
import AdminNavbar from "../../components/AdminNavBar";
import { AuthContext } from "../../context/AuthContext";

const Treinamentos = () => {
  const { user } = useContext(AuthContext);
  
  const [treinamentos, setTreinamentos] = useState([]);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
  });

  useEffect(() => {
    fetchTreinamentos();
  }, []);

  const fetchTreinamentos = async () => {
    try {
      const response = await axios.get("/treinamentos/");
      setTreinamentos(response.data);
    } catch (error) {
      console.error("Erro ao buscar treinamentos:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/treinamentos/cadastro/", formData);
      setFormData({ nome: "", descricao: "" });
      fetchTreinamentos();
    } catch (error) {
      console.error("Erro ao cadastrar treinamento:", error);
    }
  };

  return (
    <>
      <h2>{user?.nome}!</h2>

      <AdminNavbar />
      <div className="container">
        <h2 className="mb-4">Gerenciar Treinamentos</h2>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-3">
            <label className="form-label">Nome</label>
            <input
              type="text"
              className="form-control"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Descrição</label>
            <textarea
              className="form-control"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              required
            />
          </div>
          <button className="btn btn-primary">Cadastrar</button>
        </form>

        <h4>Treinamentos Cadastrados</h4>
        <ul className="list-group">
          {treinamentos.map((t) => (
            <li key={t.id} className="list-group-item">
              <strong>{t.nome}</strong> - {t.descricao}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Treinamentos;
