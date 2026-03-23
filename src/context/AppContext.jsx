import React, { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AppContext = createContext();

function AppProvider({ children }) {
  const [authToken, setAuthToken] = useState(localStorage.getItem("authToken"));
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState(null);
  const [fullName, setFullName] = useState(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [isMember, setIsMember] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authToken) {
      clearUserState();
      setIsLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(authToken);
      setUser(decoded);

      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        logout();
        setIsLoading(false);
        return;
      }

      const roleClaim =
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        decoded.role;

      const roles = Array.isArray(roleClaim)
        ? roleClaim
        : roleClaim
        ? [roleClaim]
        : [];

      setIsAdmin(roles.includes("Admin"));
      setIsEmployee(roles.includes("Employee"));
      setIsMember(roles.includes("Member"));

      const id =
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        decoded.nameid ||
        decoded.sub ||
        null;

      const emailClaim =
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
        decoded.email ||
        null;

      const nameClaim =
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
        decoded.unique_name ||
        decoded.name ||
        null;

      setUserId(id);
      setEmail(emailClaim);
      setFullName(nameClaim);
    } catch (err) {
      console.log("Token decode error:", err.message);
      logout();
    }

    setIsLoading(false);
  }, [authToken]);

  function clearUserState() {
    setUser(null);
    setUserId(null);
    setEmail(null);
    setFullName(null);
    setIsAdmin(false);
    setIsEmployee(false);
    setIsMember(false);
  }

  function login(token) {
    localStorage.setItem("authToken", token);
    setAuthToken(token);
  }

  function logout() {
    localStorage.removeItem("authToken");
    setAuthToken(null);
    clearUserState();
  }

  return (
    <AppContext.Provider
      value={{
        authToken,
        user,
        userId,
        email,
        fullName,
        isAdmin,
        isEmployee,
        isMember,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export default AppProvider;