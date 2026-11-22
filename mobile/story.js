import { element } from "../shared/js/dom.js?v=2.24";

const imageRoot = "./shared/assets/media/web/mobile-story/";
const clamp = (value) => Math.max(0, Math.min(1, value));

/** A valóban görgethető oldal hosszán osztjuk el az öt képi állapotot.
 * A sáv alatt nem foglalunk helyet egy láthatatlan animációs pályával. */
export function mobileStoryStateAtScroll(scrollTop, maxScroll) {
  if (!Number.isFinite(scrollTop) || !Number.isFinite(maxScroll) || maxScroll <= 0) return 0;
  const progress = clamp(scrollTop / maxScroll);
  if (progress < .16) return 0;
  if (progress < .37) return 1;
  if (progress < .58) return 2;
  if (progress < .79) return 3;
  return 4;
}

/** Hat képből témánként három különbözőt sorsolunk: egyet a nyitó,
 * egyet a különálló és egyet a záró állapothoz. Új oldalnyitás = új sorsolás. */
export function selectMobileStoryPhotos(topics, random = Math.random) {
  if (!Array.isArray(topics) || topics.length !== 3 ||
    !topics.every((topic) => Array.isArray(topic.photos) && topic.photos.length === 6 &&
      new Set(topic.photos).size === 6)) {
    throw new Error("Mindhárom mobilos témához pontosan hat különböző kép szükséges.");
  }
  return topics.map((topic) => {
    const order = Array.from({ length: 6 }, (_, index) => index);
    for (let i = 5; i > 0; i--) {
      const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1))));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return {
      intro: topic.photos[order[0]],
      focus: topic.photos[order[1]],
      outro: topic.photos[order[2]]
    };
  });
}

/** Öt képi állapot a normál oldalgörgetésre; a tartalom rögtön alatta indul. */
export function createMobileStory(config) {
  const data = config.home?.mobileStory;
  const ids = ["sport", "tudas", "kozosseg"];
  const required = ["ariaLabel", "introTitle", "introSubtitle", "outroTitle", "outroSubtitle"];
  if (!data || !required.every((key) => typeof data[key] === "string" && data[key].trim()) ||
    !Array.isArray(data.topics) || data.topics.length !== 3 ||
    !data.topics.every((topic, index) => topic.id === ids[index] &&
      typeof topic.title === "string" && topic.title.trim() &&
      typeof topic.subtitle === "string" && topic.subtitle.trim() &&
      Array.isArray(topic.photos) && topic.photos.length === 6 &&
      topic.photos.every((file) => /^[a-z0-9-]+\.webp$/.test(file))) ||
    new Set(data.topics.flatMap((topic) => topic.photos)).size !== 18) {
    throw new Error("Érvénytelen mobilos képes történet-JSON.");
  }
  const picks = selectMobileStoryPhotos(data.topics);
  const states = [
    { id: "intro", mode: "trio", title: data.introTitle, subtitle: data.introSubtitle,
      photos: picks.map((choice) => choice.intro) },
    ...data.topics.map((topic, index) => ({ id: topic.id, mode: "single",
      title: topic.title, subtitle: topic.subtitle, photos: [picks[index].focus] })),
    { id: "outro", mode: "trio", title: data.outroTitle, subtitle: data.outroSubtitle,
      photos: picks.map((choice) => choice.outro) }
  ];
  // A kilenc kiválasztott képet előre kérjük: görgetéskor a következő
  // állapotot nem üres, még betöltetlen képhelyekre úsztatjuk rá.
  const warmedPhotos = [...new Set(states.flatMap((state) => state.photos))].map((file) => {
    const photo = document.createElement("img");
    photo.setAttribute("src", `${imageRoot}${file}`);
    return photo;
  });
  // Kettős képréteg: a témák közötti váltásnál az előző kép megmarad
  // a háttérben, amíg az új fotóréteg finoman ráúszik.
  const imageLayers = Array.from({ length: 2 }, () => Array.from({ length: 3 }, () =>
    element("img", { className: "mobile-story-photo", attributes: {
      alt: "", decoding: "async", width: "1672", height: "941"
    } })));
  const layerNodes = imageLayers.map((photos) => element("div", {
    className: "mobile-story-visual", attributes: { "aria-hidden": "true" }
  }, ...photos));
  const title = element("h1", { className: "mobile-story-title" });
  const subtitle = element("p", { className: "mobile-story-subtitle" });
  const stage = element("div", { className: "mobile-story-stage" },
    ...layerNodes,
    element("div", { className: "mobile-story-shade", attributes: { "aria-hidden": "true" } }),
    element("div", { className: "mobile-story-copy" }, title, subtitle));
  const track = element("section", { className: "mobile-story-track", attributes: {
    "aria-label": data.ariaLabel
  } }, stage);

  let index = -1;
  let activeLayer = 1;
  let disposed = false;
  let scheduled = false;
  function renderState(nextIndex) {
    if (nextIndex === index || disposed) return;
    index = nextIndex;
    const state = states[index];
    stage.dataset.storyState = state.id;
    stage.dataset.storyMode = state.mode;
    title.textContent = state.title;
    subtitle.textContent = state.subtitle;
    const nextLayer = 1 - activeLayer;
    for (const [slot, photo] of imageLayers[nextLayer].entries()) {
      const file = state.photos[slot];
      photo.hidden = !file;
      if (file && photo.getAttribute("src") !== `${imageRoot}${file}`)
        photo.setAttribute("src", `${imageRoot}${file}`);
    }
    layerNodes[nextLayer].dataset.mode = state.mode;
    layerNodes[nextLayer].dataset.active = "true";
    layerNodes[activeLayer].dataset.active = "false";
    activeLayer = nextLayer;
  }
  function updateScroll() {
    scheduled = false;
    if (disposed) return;
    const pageHeight = Math.max(document.scrollingElement?.scrollHeight || 0,
      document.documentElement?.scrollHeight || 0, document.body?.scrollHeight || 0);
    const viewportHeight = window.innerHeight || document.documentElement?.clientHeight || 700;
    const maxScroll = Math.max(0, pageHeight - viewportHeight);
    renderState(mobileStoryStateAtScroll(window.scrollY || 0, maxScroll));
  }
  const onScroll = () => {
    if (scheduled || disposed) return;
    scheduled = true;
    requestAnimationFrame(updateScroll);
  };
  window.addEventListener?.("scroll", onScroll, { passive: true });
  window.addEventListener?.("resize", onScroll, { passive: true });
  renderState(0);
  return { track, updateScroll, destroy() {
    disposed = true;
    warmedPhotos.length = 0;
    window.removeEventListener?.("scroll", onScroll);
    window.removeEventListener?.("resize", onScroll);
  } };
}
