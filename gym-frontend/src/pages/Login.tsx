
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import type { User } from "../types";

type LoginResponse = {
  token: string;
  user: User;
};

export default function Login({
  onLogin,
}: {
  onLogin: (user: User) => void;
}) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("gym_token", res.data.token);
      localStorage.setItem(
        "gym_user",
        JSON.stringify(res.data.user)
      );

      onLogin(res.data.user);
      navigate(res.data.user.role === "Admin" ? "/admin" : "/");
    } catch {
      setError("Email ou mot de passe incorrect, ou serveur indisponible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Connexion</h1>
        <p>Connectez-vous à Gym Manager.</p>

        {error && <p className="error">{error}</p>}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <p>
          Pas encore de compte ?{" "}
          <Link to="/register">Créer un compte</Link>
        </p>
      </form>
    </div>
  );
}
