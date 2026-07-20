export default function Notification({ text, visible }) {
  return (
    <div
      className="notification"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-15px)",
      }}
    >
      {text}
    </div>
  );
}