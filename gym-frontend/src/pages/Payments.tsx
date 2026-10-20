
import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Payment, User } from "../types";

export default function Payments({ user }: { user: User }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<Payment[]>("/payments")
      .then((res) => setPayments(res.data))
      .catch(() => setError("Impossible de charger les paiements."));
  }, []);

  const visible =
    user.role === "Admin"
      ? payments
      : payments.filter((p) => p.userId === user.id);

  return (
    <main className="section">
      <h1>Mes paiements</h1>
      <p>Consultez vos abonnements et leur statut.</p>

      {error && <p className="error">{error}</p>}

      <div className="sports-grid">
        {visible.map((payment) => (
          <article className="sport-card" key={payment.id}>
            <h3>Paiement #{payment.id}</h3>
            <p>Montant : {payment.amount} $</p>
            <p>Début : {payment.startDate?.slice(0, 10)}</p>
            <p>Fin : {payment.endDate?.slice(0, 10)}</p>
            <p>
              Statut :{" "}
              <strong>{payment.status}</strong>
            </p>
          </article>
        ))}
      </div>

      {visible.length === 0 && !error && (
        <p>Aucun paiement enregistré.</p>
      )}
    </main>
  );
}

