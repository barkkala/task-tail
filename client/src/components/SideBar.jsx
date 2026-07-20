import { Link } from "react-router-dom";

export default function Sidebar({ reptilMode, onChangeTema }) {
  const btnTxt = reptilMode ? "Светлая тема" : "Темная тема";

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          <Link to="/">Главная</Link>
          <Link to="/habits">Цели</Link>
          <Link to="/snake-editor">Редактирование змеи</Link>
          <Link to="/affirmations">Аффирмации</Link>
        </nav>

        <div className="theme-widget">
          <img
            src="/huinyalight.png"
            alt=""
            className="theme-mascot theme-mascot-light"
          />

          <img
            src="/huinya.png"
            alt=""
            className="theme-mascot theme-mascot-dark"
          />

          <div className="theme-control">
            <span className="theme-control-label">Тема</span>

            <button
              type="button"
              className="theme-toggle"
              onClick={onChangeTema}
              aria-pressed={reptilMode}
            >
              {btnTxt}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}