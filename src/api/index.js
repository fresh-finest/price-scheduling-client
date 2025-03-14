import axios from "axios";

// const BASE_URL = `https://api.priceobo.com`
// const BASE_URL = `http://localhost:3000`;
const BASE_URL = "http://192.168.0.26:3000";
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
export default apiClient;
