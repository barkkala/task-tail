import { useState } from "react";
import { API_URL } from "../utils/api";

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendForgotPassword(event) {
    event.preventDefault();
    setLoading(true);
    setResult("");

    try {
      const response = await fetch(API_URL + "/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: forgotMessage }),
      });

      const data = await response.json();

      setResult(data.message || "Сообщение отправлено");
      setForgotMessage("");
    } catch (error) {
      console.error("Ошибка: ", error);
      setResult("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  }

  async function sendAuth(event) {
    event.preventDefault();
    setLoading(true);
    setResult("");

    const url = mode === "login"
      ? API_URL + "/api/login"
      : API_URL + "/api/register";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      const data = await response.json();

      if (data.success) {
        onLogin(
          data.user,
          mode === "register"
            ? "Вы успешно зарегистрировались!"
            : "Вы успешно вошли!"
        );
      } else {
        setResult(data.message || "Ошибка");
      }
    } catch (error) {
      console.error("Ошибка: ", error);
      setResult("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  }

  if (showForgotPassword) {
    return (
      <main className="auth-page">
        <section className="auth-card forgot-password-card">
          <h1>Забыли пароль?</h1>

          <form className="inline-form" onSubmit={sendForgotPassword}>
            <input
              value={forgotMessage}
              onChange={(event) => setForgotMessage(event.target.value)}
              placeholder="Введите сообщение"
              disabled={loading}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Отправка..." : "Отправить"}
            </button>
          </form>

          <button
            type="button"
            className="forgot-back-button"
            onClick={() => {
              setShowForgotPassword(false);
              setResult("");
            }}
          >
            Назад ко входу
          </button>

          {result && <p className="auth-message">{result}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>{mode === "login" ? "Вход" : "Регистрация"}</h1>

        <div className="auth-switch">
          <button
            type="button"
            className={mode === "login" ? "auth-mode-active" : ""}
            onClick={() => setMode("login")}
          >
            Вход
          </button>

          <button
            type="button"
            className={mode === "register" ? "auth-mode-active" : ""}
            onClick={() => setMode("register")}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={sendAuth}>
          <input
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            placeholder="Введите логин"
            disabled={loading}
          />

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Введите пароль"
            disabled={loading}
          />

          <div className="auth-bottom-row">
            <button type="submit" disabled={loading}>
              {loading
                ? "Подождите..."
                : mode === "login"
                  ? "Войти"
                  : "Зарегистрироваться"}
            </button>

            {mode === "login" && (
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => {
                  setShowForgotPassword(true);
                  setResult("");
                }}
              >
                Связаться с поддержкой
              </button>
            )}
          </div>
        </form>

        {result && <p className="auth-message">{result}</p>}
      </section>
    </main>
  );
}