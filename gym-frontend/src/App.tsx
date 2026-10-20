
import { Link, NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { User } from "./types";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Schedules from "./pages/Schedules";
import Registrations from "./pages/Registrations";
import Payments from "./pages/Payments";
import Admin from "./pages/Admin";

import "./App.css";

function getUser(): User | null {
  try {
    const raw = localStorage.getItem("gym_user");
    return raw ? JSON.parse(raw) as User : null;
  } catch {
    return null;
  }
}

function Protected({
  children,
  admin = false,
  user,
}: {
  children: React.ReactNode;
  admin?: boolean;
  user: User | null;
}) {
  if (!user || !localStorage.getItem("gym_token")) {
    return <Navigate to="/login" replace />;
  }

  if (admin && user.role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const [user, setUser] = useState<User | null>(getUser);
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("gym_token");
    localStorage.removeItem("gym_user");
    setUser(null);
    navigate("/login");
  }

  return (
    <div className="app">
      <header className="navbar">
        <Link to="/" className="brand">
          GYM<span>MANAGER</span>
        </Link>

        <nav>
          <NavLink to="/">Accueil</NavLink>
          <NavLink to="/schedules">Planning</NavLink>

          {user && (
            <>
              <NavLink to="/registrations">Inscriptions</NavLink>
              <NavLink to="/payments">Paiements</NavLink>
            </>
          )}

          {user?.role === "Admin" && (
            <NavLink to="/admin">Admin</NavLink>
          )}
        </nav>

        {user ? (
          <div className="nav-user">
            <span>{user.firstName}</span>
            <button onClick={logout}>Déconnexion</button>
          </div>
        ) : (
          <Link className="login-button" to="/login">
            Connexion
          </Link>
        )}
      </header>

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={<Login onLogin={setUser} />}
        />

        <Route path="/register" element={<Register />} />
        <Route path="/schedules" element={<Schedules />} />

        <Route
          path="/registrations"
          element={
            <Protected user={user}>
              <Registrations />
            </Protected>
          }
        />

        <Route
          path="/payments"
          element={
            <Protected user={user}>
              <Payments user={user!} />
            </Protected>
          }
        />

        <Route
          path="/admin"
          element={
            <Protected user={user} admin>
              <Admin />
            </Protected>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
