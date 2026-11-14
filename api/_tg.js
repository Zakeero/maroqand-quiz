// Telegram bot uchun umumiy yordamchi funksiyalar.
import crypto from "node:crypto";

export const SITE = "https://maroqandquiz.uz";
export const FORM_URL = `${SITE}/royxat`;
export const CHANNEL = "https://t.me/maroqAndquiz";

export async function tg(method, payload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  return r.json();
}

// Webhook so'rovlari faqat Telegramdan kelayotganini tekshirish uchun maxfiy kalit.
export function webhookSecret() {
  return crypto.createHash("sha256").update("mq-webhook:" + (process.env.TELEGRAM_BOT_TOKEN || "")).digest("hex");
}

// Mini App initData ni tekshiradi. To'g'ri bo'lsa Telegram foydalanuvchisini qaytaradi, aks holda null.
export function verifyInitData(initData) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || typeof initData !== "string" || !initData) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");
  const check = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  const secret = crypto.createHmac("sha256", "WebAppData").update(token).digest();
  const calc = crypto.createHmac("sha256", secret).update(check).digest("hex");
  if (calc.length !== hash.length || !crypto.timingSafeEqual(Buffer.from(calc), Buffer.from(hash))) return null;
  const authDate = parseInt(params.get("auth_date"), 10);
  if (!authDate || Date.now() / 1000 - authDate > 86400) return null;
  try {
    return JSON.parse(params.get("user") || "null");
  } catch {
    return null;
  }
}

export const registerKeyboard = {
  inline_keyboard: [
    [{ text: "📝 Ro‘yxatdan o‘tish", web_app: { url: FORM_URL } }],
    [{ text: "📣 Telegram kanal", url: CHANNEL }],
  ],
};
