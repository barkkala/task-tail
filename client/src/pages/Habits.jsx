import { useEffect, useState } from "react";
import { API_URL } from "../utils/api";

function getTodayGMT5Date() {
  const now = new Date();
  const gmt5Time = new Date(now.getTime() + 5 * 60 * 60 * 1000);
  const year = gmt5Time.getUTCFullYear();
  const month = String(gmt5Time.getUTCMonth() + 1).padStart(2, "0");
  const day = String(gmt5Time.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function countCompletedTasks(habits = [], snakePenalty = 0) {
  const completedTasks = habits.reduce((total, habit) => {
    const completedDates = habit.completedDates || {};
    const completedCount = Object.values(completedDates).filter(Boolean).length;

    return total + completedCount;
  }, 0);

  return Math.max(0, completedTasks - snakePenalty);
}

function getHoursLeft(createdAt) {
  if (!createdAt) {
    return 24;
  }

  const deadline = Number(createdAt) + 24 * 60 * 60 * 1000;
  const hoursLeft = Math.ceil((deadline - Date.now()) / (60 * 60 * 1000));

  return Math.max(0, hoursLeft);
}

export default function Habits({ user, onAddToken, onCompletedTasksChange }) {
  const [habits, setHabits] = useState([]);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [habitMessage, setHabitMessage] = useState("");
  const [loadingHabits, setLoadingHabits] = useState(true);

  const today = getTodayGMT5Date();

  function updateHabits(nextHabits, snakePenalty = 0, expiredCount = 0) {
    setHabits(nextHabits);

    if (onCompletedTasksChange) {
      onCompletedTasksChange(countCompletedTasks(nextHabits, snakePenalty));
    }

    if (expiredCount > 0) {
      setHabitMessage(
        `Просрочено задач: ${expiredCount}. Они удалены, а змея потеряла столько же делений.`
      );
    }
  }

  async function loadHabits() {
    setLoadingHabits(true);

    try {
      const response = await fetch(API_URL + `/api/habits/${user.login}`);
      const data = await response.json();

      if (data.success) {
        updateHabits(
          data.habits,
          data.snakePenalty || 0,
          data.expiredCount || 0
        );
      } else {
        setHabitMessage(data.message || "Не удалось загрузить привычки");
      }
    } catch (error) {
      console.error("Ошибка загрузки привычек: ", error);
      setHabitMessage("Ошибка соединения с сервером");
    } finally {
      setLoadingHabits(false);
    }
  }

  useEffect(() => {
    loadHabits();
  }, [user.login]);

  async function addHabit(event) {
    event.preventDefault();

    if (newHabitTitle.trim() === "") {
      setHabitMessage("Введите название привычки");
      return;
    }

    try {
      const response = await fetch(API_URL + "/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: user.login,
          title: newHabitTitle,
        }),
      });

      const data = await response.json();

      if (data.success) {
        updateHabits(
          data.habits,
          data.snakePenalty || 0,
          data.expiredCount || 0
        );
        setNewHabitTitle("");

        if (!data.expiredCount) {
          setHabitMessage("");
        }
      } else {
        setHabitMessage(data.message || "Не удалось добавить привычку");
      }
    } catch (error) {
      console.error("Ошибка добавления привычки: ", error);
      setHabitMessage("Ошибка соединения с сервером");
    }
  }

  async function completeHabit(habit) {
    if (isCompletedToday(habit)) {
      return;
    }

    try {
      const response = await fetch(API_URL + `/api/habits/${habit.id}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: user.login,
          date: today,
          completed: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        updateHabits(
          data.habits,
          data.snakePenalty || 0,
          data.expiredCount || 0
        );
        onAddToken();
      } else {
        setHabitMessage(data.message || "Не удалось отметить привычку");
      }
    } catch (error) {
      console.error("Ошибка отметки привычки: ", error);
      setHabitMessage("Ошибка соединения с сервером");
    }
  }

  function attachPhoto(habit, event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const response = await fetch(API_URL + `/api/habits/${habit.id}/photo`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            login: user.login,
            date: today,
            photo: reader.result,
          }),
        });

        const data = await response.json();

        if (data.success) {
          updateHabits(
            data.habits,
            data.snakePenalty || 0,
            data.expiredCount || 0
          );
        } else {
          setHabitMessage(data.message || "Не удалось прикрепить фото");
        }
      } catch (error) {
        console.error("Ошибка прикрепления фото: ", error);
        setHabitMessage("Ошибка соединения с сервером");
      }
    };

    reader.readAsDataURL(file);
  }

  async function deleteHabit(habit) {
    try {
      const response = await fetch(API_URL + `/api/habits/${habit.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: user.login,
        }),
      });

      const data = await response.json();

      if (data.success) {
        updateHabits(
          data.habits,
          data.snakePenalty || 0,
          data.expiredCount || 0
        );
      } else {
        setHabitMessage(data.message || "Не удалось удалить привычку");
      }
    } catch (error) {
      console.error("Ошибка удаления привычки: ", error);
      setHabitMessage("Ошибка соединения с сервером");
    }
  }

  function isCompletedToday(habit) {
    return Boolean(habit.completedDates?.[today]);
  }

  return (
    <div>
      <h1>Цели</h1>
      <p className="muted-text">
        Выполняйте задачи за 24 часа, собирайте токены и прокачивай змейку.
      </p>

      <section className="section-line">
        <h2>Мои задания</h2>

        <form className="habit-add-form" onSubmit={addHabit}>
          <input
            value={newHabitTitle}
            onChange={(event) => setNewHabitTitle(event.target.value)}
            placeholder="Название новой задачи"
          />
          <button type="submit">Добавить</button>
        </form>

        {habitMessage && <p className="error-text">{habitMessage}</p>}
        {loadingHabits && <p>Загрузка задач...</p>}

        <div className="habits-list">
          {habits.map((habit) => {
            const completedToday = isCompletedToday(habit);
            const photo = habit.photosByDate?.[today];
            const hoursLeft = getHoursLeft(habit.createdAt);

            return (
              <div
                className={`habit-item ${completedToday ? "habit-completed" : ""}`}
                key={habit.id}
              >
                <span className="habit-title">
                  {habit.title}
                  {!completedToday && (
                    <small className="muted-text"> Осталось: {hoursLeft} ч.</small>
                  )}
                </span>

                <div className="habit-actions">
                  <button
                    type="button"
                    className={`complete-button ${
                      completedToday ? "complete-button--disabled" : ""
                    }`}
                    onClick={() => completeHabit(habit)}
                    disabled={completedToday}
                    title={
                      completedToday
                        ? "Выполнено сегодня. Доступно завтра в 00:00 (GMT+5)"
                        : "Отметить как выполненное"
                    }
                  >
                    {completedToday ? "✓ Выполнено" : "Выполнено"}
                  </button>

                  <label className="photo-button">
                    Фото
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => attachPhoto(habit, event)}
                    />
                  </label>

                  <button
                    type="button"
                    className={`delete-button ${
                      completedToday ? "delete-button--disabled" : ""
                    }`}
                    onClick={() => deleteHabit(habit)}
                    disabled={completedToday}
                    title={
                      completedToday
                        ? "Нельзя удалить выполненную сегодня привычку"
                        : "Удалить привычку"
                    }
                  >
                    Удалить
                  </button>

                  {photo && (
                    <img
                      src={photo}
                      alt="Фото выполнения"
                      className="habit-photo"
                    />
                  )}
                </div>
              </div>
            );
          })}

          {!loadingHabits && habits.length === 0 && (
            <p className="muted-text">Пока нет задач. Добавьте первую.</p>
          )}
        </div>
      </section>
    </div>
  );
}