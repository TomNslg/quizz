(() => {
  const STORAGE_KEY = "quizz-v1";
  const COUNTRIES = Array.isArray(window.QUIZZ_COUNTRIES)
    ? window.QUIZZ_COUNTRIES.slice().sort((a, b) => a.order - b.order)
    : [];

  const QUIZ_DEFS = [
    {
      id: "capital-fwd",
      group: "Capitales",
      title: "Pays → capitale",
      glyph: "Ca",
      mode: "qa",
      field: "capital",
      direction: "fwd",
    },
    {
      id: "capital-rev",
      group: "Capitales",
      title: "Capitale → pays",
      glyph: "Ca",
      mode: "qa",
      field: "capital",
      direction: "rev",
    },
    {
      id: "iso3-fwd",
      group: "Code ISO3",
      title: "Pays → code 3 lettres",
      glyph: "3L",
      mode: "qa",
      field: "iso3",
      direction: "fwd",
    },
    {
      id: "iso3-rev",
      group: "Code ISO3",
      title: "Code 3 lettres → pays",
      glyph: "3L",
      mode: "qa",
      field: "iso3",
      direction: "rev",
    },
    {
      id: "iso2-fwd",
      group: "Code ISO2",
      title: "Pays → code 2 lettres",
      glyph: "2L",
      mode: "qa",
      field: "iso2",
      direction: "fwd",
    },
    {
      id: "iso2-rev",
      group: "Code ISO2",
      title: "Code 2 lettres → pays",
      glyph: "2L",
      mode: "qa",
      field: "iso2",
      direction: "rev",
    },
    {
      id: "indicatif-fwd",
      group: "Indicatif",
      title: "Pays → indicatif",
      glyph: "+#",
      mode: "qa",
      field: "indicatif",
      direction: "fwd",
      phonePad: true,
    },
    {
      id: "indicatif-rev",
      group: "Indicatif",
      title: "Indicatif → pays",
      glyph: "+#",
      mode: "qa",
      field: "indicatif",
      direction: "rev",
    },
    {
      id: "currency-fwd",
      group: "Devise",
      title: "Pays → code devise",
      glyph: "$",
      mode: "qa",
      field: "currency",
      direction: "fwd",
    },
    {
      id: "currency-rev",
      group: "Devise",
      title: "Code devise → pays",
      glyph: "$",
      mode: "qa",
      field: "currency",
      direction: "rev",
    },
    {
      id: "memory-countries",
      group: "Mémoire",
      title: "Tous les pays",
      glyph: "∑",
      mode: "memory",
      field: "name",
    },
    {
      id: "memory-capitals",
      group: "Mémoire",
      title: "Toutes les capitales",
      glyph: "∑",
      mode: "memory",
      field: "capital",
    },
  ];

  const FIELD_LABELS = {
    capital: { promptFwd: "Capitale de", promptRev: "Pays dont la capitale est" },
    iso3: { promptFwd: "Code ISO3 de", promptRev: "Pays du code ISO3" },
    iso2: { promptFwd: "Code ISO2 de", promptRev: "Pays du code ISO2" },
    indicatif: { promptFwd: "Indicatif de", promptRev: "Pays de l'indicatif" },
    currency: { promptFwd: "Code devise de", promptRev: "Pays du code devise" },
  };

  /** Extra short names accepted for countries (after softKey). */
  const COUNTRY_SHORT = {
    "États-Unis": ["usa", "us", "etats unis", "america"],
    "Royaume-Uni": ["uk", "gb", "angleterre", "grande bretagne"],
    "République tchèque": ["tcheque", "czechia"],
    "Sao Tomé-et-Principe": ["sao tome", "sao tome principe"],
    "Émirats arabes unis": ["eau", "emirats", "uae"],
    "République dominicaine": ["dominicaine"],
    "République centrafricaine": ["centrafrique", "rca"],
    "République du Congo": ["congo brazzaville", "congo"],
    "RD Congo": ["rdc", "congo kinshasa", "congo"],
    "Bosnie-Herzégovine": ["bosnie"],
    "Macédoine du Nord": ["macedoine"],
    "Papouasie-Nouvelle-Guinée": ["papouasie", "png"],
    "Trinité-et-Tobago": ["trinite", "trinidad"],
    "Antigua-et-Barbuda": ["antigua"],
    "Saint-Vincent-et-Grenadines": ["saint vincent"],
    "Saint-Kitts-et-Nevis": ["saint kitts", "saint christophe"],
    "Saint-Christophe-et-Niévès": ["saint kitts", "saint christophe"],
    "Sainte-Lucie": ["sainte lucie"],
    "Cap-Vert": ["cap vert", "cabo verde"],
    "Côte d'Ivoire": ["cote divoire", "ivoire"],
    "Guinée équatoriale": ["guinee equa"],
    "Guinée-Bissau": ["guinee bissau"],
    "Soudan du Sud": ["sud soudan"],
    "Corée du Sud": ["coree sud", "sud coree"],
    "Corée du Nord": ["coree nord", "nord coree"],
    "Timor oriental": ["timor", "timor leste"],
    "Cité du Vatican": ["vatican"],
    "La Réunion / Mayotte": ["reunion", "mayotte", "la reunion"],
    "Terres australes et antarctiques françaises": ["taaf", "terres australes"],
    "Géorgie du Sud-et-les îles Sandwich du Sud": ["georgie du sud"],
    "Îles Vierges britanniques": ["vierges britanniques", "bvi"],
    "Îles Vierges des États-Unis": ["vierges americaines", "usvi"],
    "États fédérés de Micronésie": ["micronesie", "fsm"],
    "Biélorussie": ["belarus", "belaru"],
    "Birmanie": ["myanmar"],
    "Eswatini": ["swaziland"],
  };

  const CAPITAL_SHORT = {
    Washington: ["washington dc", "dc"],
    "Andorre-la-Vieille": ["andorre"],
    "La Valette": ["valette"],
    "Port-d'Espagne": ["port despagne"],
    "Saint-Domingue": ["saint domingue"],
    "New Delhi": ["delhi"],
    "Abou Dabi": ["abu dhabi", "abou dhabi"],
    "Ulan Bator": ["oulan bator"],
    Kyiv: ["kiev"],
    "Mexico": ["mexico city"],
  };

  const state = {
    view: "home",
    quizId: null,
    session: null,
    tokenDraft: "",
    tokenStatus: "",
    tokenOk: null,
    timerHandle: null,
  };

  /* —— Normalize / match —— */

  function fold(str) {
    return String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/œ/gi, "oe")
      .replace(/æ/gi, "ae")
      .replace(/ß/g, "ss");
  }

  /** Strip accents, spaces, hyphens, apostrophes for tolerant compare. */
  function softKey(str) {
    return fold(str)
      .toLowerCase()
      .replace(/[''`´’‘]/g, "")
      .replace(/[-–—_/.,]/g, "")
      .replace(/\s+/g, "");
  }

  function digitsOnly(str) {
    return String(str || "").replace(/\D/g, "");
  }

  function levenshtein(a, b) {
    const s = String(a);
    const t = String(b);
    const n = s.length;
    const m = t.length;
    if (n === 0) return m;
    if (m === 0) return n;
    if (Math.abs(n - m) > 2) return 99;
    let prev = new Array(m + 1);
    let cur = new Array(m + 1);
    for (let j = 0; j <= m; j++) prev[j] = j;
    for (let i = 1; i <= n; i++) {
      cur[0] = i;
      const sc = s.charCodeAt(i - 1);
      for (let j = 1; j <= m; j++) {
        const cost = sc === t.charCodeAt(j - 1) ? 0 : 1;
        cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      }
      [prev, cur] = [cur, prev];
    }
    return prev[m];
  }

  /** Max edit distance allowed for a given string length. */
  function typoBudget(len) {
    if (len <= 2) return 0;
    if (len === 3) return 1;
    return 2;
  }

  /** Drop common leading geographic words for abbreviation matching. */
  function stripLeadNoise(key) {
    return key.replace(
      /^(republique|royaume|etats|etat|iles|ile|saint|sainte|federation|democratique|rd)+/g,
      "",
    );
  }

  function fuzzyTextMatch(input, expected) {
    const a = softKey(input);
    const b = softKey(expected);
    if (!a || !b) return false;
    if (a === b) return true;

    const budget = Math.min(typoBudget(a.length), typoBudget(b.length));
    if (budget > 0 && levenshtein(a, b) <= budget) return true;

    // Abbreviation: typed form is a long-enough contiguous piece of the full name
    if (a.length >= 4 && (b.includes(a) || stripLeadNoise(b).includes(a))) return true;
    // Or typed form is a prefix of the full name (sao tome → sao tome et principe)
    if (a.length >= 4 && (b.startsWith(a) || stripLeadNoise(b).startsWith(a))) return true;

    return false;
  }

  function countryNames(c) {
    const extras = COUNTRY_SHORT[c.name] || [];
    return [c.name, ...(c.altNames || []), ...extras].filter(Boolean);
  }

  function capitalNames(c) {
    if (!c.capital) return [];
    const extras = CAPITAL_SHORT[c.capital] || [];
    return [c.capital, ...(c.altCapitals || []), ...extras].filter(Boolean);
  }

  function fieldValue(c, field) {
    if (field === "name") return c.name;
    if (field === "capital") return c.capital;
    return c[field] || null;
  }

  function poolForQuiz(def) {
    return COUNTRIES.filter((c) => {
      const v = fieldValue(c, def.field);
      return v != null && String(v).trim() !== "" && String(v) !== "—";
    });
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function matchesCountryName(input, c) {
    if (!softKey(input)) return false;
    return countryNames(c).some((n) => fuzzyTextMatch(input, n));
  }

  function matchesCapital(input, c) {
    if (!softKey(input)) return false;
    return capitalNames(c).some((n) => fuzzyTextMatch(input, n));
  }

  function matchesCode(input, expected) {
    const a = softKey(input);
    const b = softKey(expected);
    if (!a || !b) return false;
    if (a === b) return true;
    const budget = Math.min(typoBudget(a.length), typoBudget(b.length));
    return budget > 0 && levenshtein(a, b) <= budget;
  }

  function matchesIndicatif(input, expected) {
    return digitsOnly(input) === digitsOnly(expected);
  }

  /** Accept answer for a QA item. */
  function checkAnswer(def, item, raw) {
    const c = item.country;
    if (def.direction === "fwd") {
      if (def.field === "indicatif") return matchesIndicatif(raw, c.indicatif);
      if (def.field === "capital") return matchesCapital(raw, c);
      if (def.field === "iso2" || def.field === "iso3" || def.field === "currency") {
        return matchesCode(raw, c[def.field]);
      }
      return false;
    }
    const promptVal = item.promptValue;
    const candidates = poolForQuiz(def).filter((x) => {
      if (def.field === "indicatif") return matchesIndicatif(x.indicatif, promptVal);
      return softKey(x[def.field]) === softKey(promptVal);
    });
    return candidates.some((x) => matchesCountryName(raw, x));
  }

  function expectedDisplay(def, item) {
    const c = item.country;
    if (def.direction === "fwd") {
      if (def.field === "indicatif") return `+${c.indicatif}`;
      return String(c[def.field] || "");
    }
    return c.name;
  }

  function itemKey(item) {
    return item.country?.id || `${item.promptValue}`;
  }

  /* —— Persistence —— */

  function loadDb() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { scores: {}, settings: {} };
      const data = JSON.parse(raw);
      return {
        scores: data.scores && typeof data.scores === "object" ? data.scores : {},
        settings: data.settings && typeof data.settings === "object" ? data.settings : {},
      };
    } catch {
      return { scores: {}, settings: {} };
    }
  }

  function saveDb(db) {
    if (!db.settings) db.settings = {};
    db.settings.contentUpdatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    if (window.QuizzSync?.isEnabled() && window.QuizzSync.canWrite()) {
      const payload = {
        kind: "quizz-backup",
        exportedAt: db.settings.contentUpdatedAt,
        scores: db.scores,
        settings: db.settings,
      };
      window.QuizzSync.push(payload).catch((err) => {
        window.QuizzSync.setLastError(err.message || String(err));
      });
    }
  }

  function getScore(quizId) {
    return loadDb().scores[quizId] || {};
  }

  function formatMs(ms) {
    if (ms == null || !Number.isFinite(ms)) return "—";
    const total = Math.max(0, Math.round(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    if (m <= 0) return `${s}s`;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function stopTimerTick() {
    if (state.timerHandle) {
      clearInterval(state.timerHandle);
      state.timerHandle = null;
    }
  }

  function elapsedMs(session) {
    if (!session?.startedAt) return 0;
    const end = session.endedAt || Date.now();
    return Math.max(0, end - session.startedAt);
  }

  function recordSessionResult(session) {
    const quizId = session.def.id;
    const db = loadDb();
    const prev = db.scores[quizId] || {};
    const total = session.items.length;
    const correct = session.correct;
    const ms = elapsedMs(session);
    const perfect = correct === total && total > 0;

    const pendingIds = (session.missedKeys || []).slice();

    const next = {
      bestCorrect: Math.max(prev.bestCorrect || 0, correct),
      bestTotal: Math.max(prev.bestTotal || 0, total),
      plays: (prev.plays || 0) + 1,
      lastAt: new Date().toISOString(),
      pendingIds,
      lastMs: ms,
      bestMs: prev.bestMs || null,
    };

    // Best time: perfect run of a full series (not a retry-of-errors round)
    if (perfect && !session.retryMode) {
      if (next.bestMs == null || ms < next.bestMs) next.bestMs = ms;
    }
    // Also track best time clearing an error round
    if (perfect && session.retryMode) {
      if (prev.bestRetryMs == null || ms < prev.bestRetryMs) next.bestRetryMs = ms;
      else next.bestRetryMs = prev.bestRetryMs;
    } else if (prev.bestRetryMs != null) {
      next.bestRetryMs = prev.bestRetryMs;
    }

    db.scores[quizId] = next;
    saveDb(db);
  }

  function clearPending(quizId) {
    const db = loadDb();
    const prev = db.scores[quizId] || {};
    db.scores[quizId] = { ...prev, pendingIds: [] };
    saveDb(db);
  }

  /* —— Session builders —— */

  function buildQaItems(def, countries) {
    return countries.map((country) => {
      let promptValue;
      let promptText;
      if (def.direction === "fwd") {
        promptValue = country.name;
        promptText = country.name;
      } else {
        promptValue = country[def.field];
        promptText =
          def.field === "indicatif" ? `+${country.indicatif}` : String(promptValue);
      }
      return { country, promptValue, promptText, wasWrong: false };
    });
  }

  function startQaSession(def, opts = {}) {
    const fullPool = poolForQuiz(def);
    const sc = getScore(def.id);
    const pending = Array.isArray(sc.pendingIds) ? sc.pendingIds.filter(Boolean) : [];
    let retryMode = false;
    let countries;

    if (opts.full) {
      countries = shuffle(fullPool);
      retryMode = false;
    } else if (pending.length) {
      const set = new Set(pending);
      countries = shuffle(fullPool.filter((c) => set.has(c.id)));
      if (!countries.length) countries = shuffle(fullPool);
      else retryMode = true;
    } else {
      countries = shuffle(fullPool);
    }

    return {
      def,
      mode: "qa",
      items: buildQaItems(def, countries),
      index: 0,
      correct: 0,
      answered: false,
      feedback: null,
      input: "",
      done: false,
      retryMode,
      fullPoolSize: fullPool.length,
      startedAt: Date.now(),
      endedAt: null,
      missedKeys: [],
    };
  }

  function startMemorySession(def) {
    const rows = poolForQuiz(def).map((c) => ({
      country: c,
      expected: fieldValue(c, def.field),
      filled: false,
      justFilled: false,
    }));
    return {
      def,
      mode: "memory",
      rows,
      found: 0,
      total: rows.length,
      input: "",
      feedback: null,
      done: false,
      startedAt: Date.now(),
      endedAt: null,
    };
  }

  function startQuiz(id, opts = {}) {
    const def = QUIZ_DEFS.find((q) => q.id === id);
    if (!def) return;
    stopTimerTick();
    state.quizId = id;
    state.session =
      def.mode === "memory" ? startMemorySession(def) : startQaSession(def, opts);
    state.view = def.mode === "memory" ? "memory" : "quiz";
    render();
  }

  /* —— DOM helpers —— */

  const app = document.getElementById("app");

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function liveTimerText(session) {
    return formatMs(elapsedMs(session));
  }

  function startTimerUi(root) {
    stopTimerTick();
    const node = root.querySelector("[data-timer]");
    if (!node || !state.session || state.session.done) return;
    state.timerHandle = setInterval(() => {
      if (!state.session || state.session.done) {
        stopTimerTick();
        return;
      }
      node.textContent = liveTimerText(state.session);
    }, 250);
  }

  /* —— Views —— */

  function renderHome() {
    stopTimerTick();
    const db = loadDb();
    const groups = [];
    let last = null;
    for (const q of QUIZ_DEFS) {
      if (q.group !== last) {
        groups.push({ name: q.group, items: [] });
        last = q.group;
      }
      groups[groups.length - 1].items.push(q);
    }

    const syncOn = window.QuizzSync?.isEnabled();
    const hasTok = window.QuizzSync?.hasToken();

    const root = el(`<div class="anim-rise"></div>`);
    root.innerHTML = `
      <header>
        <h1 class="brand">Qu<span>izz</span></h1>
        <p class="tagline">Pays, capitales, codes et indicatifs — depuis n’importe quel téléphone.</p>
      </header>
      <div class="quiz-list"></div>
      <div class="home-foot">
        <button type="button" class="ghost-btn" data-go="token">
          ${hasTok ? "Jeton sync enregistré — modifier" : "Configurer le jeton sync (appareils)"}
        </button>
        <p class="sync-pill">${
          syncOn
            ? hasTok
              ? "Sync GitHub active sur cet appareil."
              : "Entrez un jeton fine-grained pour synchroniser la progression."
            : ""
        }</p>
      </div>
    `;

    const list = root.querySelector(".quiz-list");
    for (const g of groups) {
      list.appendChild(el(`<div class="section-label">${escapeHtml(g.name)}</div>`));
      for (const q of g.items) {
        const sc = db.scores[q.id] || {};
        const pending = Array.isArray(sc.pendingIds) ? sc.pendingIds.length : 0;
        const parts = [];
        if (sc.bestMs != null) parts.push(`record ${formatMs(sc.bestMs)}`);
        if (pending && q.mode === "qa") parts.push(`${pending} à revoir`);
        else if (sc.bestCorrect != null) parts.push(`meilleur ${sc.bestCorrect}/${sc.bestTotal || "—"}`);
        const sub = parts.length ? ` · ${parts.join(" · ")}` : "";
        const btn = el(`
          <button type="button" class="quiz-link" data-quiz="${escapeHtml(q.id)}">
            <span class="glyph">${escapeHtml(q.glyph)}</span>
            <span class="meta">
              <p class="title">${escapeHtml(q.title)}</p>
              <p class="sub">${escapeHtml(q.group)}${escapeHtml(sub)}</p>
            </span>
            <span class="chev" aria-hidden="true">›</span>
          </button>
        `);
        list.appendChild(btn);
      }
    }

    root.querySelectorAll("[data-quiz]").forEach((btn) => {
      btn.addEventListener("click", () => startQuiz(btn.getAttribute("data-quiz")));
    });
    root.querySelector("[data-go=token]").addEventListener("click", () => {
      state.view = "token";
      state.tokenDraft = "";
      state.tokenStatus = "";
      state.tokenOk = null;
      render();
    });

    app.replaceChildren(root);
  }

  function renderToken() {
    stopTimerTick();
    const root = el(`<div class="anim-rise"></div>`);
    root.innerHTML = `
      <div class="top">
        <button type="button" class="back" data-back aria-label="Retour">←</button>
        <h1 class="view-title">Jeton sync</h1>
      </div>
      <div class="panel">
        <h2>Fine-grained PAT</h2>
        <p>Comme Snapszli : un jeton limité au dépôt <strong>TomNslg/quizz</strong> avec permission Contents en lecture/écriture. Stocké uniquement dans le localStorage de l’appareil.</p>
        <input class="token-input" type="password" autocomplete="off" spellcheck="false"
          placeholder="github_pat_…" data-token />
        <div class="btn-row">
          <button type="button" class="btn btn-primary" data-save>Enregistrer le jeton</button>
        </div>
        <div class="btn-row">
          <button type="button" class="btn btn-secondary" data-clear>Effacer</button>
        </div>
        <p class="status-msg ${state.tokenOk === true ? "ok" : state.tokenOk === false ? "bad" : ""}" data-status></p>
      </div>
    `;

    const input = root.querySelector("[data-token]");
    input.value = state.tokenDraft;
    input.addEventListener("input", () => {
      state.tokenDraft = input.value;
    });

    root.querySelector("[data-back]").addEventListener("click", () => {
      state.view = "home";
      render();
    });

    root.querySelector("[data-save]").addEventListener("click", async () => {
      const status = root.querySelector("[data-status]");
      try {
        window.QuizzSync.setToken(state.tokenDraft);
        status.textContent = "Test d’écriture…";
        status.className = "status-msg";
        await window.QuizzSync.testWrite();
        state.tokenOk = true;
        state.tokenStatus = "Jeton OK — écriture réussie.";
        status.textContent = state.tokenStatus;
        status.className = "status-msg ok";
      } catch (err) {
        state.tokenOk = false;
        state.tokenStatus = err.message || String(err);
        status.textContent = state.tokenStatus;
        status.className = "status-msg bad";
      }
    });

    root.querySelector("[data-clear]").addEventListener("click", () => {
      window.QuizzSync.clearToken();
      state.tokenDraft = "";
      input.value = "";
      state.tokenOk = null;
      root.querySelector("[data-status]").textContent = "Jeton effacé.";
      root.querySelector("[data-status]").className = "status-msg";
    });

    if (state.tokenStatus) {
      const status = root.querySelector("[data-status]");
      status.textContent = state.tokenStatus;
      status.className = `status-msg ${state.tokenOk ? "ok" : "bad"}`;
    }

    app.replaceChildren(root);
  }

  function markQaResult(session, ok) {
    const item = session.items[session.index];
    item.wasWrong = !ok;
    if (!ok) {
      const key = itemKey(item);
      if (!session.missedKeys.includes(key)) session.missedKeys.push(key);
    }
  }

  function submitQa(session) {
    if (session.answered || session.done) return;
    const item = session.items[session.index];
    const def = session.def;
    const ok = checkAnswer(def, item, session.input);
    session.answered = true;
    markQaResult(session, ok);
    session.feedback = ok
      ? { ok: true, text: "Correct !" }
      : { ok: false, text: `Non — ${expectedDisplay(def, item)}` };
    if (ok) session.correct += 1;
    render();
  }

  function finishQa(session) {
    session.done = true;
    session.endedAt = Date.now();
    stopTimerTick();
    // If some answers were correct after being listed as missed earlier in this pass, keep only still-wrong
    session.missedKeys = session.items.filter((it) => it.wasWrong).map(itemKey);
    recordSessionResult(session);
  }

  function nextQa(session) {
    if (!session.answered) return;
    session.index += 1;
    session.answered = false;
    session.feedback = null;
    session.input = "";
    if (session.index >= session.items.length) finishQa(session);
    render();
  }

  function renderQuiz() {
    const session = state.session;
    const def = session.def;
    const sc = getScore(def.id);

    if (session.done) {
      stopTimerTick();
      const ms = elapsedMs(session);
      const pending = session.missedKeys.length;
      const isRecord =
        !session.retryMode &&
        session.correct === session.items.length &&
        sc.bestMs != null &&
        ms === sc.bestMs;
      const root = el(`<div class="anim-rise results"></div>`);
      root.innerHTML = `
        <div class="top" style="justify-content:flex-start">
          <button type="button" class="back" data-home aria-label="Accueil">←</button>
        </div>
        <h2>${pending ? "Tour terminé" : "Terminé"}</h2>
        <p class="score">${session.correct} / ${session.items.length} correct${session.correct > 1 ? "s" : ""}</p>
        <p class="score-time">Temps : <strong>${escapeHtml(formatMs(ms))}</strong>${
          isRecord ? " · record !" : ""
        }</p>
        ${
          sc.bestMs != null
            ? `<p class="score-best">Meilleur temps (série complète) : ${escapeHtml(formatMs(sc.bestMs))}</p>`
            : ""
        }
        ${
          pending
            ? `<p class="score-pending">${pending} erreur${pending > 1 ? "s" : ""} — le prochain lancement ne rejouera que celles-ci.</p>`
            : session.retryMode
              ? `<p class="score-pending">Erreurs corrigées. Prochain lancement = série complète.</p>`
              : ""
        }
        <div class="btn-stack">
          ${
            pending
              ? `<button type="button" class="btn btn-primary" data-retry>Revoir les erreurs</button>`
              : `<button type="button" class="btn btn-primary" data-again>Rejouer</button>`
          }
          <button type="button" class="btn btn-secondary" data-full>Toute la série</button>
          <button type="button" class="btn btn-secondary" data-home2>Accueil</button>
        </div>
      `;
      const goHome = () => {
        state.view = "home";
        state.session = null;
        render();
      };
      root.querySelector("[data-home]").addEventListener("click", goHome);
      root.querySelector("[data-home2]").addEventListener("click", goHome);
      const again = root.querySelector("[data-again]");
      if (again) again.addEventListener("click", () => startQuiz(def.id));
      const retry = root.querySelector("[data-retry]");
      if (retry) retry.addEventListener("click", () => startQuiz(def.id));
      root.querySelector("[data-full]").addEventListener("click", () => {
        clearPending(def.id);
        startQuiz(def.id, { full: true });
      });
      app.replaceChildren(root);
      return;
    }

    const item = session.items[session.index];
    const labels = FIELD_LABELS[def.field];
    const promptLabel = def.direction === "fwd" ? labels.promptFwd : labels.promptRev;
    const pct = Math.round((session.index / session.items.length) * 100);
    const inputClass = session.answered
      ? session.feedback.ok
        ? "ok anim-ok"
        : "bad anim-shake"
      : "";

    const root = el(`<div class="anim-rise"></div>`);
    root.innerHTML = `
      <div class="top">
        <button type="button" class="back" data-back aria-label="Retour">←</button>
        <h1 class="view-title">${escapeHtml(def.group)}</h1>
        <span class="spacer"></span>
        <span class="timer-chip" data-timer>${escapeHtml(liveTimerText(session))}</span>
      </div>
      ${
        session.retryMode
          ? `<p class="retry-banner">Mode erreurs · ${session.items.length} question${session.items.length > 1 ? "s" : ""}</p>`
          : ""
      }
      <div class="progress-bar"><i style="width:${pct}%"></i></div>
      <div class="stats-row">
        <span>${session.index + 1} / ${session.items.length}</span>
        <span>${session.correct} juste${session.correct > 1 ? "s" : ""}</span>
      </div>
      <div class="prompt-block">
        <p class="prompt-label">${escapeHtml(promptLabel)}</p>
        <p class="prompt">${escapeHtml(item.promptText)}</p>
      </div>
      <div class="answer-wrap" data-answer-wrap></div>
      <p class="feedback ${session.feedback ? (session.feedback.ok ? "ok" : "bad") : ""}" data-fb>
        ${session.feedback ? escapeHtml(session.feedback.text) : ""}
      </p>
      <div class="btn-row">
        ${
          session.answered
            ? `<button type="button" class="btn btn-primary" data-next>Suivant</button>`
            : `<button type="button" class="btn btn-primary" data-ok>Valider</button>
               <button type="button" class="btn btn-secondary" data-skip>Passer</button>`
        }
      </div>
    `;

    const wrap = root.querySelector("[data-answer-wrap]");

    if (def.phonePad) {
      wrap.innerHTML = `
        <div class="phone-display ${inputClass}" data-phone-display>
          <span class="plus">+</span><span data-digits>${escapeHtml(session.input)}</span>
        </div>
        <div class="phone-pad" data-pad></div>
      `;
      const pad = wrap.querySelector("[data-pad]");
      const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];
      keys.forEach((k) => {
        if (k === "") {
          pad.appendChild(el(`<span class="pad-key empty"></span>`));
          return;
        }
        const btn = el(
          `<button type="button" class="pad-key ${k === "⌫" ? "action" : ""}">${k}</button>`,
        );
        btn.disabled = session.answered;
        btn.addEventListener("click", () => {
          if (session.answered) return;
          if (k === "⌫") session.input = session.input.slice(0, -1);
          else session.input += k;
          wrap.querySelector("[data-digits]").textContent = session.input;
        });
        pad.appendChild(btn);
      });
    } else {
      const autocapitalize =
        def.direction === "rev" || def.field === "capital" ? "words" : "characters";
      const input = el(
        `<input class="answer-input ${inputClass}" type="text" enterkeyhint="done"
          autocomplete="off" autocorrect="off" spellcheck="false"
          autocapitalize="${autocapitalize}"
          placeholder="Votre réponse" data-input />`,
      );
      input.value = session.input;
      input.disabled = session.answered;
      input.addEventListener("input", () => {
        session.input = input.value;
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (session.answered) nextQa(session);
          else submitQa(session);
        }
      });
      wrap.appendChild(input);
      if (!session.answered) {
        requestAnimationFrame(() => input.focus());
      }
    }

    root.querySelector("[data-back]").addEventListener("click", () => {
      // Leaving mid-series: keep existing pending; don't overwrite with partial
      stopTimerTick();
      state.view = "home";
      state.session = null;
      render();
    });

    const okBtn = root.querySelector("[data-ok]");
    if (okBtn) okBtn.addEventListener("click", () => submitQa(session));
    const skipBtn = root.querySelector("[data-skip]");
    if (skipBtn) {
      skipBtn.addEventListener("click", () => {
        session.input = "";
        session.answered = true;
        markQaResult(session, false);
        session.feedback = {
          ok: false,
          text: `Réponse : ${expectedDisplay(def, item)}`,
        };
        render();
      });
    }
    const nextBtn = root.querySelector("[data-next]");
    if (nextBtn) nextBtn.addEventListener("click", () => nextQa(session));

    app.replaceChildren(root);
    startTimerUi(root);
  }

  function tryMemoryAnswer(session) {
    const raw = session.input;
    if (!softKey(raw) && !digitsOnly(raw)) return;

    const pending = session.rows.filter((r) => !r.filled);
    let hit = null;

    if (session.def.field === "name") {
      hit = pending.find((r) => matchesCountryName(raw, r.country));
    } else if (session.def.field === "capital") {
      hit = pending.find((r) => matchesCapital(raw, r.country));
    }

    session.rows.forEach((r) => {
      r.justFilled = false;
    });

    if (hit) {
      hit.filled = true;
      hit.justFilled = true;
      session.found += 1;
      session.input = "";
      session.feedback = { ok: true, text: `✓ ${hit.expected}` };
      if (session.found >= session.total) {
        session.done = true;
        session.endedAt = Date.now();
        stopTimerTick();
        const db = loadDb();
        const prev = db.scores[session.def.id] || {};
        const ms = elapsedMs(session);
        db.scores[session.def.id] = {
          ...prev,
          bestCorrect: session.total,
          bestTotal: session.total,
          plays: (prev.plays || 0) + 1,
          lastAt: new Date().toISOString(),
          lastMs: ms,
          bestMs: prev.bestMs == null || ms < prev.bestMs ? ms : prev.bestMs,
          pendingIds: [],
        };
        saveDb(db);
      }
    } else {
      session.feedback = { ok: false, text: "Pas dans la liste restante." };
    }
    render();
  }

  function renderMemory() {
    const session = state.session;
    const def = session.def;
    const colLabel = def.field === "name" ? "Pays" : "Capitale";
    const sc = getScore(def.id);

    const root = el(`<div class="anim-rise"></div>`);

    if (session.done) {
      stopTimerTick();
      const ms = elapsedMs(session);
      root.innerHTML = `
        <div class="top">
          <button type="button" class="back" data-home aria-label="Accueil">←</button>
          <h1 class="view-title">${escapeHtml(def.title)}</h1>
        </div>
        <div class="results">
          <h2>Table complète</h2>
          <p class="score">${session.total} / ${session.total}</p>
          <p class="score-time">Temps : <strong>${escapeHtml(formatMs(ms))}</strong></p>
          ${
            sc.bestMs != null
              ? `<p class="score-best">Meilleur temps : ${escapeHtml(formatMs(sc.bestMs))}</p>`
              : ""
          }
          <div class="btn-row">
            <button type="button" class="btn btn-primary" data-again>Rejouer</button>
            <button type="button" class="btn btn-secondary" data-home2>Accueil</button>
          </div>
        </div>
      `;
      const goHome = () => {
        state.view = "home";
        state.session = null;
        render();
      };
      root.querySelector("[data-home]").addEventListener("click", goHome);
      root.querySelector("[data-home2]").addEventListener("click", goHome);
      root.querySelector("[data-again]").addEventListener("click", () => startQuiz(def.id));
      app.replaceChildren(root);
      return;
    }

    const rowsHtml = session.rows
      .map((r, i) => {
        const cls = r.filled ? `filled${r.justFilled ? " anim-fill" : ""}` : "";
        const val = r.filled
          ? escapeHtml(r.expected)
          : `<span class="blank">····</span>`;
        return `<tr class="${cls}"><td class="idx">${i + 1}</td><td>${val}</td></tr>`;
      })
      .join("");

    root.innerHTML = `
      <div class="top">
        <button type="button" class="back" data-back aria-label="Retour">←</button>
        <h1 class="view-title">${escapeHtml(def.title)}</h1>
        <span class="spacer"></span>
        <span class="timer-chip" data-timer>${escapeHtml(liveTimerText(session))}</span>
      </div>
      <div class="memory-stats">
        <span>${session.found} / ${session.total}</span>
        <span>ordre indicatif</span>
      </div>
      <p class="memory-hint">Tapez un nom ; une bonne réponse s’ajoute à la table (ordre du PDF).</p>
      <div class="memory-table-wrap">
        <table class="memory-table">
          <thead><tr><th>#</th><th>${escapeHtml(colLabel)}</th></tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
      <div class="answer-wrap">
        <input class="answer-input" type="text" enterkeyhint="done"
          autocomplete="off" autocorrect="off" spellcheck="false"
          autocapitalize="words" placeholder="${
            def.field === "name" ? "Nom du pays" : "Nom de la capitale"
          }" data-input />
      </div>
      <p class="feedback ${session.feedback ? (session.feedback.ok ? "ok" : "bad") : ""}">
        ${session.feedback ? escapeHtml(session.feedback.text) : ""}
      </p>
      <div class="btn-row">
        <button type="button" class="btn btn-primary" data-ok>Ajouter</button>
      </div>
    `;

    const input = root.querySelector("[data-input]");
    input.value = session.input;
    input.addEventListener("input", () => {
      session.input = input.value;
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        tryMemoryAnswer(session);
      }
    });
    root.querySelector("[data-ok]").addEventListener("click", () => tryMemoryAnswer(session));
    root.querySelector("[data-back]").addEventListener("click", () => {
      stopTimerTick();
      state.view = "home";
      state.session = null;
      render();
    });

    const just = root.querySelector("tr.anim-fill");
    if (just) just.scrollIntoView({ block: "nearest", behavior: "smooth" });

    requestAnimationFrame(() => input.focus());
    app.replaceChildren(root);
    startTimerUi(root);
  }

  function render() {
    if (state.view === "home") renderHome();
    else if (state.view === "token") renderToken();
    else if (state.view === "quiz") renderQuiz();
    else if (state.view === "memory") renderMemory();
  }

  /* —— Boot —— */
  if (window.QuizzSync) window.QuizzSync.init();
  if (!COUNTRIES.length) {
    app.innerHTML = `<p class="tagline">Données pays manquantes.</p>`;
    return;
  }
  render();
})();
