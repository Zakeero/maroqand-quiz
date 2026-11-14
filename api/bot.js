// Telegram bot webhook: /start va boshqa xabarlarga ro'yxatdan o'tish tugmasi bilan javob beradi.
import { tg, webhookSecret, registerKeyboard } from "./_tg.js";

const WELCOME = [
  "👋 <b>Maroqand Quiz</b>ga xush kelibsiz!",
  "",
  "Samarqanddagi eng maroqli quiz — har seshanba 19:00 da.",
  "Rebuslar, rasmli savollar, kino va musiqa raundlari, sovrinlar va lototron.",
  "",
  "Jamoangizni 1 daqiqada ro‘yxatdan o‘tkazing 👇",
].join("\n");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("ok");
  if (req.headers["x-telegram-bot-api-secret-token"] !== webhookSecret()) {
    return res.status(401).send("unauthorized");
  }

  let update = req.body;
  if (typeof update === "string") {
    try { update = JSON.parse(update); } catch { update = {}; }
  }
  const msg = update && update.message;

  // Faqat shaxsiy chatlarga javob beramiz: arizalar guruhidagi xabarlarga bot aralashmaydi.
  if (msg && msg.chat && msg.chat.type === "private") {
    try {
      await tg("sendMessage", {
        chat_id: msg.chat.id,
        text: WELCOME,
        parse_mode: "HTML",
        reply_markup: registerKeyboard,
      });
    } catch (e) {
      console.error(e);
    }
  }
  return res.status(200).json({ ok: true });
}
