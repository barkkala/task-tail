import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function FeedbackPage() {
    const [feedback, setFeedback] = useState("");
    const [feedbackResult, setFeedbackResult] = useState("");
    const [loading, setLoading] = useState(false);

    // Данные команды
    const teamMembers = [
        {
            name: "Иванов Андрей",
            vk: "https://vk.com/brainik89",
            email: "barderbread@gmail.com"
        },
        {
            name: "Беляев Андрей",
            vk: "https://vk.com/bonnieux",
            email: "onelilbonnieux@gmai.com"
        },
        {
            name: "Нестеров Артем",
            vk: "https://vk.com/barkkala",
            email: "kefteme@bk.ru"
        }
    ];

    async function sendFeedback(event) {
        event.preventDefault();
        setLoading(true);
        setFeedbackResult("");

        try {
            const response = await fetch(API_URL + "/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: feedback }),
            });
            const data = await response.json();

            setFeedbackResult(data.message || "Сообщение отправлено успешно!");
            setFeedback("");
        } catch (error) {
            console.error("Ошибка отправки:", error);
            setFeedbackResult("Ошибка отправки сообщения");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>Обратная связь</h1>
            <form className="inline-form" onSubmit={sendFeedback}>
                <input
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    placeholder="Введите сообщение"
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Отправка..." : "Отправить"}
                </button>
            </form>

            {feedbackResult && <p>{feedbackResult}</p>}

            {/* Блок с командой */}
            <div style={{ marginTop: "40px", borderTop: "1px solid #ccc", paddingTop: "20px" }}>
                <h2>Наша команда</h2>
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {teamMembers.map((member, index) => (
                        <li key={index} style={{ marginBottom: "15px" }}>
                            <strong>{member.name}</strong>
                            <br />
                            {member.vk && (
                                <a 
                                    href={member.vk} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ marginRight: "15px" }}
                                >
                                    VK
                                </a>
                            )}
                            {member.email && (
                                <a href={`mailto:${member.email}`}>
                                    {member.email}
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default FeedbackPage;