const btnEn = document.querySelector(".english");
const btnHi = document.querySelector(".hindi");
const btnGu = document.querySelector(".gujrati");

const DEFAULT_LANG = "English";
const STORAGE_KEY = "selectedLanguage";
let translations = {};

// set active button
function setActiveButton(activeBtn) {
  [btnEn, btnHi, btnGu].forEach((btn) => btn.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
}

// apply language
function applyLanguage(lang) {
  const langData = translations[lang];
  if (!langData) return;

  document.documentElement.lang = lang;

  if (lang === "English") {
    document.body.setAttribute("data-lang", "en");
    setActiveButton(btnEn);
  } else if (lang === "Hindi") {
    document.body.setAttribute("data-lang", "hi");
    setActiveButton(btnHi);
  } else if (lang === "Gujarati") {
    document.body.setAttribute("data-lang", "gu");
    setActiveButton(btnGu);
  }

  document.querySelectorAll("[data-lang-key]").forEach((el) => {
    const key = el.getAttribute("data-lang-key");
    if (langData[key] !== undefined) {
      el.innerHTML = String(langData[key]).replace(/\n/g, "<br>");
    }
  });

  localStorage.setItem(STORAGE_KEY, lang);
}

// detect refresh
function isPageRefresh() {
  const navEntries = performance.getEntriesByType("navigation");
  if (navEntries.length > 0) {
    return navEntries[0].type === "reload";
  }
  return performance.navigation.type === 1;
}

// load language
window.addEventListener("DOMContentLoaded", () => {
  translations = typeof data !== "undefined" ? data : {};

  let langToApply = DEFAULT_LANG;
  const savedLang = localStorage.getItem(STORAGE_KEY);

  if (isPageRefresh()) {
    // on refresh always reset to English
    langToApply = DEFAULT_LANG;
    localStorage.setItem(STORAGE_KEY, DEFAULT_LANG);
  } else {
    // on normal page load / navigation keep selected language
    langToApply = savedLang || DEFAULT_LANG;
  }

  applyLanguage(langToApply);
});

// ── sound effects ────────────────────────────────────────────────────────
const AUDIO_PATH = "./assets/audio/";

const topicClickSound = new Audio(`${AUDIO_PATH}topic.mp3`);
const swiperClickSound = new Audio(`${AUDIO_PATH}swiper.mp3`);
const navClickSound = new Audio(`${AUDIO_PATH}click.mp3`);
const langClickSounds = {
  English: new Audio(`${AUDIO_PATH}Eng.mpeg`),
  Hindi: new Audio(`${AUDIO_PATH}Hin.mpeg`),
  Gujarati: new Audio(`${AUDIO_PATH}Guj.mpeg`),
};

[
  topicClickSound,
  swiperClickSound,
  navClickSound,
  ...Object.values(langClickSounds),
].forEach((audio) => {
  audio.preload = "auto";
});

function playSound(audio) {
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

// play a sound, then follow the link once it finishes or this cap is hit
function navigateWithSound(href, audio, maxWait) {
  let navigated = false;
  const go = () => {
    if (navigated) return;
    navigated = true;
    window.location.href = href;
  };

  audio.currentTime = 0;
  audio.addEventListener("ended", go, { once: true });

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(go);
  }

  setTimeout(go, maxWait);
}

// button clicks
if (btnEn) {
  btnEn.addEventListener("click", () => {
    playSound(langClickSounds.English);
    applyLanguage("English");
  });
}
if (btnHi) {
  btnHi.addEventListener("click", () => {
    playSound(langClickSounds.Hindi);
    applyLanguage("Hindi");
  });
}
if (btnGu) {
  btnGu.addEventListener("click", () => {
    playSound(langClickSounds.Gujarati);
    applyLanguage("Gujarati");
  });
}

(() => {
  const pages = document.querySelectorAll(".pages .page");

  pages.forEach((page) => {
    page.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const link = this.querySelector("a");
      if (!link) return;

      if (this.classList.contains("is-open")) {
        navigateWithSound(link.href, topicClickSound, 900);
        return;
      }

      pages.forEach((item) => {
        item.classList.remove("is-open");
      });

      this.classList.add("is-open");
    });
  });
})();

document
  .querySelectorAll(".swiper-prev-btn, .swiper-next-btn")
  .forEach((btn) => {
    btn.addEventListener("click", () => playSound(swiperClickSound));
  });

document.querySelectorAll(".home-btn, .back-btn, .home-btn-1").forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (!href) return;
    e.preventDefault();
    navigateWithSound(href, navClickSound, 600);
  });
});
