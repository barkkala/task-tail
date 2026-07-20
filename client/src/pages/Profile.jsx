import { useState } from "react";
import { API_URL } from "../utils/api";

export default function Profile({ user, onUpdateUser, onNotify }) {
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [photo, setPhoto] = useState(user.photo || "");
  const [message, setMessage] = useState("");

  function changePhoto(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPhoto(reader.result);
    };

    reader.readAsDataURL(file);
  }

  async function saveProfile(event) {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(API_URL + "/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: user.login,
          firstName,
          lastName,
          photo,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setPhoto(data.user.photo || "");
        onUpdateUser(data.user);
        onNotify("Профиль сохранен");
      } else {
        setMessage(data.message || "Ошибка сохранения");
      }
    } catch (error) {
      console.error("Ошибка сохранения профиля: ", error);
      setMessage("Ошибка соединения с сервером");
    }
  }

  async function deleteProfilePhoto() {
    if (!photo) {
      return;
    }

    setMessage("");

    try {
      const response = await fetch(API_URL + "/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: user.login,
          firstName,
          lastName,
          photo: "",
        }),
      });
      const data = await response.json();

      if (data.success) {
        setPhoto("");
        onUpdateUser(data.user);
        onNotify("Фото профиля удалено");
      } else {
        setMessage(data.message || "Ошибка удаления фото");
      }
    } catch (error) {
      console.error("Ошибка удаления фото: ", error);
      setMessage("Ошибка соединения с сервером");
    }
  }

  return (
    <div>
      <h1>Профиль</h1>
      <form className="profile-form" onSubmit={saveProfile}>
        <div className="profile-photo-block">
          <label htmlFor="profile-photo" className="profile-photo">
            {photo ? (
              <img src={photo} alt="Фото профиля" />
            ) : (
              <span>Фото</span>
            )}
          </label>
          <input
            id="profile-photo"
            type="file"
            accept="image/*"
            onChange={changePhoto}
            className="hidden-input"
          />
          <button
            type="button"
            className={photo ? "profile-delete-photo active" : "profile-delete-photo"}
            onClick={deleteProfilePhoto}
            disabled={!photo}
          >
            Удалить фото
          </button>
        </div>

        <div className="profile-edit-row">
          <div className="profile-fields">
            <input
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="Имя"
            />
            <input
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="Фамилия"
            />
          </div>
          <button type="submit" className="profile-save-button">
            Сохранить профиль
          </button>
        </div>
      </form>
      {message && <p className="error-text">{message}</p>}
    </div>
  );
}