import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <p className="footer-brand">© 2026 <span className="pixelfont">TaskTail</span></p>

        <nav className="footer-nav">
          <Link to="/about" className="footer-link">
            О нас
          </Link>
          <Link to="/feedback" className="footer-link">
            Обратная связь
          </Link>
        </nav>

        <div className="footer-help">
          <p>Помощь и вопросы: почтас@почтас.почта</p>
        </div>
      </div>
    </footer>
  );
}
