const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, "users.json");

let cachedAffirmations = [];
let affirmationsCacheDate = "";
let cachedMotivationNews = [];
let motivationNewsCacheDate = "";

const AFFIRMATION_SOURCES = [
    {
        title: "Wikiquote: счастье",
        url: "https://ru.wikiquote.org/wiki/%D0%A1%D1%87%D0%B0%D1%81%D1%82%D1%8C",
    },
    {
        title: "Wikiquote: успех",
        url: "https://ru.wikiquote.org/wiki/%D0%A3%D1%81%D0%BF%D0%B5%D1%85",
    },
    {
        title: "Wikiquote: жизнь",
        url: "https://ru.wikiquote.org/wiki/%D0%96%D0%B8%D0%B7%D0%BD%D1%8C",
    },
];

const fallbackAffirmations = [
    { text: "Сегодня я выбираю двигаться вперед спокойно и уверенно.", author: "" },
    { text: "Я замечаю свой прогресс и разрешаю себе расти в своем темпе.", author: "" },
    { text: "Каждый новый день дает мне возможность стать сильнее.", author: "" },
    { text: "Я могу начать заново и сделать один хороший шаг уже сегодня.", author: "" },
    { text: "Мои действия постепенно приводят меня к нужному результату.", author: "" },
    { text: "Я выбираю заботу о себе, дисциплину и внутреннее спокойствие.", author: "" },
    { text: "Я справляюсь с трудностями и становлюсь увереннее через опыт.", author: "" },
    { text: "Сегодня я фокусируюсь на том, что могу сделать прямо сейчас.", author: "" },
    { text: "Мои маленькие привычки создают большие изменения.", author: "" },
    { text: "Я достоин хороших перемен и готов делать шаги к ним.", author: "" },
];

const MOTIVATION_NEWS_SOURCES = [
    {
        source: "Forbes Life",
        url: "https://www.forbes.ru/forbeslife/feed",
    },
];

const fallbackMotivationNews = [
    {
        source: "Forbes Motivation",
        title: "История успеха начинается с маленького шага",
        description: "Большие цели становятся реальными, когда каждый день есть одно понятное действие: учиться, пробовать, исправлять и продолжать.",
        url: "https://www.forbes.ru/forbeslife",
    },
    {
        source: "Forbes Motivation",
        title: "Дисциплина помогает превратить мечту в систему",
        description: "Стабильный прогресс складывается из привычек, фокуса и спокойной работы над собой, а не из резких рывков.",
        url: "https://www.forbes.ru/forbeslife",
    },
    {
        source: "Forbes Motivation",
        title: "Предпринимательское мышление учит не сдаваться",
        description: "Ошибки можно использовать как обратную связь: анализировать, менять подход и снова двигаться к цели с большей уверенностью.",
        url: "https://www.forbes.ru/forbeslife",
    },
];

const strongMotivationPhrases = [
    "история успеха",
    "личный рост",
    "саморазвитие",
    "карьерный рост",
    "развитие карьеры",
    "полезные привычки",
    "предпринимательское мышление",
    "как добиться",
    "как развить",
    "как построить",
    "как начать",
    "как не сдаваться",
    "как стать",
    "мотивация",
    "вдохновение",
    "дисциплина",
    "продуктивность",
    "уверенность",
    "лидерство",
    "новые возможности",
    "достижение цели",
    "достичь цели",
];

const softMotivationWords = [
    "успех",
    "успеш",
    "цель",
    "цели",
    "рост",
    "развитие",
    "карьера",
    "бизнес",
    "стартап",
    "предприниматель",
    "основатель",
    "лидер",
    "привычка",
    "привычки",
    "навык",
    "навыки",
    "обучение",
    "мечта",
    "мечты",
    "энергия",
    "фокус",
    "победа",
    "достижение",
    "возможность",
    "возможности",
];

const badNewsWords = [
    "умер",
    "умерла",
    "смерть",
    "погиб",
    "погибла",
    "убийство",
    "война",
    "кризис",
    "катастрофа",
    "скандал",
    "развод",
    "провал",
    "банкротство",
    "штраф",
    "суд",
    "обвинение",
    "болезнь",
    "трагедия",
    "насилие",
    "арест",
    "приговор",
    "конфликт",
    "санкции",
    "уволили",
    "закрылся",
    "закрылась",
];

app.use(cors());
app.use(express.json({ limit: "20mb" }));

function readUsers() {
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 4));
        return [];
    }

    const fileData = fs.readFileSync(USERS_FILE, "utf-8");

    if (!fileData.trim()) {
        return [];
    }

    return JSON.parse(fileData);
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 4));
}

function hidePassword(user) {
    return {
        login: user.login,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        photo: user.photo || "",
        habits: user.habits || [],
        snakePenalty: user.snakePenalty || 0,
    };
}

function findUser(users, login) {
    return users.find((user) => user.login === login);
}

function prepareUser(user) {
    if (!user.habits) {
        user.habits = [];
    }

    if (typeof user.snakePenalty !== "number") {
        user.snakePenalty = 0;
    }

    return user;
}

function isHabitCompleted(habit) {
    const completedDates = habit.completedDates || {};

    return Object.values(completedDates).some(Boolean);
}

function removeExpiredHabits(user) {
    prepareUser(user);

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const activeHabits = [];
    let expiredCount = 0;

    for (const habit of user.habits) {
        if (!habit.createdAt) {
            habit.createdAt = now;
        }

        const habitAge = now - Number(habit.createdAt);
        const expired = habitAge >= dayMs && !isHabitCompleted(habit);

        if (expired) {
            expiredCount += 1;
        } else {
            activeHabits.push(habit);
        }
    }

    user.habits = activeHabits;
    user.snakePenalty += expiredCount;

    return expiredCount;
}

function getGmtPlus5DateKey() {
    const now = new Date();
    const gmtPlus5 = new Date(now.getTime() + 5 * 60 * 60 * 1000);

    return gmtPlus5.toISOString().slice(0, 10);
}

function decodeHtml(text) {
    return String(text || "")
        .replace(/&#(\d+);/g, (match, code) => String.fromCharCode(Number(code)))
        .replace(/&#x([0-9a-f]+);/gi, (match, code) => String.fromCharCode(parseInt(code, 16)))
        .replace(/&nbsp;/g, " ")
        .replace(/&quot;/g, "\"")
        .replace(/&apos;/g, "'")
        .replace(/&#34;/g, "\"")
        .replace(/&#39;/g, "'")
        .replace(/&laquo;/g, "«")
        .replace(/&raquo;/g, "»")
        .replace(/&mdash;/g, "—")
        .replace(/&ndash;/g, "–")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
}

function cleanText(text) {
    return decodeHtml(text)
        .replace(/<!\[CDATA\[/g, "")
        .replace(/\]\]>/g, "")
        .replace(/<sup[\s\S]*?<\/sup>/gi, " ")
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\[[^\]]+\]/g, "")
        .replace(/\u00a0/g, " ")
        .replace(/↑/g, " ")
        .replace(/\s+/g, " ")
        .replace(/^[:;,.—\-\s]+/, "")
        .replace(/[:;,.—\-\s]+$/, "")
        .trim();
}

function isGoodAffirmation(text) {
    const lowerText = text.toLowerCase();

    if (text.length < 35 || text.length > 220) {
        return false;
    }

    if (!/[а-яё]/i.test(text)) {
        return false;
    }

    if (/^[:\d\s]+$/.test(text)) {
        return false;
    }

    const bannedWords = [
        "cookie",
        "javascript",
        "редактировать",
        "перейти",
        "навигация",
        "страница",
        "категория",
        "источник",
        "источники",
        "литература",
        "примечания",
        "ссылки",
        "заглавная",
        "содержание",
        "архивировано",
        "проверено",
        "isbn",
        "http",
        "www",
    ];

    return !bannedWords.some((word) => lowerText.includes(word));
}

function hashString(text) {
    let hash = 0;

    for (let index = 0; index < text.length; index += 1) {
        hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
    }

    return hash;
}

function shuffleByDate(items, dateKey) {
    const seed = hashString(dateKey);

    return [...items].sort((left, right) => {
        const leftHash = hashString((left.text || left.title || "") + seed);
        const rightHash = hashString((right.text || right.title || "") + seed);

        return leftHash - rightHash;
    });
}

function parseAffirmationsFromHtml(html, sourceTitle) {
    const contentOnly = html
        .replace(/<sup[\s\S]*?<\/sup>/gi, " ")
        .replace(/<ol[^>]*class="[^"]*references[^"]*"[\s\S]*?<\/ol>/gi, "")
        .replace(/<div[^>]*class="[^"]*reflist[^"]*"[\s\S]*?<\/div>/gi, "")
        .replace(/<div[^>]*class="[^"]*navbox[^"]*"[\s\S]*?<\/div>/gi, "")
        .replace(/<table[\s\S]*?<\/table>/gi, "");

    const parts = contentOnly.match(/<(p|li|blockquote)[^>]*>[\s\S]*?<\/\1>/gi) || [];

    return parts
        .map((part) => cleanText(part))
        .filter(isGoodAffirmation)
        .map((text) => ({
            text,
            author: sourceTitle,
        }));
}

async function loadAffirmationsFromSource(source) {
    const response = await fetch(source.url, {
        headers: {
            "User-Agent": "Mozilla/5.0 TaskTail/1.0",
        },
    });

    if (!response.ok) {
        throw new Error(`Не удалось загрузить ${source.url}`);
    }

    const html = await response.text();

    return parseAffirmationsFromHtml(html, source.title);
}

async function loadAffirmations() {
    const todayKey = getGmtPlus5DateKey();

    if (cachedAffirmations.length > 0 && affirmationsCacheDate === todayKey) {
        return cachedAffirmations;
    }

    try {
        const results = await Promise.allSettled(
            AFFIRMATION_SOURCES.map(loadAffirmationsFromSource)
        );

        const allAffirmations = [];

        for (const result of results) {
            if (result.status === "fulfilled") {
                allAffirmations.push(...result.value);
            }
        }

        const uniqueAffirmations = [];

        for (const affirmation of allAffirmations) {
            const alreadyExists = uniqueAffirmations.some(
                (item) => item.text === affirmation.text
            );

            if (!alreadyExists) {
                uniqueAffirmations.push(affirmation);
            }
        }

        const sourceItems = uniqueAffirmations.length >= 10
            ? uniqueAffirmations
            : fallbackAffirmations;

        cachedAffirmations = shuffleByDate(sourceItems, todayKey).slice(0, 10);
        affirmationsCacheDate = todayKey;

        return cachedAffirmations;
    } catch (error) {
        console.error("Ошибка загрузки аффирмаций:", error);

        cachedAffirmations = shuffleByDate(fallbackAffirmations, todayKey).slice(0, 10);
        affirmationsCacheDate = todayKey;

        return cachedAffirmations;
    }
}

function getTagValue(xml, tagName) {
    const match = xml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));

    return match ? cleanText(match[1]) : "";
}

function getLinkValue(xml) {
    const simpleLink = getTagValue(xml, "link");

    if (simpleLink) {
        return simpleLink;
    }

    const hrefMatch = xml.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);

    return hrefMatch ? hrefMatch[1] : "";
}

function shortenText(text, maxLength) {
    if (!text || text.length <= maxLength) {
        return text;
    }

    return text.slice(0, maxLength).trim().replace(/[,.!?;:]+$/, "") + "...";
}

function hasBadNewsWords(item) {
    const text = `${item.title} ${item.description}`.toLowerCase();

    return badNewsWords.some((word) => text.includes(word));
}

function getMotivationScore(item) {
    const text = `${item.title} ${item.description}`.toLowerCase();

    if (hasBadNewsWords(item)) {
        return -100;
    }

    let score = 0;

    for (const phrase of strongMotivationPhrases) {
        if (text.includes(phrase)) {
            score += 4;
        }
    }

    for (const word of softMotivationWords) {
        if (text.includes(word)) {
            score += 1;
        }
    }

    if (item.source.toLowerCase().includes("forbes")) {
        score += 2;
    }

    return score;
}

function isMotivationalNews(item) {
    return item.score >= 4 && !hasBadNewsWords(item);
}

function parseRssItems(xml, sourceName) {
    const rssItems = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
    const atomItems = xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
    const allItems = [...rssItems, ...atomItems];

    return allItems
        .map((itemXml) => {
            const title = getTagValue(itemXml, "title");
            const description =
                getTagValue(itemXml, "description") ||
                getTagValue(itemXml, "summary") ||
                getTagValue(itemXml, "content:encoded");
            const url = getLinkValue(itemXml);

            const item = {
                source: sourceName,
                title: shortenText(title, 120),
                description: shortenText(description, 175),
                url,
            };

            return {
                ...item,
                score: getMotivationScore(item),
            };
        })
        .filter((item) => item.title && item.description && item.url)
        .filter((item) => item.title.length >= 12 && item.description.length >= 25);
}

async function fetchWithTimeout(url, options = {}, timeout = 6000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timeoutId);
    }
}

async function loadMotivationNewsFromSource(source) {
    const response = await fetchWithTimeout(source.url, {
        headers: {
            "User-Agent": "Mozilla/5.0 TaskTailMotivationParser/1.0",
            "Accept": "application/rss+xml, application/xml, text/xml, */*",
        },
    });

    if (!response.ok) {
        throw new Error(`Не удалось загрузить RSS: ${source.url}`);
    }

    const xml = await response.text();

    return parseRssItems(xml, source.source);
}

async function loadMotivationNews() {
    const todayKey = getGmtPlus5DateKey();

    if (cachedMotivationNews.length > 0 && motivationNewsCacheDate === todayKey) {
        return cachedMotivationNews;
    }

    const results = await Promise.allSettled(
        MOTIVATION_NEWS_SOURCES.map(loadMotivationNewsFromSource)
    );

    const allNews = [];

    for (const result of results) {
        if (result.status === "fulfilled") {
            allNews.push(...result.value);
        } else {
            console.error("Один из RSS-источников не загрузился:", result.reason.message);
        }
    }

    const uniqueNews = [];

    for (const item of allNews) {
        const alreadyExists = uniqueNews.some(
            (currentItem) => currentItem.title === item.title || currentItem.url === item.url
        );

        if (!alreadyExists) {
            uniqueNews.push(item);
        }
    }

    const sortedNews = uniqueNews.sort((left, right) => right.score - left.score);
    const motivationalNews = sortedNews.filter(isMotivationalNews);

    const newsForPage = motivationalNews.length >= 3
        ? motivationalNews.slice(0, 3)
        : shuffleByDate(fallbackMotivationNews, todayKey).slice(0, 3);

    cachedMotivationNews = newsForPage.map(({ score, ...item }) => item);
    motivationNewsCacheDate = todayKey;

    return cachedMotivationNews;
}

function sendHabitsResponse(res, user, expiredCount = 0) {
    return res.json({
        success: true,
        habits: user.habits,
        snakePenalty: user.snakePenalty || 0,
        expiredCount,
    });
}

app.get("/api/health", (req, res) => {
    res.json({ message: "Сервер работает" });
});

app.post("/api/register", (req, res) => {
    const { login, password } = req.body;
    const users = readUsers();

    if (!login || !password) {
        return res.status(400).json({
            success: false,
            message: "Заполните логин и пароль",
        });
    }

    const existingUser = findUser(users, login);

    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "Пользователь с таким логином уже существует",
        });
    }

    const newUser = {
        login,
        password,
        firstName: "",
        lastName: "",
        photo: "",
        habits: [],
        snakePenalty: 0,
    };

    users.push(newUser);
    saveUsers(users);

    return res.json({
        success: true,
        message: "Регистрация прошла успешно",
        user: hidePassword(newUser),
    });
});

app.post("/api/login", (req, res) => {
    const { login, password } = req.body;
    const users = readUsers();

    if (!login || !password) {
        return res.status(400).json({
            success: false,
            message: "Заполните логин и пароль",
        });
    }

    const user = users.find(
        (item) => item.login === login && item.password === password
    );

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Логин или пароль введены неверно",
        });
    }

    prepareUser(user);
    removeExpiredHabits(user);
    saveUsers(users);

    return res.json({
        success: true,
        message: "Добро пожаловать!",
        user: hidePassword(user),
    });
});

app.put("/api/profile", (req, res) => {
    const { login, firstName, lastName, photo } = req.body;
    const users = readUsers();
    const user = findUser(users, login);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "Пользователь не найден",
        });
    }

    prepareUser(user);

    user.firstName = firstName || "";
    user.lastName = lastName || "";
    user.photo = photo || "";

    saveUsers(users);

    return res.json({
        success: true,
        message: "Профиль сохранен",
        user: hidePassword(user),
    });
});

app.get("/api/habits/:login", (req, res) => {
    const users = readUsers();
    const user = findUser(users, req.params.login);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "Пользователь не найден",
        });
    }

    prepareUser(user);
    const expiredCount = removeExpiredHabits(user);
    saveUsers(users);

    return sendHabitsResponse(res, user, expiredCount);
});

app.post("/api/habits", (req, res) => {
    const { login, title } = req.body;
    const users = readUsers();
    const user = findUser(users, login);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "Пользователь не найден",
        });
    }

    if (!title || title.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Введите название привычки",
        });
    }

    prepareUser(user);
    const expiredCount = removeExpiredHabits(user);

    user.habits.push({
        id: String(Date.now()),
        title: title.trim(),
        createdAt: Date.now(),
        completedDates: {},
        photosByDate: {},
    });

    saveUsers(users);

    return sendHabitsResponse(res, user, expiredCount);
});

app.put("/api/habits/:habitId/toggle", (req, res) => {
    const { login, date, completed } = req.body;
    const users = readUsers();
    const user = findUser(users, login);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "Пользователь не найден",
        });
    }

    prepareUser(user);
    const expiredCount = removeExpiredHabits(user);

    const habit = user.habits.find((item) => item.id === req.params.habitId);

    if (!habit) {
        saveUsers(users);

        return res.status(404).json({
            success: false,
            message: "Задача просрочена или не найдена",
            habits: user.habits,
            snakePenalty: user.snakePenalty || 0,
            expiredCount,
        });
    }

    if (!habit.completedDates) {
        habit.completedDates = {};
    }

    habit.completedDates[date] = Boolean(completed);

    saveUsers(users);

    return sendHabitsResponse(res, user, expiredCount);
});

app.put("/api/habits/:habitId/photo", (req, res) => {
    const { login, date, photo } = req.body;
    const users = readUsers();
    const user = findUser(users, login);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "Пользователь не найден",
        });
    }

    prepareUser(user);
    const expiredCount = removeExpiredHabits(user);

    const habit = user.habits.find((item) => item.id === req.params.habitId);

    if (!habit) {
        saveUsers(users);

        return res.status(404).json({
            success: false,
            message: "Задача просрочена или не найдена",
            habits: user.habits,
            snakePenalty: user.snakePenalty || 0,
            expiredCount,
        });
    }

    if (!habit.photosByDate) {
        habit.photosByDate = {};
    }

    habit.photosByDate[date] = photo || "";

    saveUsers(users);

    return sendHabitsResponse(res, user, expiredCount);
});

app.delete("/api/habits/:habitId", (req, res) => {
    const { login } = req.body;
    const users = readUsers();
    const user = findUser(users, login);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "Пользователь не найден",
        });
    }

    prepareUser(user);
    const expiredCount = removeExpiredHabits(user);

    user.habits = user.habits.filter((item) => item.id !== req.params.habitId);

    saveUsers(users);

    return sendHabitsResponse(res, user, expiredCount);
});

app.get("/api/affirmations", async (req, res) => {
    const affirmations = await loadAffirmations();

    res.json({
        success: true,
        affirmations,
    });
});

app.get("/api/motivation-news", async (req, res) => {
    try {
        const news = await loadMotivationNews();

        res.json({
            success: true,
            news,
        });
    } catch (error) {
        console.error("Ошибка загрузки мотивационных материалов:", error);

        res.status(503).json({
            success: false,
            message: "Сейчас не удалось получить материалы с сайтов. Попробуйте обновить страницу позже.",
            news: [],
        });
    }
});

app.post("/api/feedback", (request, response) => {
    const { text } = request.body;

    if (!text || text.trim() === "") {
        return response.status(400).json({
            message: "Текст сообщения не должен быть пустым",
        });
    }

    console.log("Сообщение обратной связи:", text);

    response.json({
        message: "Сообщение успешно получено сервером",
        receivedText: text,
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Сервер запущен: http://localhost:${PORT}/api/health`);
});