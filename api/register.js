// Ro'yxatdan o'tish arizasini Telegram guruhga yuboradi.
// Vercel sozlamalarida ikkita o'zgaruvchi kerak:
//   TELEGRAM_BOT_TOKEN — @BotFather bergan token
//   TELEGRAM_CHAT_ID   — arizalar tushadigan guruh ID si (masalan -1001234567890)

import { tg, verifyInitData, CHANNEL } from "./_tg.js";

const hits = new Map(); // oddiy spam himoyasi: bitta IP dan daqiqasiga 5 tagacha

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .trim()
    .slice(0, 300);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Faqat POST" });
  }

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0] || "anon";
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  if (recent.length >= 5) {
    return res.status(429).json({ ok: false, error: "Juda ko‘p urinish. Bir daqiqadan so‘ng qayta urinib ko‘ring." });
  }
  hits.set(ip, [...recent, now]);

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  // Honeypot: odam ko'rmaydigan maydon to'ldirilgan bo'lsa — bot
  if (body.website) return res.status(200).json({ ok: true });

  const team = esc(body.team);
  const captain = esc(body.captain);
  const phone = esc(body.phone);
  const players = parseInt(body.players, 10);
  const date = esc(body.date);

  const phoneDigits = phone.replace(/\D/g, "");
  if (!team || !captain || phoneDigits.length < 9 || !(players >= 2 && players <= 10) || !date) {
    return res.status(400).json({ ok: false, error: "Majburiy maydonlarni to‘ldiring." });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return res.status(503).json({ ok: false, error: "not_configured" });
  }

  const tgUser = verifyInitData(body.tg_init);
  const tgName = tgUser ? esc([tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ")) || "profil" : "";
  const tgLogin = esc(body.telegram).replace(/^@/, "");
  const lines = [
    "🧠 <b>Yangi jamoa ro‘yxatdan o‘tdi!</b>",
    "",
    `📅 <b>O‘yin:</b> ${date}`,
    `👥 <b>Jamoa:</b> ${team}`,
    `🙋 <b>Sardor:</b> ${captain}`,
    `📞 <b>Telefon:</b> ${phone}`,
    `🔢 <b>Ishtirokchilar:</b> ${players} kishi`,
    tgLogin ? `✈️ <b>Telegram:</b> @${tgLogin}` : null,
    tgUser ? `🤖 <b>Bot orqali:</b> <a href="tg://user?id=${tgUser.id}">${tgName}</a>` : null,
    body.first === "yes" ? "⭐ <b>Birinchi marta qatnashmoqda</b>" : null,
    body.source ? `📣 <b>Qayerdan eshitgan:</b> ${esc(body.source)}` : null,
    body.note ? `💬 <b>Izoh:</b> ${esc(body.note)}` : null,
  ].filter((l) => l !== null);

  try {
    const data = await tg("sendMessage", { chat_id: chatId, text: lines.join("\n"), parse_mode: "HTML" });
    if (!data.ok) {
      console.error("Telegram xatosi:", data);
      return res.status(502).json({ ok: false, error: "send_failed" });
    }
    // Bot orqali yozilgan bo'lsa, foydalanuvchiga tasdiq xabari
    if (tgUser) {
      await tg("sendMessage", {
        chat_id: tgUser.id,
        text: `✅ <b>${team}</b> jamoasi ${date} o‘yiniga yozildi!\n\nTez orada tashkilotchilarimiz siz bilan bog‘lanib, joyni tasdiqlaydi.`,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: [[{ text: "📣 Telegram kanal", url: CHANNEL }]] },
      }).catch(() => {});
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ ok: false, error: "send_failed" });
  }
}
