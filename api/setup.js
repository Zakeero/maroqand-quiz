// Botni bir marta sozlash: webhook, menyu tugmasi va bot tavsifi.
// Brauzerda https://maroqandquiz.uz/api/setup ni ochish kifoya. Qayta ochish xavfsiz — har safar bir xil qiymatlar o'rnatiladi.
import { tg, SITE, FORM_URL, webhookSecret } from "./_tg.js";

export default async function handler(req, res) {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return res.status(503).json({ ok: false, error: "TELEGRAM_BOT_TOKEN sozlanmagan" });
  }

  const before = await tg("getWebhookInfo");
  const steps = {
    me: await tg("getMe"),
    webhook: await tg("setWebhook", {
      url: `${SITE}/api/bot`,
      secret_token: webhookSecret(),
      allowed_updates: ["message"],
    }),
    menuButton: await tg("setChatMenuButton", {
      menu_button: { type: "web_app", text: "Ro‘yxatdan o‘tish", web_app: { url: FORM_URL } },
    }),
    description: await tg("setMyDescription", {
      description:
        "Maroqand Quiz — Samarqanddagi eng maroqli quiz.\n\n" +
        "Har seshanba 19:00 da jamoaviy intellektual o‘yin: rebuslar, rasmli savollar, kino va musiqa raundlari, sovrinlar.\n\n" +
        "«Start» tugmasini bosing va jamoangizni 1 daqiqada ro‘yxatdan o‘tkazing.",
    }),
    shortDescription: await tg("setMyShortDescription", {
      short_description: "Samarqanddagi eng maroqli quiz. Har seshanba 19:00. Jamoangizni shu yerda ro‘yxatdan o‘tkazing.",
    }),
  };

  const ok = Object.values(steps).every((s) => s && s.ok);
  return res.status(ok ? 200 : 502).json({
    ok,
    bot: steps.me.result ? "@" + steps.me.result.username : null,
    previousWebhook: before.result ? before.result.url || "(yo‘q)" : null,
    steps: Object.fromEntries(Object.entries(steps).map(([k, v]) => [k, v && v.ok ? "ok" : v && v.description])),
  });
}
