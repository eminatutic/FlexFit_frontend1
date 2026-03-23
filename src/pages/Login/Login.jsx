import { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/useAppContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, user, isAdmin, isEmployee, isMember } = useAppContext();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Unesi email i lozinku.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("https://localhost:7127/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const token = await response.text();

      if (!response.ok) {
        setError(token || "Pogrešan email ili lozinka.");
        return;
      }

      if (!token) {
        setError("Token nije vraćen sa servera.");
        return;
      }

      login(token);

      // preusmerenje može i ovde, ali bolje po roli iz dekodiranog tokena u posebnom useEffect-u
      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      setError("Greška pri povezivanju sa serverom.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-orb orb-one"></div>
      <div className="login-bg-orb orb-two"></div>

      <div className="login-box">
        <p className="login-kicker">FlexFit Access</p>
        <h2>Prijava</h2>
        <p className="login-subtitle">
          Prijavi se na svoj nalog i nastavi sa korišćenjem sistema.
        </p>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Unesi email"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="input-group">
            <label>Lozinka</label>
            <input
              type="password"
              name="password"
              placeholder="Unesi lozinku"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn" disabled={isSubmitting}>
            {isSubmitting ? "Prijavljivanje..." : "Prijavi se"}
          </button>
        </form>

        <p className="login-footer-text">
          Nemaš nalog? <Link to="/registracija">Registruj se</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;