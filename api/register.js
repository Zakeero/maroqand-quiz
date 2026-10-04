// Ro'yxatdan o'tish arizasini Telegram guruhga yuboradi.
// Vercel sozlamalarida ikkita o'zgaruvchi kerak:
//   TELEGRAM_BOT_TOKEN — @BotFather bergan token
//   TELEGRAM_CHAT_ID   — arizalar tushadigan guruh ID si (masalan -1001234567890)

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

  const tg = esc(body.telegram).replace(/^@/, "");
  const lines = [
    "🧠 <b>Yangi jamoa ro‘yxatdan o‘tdi!</b>",
    "",
    `📅 <b>O‘yin:</b> ${date}`,
    `👥 <b>Jamoa:</b> ${team}`,
    `🙋 <b>Sardor:</b> ${captain}`,
    `📞 <b>Telefon:</b> ${phone}`,
    `🔢 <b>Ishtirokchilar:</b> ${players} kishi`,
    tg ? `✈️ <b>Telegram:</b> @${tg}` : null,
    body.first === "yes" ? "⭐ <b>Birinchi marta qatnashmoqda</b>" : null,
    body.source ? `📣 <b>Qayerdan eshitgan:</b> ${esc(body.source)}` : null,
    body.note ? `💬 <b>Izoh:</b> ${esc(body.note)}` : null,
  ].filter((l) => l !== null);

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: lines.join("\n"), parse_mode: "HTML" }),
    });
    const data = await r.json();
    if (!data.ok) {
      console.error("Telegram xatosi:", data);
      return res.status(502).json({ ok: false, error: "send_failed" });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ ok: false, error: "send_failed" });
  }
}
