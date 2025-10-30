import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        const { data } = await axios.post("http://localhost:8000/api/token/refresh/", { refresh });
        localStorage.setItem("access", data.access);
        error.config.headers.Authorization = `Bearer ${data.access}`;
        return api.request(error.config); // tenta novamente
      }
    }
    return Promise.reject(error);
  }
);


export default api;
