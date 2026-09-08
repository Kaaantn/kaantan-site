const { getStore } = require("@netlify/blobs");

// Automatic context injection for @netlify/blobs is unreliable for CommonJS
// functions bundled outside Netlify's own build pipeline (MissingBlobsEnvironmentError).
// Fall back to explicit siteID/token when provided. Site ID is not secret (it's
// the project's public API ID, same one shown in status badge URLs).
const SITE_ID = process.env.SITE_ID || "2a87c684-840b-4d92-b789-a1feec354fc2";

function storeOptions(name) {
  if (process.env.NETLIFY_BLOBS_TOKEN) {
    return { name, siteID: SITE_ID, token: process.env.NETLIFY_BLOBS_TOKEN };
  }
  return name;
}

function configStore() {
  return getStore(storeOptions("ig-automation-configs"));
}

function stateStore() {
  return getStore(storeOptions("ig-automation-state"));
}

function rateStore() {
  return getStore(storeOptions("ig-automation-rate"));
}

function bioStore() {
  return getStore(storeOptions("bio-config"));
}

function bioAssetStore() {
  return getStore(storeOptions("bio-assets"));
}

const BIO_KEY = "config";

// Seed value: matches what was live in blog/_data/bio.json before the bio
// page moved to a Blobs-backed, panel-editable config. Only used until the
// first save from /bio-admin, so the public page never changes on its own.
const DEFAULT_BIO = {
  bio: "Meta ve Tiktok ADS Yönetimi",
  socialLinks: [
    { platform: "youtube", url: "https://youtube.com/@qkaantan", live: true },
    { platform: "tiktok", url: "https://www.tiktok.com/@qkaantan", followerCount: "10.7K" },
    { platform: "instagram", url: "https://www.instagram.com/qkaantan/", followerCount: "15.5K" },
  ],
  displayName: "Kaan Tan",
  phone: "+905422979212",
  showPhone: true,
  location: "İstanbul",
  bannerColor: "#4F46E5",
  avatar: "/assets/bio/profil.jpg",
  links: [
    {
      id: "lightpdf",
      title: "LightPDF - PDF Düzenle, Birleştir, Ayır",
      subtitle: "lightpdf.com",
      url: "https://lightpdfcom.pxf.io/aN9bbW",
      icon: "file-text",
      color: "#DC2626",
      iconColor: "#FFFFFF",
    },
    {
      id: "chatllm",
      title: "ChatLLM - Tüm Yapay Zeka Modelleri Tek Yerde",
      subtitle: "chatllm.abacus.ai",
      url: "https://chatllm.abacus.ai/qka",
      icon: "image",
      iconImage: "/assets/abacus.png",
      color: "#031321",
      iconColor: "#FFFFFF",
      perk: "İlk ay $10 yerine $7",
    },
    {
      id: "snapgen",
      title: "SnapGen - Ücretsiz Yapay Zeka Video Oluştur",
      subtitle: "snapgen.ai",
      url: "https://snapgen.ai/auth/signup?ref=TKN6UU9",
      icon: "image",
      iconImage: "/assets/snap.png",
    },
    {
      id: "atlasfind",
      title: "Atlas Find - İş Geliştirme ve Satış Platformu",
      subtitle: "app.atlasfind.co",
      url: "https://app.atlasfind.co/?ref=KAANTAN",
      icon: "image",
      iconImage: "/assets/bio/atlas-logo.png",
      color: "#FFFFFF",
      iconColor: "#0A0A0A",
    },
    {
      id: "autoae",
      title: "AutoAE - Düzenleme Yok, Sadece Tıkla, Özelleştir ve Paylaş.",
      subtitle: "autoae.online",
      url: "https://autoae.online/?linkId=lp_115715&sourceId=kaan-tan&tenantId=autoae",
      icon: "image",
      iconImage: "/assets/bio/autoae-logo.png",
      color: "#FFFFFF",
      iconColor: "#0A0A0A",
    },
    {
      id: "elevenlabs",
      title: "ElevenLabs - Yapay Zeka Ses Teknolojisi",
      subtitle: "try.elevenlabs.io",
      url: "https://try.elevenlabs.io/1232pu77ju52",
      icon: "activity",
      color: "#000000",
      iconColor: "#FFFFFF",
    },
    {
      id: "aitools100",
      url: "https://www.shopier.com/aitan/49575935",
      icon: "shopping-bag",
      title: "100 Yapay Zeka Aracı",
      subtitle: "Bilmen Gereken Rehber Serisi #1",
      color: "#6D40FF",
      iconColor: "#FFFFFF",
    },
    {
      id: "hakkimda",
      title: "Hakkımda - Tüm Bilgiler",
      subtitle: "kaantan.com.tr",
      url: "https://kaantan.com.tr/",
      icon: "kt-logo",
      color: "#A3E635",
      iconColor: "#0A0A0A",
    },
  ],
  email: "kaantanpr@gmail.com",
  showEmail: true,
};

async function getBioConfig() {
  const data = await bioStore().get(BIO_KEY, { type: "json" });
  return data || DEFAULT_BIO;
}

async function saveBioConfig(config) {
  await bioStore().setJSON(BIO_KEY, config);
}

const CONFIGS_KEY = "configs";

async function getConfigs() {
  const data = await configStore().get(CONFIGS_KEY, { type: "json" });
  return data || { fallbackWord: "", posts: [] };
}

async function saveConfigs(configs) {
  await configStore().setJSON(CONFIGS_KEY, configs);
}

async function getState(commentId) {
  return stateStore().get(`state:${commentId}`, { type: "json" });
}

async function setState(commentId, state) {
  await stateStore().setJSON(`state:${commentId}`, {
    ...state,
    last_checked_at: new Date().toISOString(),
  });
}

// Lists comment states for the panel's analytics view. Capped since Blobs
// listing has no server-side filtering — fine at this project's volume.
async function listStates(limit = 500) {
  const store = stateStore();
  const { blobs } = await store.list({ prefix: "state:" });
  const keys = blobs.slice(-limit).map((b) => b.key);
  const items = await Promise.all(
    keys.map(async (key) => {
      const data = await store.get(key, { type: "json" });
      return data ? { commentId: key.slice("state:".length), ...data } : null;
    })
  );
  return items.filter(Boolean);
}

module.exports = {
  configStore,
  stateStore,
  rateStore,
  bioStore,
  bioAssetStore,
  getConfigs,
  saveConfigs,
  getState,
  setState,
  listStates,
  getBioConfig,
  saveBioConfig,
};
