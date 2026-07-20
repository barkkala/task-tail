import { useEffect, useState } from "react";
import { API_URL } from "./utils/api";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import Notification from "./components/Notification";
import TopBar from "./components/TopBar";
import Sidebar from "./components/SideBar";
import Snakey from "./components/Snakey";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import Habits from "./pages/Habits";
import About from "./pages/About";
import Feedback from "./pages/Feedback";
import SnakeEditor from "./pages/SnakeEditor";
import Affirmations from "./pages/Affirmations";
import Profile from "./pages/Profile";
import Footer from "./pages/Footer";

function countCompletedTasks(habits = [], snakePenalty = 0) {
  const completedTasks = habits.reduce((total, habit) => {
    const completedDates = habit.completedDates || {};
    const completedCount = Object.values(completedDates).filter(Boolean).length;

    return total + completedCount;
  }, 0);

  return Math.max(0, completedTasks - snakePenalty);
}

function getTokensKey(login) {
  return `habit_tokens_${login}`;
}

function getSnakeLegsKey(login) {
  return `snake_legs_style_${login}`;
}

function getOwnedSnakeLegsKey(login) {
  return `snake_legs_owned_${login}`;
}

function getSnakeHeadKey(login) {
  return `snake_head_style_${login}`;
}

function getOwnedSnakeHeadsKey(login) {
  return `snake_heads_owned_${login}`;
}

function getSnakeColorKey(login) {
  return `snake_color_style_${login}`;
}

function getOwnedSnakeColorsKey(login) {
  return `snake_colors_owned_${login}`;
}

function parseOwnedStyles(value, defaultStyle) {
  if (!value) {
    return [defaultStyle];
  }

  try {
    const parsedValue = JSON.parse(value);

    if (Array.isArray(parsedValue) && parsedValue.includes(defaultStyle)) {
      return parsedValue;
    }
  } catch (error) {
    console.error("Ошибка чтения покупок змеи: ", error);
  }

  return [defaultStyle];
}

function loadTeme() {
  return localStorage.getItem("tasktail_theme") || "light";
}

const snakeLegStyleMessages = {
  triangle: "Треугольные ноги куплены",
  none: "Версия без ног куплена",
};

const snakeHeadStyleMessages = {
  oval: "Овальная голова выбрана",
  triangle: "Треугольная голова куплена",
  square: "Квадратная голова куплена",
  circle: "Круглая голова куплена",
};

const snakeColorStyleMessages = {
  green: "Зеленый цвет выбран",
  red: "Красный цвет куплен",
  pink: "Розовый цвет куплен",
  blue: "Синий цвет куплен",
  orange: "Оранжевый цвет куплен",
};

export default function App() {
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [tokens, setTokens] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  const [snakeLegStyle, setSnakeLegStyle] = useState("round");
  const [ownedSnakeLegStyles, setOwnedSnakeLegStyles] = useState(["round"]);

  const [snakeHeadStyle, setSnakeHeadStyle] = useState("oval");
  const [ownedSnakeHeadStyles, setOwnedSnakeHeadStyles] = useState(["oval"]);

  const [snakeColorStyle, setSnakeColorStyle] = useState("green");
  const [ownedSnakeColorStyles, setOwnedSnakeColorStyles] = useState(["green"]);

  const [notification, setNotification] = useState("");
  const [notificationVisible, setNotificationVisible] = useState(false);

  const [theme, setTheme] = useState(loadTeme);
  const reptilMode = theme === "dark";
  const showCursorSnake = location.pathname !== "/snake-editor";

  async function loadCompletedTasks(login) {
    try {
      const response = await fetch(API_URL + `/api/habits/${login}`);
      const data = await response.json();

      if (data.success) {
        setCompletedTasks(countCompletedTasks(data.habits, data.snakePenalty || 0));
      }
    } catch (error) {
      console.error("Ошибка загрузки выполненных задач: ", error);
    }
  }

  function showNotification(message) {
    setNotification(message);
    setNotificationVisible(true);
  }

  function handleLogin(user, message) {
    const oldTokens = localStorage.getItem(getTokensKey(user.login));

    const savedOwnedLegStyles = parseOwnedStyles(
      localStorage.getItem(getOwnedSnakeLegsKey(user.login)),
      "round"
    );
    const savedLegStyle = localStorage.getItem(getSnakeLegsKey(user.login)) || "round";
    const nextLegStyle = savedOwnedLegStyles.includes(savedLegStyle)
      ? savedLegStyle
      : "round";

    const savedOwnedHeadStyles = parseOwnedStyles(
      localStorage.getItem(getOwnedSnakeHeadsKey(user.login)),
      "oval"
    );
    const savedHeadStyle = localStorage.getItem(getSnakeHeadKey(user.login)) || "oval";
    const nextHeadStyle = savedOwnedHeadStyles.includes(savedHeadStyle)
      ? savedHeadStyle
      : "oval";

    const savedOwnedColorStyles = parseOwnedStyles(
      localStorage.getItem(getOwnedSnakeColorsKey(user.login)),
      "green"
    );
    const savedColorStyle = localStorage.getItem(getSnakeColorKey(user.login)) || "green";
    const nextColorStyle = savedOwnedColorStyles.includes(savedColorStyle)
      ? savedColorStyle
      : "green";

    setCurrentUser(user);
    setTokens(oldTokens ? Number(oldTokens) : 0);
    setCompletedTasks(countCompletedTasks(user.habits, user.snakePenalty || 0));

    setSnakeLegStyle(nextLegStyle);
    setOwnedSnakeLegStyles(savedOwnedLegStyles);

    setSnakeHeadStyle(nextHeadStyle);
    setOwnedSnakeHeadStyles(savedOwnedHeadStyles);

    setSnakeColorStyle(nextColorStyle);
    setOwnedSnakeColorStyles(savedOwnedColorStyles);

    loadCompletedTasks(user.login);
    showNotification(message);
  }

  function addToken() {
    setTokens((currentTokens) => currentTokens + 1);
  }

  function buySnakeLegStyle(style, price) {
    if (ownedSnakeLegStyles.includes(style)) {
      setSnakeLegStyle(style);
      return true;
    }

    if (tokens < price) {
      showNotification("Недостаточно монет");
      return false;
    }

    const nextOwnedStyles = [...ownedSnakeLegStyles, style];

    setTokens((currentTokens) => currentTokens - price);
    setOwnedSnakeLegStyles(nextOwnedStyles);
    setSnakeLegStyle(style);
    showNotification(snakeLegStyleMessages[style] || "Покупка добавлена");

    return true;
  }

  function buySnakeHeadStyle(style, price) {
    if (ownedSnakeHeadStyles.includes(style)) {
      setSnakeHeadStyle(style);
      return true;
    }

    if (tokens < price) {
      showNotification("Недостаточно монет");
      return false;
    }

    const nextOwnedStyles = [...ownedSnakeHeadStyles, style];

    setTokens((currentTokens) => currentTokens - price);
    setOwnedSnakeHeadStyles(nextOwnedStyles);
    setSnakeHeadStyle(style);
    showNotification(snakeHeadStyleMessages[style] || "Голова куплена");

    return true;
  }

  function buySnakeColorStyle(style, price) {
    if (ownedSnakeColorStyles.includes(style)) {
      setSnakeColorStyle(style);
      return true;
    }

    if (tokens < price) {
      showNotification("Недостаточно монет");
      return false;
    }

    const nextOwnedStyles = [...ownedSnakeColorStyles, style];

    setTokens((currentTokens) => currentTokens - price);
    setOwnedSnakeColorStyles(nextOwnedStyles);
    setSnakeColorStyle(style);
    showNotification(snakeColorStyleMessages[style] || "Цвет куплен");

    return true;
  }

  function logout() {
    setCurrentUser(null);
    setTokens(0);
    setCompletedTasks(0);

    setSnakeLegStyle("round");
    setOwnedSnakeLegStyles(["round"]);

    setSnakeHeadStyle("oval");
    setOwnedSnakeHeadStyles(["oval"]);

    setSnakeColorStyle("green");
    setOwnedSnakeColorStyles(["green"]);
  }

  function changeTema() {
    setTheme((oldTema) => (oldTema === "dark" ? "light" : "dark"));
  }

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    localStorage.setItem(getTokensKey(currentUser.login), String(tokens));
  }, [tokens, currentUser]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    localStorage.setItem(getSnakeLegsKey(currentUser.login), snakeLegStyle);
    localStorage.setItem(
      getOwnedSnakeLegsKey(currentUser.login),
      JSON.stringify(ownedSnakeLegStyles)
    );
  }, [snakeLegStyle, ownedSnakeLegStyles, currentUser]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    localStorage.setItem(getSnakeHeadKey(currentUser.login), snakeHeadStyle);
    localStorage.setItem(
      getOwnedSnakeHeadsKey(currentUser.login),
      JSON.stringify(ownedSnakeHeadStyles)
    );
  }, [snakeHeadStyle, ownedSnakeHeadStyles, currentUser]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    localStorage.setItem(getSnakeColorKey(currentUser.login), snakeColorStyle);
    localStorage.setItem(
      getOwnedSnakeColorsKey(currentUser.login),
      JSON.stringify(ownedSnakeColorStyles)
    );
  }, [snakeColorStyle, ownedSnakeColorStyles, currentUser]);

  useEffect(() => {
    if (!notificationVisible) {
      return;
    }

    const hideTimer = setTimeout(() => setNotificationVisible(false), 5000);
    const clearTimer = setTimeout(() => setNotification(""), 5600);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(clearTimer);
    };
  }, [notificationVisible]);

  useEffect(() => {
    localStorage.setItem("tasktail_theme", theme);
  }, [theme]);

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className={reptilMode ? "app-shell theme-dark" : "app-shell"}>
      {showCursorSnake && (
        <Snakey
          mode="cursor"
          completedTasks={completedTasks}
          legStyle={snakeLegStyle}
          headStyle={snakeHeadStyle}
          skinColor={snakeColorStyle}
        />
      )}

      {notification && (
        <Notification text={notification} visible={notificationVisible} />
      )}

      <TopBar user={currentUser} tokens={tokens} onLogout={logout} />

      <div className="page-body">
        <Sidebar reptilMode={reptilMode} onChangeTema={changeTema} />

        <main className="main-layout">
          <Routes>
            <Route path="/" element={<Home user={currentUser} />} />
            <Route
              path="/habits"
              element={
                <Habits
                  user={currentUser}
                  onAddToken={addToken}
                  onCompletedTasksChange={setCompletedTasks}
                />
              }
            />
            <Route
              path="/snake-editor"
              element={
                <SnakeEditor
                  completedTasks={completedTasks}
                  tokens={tokens}
                  legStyle={snakeLegStyle}
                  ownedLegStyles={ownedSnakeLegStyles}
                  onBuyLegStyle={buySnakeLegStyle}
                  onSelectLegStyle={setSnakeLegStyle}
                  headStyle={snakeHeadStyle}
                  ownedHeadStyles={ownedSnakeHeadStyles}
                  onBuyHeadStyle={buySnakeHeadStyle}
                  onSelectHeadStyle={setSnakeHeadStyle}
                  skinColor={snakeColorStyle}
                  ownedSkinColors={ownedSnakeColorStyles}
                  onBuySkinColor={buySnakeColorStyle}
                  onSelectSkinColor={setSnakeColorStyle}
                />
              }
            />
            <Route path="/affirmations" element={<Affirmations />} />
            <Route path="/about" element={<About />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route
              path="/profile"
              element={
                <Profile
                  user={currentUser}
                  onUpdateUser={setCurrentUser}
                  onNotify={showNotification}
                />
              }
            />
          </Routes>
        </main>
      </div>

      <Footer />
    </div>
  );
}