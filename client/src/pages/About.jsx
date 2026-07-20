export default function About() {
  const developers = ["Беляев Андрей", "Нестеров Артем", "Иванов Андрей"];

  return (
    <div className="about-container">
      <h1 className="pixelfont">TaskTail</h1>
      <p className="about-description">
        <span className="pixelfont">TaskTail</span> — сделай продуктивность
        игрой. Приложение помогает превращать задачи и полезные привычки в
        понятный прогресс: выполняйте дела, получайте токены и двигайтесь к
        своим целям каждый день.
      </p>

      <h2>Разработчики проекта</h2>
      <ul className="developers-list">
        {developers.map((dev, index) => (
          <li key={index} className="developer-item">
            {dev}
          </li>
        ))}
      </ul>
    </div>
  );
}
