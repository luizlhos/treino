// Validação do formulário público — função pura (sem imports), testável em Node e Deno.
// As chaves/limites devem espelhar as perguntas de avaliacao.js (há um teste que confere: tests/spec-sync.test.mjs).

export type Rule =
  | { t: "num"; min: number; max: number; req?: boolean }
  | { t: "int"; min: number; max: number; req?: boolean }
  | { t: "enum"; v: string[]; req?: boolean }
  | { t: "str"; max: number; req?: boolean }
  | { t: "phone"; req?: boolean }
  | { t: "date"; req?: boolean }
  | { t: "parq"; req?: boolean };

export const PARQ_COUNT = 7;
export const MIN_AGE = 18;

export const SPEC: Record<string, Rule> = {
  whatsapp: { t: "phone", req: true },
  birth: { t: "date", req: true },
  sex: { t: "enum", v: ["F", "M"], req: true },
  weight: { t: "num", min: 30, max: 300, req: true },
  goal_weight: { t: "num", min: 30, max: 300, req: true },
  height: { t: "num", min: 100, max: 230, req: true },
  bf_scale: { t: "num", min: 3, max: 60 },
  neck: { t: "num", min: 20, max: 80 },
  waist: { t: "num", min: 40, max: 200 },
  abdomen: { t: "num", min: 40, max: 200 },
  hip: { t: "num", min: 50, max: 200 },
  goal: { t: "enum", v: ["emagrecimento", "hipertrofia", "recomposicao", "condicionamento", "saude", "outro"], req: true },
  activity: { t: "enum", v: ["1.2", "1.375", "1.55", "1.725", "1.9"], req: true },
  train_hist: { t: "str", max: 600, req: true },
  train_days: { t: "int", min: 0, max: 7, req: true },
  train_place: { t: "enum", v: ["academia", "casa", "ar_livre", "box", "outro"] },
  work_type: { t: "enum", v: ["sedentario", "em_pe", "ativo", "turnos"] },
  parq: { t: "parq", req: true },
  injuries: { t: "str", max: 600, req: true },
  conditions: { t: "str", max: 600, req: true },
  meds: { t: "str", max: 600, req: true },
  allergies: { t: "str", max: 400, req: true },
  pregnancy: { t: "enum", v: ["nao", "gestante", "lactante"] }, // obrigatória só se sex = F (regra abaixo)
  diet_restr: { t: "str", max: 400, req: true },
  meals: { t: "int", min: 1, max: 8, req: true },
  meal_times: { t: "str", max: 300 },
  eats_out: { t: "enum", v: ["raramente", "1a2", "3a5", "todos"] },
  food_likes: { t: "str", max: 400 },
  food_dislikes: { t: "str", max: 400 },
  prev_diets: { t: "str", max: 500 },
  water: { t: "num", min: 0, max: 10, req: true },
  alcohol: { t: "enum", v: ["nunca", "social", "semanal", "diario"] },
  smoker: { t: "enum", v: ["nao", "sim", "ex"] },
  sleep_h: { t: "num", min: 2, max: 14, req: true },
  sleep_q: { t: "enum", v: ["1", "2", "3", "4", "5"], req: true },
  tired: { t: "enum", v: ["nao", "as_vezes", "sempre"] },
  stress: { t: "enum", v: ["1", "2", "3", "4", "5"] },
  bowel: { t: "enum", v: ["regular", "constipacao", "diarreia", "irregular"] },
  commit: { t: "int", min: 1, max: 10, req: true },
  notes: { t: "str", max: 1000 },
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
// deno-lint-ignore no-control-regex
const CTRL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function cleanStr(v: unknown, max: number): string {
  return String(v ?? "").replace(CTRL_RE, "").replace(/\r\n?/g, "\n").trim().slice(0, max);
}

export function validateEmail(v: unknown): string | null {
  const e = cleanStr(v, 254).toLowerCase();
  return EMAIL_RE.test(e) && e.length <= 254 ? e : null;
}

function toNum(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;
  const s = v.replace(",", ".").trim();
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

export function ageOn(birthISO: string, today = new Date()): number {
  const [y, m, d] = birthISO.split("-").map(Number);
  let a = today.getUTCFullYear() - y;
  const md = today.getUTCMonth() + 1 - m || today.getUTCDate() - d;
  if (md < 0) a--;
  return a;
}

function validDate(s: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const t = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return t.getUTCFullYear() === +m[1] && t.getUTCMonth() === +m[2] - 1 && t.getUTCDate() === +m[3];
}

export type Result =
  | { ok: true; value: { name: string; email: string; answers: Record<string, unknown> } }
  | { ok: false; errors: Record<string, string> };

export function validateIntake(body: any, today = new Date()): Result {
  const errors: Record<string, string> = {};
  const name = cleanStr(body?.name, 80);
  if (name.length < 2) errors.name = "Informe seu nome completo.";
  const email = validateEmail(body?.email);
  if (!email) errors.email = "E-mail inválido.";
  if (body?.consent?.accepted !== true || !cleanStr(body?.consent?.version, 40)) {
    errors.consent = "É necessário aceitar o termo de consentimento.";
  }

  const src = body?.answers && typeof body.answers === "object" ? body.answers : {};
  const out: Record<string, unknown> = {};
  const isF = src.sex === "F";

  for (const [k, r] of Object.entries(SPEC)) {
    const raw = src[k];
    const empty = raw === undefined || raw === null || raw === "" || (Array.isArray(raw) && raw.length === 0);
    const required = !!r.req || (k === "pregnancy" && isF);
    if (empty) {
      if (required) errors[k] = "Campo obrigatório.";
      continue;
    }
    switch (r.t) {
      case "num":
      case "int": {
        const n = toNum(raw);
        if (n === null || n < r.min || n > r.max || (r.t === "int" && !Number.isInteger(n))) {
          errors[k] = `Valor entre ${r.min} e ${r.max}.`;
        } else out[k] = n;
        break;
      }
      case "enum": {
        const s = String(raw);
        if (!r.v.includes(s)) errors[k] = "Opção inválida.";
        else out[k] = s;
        break;
      }
      case "str": {
        const s = cleanStr(raw, r.max + 1);
        if (s.length > r.max) errors[k] = `Máximo de ${r.max} caracteres.`;
        else if (s) out[k] = s;
        else if (required) errors[k] = "Campo obrigatório.";
        break;
      }
      case "phone": {
        const digits = String(raw).replace(/\D/g, "");
        if (digits.length < 10 || digits.length > 13) errors[k] = "WhatsApp inválido (com DDD).";
        else out[k] = digits;
        break;
      }
      case "date": {
        const s = String(raw);
        if (!validDate(s)) errors[k] = "Data inválida.";
        else {
          const age = ageOn(s, today);
          if (age < MIN_AGE) errors[k] = "Esta avaliação é para maiores de 18 anos.";
          else if (age > 100) errors[k] = "Data inválida.";
          else out[k] = s;
        }
        break;
      }
      case "parq": {
        if (!Array.isArray(raw) || raw.length !== PARQ_COUNT || raw.some((x) => typeof x !== "boolean")) {
          errors[k] = "Responda todas as perguntas de saúde (Sim ou Não).";
        } else out[k] = raw;
        break;
      }
    }
  }

  // consistência entre campos
  if (!errors.sex && !isF && out.pregnancy) delete out.pregnancy;

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { name, email: email!, answers: out } };
}
