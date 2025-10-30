import React from "react";

const ResourceViewer = ({ resource }) => {
  if (!resource) {
    return <p>Carregando recurso...</p>;
  }

  if (resource.tipo_recurso === "video") {
    return (
      <div style={{ marginBottom: "20px" }}>
        <h4>{resource.nome}</h4>
        <video width="480" controls>
          <source src={resource.url} type="video/mp4" />
          Seu navegador não suporta vídeo.
        </video>
        <div style={{ marginTop: "10px" }}>
          <a href={resource.url} download>
            ⬇️ Download do vídeo
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "20px" }}>
      <h4>{resource.nome}</h4>
      {resource.descricao && <p>{resource.descricao}</p>}
      <a href={resource.url} download>
        ⬇️ Download
      </a>
    </div>
  );
};

export default ResourceViewer;
