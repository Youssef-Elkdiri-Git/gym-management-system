
import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../api/client";
import type { Registration, Schedule } from "../types";

export default function Registrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [regResponse, scheduleResponse] = await Promise.all([
          api.get<Registration[]>("/registrations"),
          api.get<Schedule[]>("/schedules"),
        ]);

        setRegistrations(regResponse.data);
        setSchedules(scheduleResponse.data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger vos inscriptions.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  function getSchedule(scheduleId: number) {
    return schedules.find((s) => s.id === scheduleId);
  }

  function formatTime(time: string) {
    return time ? time.substring(0, 5) : "--:--";
  }

  function formatDate(date: string) {
    if (!date) return "Non disponible";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Non disponible";
    }

    return parsed.toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  async function cancelRegistration(id: number) {
    const confirmed = window.confirm(
      "Voulez-vous vraiment annuler cette inscription ?"
    );

    if (!confirmed) return;

    setMessage("");
    setError("");
    setCancellingId(id);

    try {
      await api.delete(`/registrations/${id}`);

      setRegistrations((current) =>
        current.filter((registration) => registration.id !== id)
      );

      setMessage("Inscription annulée avec succès !");
    } catch (err) {
      console.error(err);

      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("Session expirée. Reconnectez-vous.");
      } else {
        setError("Impossible d'annuler cette inscription.");
      }
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <main className="section">
      <h1>Mes inscriptions</h1>
      <p>Consultez et gérez vos séances.</p>

      {message && (
        <p style={{ color: "#22c55e" }}>{message}</p>
      )}

      {error && (
        <p style={{ color: "#f87171" }}>{error}</p>
      )}

      {loading && <p>Chargement...</p>}

      {!loading && !error && registrations.length === 0 && (
        <p>Vous n'avez aucune inscription pour le moment.</p>
      )}

      <div className="sports-grid">
        {registrations.map((registration) => {
          const schedule = getSchedule(registration.scheduleId);

          return (
            <article
              className="sport-card"
              key={registration.id}
            >
              <h3>
                {schedule?.sportName ??
                  `Inscription #${registration.id}`}
              </h3>

              <p>
                Jour : {schedule?.dayOfWeek ?? "Non disponible"}
              </p>

              <p>
                Horaire :{" "}
                {schedule
                  ? `${formatTime(schedule.startTime)} - ${formatTime(
                      schedule.endTime
                    )}`
                  : "Non disponible"}
              </p>

              <p>Statut : {registration.status}</p>

              <p>
                Date d'inscription :{" "}
                {formatDate(registration.registrationDate)}
              </p>

              <button
                className="small-button"
                disabled={cancellingId === registration.id}
                onClick={() => cancelRegistration(registration.id)}
              >
                {cancellingId === registration.id
                  ? "Annulation..."
                  : "Annuler"}
              </button>
            </article>
          );
        })}
      </div>
    </main>
  );
}
