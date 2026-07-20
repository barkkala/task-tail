import { useEffect, useState } from "react";
import { API_URL } from "../utils/api";

export default function Affirmations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAffirmations() {
      try {
        const response = await fetch(API_URL + "/api/affirmations");
        const data = await response.json();

        if (data.success) {
          setItems(data.affirmations);
        } else {
          setError(data.message || "Не удалось загрузить аффирмации");
        }
      } catch (error) {
        console.error("Ошибка загрузки аффирмаций: ", error);
        setError("Ошибка соединения с сервером");
      } finally {
        setLoading(false);
      }
    }

    loadAffirmations();
  }, []);

  return (
    <div>
      <h1>Аффирмации</h1>
      <p>Подборка обновляется каждый день.</p>

      {loading && <p>Загрузка...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="affirmations-list">
        {items.map((item, index) => (
          <div key={index} className="affirmation-card">
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}