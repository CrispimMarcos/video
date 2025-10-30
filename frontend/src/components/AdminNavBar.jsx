// src/components/AdminNavbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminNavbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/dashboard">
          Painel Admin
        </Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/admin/treinamentos">
                Treinamentos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/turmas">
                Turmas
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/recursos">
                Recursos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Sair
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
