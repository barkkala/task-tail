import { Link } from "react-router-dom";

function Navigation() {
    return (
        <nav style={{ 
            marginBottom: "20px", 
            display: "flex", 
            gap: "15px",
            borderBottom: "1px solid #ddd",
            paddingBottom: "10px"
        }}>
            <Link to="/">Главная</Link>
            <Link to="/about">О нас</Link>
            <Link to="/feedback">Обратная связь</Link>
        </nav>
    );
}

export default Navigation;