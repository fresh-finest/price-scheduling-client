// src/api/refreshToken.js
import axios from "axios";
export const refreshAccessToken = async () => {
    console.log("freshing")
    try {
      const response = await axios.post('http://localhost:3000/api/auth/refresh-token', {}, { withCredentials: true });
      console.log("Access token refreshed:", response.data);
      // New access token is now set in cookies
    } catch (error) {
      console.error("Failed to refresh access token:", error);
      throw new Error("Refresh token failed");
    }
  };
  