
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dumbbell, CalendarDays, CreditCard } from "lucide-react";
import { api } from "../api/client";
import type { Sport } from "../types";

export default function Home() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<Sport[]>("/sports")
      .then((res) => setSports(res.data))
      .catch(() => setError("Impossible de charger les sports."));
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">VOTRE ESPACE FITNESS</p>
          <h1>
            Dépassez vos <span>limites.</span>
          </h1>
          <p>
            Découvrez nos activités, consultez les horaires
            et gérez vos inscriptions.
          </p>
          <Link className="primary-button" to="/schedules">
            Découvrir le planning
          </Link>
        </div>
        <Dumbbell size={130} strokeWidth={1} />
      </section>

      <section className="section">
        <h2>Nos activités</h2>
        <p>Choisissez le sport qui vous correspond.</p>

        {error && <p className="error">{error}</p>}

        <div className="sports-grid">
          {sports.map((sport) => (
            <article className="sport-card" key={sport.id}>
              <Dumbbell size={32} />
              <h3>{sport.name}</h3>
              <p>{sport.description}</p>
              <div className="sport-footer">
                <strong>{sport.price} $</strong>
                <Link className="small-button" to="/schedules">
                  Voir les horaires
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="features">
        <div>
          <CalendarDays size={32} />
          <h3>Planning flexible</h3>
          <p>Consultez les horaires des entraînements.</p>
        </div>
        <div>
          <CreditCard size={32} />
          <h3>Suivi des paiements</h3>
          <p>Retrouvez vos abonnements facilement.</p>
        </div>
      </section>
    </main>
  );
}
