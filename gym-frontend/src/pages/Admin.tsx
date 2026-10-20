
import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { api } from "../api/client";
import type {
  User,
  Sport,
  Schedule,
  Registration,
  Payment,
} from "../types";

const days = [
  { value: "Monday", label: "Lundi" },
  { value: "Tuesday", label: "Mardi" },
  { value: "Wednesday", label: "Mercredi" },
  { value: "Thursday", label: "Jeudi" },
  { value: "Friday", label: "Vendredi" },
  { value: "Saturday", label: "Samedi" },
  { value: "Sunday", label: "Dimanche" },
];

const emptySport = {
  name: "",
  description: "",
  price: 0,
};

const emptySchedule = {
  sportId: 0,
  dayOfWeek: "",
  startTime: "",
  endTime: "",
  capacity: 10,
};

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [registrations, setRegistrations] =
    useState<Registration[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [sport, setSport] = useState({ ...emptySport });
  const [schedule, setSchedule] = useState({
    ...emptySchedule,
  });

  const [payment, setPayment] = useState({
    userId: 0,
    amount: 60,
    startDate: "",
    endDate: "",
  });

  const [editingSportId, setEditingSportId] =
    useState<number | null>(null);

  const [editingScheduleId, setEditingScheduleId] =
    useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [u, sp, sc, reg, pa] = await Promise.all([
        api.get<User[]>("/users"),
        api.get<Sport[]>("/sports"),
        api.get<Schedule[]>("/schedules"),
        api.get<Registration[]>("/registrations"),
        api.get<Payment[]>("/payments"),
      ]);

      setUsers(u.data);
      setSports(sp.data);
      setSchedules(sc.data);
      setRegistrations(reg.data);
      setPayments(pa.data);
    } catch (err) {
      console.error(err);
      showError(err, "Impossible de charger le dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function clearMessages() {
    setMessage("");
    setError("");
  }

  function showError(err: unknown, fallback: string) {
    console.error(err);

    if (!axios.isAxiosError(err)) {
      setError(fallback);
      return;
    }

    const status = err.response?.status;
    const data = err.response?.data;

    const details =
      typeof data === "string"
        ? data
        : JSON.stringify(data ?? {});

    if (status === 401) {
      setError("Session expirée. Reconnectez-vous.");
    } else if (status === 403) {
      setError("Accès refusé. Compte Admin requis.");
    } else {
      setError(
        `Erreur ${status ?? "réseau"} : ${details}`
      );
    }
  }

  function getUserName(userId: number) {
    const user = users.find((u) => u.id === userId);

    return user
      ? `${user.firstName} ${user.lastName}`
      : `Utilisateur #${userId}`;
  }

  function getScheduleName(scheduleId: number) {
    const schedule = schedules.find(
      (s) => s.id === scheduleId
    );

    return schedule
      ? `${schedule.sportName} - ${schedule.dayOfWeek}`
      : `Séance #${scheduleId}`;
  }

  function formatTime(time: string) {
    return time ? time.substring(0, 5) : "";
  }

  function timeForApi(time: string) {
    return time.length === 5 ? `${time}:00` : time;
  }

  function formatDate(date: string) {
    if (!date) return "Non disponible";

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
      ? "Non disponible"
      : parsed.toLocaleDateString("fr-CA");
  }

  // SPORTS
  async function saveSport(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearMessages();
    setSaving(true);

    try {
      if (editingSportId !== null) {
        await api.put(`/sports/${editingSportId}`, {
          id: editingSportId,
          ...sport,
        });

        setMessage("Sport modifié avec succès !");
      } else {
        await api.post("/sports", sport);
        setMessage("Sport ajouté avec succès !");
      }

      setEditingSportId(null);
      setSport({ ...emptySport });

      await load();
    } catch (err) {
      showError(err, "Impossible d'enregistrer le sport.");
    } finally {
      setSaving(false);
    }
  }

  function editSport(s: Sport) {
    clearMessages();

    setEditingSportId(s.id);
    setSport({
      name: s.name,
      description: s.description ?? "",
      price: s.price,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteSport(id: number) {
    if (!window.confirm("Supprimer ce sport ?")) return;

    clearMessages();

    try {
      await api.delete(`/sports/${id}`);
      setMessage("Sport supprimé avec succès !");
      await load();
    } catch (err) {
      showError(err, "Impossible de supprimer ce sport.");
    }
  }

  // SCHEDULES
  async function saveSchedule(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearMessages();

    if (
      schedule.sportId <= 0 ||
      !schedule.dayOfWeek ||
      !schedule.startTime ||
      !schedule.endTime
    ) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (schedule.startTime >= schedule.endTime) {
      setError(
        "L'heure de fin doit être après l'heure de début."
      );
      return;
    }

    if (schedule.capacity <= 0) {
      setError("La capacité doit être supérieure à zéro.");
      return;
    }

    const payload = {
      sportId: schedule.sportId,
      dayOfWeek: schedule.dayOfWeek,
      startTime: timeForApi(schedule.startTime),
      endTime: timeForApi(schedule.endTime),
      capacity: schedule.capacity,
    };

    setSaving(true);

    try {
      if (editingScheduleId !== null) {
        await api.put(
          `/schedules/${editingScheduleId}`,
          payload
        );

        setMessage("Séance modifiée avec succès !");
      } else {
        await api.post("/schedules", payload);
        setMessage("Séance ajoutée avec succès !");
      }

      setEditingScheduleId(null);
      setSchedule({ ...emptySchedule });

      await load();
    } catch (err) {
      showError(err, "Impossible d'enregistrer la séance.");
    } finally {
      setSaving(false);
    }
  }

  function editSchedule(s: Schedule) {
    clearMessages();

    setEditingScheduleId(s.id);
    setSchedule({
      sportId: s.sportId,
      dayOfWeek: s.dayOfWeek,
      startTime: formatTime(s.startTime),
      endTime: formatTime(s.endTime),
      capacity: s.capacity,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteSchedule(id: number) {
    if (!window.confirm("Supprimer cette séance ?")) return;

    clearMessages();

    try {
      await api.delete(`/schedules/${id}`);
      setMessage("Séance supprimée avec succès !");
      await load();
    } catch (err) {
      showError(err, "Impossible de supprimer cette séance.");
    }
  }

  // PAYMENTS
  async function createPayment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearMessages();

    if (payment.userId <= 0) {
      setError("Veuillez choisir un utilisateur.");
      return;
    }

    if (!payment.startDate || !payment.endDate) {
      setError("Veuillez choisir les dates.");
      return;
    }

    if (payment.endDate < payment.startDate) {
      setError("Date de fin invalide.");
      return;
    }

    setSaving(true);

    try {
      await api.post("/payments", {
        userId: payment.userId,
        amount: payment.amount,
        startDate: new Date(
          `${payment.startDate}T00:00:00`
        ).toISOString(),
        endDate: new Date(
          `${payment.endDate}T00:00:00`
        ).toISOString(),
      });

      setMessage("Paiement enregistré avec succès !");

      setPayment({
        userId: 0,
        amount: 60,
        startDate: "",
        endDate: "",
      });

      await load();
    } catch (err) {
      showError(err, "Impossible d'ajouter le paiement.");
    } finally {
      setSaving(false);
    }
  }

  async function markPaid(id: number) {
    clearMessages();

    try {
      await api.put(`/payments/${id}/status`, {
        status: "Paid",
      });

      setMessage("Paiement marqué comme payé !");
      await load();
    } catch (err) {
      showError(err, "Impossible de modifier le paiement.");
    }
  }

  return (
    <main className="section">
      <h1>Admin Dashboard</h1>
      <p>Gestion de votre salle de sport.</p>

      {message && (
        <p style={{ color: "#22c55e" }}>{message}</p>
      )}

      {error && (
        <p
          style={{
            color: "#f87171",
            overflowWrap: "anywhere",
          }}
        >
          {error}
        </p>
      )}

      {loading && <p>Chargement...</p>}

      {/* STATISTICS */}
      <div className="dashboard-stats">
        <div className="sport-card">
          <h3>Utilisateurs</h3>
          <strong>{users.length}</strong>
        </div>

        <div className="sport-card">
          <h3>Sports</h3>
          <strong>{sports.length}</strong>
        </div>

        <div className="sport-card">
          <h3>Séances</h3>
          <strong>{schedules.length}</strong>
        </div>

        <div className="sport-card">
          <h3>Inscriptions</h3>
          <strong>{registrations.length}</strong>
        </div>

        <div className="sport-card">
          <h3>Paiements</h3>
          <strong>{payments.length}</strong>
        </div>
      </div>

      {/* FORMS */}
      <div className="admin-grid">
        {/* SPORT FORM */}
        <form className="admin-form" onSubmit={saveSport}>
          <h2>
            {editingSportId !== null
              ? "Modifier un sport"
              : "Ajouter un sport"}
          </h2>

          <label>Nom du sport</label>
          <input
            value={sport.name}
            onChange={(e) =>
              setSport({
                ...sport,
                name: e.target.value,
              })
            }
            required
          />

          <label>Description</label>
          <textarea
            value={sport.description}
            onChange={(e) =>
              setSport({
                ...sport,
                description: e.target.value,
              })
            }
          />

          <label>Prix ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={sport.price}
            onChange={(e) =>
              setSport({
                ...sport,
                price: Number(e.target.value),
              })
            }
            required
          />

          <button type="submit" disabled={saving}>
            {editingSportId !== null
              ? "Enregistrer les modifications"
              : "Ajouter le sport"}
          </button>

          {editingSportId !== null && (
            <button
              type="button"
              className="small-button"
              onClick={() => {
                setEditingSportId(null);
                setSport({ ...emptySport });
              }}
            >
              Annuler la modification
            </button>
          )}
        </form>

        {/* SCHEDULE FORM */}
        <form className="admin-form" onSubmit={saveSchedule}>
          <h2>
            {editingScheduleId !== null
              ? "Modifier une séance"
              : "Ajouter une séance"}
          </h2>

          <label>Sport</label>
          <select
            value={schedule.sportId}
            onChange={(e) =>
              setSchedule({
                ...schedule,
                sportId: Number(e.target.value),
              })
            }
            required
          >
            <option value={0}>Choisir un sport</option>

            {sports.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <label>Jour</label>
          <select
            value={schedule.dayOfWeek}
            onChange={(e) =>
              setSchedule({
                ...schedule,
                dayOfWeek: e.target.value,
              })
            }
            required
          >
            <option value="">Choisir un jour</option>

            {days.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>

          <label>Heure de début</label>
          <input
            type="time"
            value={schedule.startTime}
            onChange={(e) =>
              setSchedule({
                ...schedule,
                startTime: e.target.value,
              })
            }
            required
          />

          <label>Heure de fin</label>
          <input
            type="time"
            value={schedule.endTime}
            onChange={(e) =>
              setSchedule({
                ...schedule,
                endTime: e.target.value,
              })
            }
            required
          />

          <label>Capacité</label>
          <input
            type="number"
            min="1"
            value={schedule.capacity}
            onChange={(e) =>
              setSchedule({
                ...schedule,
                capacity: Number(e.target.value),
              })
            }
            required
          />

          <button
            type="submit"
            disabled={saving || schedule.sportId === 0}
          >
            {editingScheduleId !== null
              ? "Enregistrer les modifications"
              : "Ajouter la séance"}
          </button>

          {editingScheduleId !== null && (
            <button
              type="button"
              className="small-button"
              onClick={() => {
                setEditingScheduleId(null);
                setSchedule({ ...emptySchedule });
              }}
            >
              Annuler la modification
            </button>
          )}
        </form>

        {/* PAYMENT FORM */}
        <form className="admin-form" onSubmit={createPayment}>
          <h2>Ajouter un paiement</h2>

          <label>Utilisateur</label>
          <select
            value={payment.userId}
            onChange={(e) =>
              setPayment({
                ...payment,
                userId: Number(e.target.value),
              })
            }
            required
          >
            <option value={0}>
              Choisir un utilisateur
            </option>

            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName} - {u.email}
              </option>
            ))}
          </select>

          <label>Montant ($)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={payment.amount}
            onChange={(e) =>
              setPayment({
                ...payment,
                amount: Number(e.target.value),
              })
            }
            required
          />

          <label>Date de début</label>
          <input
            type="date"
            value={payment.startDate}
            onChange={(e) =>
              setPayment({
                ...payment,
                startDate: e.target.value,
              })
            }
            required
          />

          <label>Date de fin</label>
          <input
            type="date"
            min={payment.startDate}
            value={payment.endDate}
            onChange={(e) =>
              setPayment({
                ...payment,
                endDate: e.target.value,
              })
            }
            required
          />

          <button type="submit" disabled={saving}>
            Enregistrer le paiement
          </button>
        </form>
      </div>

      {/* USERS */}
      <h2>Gestion des utilisateurs</h2>

      <div className="sports-grid">
        {users.map((u) => (
          <article className="sport-card" key={u.id}>
            <h3>{u.firstName} {u.lastName}</h3>
            <p>Email : {u.email}</p>
            <p>Rôle : {u.role}</p>
            <p>ID : {u.id}</p>
          </article>
        ))}
      </div>

      {/* SPORTS */}
      <h2>Gestion des sports</h2>

      <div className="sports-grid">
        {sports.map((s) => (
          <article className="sport-card" key={s.id}>
            <h3>{s.name}</h3>
            <p>{s.description}</p>
            <p>Prix : {s.price} $</p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="small-button"
                onClick={() => editSport(s)}
              >
                Modifier
              </button>

              <button
                className="small-button"
                onClick={() => deleteSport(s.id)}
              >
                Supprimer
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* SCHEDULES */}
      <h2>Gestion des séances</h2>

      <div className="sports-grid">
        {schedules.map((s) => (
          <article className="sport-card" key={s.id}>
            <h3>{s.sportName}</h3>
            <p>Jour : {s.dayOfWeek}</p>
            <p>
              Horaire : {formatTime(s.startTime)} -{" "}
              {formatTime(s.endTime)}
            </p>
            <p>Capacité : {s.capacity}</p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="small-button"
                onClick={() => editSchedule(s)}
              >
                Modifier
              </button>

              <button
                className="small-button"
                onClick={() => deleteSchedule(s.id)}
              >
                Supprimer
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* REGISTRATIONS */}
      <h2>Liste des inscriptions</h2>

      <div className="sports-grid">
        {registrations.map((r) => (
          <article className="sport-card" key={r.id}>
            <h3>Inscription #{r.id}</h3>
            <p>Utilisateur : {getUserName(r.userId)}</p>
            <p>Séance : {getScheduleName(r.scheduleId)}</p>
            <p>Statut : {r.status}</p>
            <p>
              Date : {formatDate(r.registrationDate)}
            </p>
          </article>
        ))}
      </div>

      {/* PAYMENTS */}
      <h2>Liste des paiements</h2>

      <div className="sports-grid">
        {payments.map((p) => (
          <article className="sport-card" key={p.id}>
            <h3>Paiement #{p.id}</h3>
            <p>Utilisateur : {getUserName(p.userId)}</p>
            <p>Montant : {p.amount} $</p>
            <p>Statut : {p.status}</p>

            {p.status !== "Paid" && (
              <button
                className="small-button"
                onClick={() => markPaid(p.id)}
              >
                Marquer payé
              </button>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
