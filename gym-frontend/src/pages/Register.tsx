
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { api } from "../api/client";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function change(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError("Cet email est déjà utilisé.");
      } else {
        setError("Impossible de créer le compte.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Inscription</h1>
        <p>Créez votre compte Gym Manager.</p>

        {error && <p className="error">{error}</p>}

        <label>Prénom</label>
        <input
          value={form.firstName}
          onChange={(e) => change("firstName", e.target.value)}
          required
        />

        <label>Nom</label>
        <input
          value={form.lastName}
          onChange={(e) => change("lastName", e.target.value)}
          required
        />

        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => change("email", e.target.value)}
          required
        />

        <label>Téléphone</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => change("phone", e.target.value)}
        />

        <label>Mot de passe</label>
        <input
          type="password"
          minLength={8}
          value={form.password}
          onChange={(e) => change("password", e.target.value)}
          required
        />

        <button disabled={loading}>
          {loading ? "Création..." : "Créer mon compte"}
        </button>

        <p>
          Déjà inscrit ? <Link to="/login">Connexion</Link>
        </p>
      </form>
    </div>
  );
}
