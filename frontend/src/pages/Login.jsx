import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userLogged = await login(email, senha);
      console.log("Usuário logado:", userLogged);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setErro(err.message);
    }
  };


  return (
    <div style={{ maxWidth: 400, margin: "100px auto", textAlign: "center" }}>
      <h2>Acesso ao Portal do Aluno</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", margin: "10px 0", padding: "8px" }}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          style={{ width: "100%", margin: "10px 0", padding: "8px" }}
        />
        <button type="submit" style={{ width: "100%", padding: "8px" }}>
          Entrar
        </button>
        <button
          type="button"
          onClick={() => navigate("/register")}
          style={{ width: "100%", padding: "8px", marginTop: 10 }}
        >
          Registrar
        </button>
      </form>
      {erro && <p style={{ color: "red", marginTop: 10 }}>{erro}</p>}
    </div>
  );
};

export default Login;
