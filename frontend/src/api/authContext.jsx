import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = {
      _id: localStorage.getItem("userId"),  // ✅ use _id for consistency
      name: localStorage.getItem("name"),
      role: localStorage.getItem("role"),
    };

    if (storedToken && storedUser._id) {
      setToken(storedToken);
      setUser(storedUser);
    }
  }, []);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};