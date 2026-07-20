import { useState } from "react";
import Snakey from "../components/Snakey";

const TRIANGLE_LEGS_PRICE = 5;
const NO_LEGS_PRICE = 10;
const HEAD_PRICE = 15;
const COLOR_PRICE = 10;

const headOptions = [
  { id: "oval", title: "Овальная", price: 0 },
  { id: "triangle", title: "Треугольная", price: HEAD_PRICE },
  { id: "square", title: "Квадратная", price: HEAD_PRICE },
  { id: "circle", title: "Круглая", price: HEAD_PRICE },
];

const colorOptions = [
  { id: "green", title: "Зеленый", price: 0, swatch: "#22c55e" },
  { id: "red", title: "Красный", price: COLOR_PRICE, swatch: "#ef4444" },
  { id: "pink", title: "Розовый", price: COLOR_PRICE, swatch: "#ec4899" },
  { id: "blue", title: "Синий", price: COLOR_PRICE, swatch: "#3b82f6" },
  { id: "orange", title: "Оранжевый", price: COLOR_PRICE, swatch: "#f97316" },
];

export default function SnakeEditor({
  completedTasks = 0,
  tokens = 0,
  legStyle = "round",
  ownedLegStyles = ["round"],
  onBuyLegStyle,
  onSelectLegStyle,
  headStyle = "oval",
  ownedHeadStyles = ["oval"],
  onBuyHeadStyle,
  onSelectHeadStyle,
  skinColor = "green",
  ownedSkinColors = ["green"],
  onBuySkinColor,
  onSelectSkinColor,
}) {
  const [openMenu, setOpenMenu] = useState("");
  const ownsTriangleLegs = ownedLegStyles.includes("triangle");
  const ownsNoLegs = ownedLegStyles.includes("none");

  function toggleMenu(menuName) {
    setOpenMenu((currentMenu) => (currentMenu === menuName ? "" : menuName));
  }

  function chooseRoundLegs() {
    onSelectLegStyle("round");
  }

  function chooseTriangleLegs() {
    if (ownsTriangleLegs) {
      onSelectLegStyle("triangle");
      return;
    }

    onBuyLegStyle("triangle", TRIANGLE_LEGS_PRICE);
  }

  function chooseNoLegs() {
    if (ownsNoLegs) {
      onSelectLegStyle("none");
      return;
    }

    onBuyLegStyle("none", NO_LEGS_PRICE);
  }

  function chooseHead(option) {
    if (ownedHeadStyles.includes(option.id)) {
      onSelectHeadStyle(option.id);
      return;
    }

    onBuyHeadStyle(option.id, option.price);
  }

  function chooseColor(option) {
    if (ownedSkinColors.includes(option.id)) {
      onSelectSkinColor(option.id);
      return;
    }

    onBuySkinColor(option.id, option.price);
  }

  function renderPrice(option, owned) {
    if (owned) {
      return <small>Куплено</small>;
    }

    if (option.price === 0) {
      return <small>Бесплатно</small>;
    }

    return (
      <small className="snake-editor-price">
        <img src="/token.png" alt="" />
        <span>{option.price}</span>
      </small>
    );
  }

  return (
    <div className="snake-editor-page">
      <h1>Редактирование змеи</h1>

      <div className="snake-editor-layout">
        <section className="snake-preview-panel">
          <Snakey
            mode="auto"
            completedTasks={completedTasks}
            legStyle={legStyle}
            headStyle={headStyle}
            skinColor={skinColor}
          />
        </section>

        <aside className="snake-custom-panel">
          <div className="snake-editor-balance">
            <span>Баланс</span>
            <strong>
              <img src="/token.png" alt="" />
              {tokens}
            </strong>
          </div>

          <button
            type="button"
            className={`snake-editor-tab ${openMenu === "head" ? "snake-editor-tab-active" : ""}`}
            onClick={() => toggleMenu("head")}
          >
            Голова
          </button>

          <button
            type="button"
            className={`snake-editor-tab snake-editor-tab-wide ${
              openMenu === "color" ? "snake-editor-tab-active" : ""
            }`}
            onClick={() => toggleMenu("color")}
          >
            Цвет кожи
          </button>

          <button
            type="button"
            className={`snake-editor-tab ${openMenu === "legs" ? "snake-editor-tab-active" : ""}`}
            onClick={() => toggleMenu("legs")}
          >
            Ноги
          </button>

          {openMenu === "head" && (
            <div className="snake-editor-menu">
              {headOptions.map((option) => {
                const owned = ownedHeadStyles.includes(option.id);

                return (
                  <button
                    type="button"
                    key={option.id}
                    className={`snake-editor-option ${
                      headStyle === option.id ? "snake-editor-option-selected" : ""
                    }`}
                    onClick={() => chooseHead(option)}
                    title={
                      owned
                        ? `Выбрать: ${option.title}`
                        : `Купить за ${option.price} монет`
                    }
                  >
                    <span>{option.title}</span>
                    {renderPrice(option, owned)}
                  </button>
                );
              })}
            </div>
          )}

          {openMenu === "color" && (
            <div className="snake-editor-menu">
              {colorOptions.map((option) => {
                const owned = ownedSkinColors.includes(option.id);

                return (
                  <button
                    type="button"
                    key={option.id}
                    className={`snake-editor-option ${
                      skinColor === option.id ? "snake-editor-option-selected" : ""
                    }`}
                    onClick={() => chooseColor(option)}
                    title={
                      owned
                        ? `Выбрать: ${option.title}`
                        : `Купить за ${option.price} монет`
                    }
                  >
                    <span className="snake-editor-color-name">
                      <span
                        className="snake-editor-swatch"
                        style={{ background: option.swatch }}
                      />
                      {option.title}
                    </span>
                    {renderPrice(option, owned)}
                  </button>
                );
              })}
            </div>
          )}

          {openMenu === "legs" && (
            <div className="snake-editor-menu">
              <button
                type="button"
                className={`snake-editor-option ${
                  legStyle === "round" ? "snake-editor-option-selected" : ""
                }`}
                onClick={chooseRoundLegs}
              >
                <span>Обычные</span>
                <small>Бесплатно</small>
              </button>

              <button
                type="button"
                className={`snake-editor-option ${
                  legStyle === "triangle" ? "snake-editor-option-selected" : ""
                }`}
                onClick={chooseTriangleLegs}
                title={
                  ownsTriangleLegs
                    ? "Выбрать треугольные ноги"
                    : "Купить треугольные ноги за 5 монет"
                }
              >
                <span>Треугольные ноги</span>
                {ownsTriangleLegs ? (
                  <small>Куплено</small>
                ) : (
                  <small className="snake-editor-price">
                    <img src="/token.png" alt="" />
                    <span>{TRIANGLE_LEGS_PRICE}</span>
                  </small>
                )}
              </button>

              <button
                type="button"
                className={`snake-editor-option ${
                  legStyle === "none" ? "snake-editor-option-selected" : ""
                }`}
                onClick={chooseNoLegs}
                title={
                  ownsNoLegs
                    ? "Выбрать змейку без ног"
                    : "Купить змейку без ног за 10 монет"
                }
              >
                <span>Нет</span>
                {ownsNoLegs ? (
                  <small>Куплено</small>
                ) : (
                  <small className="snake-editor-price">
                    <img src="/token.png" alt="" />
                    <span>{NO_LEGS_PRICE}</span>
                  </small>
                )}
              </button>
            </div>
          )}
        </aside>
      </div>

      <style>{`
        .snake-editor-page {
          width: 100%;
        }

        .snake-editor-layout {
          display: grid;
          grid-template-columns: minmax(320px, 1fr) minmax(280px, 420px);
          min-height: 680px;
          margin-top: 18px;
          border: 2px solid var(--border-strong);
          background: var(--surface);
          overflow: hidden;
        }

        .snake-preview-panel {
          min-height: 680px;
          overflow: hidden;
          border-right: 2px solid var(--border-strong);
          background: #fff7ed;
        }

        .snake-custom-panel {
          min-width: 0;
          min-height: 680px;
          padding: 18px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          align-content: start;
          gap: 14px;
          background: var(--surface);
        }

        .snake-editor-balance {
          grid-column: 1 / -1;
          min-height: 54px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 2px solid var(--border-strong);
          color: var(--text-strong);
          background: var(--surface-soft);
        }

        .snake-editor-balance strong {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: var(--heading);
          font-size: 20px;
        }

        .snake-editor-balance img {
          width: 26px;
          height: 26px;
          object-fit: contain;
        }

        .snake-editor-tab {
          width: 100%;
          min-width: 0;
          min-height: 68px;
          margin: 0;
          padding: 10px;
          border-radius: 0;
          border: 2px solid var(--border-strong);
          background: var(--surface);
          color: var(--text-strong);
          box-shadow: none;
          font-size: 18px;
          overflow-wrap: anywhere;
        }

        .snake-editor-tab:hover {
          background: var(--surface-soft);
          color: var(--heading);
          transform: none;
          box-shadow: none;
        }

        .snake-editor-tab-active {
          background: var(--surface-soft);
          color: var(--heading);
        }

        .snake-editor-menu {
          grid-column: 1 / -1;
          justify-self: start;
          width: min(100%, 280px);
          display: grid;
          gap: 10px;
          padding: 12px;
          border: 2px solid var(--border-strong);
          background: var(--surface-soft);
        }

        .snake-editor-option {
          width: 100%;
          min-height: 54px;
          margin: 0;
          padding: 9px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-radius: 0;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text-strong);
          box-shadow: none;
          font-size: 15px;
          text-align: left;
        }

        .snake-editor-option small {
          color: var(--text-muted);
          font-size: 12px;
          white-space: nowrap;
        }

        .snake-editor-color-name {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .snake-editor-swatch {
          width: 20px;
          height: 20px;
          flex: 0 0 auto;
          border: 1px solid var(--border-strong);
        }

        .snake-editor-price {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: var(--heading);
          font-weight: 700;
        }

        .snake-editor-price img {
          width: 24px;
          height: 24px;
          object-fit: contain;
        }

        .snake-editor-option:hover:not(:disabled),
        .snake-editor-option-selected {
          border-color: var(--border-strong);
          background: var(--sidebar-hover-bg);
          color: var(--heading);
          transform: none;
          box-shadow: none;
        }

        .snake-editor-option:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        @media (max-width: 950px) {
          .snake-editor-layout {
            grid-template-columns: 1fr;
          }

          .snake-preview-panel {
            min-height: 560px;
            border-right: none;
            border-bottom: 2px solid var(--border-strong);
          }

          .snake-custom-panel {
            min-height: auto;
          }
        }

        @media (max-width: 520px) {
          .snake-custom-panel {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}