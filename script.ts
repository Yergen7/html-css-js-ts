// Браузерный скрипт страницы. Сборка: npx tsc -p tsconfig.web.json  →  script.js
(() => {
  "use strict";

  // ---------- Вспомогательные функции ----------
  function $<T extends HTMLElement>(id: string): T {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Элемент #${id} не найден`);
    return el as T;
  }

  function load<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  }

  function save(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage недоступен (приватный режим) — просто не сохраняем
    }
  }

  const pad = (n: number): string => String(n).padStart(2, "0");

  // ---------- 1. Тема (зелёная ↔ светлая) ----------
  type Theme = "dark" | "light";
  const themeBtn = $<HTMLButtonElement>("theme-toggle");

  function applyTheme(theme: Theme): void {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    themeBtn.textContent = theme === "light" ? "☀️" : "🌙";
    save("theme", theme);
  }

  let theme: Theme = load<Theme>("theme", "dark") === "light" ? "light" : "dark";
  applyTheme(theme);
  themeBtn.addEventListener("click", () => {
    theme = theme === "light" ? "dark" : "light";
    applyTheme(theme);
  });

  // ---------- 2. Приветствие и часы ----------
  const greetingEl = $("greeting");
  const clockEl = $("clock");

  function greetingFor(hour: number): string {
    if (hour < 5) return "Доброй ночи";
    if (hour < 12) return "Доброе утро";
    if (hour < 18) return "Добрый день";
    return "Добрый вечер";
  }

  function tickClock(): void {
    const now = new Date();
    greetingEl.textContent = greetingFor(now.getHours());
    clockEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }
  tickClock();
  setInterval(tickClock, 1000);

  // ---------- 3. Навыки: добавление, удаление, поиск, фильтр ----------
  const skillForm = $<HTMLFormElement>("skill-form");
  const skillInput = $<HTMLInputElement>("skill-input");
  const skillSearch = $<HTMLInputElement>("skill-search");
  const skillShort = $<HTMLButtonElement>("skill-short");
  const skillList = $<HTMLUListElement>("skill-list");
  const skillEmpty = $("skill-empty");
  const skillCount = $("skill-count");

  const defaultSkills = ["HTML", "CSS", "JavaScript", "Git", "TypeScript"];
  const stored = load<unknown>("skills", defaultSkills);
  let skills: string[] = Array.isArray(stored)
    ? stored.filter((s): s is string => typeof s === "string")
    : defaultSkills;
  let onlyShort = false;

  function renderSkills(): void {
    const query = skillSearch.value.trim().toLowerCase();
    const visible = skills.filter(
      (s) => s.toLowerCase().includes(query) && (!onlyShort || s.length <= 4),
    );

    skillList.replaceChildren();
    for (const skill of visible) {
      const li = document.createElement("li");
      li.className = "chip";

      const label = document.createElement("span");
      label.textContent = skill; // textContent — защита от вставки HTML

      const del = document.createElement("button");
      del.type = "button";
      del.className = "icon-btn";
      del.textContent = "×";
      del.dataset["skill"] = skill;
      del.setAttribute("aria-label", `Удалить навык ${skill}`);

      li.append(label, del);
      skillList.append(li);
    }

    skillEmpty.hidden = visible.length > 0;
    skillCount.textContent = `Показано ${visible.length} из ${skills.length}`;
  }

  skillForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = skillInput.value.trim();
    if (!value) return;
    if (skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
      skillInput.setCustomValidity("Такой навык уже есть");
      skillInput.reportValidity();
      skillInput.setCustomValidity("");
      return;
    }
    skills.push(value);
    save("skills", skills);
    skillInput.value = "";
    renderSkills();
  });

  skillList.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const skill = target.dataset["skill"];
    if (skill === undefined) return;
    skills = skills.filter((s) => s !== skill);
    save("skills", skills);
    renderSkills();
  });

  skillSearch.addEventListener("input", renderSkills);
  skillShort.addEventListener("click", () => {
    onlyShort = !onlyShort;
    skillShort.setAttribute("aria-pressed", String(onlyShort));
    renderSkills();
  });
  renderSkills();

  // ---------- 4. Список задач ----------
  type Todo = { id: number; text: string; done: boolean };

  const todoForm = $<HTMLFormElement>("todo-form");
  const todoInput = $<HTMLInputElement>("todo-input");
  const todoList = $<HTMLUListElement>("todo-list");
  const todoEmpty = $("todo-empty");
  const todoCount = $("todo-count");
  const todoClear = $<HTMLButtonElement>("todo-clear");

  const storedTodos = load<unknown>("todos", []);
  let todos: Todo[] = Array.isArray(storedTodos)
    ? storedTodos.filter(
        (t): t is Todo =>
          typeof t === "object" &&
          t !== null &&
          typeof (t as Todo).id === "number" &&
          typeof (t as Todo).text === "string" &&
          typeof (t as Todo).done === "boolean",
      )
    : [];

  function renderTodos(): void {
    todoList.replaceChildren();
    for (const todo of todos) {
      const li = document.createElement("li");
      li.className = todo.done ? "todo done" : "todo";

      const check = document.createElement("input");
      check.type = "checkbox";
      check.checked = todo.done;
      check.dataset["toggle"] = String(todo.id);
      check.setAttribute("aria-label", `Выполнено: ${todo.text}`);

      const text = document.createElement("span");
      text.textContent = todo.text;

      const del = document.createElement("button");
      del.type = "button";
      del.className = "icon-btn";
      del.textContent = "×";
      del.dataset["remove"] = String(todo.id);
      del.setAttribute("aria-label", `Удалить задачу ${todo.text}`);

      li.append(check, text, del);
      todoList.append(li);
    }

    const left = todos.filter((t) => !t.done).length;
    todoEmpty.hidden = todos.length > 0;
    todoCount.textContent = todos.length ? `Осталось: ${left} из ${todos.length}` : "";
    todoClear.disabled = !todos.some((t) => t.done);
  }

  todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;
    todos.push({ id: Date.now() + Math.floor(Math.random() * 1000), text, done: false });
    save("todos", todos);
    todoInput.value = "";
    renderTodos();
  });

  todoList.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const toggleId = target.dataset["toggle"];
    const removeId = target.dataset["remove"];
    if (toggleId !== undefined) {
      const todo = todos.find((t) => t.id === Number(toggleId));
      if (todo) todo.done = !todo.done;
    } else if (removeId !== undefined) {
      todos = todos.filter((t) => t.id !== Number(removeId));
    } else {
      return;
    }
    save("todos", todos);
    renderTodos();
  });

  todoClear.addEventListener("click", () => {
    todos = todos.filter((t) => !t.done);
    save("todos", todos);
    renderTodos();
  });
  renderTodos();

  // ---------- 5. Pomodoro-таймер ----------
  type Mode = "work" | "break";
  const durations: Record<Mode, number> = { work: 25 * 60, break: 5 * 60 };

  const display = $("timer-display");
  const bar = $("timer-bar");
  const toggleBtn = $<HTMLButtonElement>("timer-toggle");
  const resetBtn = $<HTMLButtonElement>("timer-reset");
  const statusEl = $("timer-status");
  const modeButtons: Record<Mode, HTMLButtonElement> = {
    work: $<HTMLButtonElement>("mode-work"),
    break: $<HTMLButtonElement>("mode-break"),
  };
  const baseTitle = document.title;

  let mode: Mode = "work";
  let remaining = durations[mode]; // секунд
  let endAt = 0; // момент окончания (мс), пока таймер идёт
  let timerId: number | undefined;

  function renderTimer(): void {
    const text = `${pad(Math.floor(remaining / 60))}:${pad(remaining % 60)}`;
    display.textContent = text;
    bar.style.width = `${((durations[mode] - remaining) / durations[mode]) * 100}%`;
    document.title = timerId === undefined ? baseTitle : `${text} — ${baseTitle}`;
    toggleBtn.textContent = timerId === undefined ? (remaining === durations[mode] ? "Старт" : "Продолжить") : "Пауза";
  }

  function stopTimer(): void {
    if (timerId !== undefined) {
      clearInterval(timerId);
      timerId = undefined;
    }
  }

  function tickTimer(): void {
    remaining = Math.max(0, Math.round((endAt - Date.now()) / 1000));
    if (remaining === 0) {
      stopTimer();
      statusEl.textContent = mode === "work" ? "Время вышло! Пора отдохнуть 🎉" : "Отдых закончен — за работу 💪";
      renderTimer();
      return;
    }
    renderTimer();
  }

  function setMode(next: Mode): void {
    stopTimer();
    mode = next;
    remaining = durations[mode];
    statusEl.textContent = "";
    for (const key of Object.keys(modeButtons) as Mode[]) {
      modeButtons[key].setAttribute("aria-pressed", String(key === mode));
    }
    renderTimer();
  }

  toggleBtn.addEventListener("click", () => {
    if (timerId !== undefined) {
      stopTimer();
      statusEl.textContent = "Пауза";
    } else {
      if (remaining === 0) remaining = durations[mode];
      endAt = Date.now() + remaining * 1000;
      timerId = window.setInterval(tickTimer, 250);
      statusEl.textContent = mode === "work" ? "Сосредоточься 🔥" : "Отдыхай ☕";
    }
    renderTimer();
  });

  resetBtn.addEventListener("click", () => setMode(mode));
  modeButtons.work.addEventListener("click", () => setMode("work"));
  modeButtons.break.addEventListener("click", () => setMode("break"));
  renderTimer();
})();
