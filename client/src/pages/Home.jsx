import { useEffect, useState } from "react";
import { API_URL } from "../utils/api";
import { affirmations } from "../utils/constants";
import { getUserName } from "../utils/helpers";

export default function Home({ user }) {
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState("");

  const dayIndex = new Date().getDate() % affirmations.length;
  const affirmation = affirmations[dayIndex];

  useEffect(() => {
    async function loadNews() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        const response = await fetch(API_URL + "/api/motivation-news", {
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Не удалось загрузить материалы");
        }

        setNews(data.news.slice(0, 3));
        setNewsError("");
      } catch (error) {
        console.error("Ошибка загрузки мотивационных материалов:", error);
        setNews([]);
        setNewsError(
          "Сейчас не удалось получить мотивационные материалы с сайтов. Попробуйте обновить страницу позже."
        );
      } finally {
        clearTimeout(timeoutId);
        setNewsLoading(false);
      }
    }

    loadNews();
  }, []);

  return (
    <div>
      <h1 className="pixelfont">TaskTail</h1>
      <p>Добро пожаловать, {getUserName(user)}! Сделай продуктивность игрой.</p>

      <section className="strict-block">
        <h2>Совет дня</h2>
        <p className="big-text">{affirmation}</p>
      </section>

      <section className="motivation-news-section">
        <div className="motivation-news-heading">
          <h2>Мотивационные материалы дня</h2>
          {newsLoading && <span>Загрузка с сайтов...</span>}
        </div>

        {newsError && !newsLoading && (
          <p className="motivation-news-error">{newsError}</p>
        )}

        {!newsError && !newsLoading && (
          <div className="motivation-news-grid">
            {news.map((item, index) => (
              <a
                className="motivation-news-card"
                href={item.url}
                target="_blank"
                rel="noreferrer"
                key={`${item.title}-${index}`}
              >
                <div className="motivation-news-top">
                  <span>{item.source}</span>
                  <span className="motivation-news-bookmark">⌑</span>
                </div>

                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </a>
            ))}
          </div>
        )}
      </section>

      <style>{`
        .motivation-news-section {
          margin-top: 34px;
        }

        .motivation-news-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .motivation-news-heading h2 {
          margin: 0;
          color: var(--heading-soft);
        }

        .motivation-news-heading span {
          color: var(--text-muted);
          font-size: 14px;
        }

        .motivation-news-error {
          margin: 0;
          padding: 20px 22px;
          color: var(--text-main);
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 8px;
        }

        .motivation-news-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .motivation-news-card {
          min-height: 310px;
          padding: 24px 26px;
          display: flex;
          flex-direction: column;
          gap: 22px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-main);
          text-decoration: none;
          box-shadow: 0 10px 30px rgba(31, 77, 54, 0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .motivation-news-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 36px rgba(31, 77, 54, 0.14);
          text-shadow: none;
        }

        .motivation-news-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          color: #6aa5ff;
          font-weight: 700;
        }

        .motivation-news-bookmark {
          color: var(--text-muted);
          font-size: 28px;
          line-height: 1;
        }

        .motivation-news-card h3 {
          margin: 0;
          color: var(--text-strong);
          font-size: 26px;
          line-height: 1.2;
          font-family: Georgia, "Times New Roman", serif;
          text-shadow: none;
        }

        .motivation-news-card p {
          margin: 0;
          color: var(--text-main);
          font-size: 17px;
          line-height: 1.65;
        }

        .theme-dark .motivation-news-card {
          background: rgba(8, 31, 22, 0.88);
          border-color: var(--border);
        }

        .theme-dark .motivation-news-card h3,
        .theme-dark .motivation-news-card p,
        .theme-dark .motivation-news-error {
          color: var(--text-main);
        }

        @media (max-width: 1050px) {
          .motivation-news-grid {
            grid-template-columns: 1fr;
          }

          .motivation-news-card {
            min-height: auto;
          }
        }
      `}</style>
    </div>
  );
}