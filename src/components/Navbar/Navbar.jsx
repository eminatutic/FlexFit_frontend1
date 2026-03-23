import "./Navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { removeAuthToken } from "../../services/api";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeAuthToken();
    navigate("/prijava");
  };

  return (
    <nav className="navbar">
      <h4 className="logo">FlexFit</h4>

      <div className="links">
        <NavLink to="/dashboard">Početna</NavLink>
        <NavLink to="/objekti">Objekti</NavLink>
        <NavLink to="/clanarina">Članarina</NavLink>
        <NavLink to="/kazne">Kazne</NavLink>
        <NavLink to="/redar">Redar</NavLink>
        <NavLink to="/admin">Admin</NavLink>
      </div>

      <button className="logout" onClick={handleLogout}>
        Odjava
      </button>
    </nav>
  );
};

export default Navbar;