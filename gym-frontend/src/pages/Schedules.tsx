
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import type {
  Schedule,
  Sport,
  Registration,
} from "../types";

const days: Record<string, string> = {
  Monday: "Lundi",
  Tuesday: "Mardi",
  Wednesday: "Mercredi",
  Thursday: "Jeudi",
  Friday: "Vendredi",
  Saturday: "Samedi",
  Sunday: "Dimanche",
};

export default function Schedules() {
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [registrations, setRegistrations] =
    useState<Registration[]>([]);

  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] =
    useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isLoggedIn = Boolean(
    localStorage.getItem("gym_token")
  );

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [sc, sp] = await Promise.all([
        api.get<Schedule[]>("/schedules"),
        api.get<Sport[]>("/sports"),
      ]);

      setSchedules(sc.data);
      setSports(sp.data);

      if (isLoggedIn) {
        const reg = await api.get<Registration[]>(
          "/registrations"
        );

        setRegistrations(reg.data);
      } else {
        setRegistrations([]);
      }
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les séances.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function sportName(schedule: Schedule) {
    if (schedule.sportName) {
      return schedule.sportName;
    }

    const sport = sports.find(
      (s) => s.id === schedule.sportId
    );

    return sport?.name ?? `Sport #${schedule.sportId}`;
  }

  function formatTime(time: string) {
    return time ? time.substring(0, 5) : "--:--";
  }

  function formatDay(day: string) {
    return days[day] ?? day;
  }

  function isRegistered(scheduleId: number) {
    return registrations.some(
      (r) =>
        r.scheduleId === scheduleId &&
        r.status === "Active"
    );
  }

  async function register(scheduleId: number) {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    setMessage("");
    setError("");
    setSubmittingId(scheduleId);

    try {
      await api.post("/registrations", {
        scheduleId,
      });

      setMessage("Inscription réussie !");

      await load();
    } catch (err) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const data = err.response?.data;

        if (status === 401) {
          setError(
            "Session expirée. Veuillez vous reconnecter."
          );
        } else if (status === 409) {
          setError(
            typeof data === "string"
              ? data
              : "Vous êtes déjà inscrit ou la séance est complète."
          );
        } else {
          setError(
            "Inscription impossible. Veuillez réessayer."
          );
        }
      } else {
        setError("Une erreur est survenue.");
      }
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <main className="section">
      <h1>Planning des entraînements</h1>

      <p>Choisissez votre séance.</p>

      {message && (
        <p style={{ color: "#22c55e" }}>
          {message}
        </p>
      )}

      {error && (
        <p style={{ color: "#f87171" }}>
          {error}
        </p>
      )}

      {loading && <p>Chargement...</p>}

      <div className="sports-grid">
        {schedules.map((schedule) => {
          const registered = isRegistered(schedule.id);

          return (
            <article
              className="sport-card"
              key={schedule.id}
            >
              <h3>{sportName(schedule)}</h3>

              <p>
                Jour : {formatDay(schedule.dayOfWeek)}
              </p>

              <p>
                Horaire :{" "}
                {formatTime(schedule.startTime)} -{" "}
                {formatTime(schedule.endTime)}
              </p>

              <p>
                Capacité : {schedule.capacity}
              </p>

              <button
                className="small-button"
                disabled={
                  registered ||
                  submittingId === schedule.id
                }
                onClick={() => register(schedule.id)}
              >
                {submittingId === schedule.id
                  ? "Inscription..."
                  : registered
                  ? "Déjà inscrit"
                  : "S'inscrire"}
              </button>
            </article>
          );
        })}
      </div>

      {!loading && schedules.length === 0 && (
        <p>Aucune séance disponible pour le moment.</p>
      )}
    </main>
  );
}
