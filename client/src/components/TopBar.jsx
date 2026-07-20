import { Link } from "react-router-dom";
import { getUserName } from "../utils/helpers";

export default function TopBar({ user, tokens, onLogout }) {
  const name = getUserName(user);

  return (
    <header className="top-bar">
      <Link to="/" className="brand-link" aria-label="TaskTail">
        <span className="brand-name pixelfont">TaskTail</span>
        <span className="brand-tagline">сделай продуктивность игрой</span>
      </Link>

      <div className="profile-area">
        <div className="tokens-counter" aria-label={`Токены: ${tokens}`}>
          <img src="/token.png" alt="" className="token-icon" />
          <span>{tokens}</span>
        </div>

        <Link to="/profile" className="profile-link">
          {user.photo ? (
            <img
              src={user.photo}
              alt="Фото профиля"
              className="profile-small-photo"
            />
          ) : (
            <div className="profile-small-empty">
              {name[0]?.toUpperCase()}
            </div>
          )}

          <span>{name}</span>
        </Link>

        <button type="button" onClick={onLogout}>
          Выйти
        </button>
      </div>
    </header>
  );
}
