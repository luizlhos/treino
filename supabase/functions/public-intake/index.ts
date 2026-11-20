// Edge Function "public-intake" — formulário de avaliação PÚBLICO (sem login).
//
// Ações:
//   submit : valida, cria a conta (senha aleatória inutilizável), grava a avaliação e
//            dispara o e-mail com um CÓDIGO de uso único para o cliente CRIAR A PRÓPRIA SENHA no app.
//   resend : reenvia o código (também serve como "esqueci minha senha").
//
// Segurança:
//   • verify_jwt = false (é público por definição) — toda defesa está aqui:
//     origem permitida (CORS), honeypot, Turnstile (opcional), limite de tentativas por IP e por e-mail,
//     validação por lista de campos permitidos, maioridade, tamanho máximo do corpo.
//   • Resposta SEMPRE genérica quanto à existência do e-mail (sem enumeração de contas).
//   • Se o e-mail já tem conta, NÃO se grava nada nela: só se envia um aviso (evita alguém
//     injetar dados na conta de outra pessoa).
//   • Nenhum dado de saúde vai por e-mail; o código é de uso único e expira (validade no Auth).
//   • Logs sem dados pessoais.
//
// Secrets (Supabase → Edge Functions → Secrets):
//   MAIL_MODE (obrigatório): "log" | "auth"
//     log  = TESTE. Não envia e-mail; escreve o link de acesso nos logs da função (só quem tem acesso
//            ao painel vê). O link equivale a uma senha: nunca deixe em "log" com clientes reais.
//     auth = PRODUÇÃO. O Supabase Auth envia o e-mail (SMTP configurado em Authentication → Emails)
//            usando o modelo "Reset password" ({{ .Token }}, sem link — evita spam no Gmail).
//   APP_URL (opcional) · ALLOWED_ORIGINS (opcional, separados por vírgula) · HASH_SALT (recomendado)
//   TURNSTILE_SECRET (opcional; se definido, o captcha passa a ser exigido)
import { createClient } from "npm:@supabase/supabase-js@2";
import { validateEmail, validateIntake } from "./validate.ts";

const APP_URL = Deno.env.get("APP_URL") ?? "https://luizlhos.github.io/treino/";
const ALLOWED = (Deno.env.get("ALLOWED_ORIGINS") ?? "https://luizlhos.github.io")
  .split(",").map((s) => s.trim()).filter(Boolean);
const MAIL_MODE = Deno.env.get("MAIL_MODE") ?? "";
const TURNSTILE_SECRET = Deno.env.get("TURNSTILE_SECRET") ?? "";
const SALT = Deno.env.get("HASH_SALT") ?? (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "").slice(-24);
const MAX_BODY = 24_000;

const LIMITS = {
  submit: { ip: [6, 3600], email: [3, 86400] },
  resend: { ip: [10, 3600], email: [3, 3600] },
} as const;

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

function corsHeaders(origin: string | null): Record<string, string> {
  const h: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
  if (origin && ALLOWED.includes(origin)) h["Access-Control-Allow-Origin"] = origin;
  return h;
}
const json = (b: unknown, status: number, origin: string | null) =>
  new Response(JSON.stringify(b), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

async function sha(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(SALT + "|" + s));
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function clientIp(req: Request): string {
  return (req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "?";
}

async function overLimit(kind: "submit" | "resend", ipH: string, emailH: string | null): Promise<boolean> {
  const checks: Array<[string, string, number, number]> = [["ip_hash", ipH, ...LIMITS[kind].ip]];
  if (emailH) checks.push(["email_hash", emailH, ...LIMITS[kind].email]);
  for (const [col, val, max, secs] of checks) {
    const since = new Date(Date.now() - secs * 1000).toISOString();
    const { count } = await admin.from("intake_attempts").select("id", { count: "exact", head: true })
      .eq("kind", kind).eq(col, val).gte("created_at", since);
    if ((count ?? 0) >= max) return true;
  }
  return false;
}

async function verifyCaptcha(token: unknown, ip: string): Promise<boolean> {
  if (!TURNSTILE_SECRET) return true; // captcha desligado
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: TURNSTILE_SECRET, response: token, remoteip: ip }),
  }).catch(() => null);
  const j = r && r.ok ? await r.json().catch(() => null) : null;
  return !!j?.success;
}

async function recoveryLink(email: string): Promise<string | null> {
  const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email });
  const th = data?.properties?.hashed_token;
  if (error || !th) { console.error("link_failed"); return null; }
  return `${APP_URL}#acesso=${encodeURIComponent(th)}`;
}

// kind ("new" | "existing") hoje só diferencia o log; o texto do e-mail vem do modelo do Supabase Auth.
async function sendAccessMail(email: string, _name: string, _kind: "new" | "existing"): Promise<boolean> {
  if (MAIL_MODE === "log") {
    const link = await recoveryLink(email);
    if (!link) return false;
    console.log(`[MAIL_MODE=log] link de acesso para ${email}: ${link}`); // SÓ em teste
    return true;
  }
  const { error } = await admin.auth.resetPasswordForEmail(email);
  if (error) { console.error("auth_mail_failed", error.status ?? ""); return false; }
  return true;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (req.method !== "POST") return json({ error: "method" }, 405, origin);
  if (origin && !ALLOWED.includes(origin)) return json({ error: "origin" }, 403, origin);
  if (MAIL_MODE !== "log" && MAIL_MODE !== "auth") return json({ error: "not_configured" }, 503, origin);

  const raw = await req.text();
  if (raw.length > MAX_BODY) return json({ error: "too_large" }, 413, origin);
  let body: any;
  try { body = JSON.parse(raw); } catch { return json({ error: "bad_json" }, 400, origin); }

  const action = body?.action;
  if (action !== "submit" && action !== "resend") return json({ error: "action" }, 400, origin);

  // honeypot: robôs preenchem; resposta "ok" para não dar pista
  if (typeof body.hp === "string" && body.hp.trim() !== "") return json({ ok: true }, 200, origin);

  const ip = clientIp(req);
  const ipH = await sha("ip:" + ip);
  const emailNorm = validateEmail(body?.email);
  const emailH = emailNorm ? await sha("em:" + emailNorm) : null;

  if (!(await verifyCaptcha(body?.cf_token, ip))) return json({ error: "captcha" }, 400, origin);
  if (await overLimit(action, ipH, emailH)) return json({ error: "rate_limited" }, 429, origin);
  await admin.from("intake_attempts").insert({ kind: action, ip_hash: ipH, email_hash: emailH });
  // limpeza oportunista (mantém a tabela pequena)
  if (Math.random() < 0.05) {
    await admin.from("intake_attempts").delete().lt("created_at", new Date(Date.now() - 3 * 86400_000).toISOString());
  }

  // ---------------------------------------------------------------- resend
  if (action === "resend") {
    if (!emailNorm) return json({ error: "validation", fields: { email: "E-mail inválido." } }, 400, origin);
    const { data: p } = await admin.from("profiles").select("name,active").eq("email", emailNorm).maybeSingle();
    if (p?.active) await sendAccessMail(emailNorm, p.name ?? "", "existing");
    return json({ ok: true }, 200, origin); // sempre igual: não revela se a conta existe
  }

  // ---------------------------------------------------------------- submit
  const v = validateIntake(body);
  if (!v.ok) return json({ error: "validation", fields: v.errors }, 400, origin);
  const { name, email, answers } = v.value;

  const { data: existing } = await admin.from("profiles").select("id,active").eq("email", email).maybeSingle();
  if (existing) {
    if (existing.active) await sendAccessMail(email, name, "existing");
    return json({ ok: true }, 200, origin);
  }

  // senha aleatória e descartada: a conta só passa a ser usável quando o dono do e-mail usa o código
  const tmpPass = crypto.randomUUID() + crypto.randomUUID();
  const { data: cu, error: ce } = await admin.auth.admin.createUser({
    email, password: tmpPass, email_confirm: true, user_metadata: { name },
  });
  if (ce || !cu?.user) {
    // corrida (e-mail criado entre a checagem e agora) ou falha: resposta genérica
    console.error("create_user_failed");
    return json({ ok: true }, 200, origin);
  }
  const uid = cu.user.id;
  await admin.from("profiles").update({ name }).eq("id", uid);

  const num = (k: string) => (typeof answers[k] === "number" ? (answers[k] as number) : null);
  const { error: ie } = await admin.from("assessments").insert({
    user_id: uid,
    created_by: null,
    source: "public",
    weight_kg: num("weight"),
    height_cm: num("height"),
    bf_scale_pct: num("bf_scale"),
    answers,
    consent_version: String(body.consent.version).slice(0, 40),
    consent_at: new Date().toISOString(),
  });
  if (ie) {
    console.error("insert_failed");
    await admin.auth.admin.deleteUser(uid); // não deixa conta órfã
    return json({ error: "server" }, 500, origin);
  }

  const sent = await sendAccessMail(email, name, "new");
  if (!sent) return json({ error: "email_failed" }, 502, origin); // dados salvos; cliente pode usar "reenviar"
  return json({ ok: true }, 200, origin);
});
