import axios from "axios";
import jwtDecode from "jwt-decode";

// Get a valid access token, refreshing if needed
export const getAccessToken = async () => {
  let token = localStorage.getItem("accessToken");

  try {
    // Try verifying token with a dummy request
    await axios.get("http://localhost:5000/health", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return token;
  } catch {
    // If failed, try refreshing
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    try {
      const res = await axios.post("http://localhost:5000/auth/refresh", {
        refreshToken,
      });
      const newToken = res.data.accessToken;
      localStorage.setItem("accessToken", newToken);
      return newToken;
    } catch {
      return null;
    }
  }
};

// Get time remaining before access token expires (in ms)
export const getTokenExpiryTime = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    const expiry = decoded.exp * 1000; // convert to ms
    return expiry - Date.now(); // time remaining
  } catch {
    return null;
  }
};

// Optional: Auto-logout after token expires
export const scheduleAutoLogout = (callback) => {
  const timeLeft = getTokenExpiryTime();
  if (timeLeft && timeLeft > 0) {
    setTimeout(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      callback(); // e.g., navigate("/admin-login")
    }, timeLeft);
  }
};
