/* =============================================================================
   avaliacao.js — Avaliação (anamnese) integrada ao app Treino
   • Formulário PÚBLICO na tela de login (sem cadastro) → link por e-mail para criar a senha
   • Área do cliente: vê só as próprias respostas/análise e envia as 4 fotos
   • Master: vê todos os clientes e cria avaliações para eles
   Depende de (globais do index.html, usadas só em tempo de execução):
   SB, sbInit, ME, V, VIEWS, ACT, render, go, hdr, esc, num, toast, modal, confirmBox, $,
   isoToBR, brToISO, ageAt, iso, imcOf, rcqOf, rceOf, bfTape, bfClass, kv, loadUser, sync, USERS
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- configuração (ajuste aqui) ---------- */
  const CFG = {
    BRAND: 'Treino',                 // nome mostrado no formulário e no termo
    CONTROLLER: 'Luiz Santos',                // quem responde pelos dados (nome/empresa). Vazio = "o profissional responsável"
    CONTACT: 'luiz.lhos@gmail.com',                   // e-mail/WhatsApp para pedidos de privacidade (LGPD). Mostrado no termo se preenchido
    FN: 'public-intake',             // Edge Function pública
    BUCKET: 'assessment-photos',
    CONSENT_VERSION: 'v1-2026-11',   // mude ao alterar o texto do termo
    TURNSTILE_SITEKEY: '',           // opcional: chave do Cloudflare Turnstile (anti-robô). Vazio = desligado
  };

  /* ---------- perguntas (chaves e limites espelham supabase/functions/public-intake/validate.ts) ---------- */
  const PARQ = [
    'Algum médico já disse que você tem problema no coração ou pressão alta?',
    'Você sente dor no peito em repouso, nas atividades do dia a dia ou durante atividade física?',
    'Você perde o equilíbrio por tontura ou perdeu a consciência nos últimos 12 meses?',
    'Você já foi diagnosticado com outra doença crônica (além de coração ou pressão alta)?',
    'Você toma atualmente remédios receitados para alguma doença crônica?',
    'Você tem (ou teve nos últimos 12 meses) problema em ossos, articulações ou tecidos moles que possa piorar com atividade física?',
    'Algum médico já disse que você só deve fazer atividade física com supervisão médica?',
  ];
  const Q = (k, l, t, o) => Object.assign({ k, l, t }, o || {});
  const SECTIONS = [
    { t: 'Você', qs: [
      Q('whatsapp', 'WhatsApp (com DDD)', 'tel', { req: 1, ph: '(11) 99999-0000' }),
      Q('birth', 'Data de nascimento', 'date', { req: 1 }),
      Q('sex', 'Sexo (usado nas fórmulas de cálculo)', 'radio2', { req: 1, opts: [['F', 'Feminino'], ['M', 'Masculino']] }),
    ] },
    { t: 'Medidas', qs: [
      Q('weight', 'Peso atual', 'num', { req: 1, u: 'kg', ph: '68,5', min: 30, max: 300 }),
      Q('goal_weight', 'Peso meta', 'num', { req: 1, u: 'kg', ph: '62', min: 30, max: 300 }),
      Q('height', 'Altura', 'num', { req: 1, u: 'cm', ph: '168', min: 100, max: 230 }),
      Q('bf_scale', '% de gordura da balança (opcional)', 'num', { u: '%', ph: '27,5', min: 3, max: 60,
        help: 'Se a sua balança de bioimpedância informa o percentual de gordura, digite aqui. É uma estimativa: varia com hidratação, horário e refeições. Meça sempre nas mesmas condições (ex.: ao acordar, em jejum).' }),
      Q('neck', 'Pescoço (opcional)', 'num', { u: 'cm', min: 20, max: 80, help: 'Com fita métrica. Pescoço + cintura (+ quadril, para mulheres) permitem estimar a gordura pelo método da Marinha dos EUA.' }),
      Q('waist', 'Cintura (opcional)', 'num', { u: 'cm', min: 40, max: 200, help: 'Na parte mais estreita do tronco.' }),
      Q('abdomen', 'Abdômen na altura do umbigo (opcional)', 'num', { u: 'cm', min: 40, max: 200 }),
      Q('hip', 'Quadril (opcional)', 'num', { u: 'cm', min: 50, max: 200, help: 'Na parte mais larga do quadril.' }),
    ] },
    { t: 'Objetivo e rotina', qs: [
      Q('goal', 'Qual é o seu objetivo principal?', 'sel', { req: 1, opts: [['emagrecimento', 'Emagrecimento'], ['hipertrofia', 'Ganho de massa muscular'], ['recomposicao', 'Recomposição corporal'], ['condicionamento', 'Condicionamento físico'], ['saude', 'Saúde e bem-estar'], ['outro', 'Outro (conte nas observações)']] }),
      Q('activity', 'Nível de atividade no dia a dia', 'radio', { req: 1, opts: [['1.2', 'Sedentário', 'Pouco ou nenhum exercício'], ['1.375', 'Leve', '1 a 3 dias por semana'], ['1.55', 'Moderado', '3 a 5 dias por semana'], ['1.725', 'Ativo', '6 a 7 dias por semana'], ['1.9', 'Muito ativo', 'Treino intenso, 2x ao dia']] }),
      Q('train_hist', 'Você treina atualmente? Conte seu histórico de treino', 'area', { req: 1, max: 600, ph: 'Ex.: musculação 4x por semana há 1 ano; caminhada nos outros dias. Ou: nunca treinei.' }),
      Q('train_days', 'Quantos dias por semana você consegue treinar?', 'sel', { req: 1, int: 1, opts: [0, 1, 2, 3, 4, 5, 6, 7].map(n => [String(n), String(n)]) }),
      Q('train_place', 'Onde você treina (ou pretende treinar)?', 'sel', { opts: [['academia', 'Academia'], ['casa', 'Em casa'], ['ar_livre', 'Ao ar livre'], ['box', 'Box de CrossFit'], ['outro', 'Outro']] }),
      Q('work_type', 'Como é o seu trabalho?', 'sel', { opts: [['sedentario', 'Sentado a maior parte do tempo'], ['em_pe', 'Em pé / andando'], ['ativo', 'Esforço físico'], ['turnos', 'Turnos / horários variáveis']] }),
    ] },
    { t: 'Saúde', qs: [
      Q('parq', 'Questionário de prontidão para atividade física (PAR-Q)', 'parq', { req: 1 }),
      Q('injuries', 'Você tem lesões, dores ou limitações?', 'area', { req: 1, max: 600, ph: 'Ex.: dor no joelho, lesão no ombro, nenhuma…' }),
      Q('conditions', 'Você tem alguma doença diagnosticada?', 'area', { req: 1, max: 600, ph: 'Ex.: nenhuma' }),
      Q('meds', 'Usa medicamentos ou suplementos?', 'area', { req: 1, max: 600, ph: 'Nome, dose e frequência, se houver. Ou: nenhum.' }),
      Q('allergies', 'Você tem alergias ou intolerâncias alimentares?', 'area', { req: 1, max: 400, ph: 'Ex.: lactose, glúten, frutos do mar, nenhuma…' }),
      Q('pregnancy', 'Você está gestante ou amamentando?', 'sel', { opts: [['nao', 'Não'], ['gestante', 'Gestante'], ['lactante', 'Amamentando']], onlyF: 1 }),
    ] },
    { t: 'Alimentação e hábitos', qs: [
      Q('diet_restr', 'Você tem alguma restrição alimentar?', 'area', { req: 1, max: 400, ph: 'Ex.: vegetariana, sem carne vermelha, sem açúcar, nenhuma…' }),
      Q('meals', 'Quantas refeições você faz por dia?', 'sel', { req: 1, int: 1, opts: [1, 2, 3, 4, 5, 6, 7, 8].map(n => [String(n), n === 8 ? '8 ou mais' : String(n)]) }),
      Q('meal_times', 'Em quais horários você costuma comer? (opcional)', 'area', { max: 300, ph: 'Ex.: 8h café, 12h almoço, 16h lanche, 20h jantar' }),
      Q('eats_out', 'Com que frequência come fora de casa? (opcional)', 'sel', { opts: [['raramente', 'Raramente'], ['1a2', '1 a 2 vezes por semana'], ['3a5', '3 a 5 vezes por semana'], ['todos', 'Quase todos os dias']] }),
      Q('food_likes', 'Alimentos que você gosta e quer no plano (opcional)', 'area', { max: 400 }),
      Q('food_dislikes', 'Alimentos que você não come ou não gosta (opcional)', 'area', { max: 400 }),
      Q('prev_diets', 'Já fez dietas antes? Como foi? (opcional)', 'area', { max: 500 }),
      Q('water', 'Quantos litros de água você bebe por dia?', 'num', { req: 1, u: 'L', ph: '1,8', min: 0, max: 10 }),
      Q('alcohol', 'Consumo de álcool (opcional)', 'sel', { opts: [['nunca', 'Não bebo'], ['social', 'Socialmente'], ['semanal', 'Toda semana'], ['diario', 'Quase todo dia']] }),
      Q('smoker', 'Tabagismo (opcional)', 'sel', { opts: [['nao', 'Não fumo'], ['sim', 'Fumo'], ['ex', 'Ex-fumante']] }),
    ] },
    { t: 'Sono e bem-estar', qs: [
      Q('sleep_h', 'Quantas horas você dorme por noite?', 'num', { req: 1, u: 'h', ph: '7', min: 2, max: 14 }),
      Q('sleep_q', 'Como é a qualidade do seu sono?', 'sel', { req: 1, opts: [['1', '1 · Muito ruim'], ['2', '2 · Ruim'], ['3', '3 · Regular'], ['4', '4 · Boa'], ['5', '5 · Ótima']] }),
      Q('tired', 'Você acorda cansado(a)? (opcional)', 'sel', { opts: [['nao', 'Não'], ['as_vezes', 'Às vezes'], ['sempre', 'Quase sempre']] }),
      Q('stress', 'Nível de estresse no dia a dia (opcional)', 'sel', { opts: [['1', '1 · Muito baixo'], ['2', '2 · Baixo'], ['3', '3 · Médio'], ['4', '4 · Alto'], ['5', '5 · Muito alto']] }),
      Q('bowel', 'Funcionamento do intestino (opcional)', 'sel', { opts: [['regular', 'Regular'], ['constipacao', 'Prisão de ventre'], ['diarreia', 'Tendência a diarreia'], ['irregular', 'Irregular']] }),
    ] },
    { t: 'Compromisso', qs: [
      Q('commit', 'Qual é o seu nível de comprometimento? (1 a 10)', 'sel', { req: 1, int: 1, opts: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => [String(n), String(n)]) }),
      Q('notes', 'Algo mais que precisamos saber? (opcional)', 'area', { max: 1000, ph: 'Preferências, horários, dificuldades, metas com prazo…' }),
    ] },
  ];
  const QS = SECTIONS.flatMap(s => s.qs);
  const QMAP = Object.fromEntries(QS.map(q => [q.k, q]));
  const MIN_AGE = 18;

  /* ---------- estado ---------- */
  const AV = {
    state: null,           // tela pública: {mode:'form'|'sent'|'activate', ...}
    draft: { name: '', email: '', a: {}, consent: false },
    cache: { mine: null, byUser: {}, all: null, det: {} },
    cf: '', cooldown: 0,
    QS, CFG,
  };

  /* ---------- utilidades ---------- */
  const g = n => (typeof window !== 'undefined' ? window : globalThis)[n];
  const f1 = v => (v == null || isNaN(v) ? '—' : (Math.round(v * 10) / 10).toLocaleString('pt-BR'));
  const optLabel = (q, v) => { const o = (q.opts || []).find(x => String(x[0]) === String(v)); return o ? o[1] : v; };
  const needF = q => !!q.onlyF;

  /* ---------- cálculos / análise ---------- */
  function analyze(row) {
    const a = row.answers || {};
    const w = +row.weight_kg || a.weight || null, h = +row.height_cm || a.height || null;
    const sex = a.sex || '';
    const age = a.birth ? ageAt(a.birth, String(row.created_at || '').slice(0, 10) || undefined) : null;
    const out = { w, h, sex, age, flags: [] };
    out.imc = imcOf(w, h);
    if (w && h && age != null && sex) {
      out.tmb = Math.round(10 * w + 6.25 * h - 5 * age + (sex === 'M' ? 5 : -161));
      const f = +a.activity || null;
      if (f) { out.tdee = Math.round(out.tmb * f); out.factor = f; }
    }
    const waist = +a.waist || null, hip = +a.hip || null;
    out.rcq = rcqOf(waist, hip, sex);
    out.rce = rceOf(waist, h);
    const tape = bfTape({ circ: { neck: +a.neck || 0, waist: waist || 0, abdomen: +a.abdomen || 0, hip: hip || 0 } }, sex, h);
    out.bfTape = tape;
    out.bfScale = row.bf_scale_pct != null ? +row.bf_scale_pct : null;
    const bf = out.bfScale != null ? out.bfScale : (tape ? tape.v : null);
    if (bf != null && w) { out.bf = bf; out.fat = Math.round(w * bf) / 100; out.lean = Math.round((w - out.fat) * 10) / 10; out.bfc = bfClass(bf, sex); }
    if (w) out.waterGoal = Math.round(w * 35 / 100) / 10; // 35 mL/kg
    // alertas
    if ((a.parq || []).some(x => x === true)) out.flags.push('PAR-Q com resposta "Sim": recomenda-se avaliação médica antes de aumentar a intensidade dos treinos.');
    if (a.pregnancy && a.pregnancy !== 'nao') out.flags.push('Gestante/amamentando: plano alimentar e de treino devem ser conduzidos com acompanhamento de saúde.');
    if (out.imc && (out.imc.v < 18.5)) out.flags.push('IMC abaixo de 18,5.');
    if (out.imc && out.imc.v >= 35) out.flags.push('IMC a partir de 35 (obesidade grau II ou maior): priorizar avaliação médica.');
    if (a.sleep_h != null && a.sleep_h < 6) out.flags.push('Sono abaixo de 6 h por noite — pode atrapalhar recuperação e controle do apetite.');
    if (out.bfScale != null && tape && Math.abs(out.bfScale - tape.v) >= 6) out.flags.push('% de gordura da balança e da fita diferem em 6 pontos ou mais — repita as medidas nas mesmas condições.');
    return out;
  }

  /* ---------- CSS ---------- */
  function injectCss() {
    if (typeof document === 'undefined' || document.getElementById('avcss')) return;
    const s = document.createElement('style'); s.id = 'avcss';
    s.textContent = `
.av-sec{margin:24px 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:var(--mu);font-weight:600}
.av-q{background:var(--s1);border-radius:var(--r,14px);padding:14px;margin:10px 0}
.av-q.err{outline:2px solid var(--bad)}
.av-q .t{display:flex;gap:10px;align-items:flex-start;font-weight:600;margin-bottom:8px;line-height:1.3}
.av-n{flex:none;background:var(--ac);color:#fff;border-radius:999px;min-width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:700}
.av-opt{display:flex;gap:10px;align-items:flex-start;background:var(--s2);border:1px solid var(--s3);border-radius:12px;padding:10px 12px;margin:6px 0;cursor:pointer}
.av-opt input{width:auto;margin-top:3px;flex:none}
.av-opt.on{border-color:var(--ac);background:color-mix(in srgb,var(--ac) 12%,var(--s2))}
.av-opt small{display:block;color:var(--mu)}
.av-unit{position:relative}.av-unit input{padding-right:48px}.av-unit span{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--mu);font-size:14px}
.av-msg{color:var(--bad);font-size:13px;margin-top:6px}
.av-help{color:var(--mu);font-size:12px;margin-top:6px}
.av-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none}
.av-parq .row{margin:8px 0 0}.av-parq .qq{padding:10px 0;border-top:1px solid var(--s3)}.av-parq .qq:first-of-type{border-top:0}
.av-ph{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.av-ph .slot{background:var(--s2);border-radius:12px;padding:8px;text-align:center}
.av-ph .ph{width:100%;aspect-ratio:3/4;border-radius:8px;background:var(--s3);display:flex;align-items:center;justify-content:center;overflow:hidden}
.av-ph img{width:100%;height:100%;object-fit:cover}
.av-ph svg{width:46%;height:auto;opacity:.7}
.av-ph .btn{margin-top:8px;width:100%}
.av-note{background:var(--s2);border-left:4px solid var(--ac);border-radius:10px;padding:10px 12px;font-size:13px;margin:10px 0}
.av-top{display:flex;gap:10px;align-items:center;margin:8px 0 4px}
html[data-theme=light] .av-n{color:#fff}
html[data-theme=light] .av-q{box-shadow:0 1px 2px rgba(16,24,40,.06)}
`;
    document.head.appendChild(s);
  }

  /* ---------- formulário ---------- */
  function fig(kind) {
    const side = kind === 'left' || kind === 'right';
    const x = side ? 0 : 6;
    return `<svg viewBox="0 0 60 120" aria-hidden="true"><circle cx="30" cy="12" r="9" fill="#5b8cff"/>${side
      ? '<rect x="22" y="24" width="16" height="42" rx="7" fill="#5b8cff"/><rect x="25" y="64" width="10" height="50" rx="4" fill="#9097a6"/>'
      : `<rect x="${14 + x - 6}" y="24" width="${32 - 2 * (x - 6)}" height="42" rx="7" fill="#5b8cff"/><rect x="${6}" y="26" width="7" height="40" rx="3" fill="#5b8cff"/><rect x="47" y="26" width="7" height="40" rx="3" fill="#5b8cff"/><rect x="19" y="64" width="9" height="50" rx="4" fill="#9097a6"/><rect x="32" y="64" width="9" height="50" rx="4" fill="#9097a6"/>`}</svg>`;
  }

  function qHtml(q, val, n, A) {
    const id = 'av_' + q.k, v = val == null ? '' : val;
    const hidden = needF(q) && A.sex !== 'F';
    let body = '';
    if (q.t === 'tel') body = `<input id="${id}" type="tel" inputmode="tel" autocomplete="tel" placeholder="${esc(q.ph || '')}" value="${esc(v)}">`;
    else if (q.t === 'date') body = `<input id="${id}" data-mask="date" inputmode="numeric" maxlength="10" placeholder="DD/MM/AAAA" autocomplete="bday" value="${esc(v)}">`;
    else if (q.t === 'num') body = `<div class="av-unit"><input id="${id}" inputmode="decimal" placeholder="${esc(q.ph || '')}" value="${esc(v)}"><span>${esc(q.u || '')}</span></div>`;
    else if (q.t === 'sel') body = `<select id="${id}"><option value="">Selecione…</option>${q.opts.map(([o, l]) => `<option value="${esc(o)}" ${String(o) === String(v) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
    else if (q.t === 'area') body = `<textarea id="${id}" rows="2" maxlength="${q.max || 500}" placeholder="${esc(q.ph || '')}">${esc(v)}</textarea>`;
    else if (q.t === 'radio2') body = `<div class="grid2">${q.opts.map(([o, l]) => `<label class="av-opt ${String(o) === String(v) ? 'on' : ''}"><input type="radio" name="${id}" value="${esc(o)}" ${String(o) === String(v) ? 'checked' : ''}><span>${esc(l)}</span></label>`).join('')}</div>`;
    else if (q.t === 'radio') body = q.opts.map(([o, l, d]) => `<label class="av-opt ${String(o) === String(v) ? 'on' : ''}"><input type="radio" name="${id}" value="${esc(o)}" ${String(o) === String(v) ? 'checked' : ''}><span><b>${esc(l)}</b> <span class="mu xs">×${esc(String(o).replace(".", ","))}</span><small>${esc(d || '')}</small></span></label>`).join('');
    else if (q.t === 'parq') {
      const arr = Array.isArray(v) ? v : [];
      body = `<div class="av-parq">${PARQ.map((t, i) => `<div class="qq"><div class="sm">${i + 1}. ${esc(t)}</div><div class="row">${[['1', 'Sim'], ['0', 'Não']].map(([o, l]) => `<label class="av-opt ${arr[i] === (o === '1') ? 'on' : ''}" style="margin:6px 0;flex:1"><input type="radio" name="av_parq${i}" value="${o}" ${arr[i] === (o === '1') ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div></div>`).join('')}</div>`;
    }
    return `<div class="av-q" id="avc_${q.k}" data-q="${q.k}" ${hidden ? 'hidden' : ''}><div class="t"><span class="av-n">${n}</span><span>${esc(q.l)}</span></div>${body}${q.help ? `<div class="av-help">${esc(q.help)}</div>` : ''}<div class="av-msg" id="avm_${q.k}" hidden></div></div>`;
  }

  function formHtml(mode, ctx) {
    const D = AV.draft, A = D.a;
    let n = 0, h = '';
    if (mode === 'public') {
      h += `<div class="av-q" id="avc_name"><div class="t"><span class="av-n">${++n}</span><span>Nome completo</span></div><input id="av_name" autocomplete="name" maxlength="80" value="${esc(D.name)}"><div class="av-msg" id="avm_name" hidden></div></div>`;
      h += `<div class="av-q" id="avc_email"><div class="t"><span class="av-n">${++n}</span><span>E-mail</span></div><input id="av_email" type="email" inputmode="email" autocomplete="email" autocapitalize="off" maxlength="254" value="${esc(D.email)}"><div class="av-help">Enviaremos para este e-mail um código para você criar sua senha e ver sua análise.</div><div class="av-msg" id="avm_email" hidden></div></div>`;
    }
    for (const s of SECTIONS) {
      h += `<div class="av-sec">${esc(s.t)}</div>`;
      for (const q of s.qs) { const hide = needF(q) && A.sex !== 'F'; h += qHtml(q, A[q.k], hide ? '' : ++n, A); }
    }
    const who = CFG.CONTROLLER ? esc(CFG.CONTROLLER) : 'o profissional responsável pelo seu acompanhamento';
    const consentTxt = mode === 'master'
      ? 'Confirmo que o cliente foi informado e autorizou o registro destes dados pessoais, inclusive de saúde, para elaboração do plano alimentar e de treino.'
      : `Declaro ter 18 anos ou mais e autorizo ${who} a tratar meus dados pessoais, inclusive <b>dados de saúde e fotos</b> (dados sensíveis), para elaborar meu plano alimentar e de treino. Os dados ficam acessíveis só a mim e ao profissional responsável. Posso revogar este consentimento e pedir a exclusão dos meus dados a qualquer momento${CFG.CONTACT ? ' pelo próprio app (Minha avaliação → Excluir) ou pelo e-mail ' + esc(CFG.CONTACT) : ' pelo próprio app (Minha avaliação → Excluir) ou falando com o profissional'}.`;
    h += `<div class="av-sec">Consentimento</div><div class="av-q" id="avc_consent"><label class="av-opt ${D.consent ? 'on' : ''}" style="margin:0"><input type="checkbox" id="av_consent" ${D.consent ? 'checked' : ''}><span class="sm">${consentTxt}</span></label><div class="av-msg" id="avm_consent" hidden></div></div>`;
    if (mode === 'public') {
      h += `<input class="av-hp" id="av_hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">`;
      if (CFG.TURNSTILE_SITEKEY) h += `<div id="avCf" style="margin:12px 0"></div>`;
      h += `<div class="av-note">📷 As <b>4 fotos</b> (frente, costas e lados) são enviadas depois, dentro do app, quando você criar sua senha.</div>`;
    }
    h += `<div id="avErr" class="av-msg" hidden></div><button class="btn pri block" data-act="avSubmit" id="avBtn" style="margin-top:12px">${mode === 'public' ? 'Enviar avaliação' : 'Salvar avaliação'}</button>`;
    h += `<p class="mu xs" style="margin-top:10px">Esta avaliação não substitui avaliação médica. Use o resultado como ponto de partida.</p>`;
    return h;
  }

  function renumber() {
    let n = 0;
    document.querySelectorAll('#avForm .av-q').forEach(c => {
      if (c.hidden || c.id === 'avc_consent') return;
      const b = c.querySelector('.av-n'); if (b) b.textContent = ++n;
    });
  }

  function readDraft() {
    const form = document.getElementById('avForm'); if (!form) return;
    const D = AV.draft, A = D.a;
    const nm = document.getElementById('av_name'), em = document.getElementById('av_email');
    if (nm) D.name = nm.value; if (em) D.email = em.value;
    for (const q of QS) {
      if (q.t === 'radio2' || q.t === 'radio') { const r = form.querySelector(`input[name="av_${q.k}"]:checked`); A[q.k] = r ? r.value : ''; }
      else if (q.t === 'parq') A.parq = PARQ.map((_, i) => { const r = form.querySelector(`input[name="av_parq${i}"]:checked`); return r ? r.value === '1' : null; });
      else { const el = document.getElementById('av_' + q.k); if (el) A[q.k] = el.value; }
    }
    const c = document.getElementById('av_consent'); if (c) D.consent = c.checked;
  }

  // converte o rascunho em respostas "limpas" e valida (mesmas regras do servidor)
  function collect(mode) {
    const D = AV.draft, A = D.a, out = {}, err = {};
    const isF = A.sex === 'F';
    if (mode === 'public') {
      if ((D.name || '').trim().length < 2) err.name = 'Informe seu nome completo.';
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test((D.email || '').trim())) err.email = 'E-mail inválido.';
    }
    for (const q of QS) {
      const raw = A[q.k], req = !!q.req || (q.k === 'pregnancy' && isF);
      if (needF(q) && !isF) continue;
      if (q.t === 'parq') {
        if (!Array.isArray(raw) || raw.length !== PARQ.length || raw.some(x => typeof x !== 'boolean')) err.parq = 'Responda todas as perguntas (Sim ou Não).'; else out.parq = raw;
        continue;
      }
      if (raw == null || String(raw).trim() === '') { if (req) err[q.k] = 'Campo obrigatório.'; continue; }
      if (q.t === 'num') {
        const x = num(raw);
        if (x == null || x < q.min || x > q.max || (q.int && !Number.isInteger(x))) err[q.k] = `Informe um valor entre ${q.min} e ${q.max}.`; else out[q.k] = x;
      } else if (q.t === 'sel' || q.t === 'radio' || q.t === 'radio2') {
        if (!q.opts.some(o => String(o[0]) === String(raw))) err[q.k] = 'Opção inválida.';
        else out[q.k] = q.int ? Number(raw) : String(raw);
      } else if (q.t === 'area') {
        const s = String(raw).replace(/\r\n?/g, '\n').trim();
        if (s.length > q.max) err[q.k] = `Máximo de ${q.max} caracteres.`; else if (s) out[q.k] = s; else if (req) err[q.k] = 'Campo obrigatório.';
      } else if (q.t === 'tel') {
        const d = String(raw).replace(/\D/g, '');
        if (d.length < 10 || d.length > 13) err[q.k] = 'WhatsApp inválido (com DDD).'; else out[q.k] = d;
      } else if (q.t === 'date') {
        const isoD = brToISO(raw);
        if (!isoD) err[q.k] = 'Data inválida (DD/MM/AAAA).';
        else { const ag = ageAt(isoD); if (ag < MIN_AGE) err[q.k] = 'Esta avaliação é para maiores de 18 anos.'; else if (ag > 100) err[q.k] = 'Data inválida.'; else out[q.k] = isoD; }
      }
    }
    if (!D.consent) err.consent = 'É necessário marcar o consentimento para continuar.';
    return { out, err };
  }

  function showErrors(err) {
    document.querySelectorAll('#avForm .av-q.err').forEach(c => c.classList.remove('err'));
    document.querySelectorAll('#avForm .av-msg').forEach(m => { m.hidden = true; });
    let first = null;
    for (const [k, msg] of Object.entries(err)) {
      const c = document.getElementById('avc_' + k), m = document.getElementById('avm_' + k);
      if (c) { c.classList.add('err'); if (!first) first = c; }
      if (m) { m.textContent = msg; m.hidden = false; }
    }
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function fnError(error) {
    let j = null; try { j = await error.context.json(); } catch (e) { /* sem corpo */ }
    return j || { error: 'network' };
  }

  async function submit(mode, ctx) {
    readDraft();
    const { out, err } = collect(mode);
    if (Object.keys(err).length) { showErrors(err); toast('Revise os campos destacados'); return; }
    const btn = document.getElementById('avBtn'), msg = document.getElementById('avErr');
    msg.hidden = true;
    if (!navigator.onLine) { msg.textContent = 'Sem internet. Conecte-se para enviar.'; msg.hidden = false; return; }
    btn.disabled = true; const label = btn.textContent; btn.textContent = 'Enviando…';
    try {
      if (!sbInit()) throw new Error('Servidor não configurado.');
      if (mode === 'public') {
        const hp = (document.getElementById('av_hp') || {}).value || '';
        const { data, error } = await SB.functions.invoke(CFG.FN, { body: { action: 'submit', name: AV.draft.name.trim(), email: AV.draft.email.trim(), answers: out, consent: { accepted: true, version: CFG.CONSENT_VERSION }, hp, cf_token: AV.cf } });
        if (error) {
          const j = await fnError(error);
          if (j.error === 'validation') { showErrors(j.fields || {}); toast('Revise os campos destacados'); }
          else msg.textContent = j.error === 'rate_limited' ? 'Muitas tentativas. Aguarde um pouco e tente de novo.'
            : j.error === 'captcha' ? 'Não foi possível confirmar que você não é um robô. Recarregue e tente de novo.'
            : j.error === 'email_failed' ? 'Suas respostas foram salvas, mas não conseguimos enviar o e-mail. Use "Reenviar e-mail" na próxima tela.'
            : 'Não foi possível enviar agora. Tente novamente em instantes.';
          if (j.error === 'email_failed') { AV.state = { mode: 'sent', email: AV.draft.email.trim(), warn: true }; clearDraft(); render(); return; }
          if (j.error !== 'validation') msg.hidden = false;
          return;
        }
        AV.state = { mode: 'sent', email: AV.draft.email.trim() }; clearDraft(); render(); scrollTo(0, 0); return;
      }
      const uid = mode === 'master' ? ctx.uid : ME.id;
      const row = { user_id: uid, created_by: ME.id, source: mode === 'master' ? 'master' : 'self', weight_kg: out.weight, height_cm: out.height, bf_scale_pct: out.bf_scale ?? null, answers: out, consent_version: CFG.CONSENT_VERSION, consent_at: new Date().toISOString() };
      const { data, error } = await SB.from('assessments').insert(row).select('id').single();
      if (error) throw new Error(friendlyErr(error));
      clearDraft(); AV.cache.mine = null; delete AV.cache.byUser[uid]; AV.cache.all = null;
      toast('Avaliação salva');
      V.stack.pop(); go('avdet', { id: data.id, uid });
    } catch (e) { msg.textContent = e.message || String(e); msg.hidden = false; }
    finally { if (btn.isConnected) { btn.disabled = false; btn.textContent = label; } }
  }

  function clearDraft() { AV.draft = { name: '', email: '', a: {}, consent: false }; }

  /* ---------- telas PÚBLICAS (sem login) ---------- */
  function pubHeader(title, sub) {
    return `<div class="av-top"><button class="bk" data-act="avClose" aria-label="Voltar" style="background:var(--s2);border:0;color:var(--tx);width:38px;height:38px;border-radius:12px;font-size:26px;line-height:1">‹</button><div style="min-width:0"><h1 style="margin:0">${esc(title)}</h1>${sub ? `<div class="mu sm">${sub}</div>` : ''}</div></div>`;
  }

  function viewPublic() {
    const s = AV.state;
    if (s.mode === 'form') {
      return `<div style="max-width:560px;margin:0 auto">${pubHeader('Avaliação gratuita', 'Dieta, treino e saúde · leva uns 8 minutos')}
        <div class="av-note">Responda com calma. Ao enviar, você recebe por e-mail um <b>código de acesso</b> para criar sua senha; só então terá acesso à sua análise. Seus dados de saúde ficam visíveis apenas para você e para o profissional responsável.</div>
        <div id="avForm">${formHtml('public')}</div></div>`;
    }
    if (s.mode === 'sent') {
      return `<div class="login" style="max-width:420px">${s.warn ? '<h1>⚠️ Quase lá</h1><p class="mu">Suas respostas foram salvas, mas o e-mail não saiu. Toque em <b>Reenviar código</b>.</p>' : '<h1>📬 Confira seu e-mail</h1><p class="mu">Enviamos um <b>código de acesso</b> para <b>' + esc(s.email) + '</b>. Digite-o no próximo passo para criar sua senha e ver sua análise.</p>'}
        <p class="mu sm">Não chegou em alguns minutos? Veja a caixa de spam. O código vale por 1 hora e é de uso único.</p>
        <button class="btn pri block" data-act="avOpenCode" data-email="${esc(s.email)}" style="margin-top:10px">Digitar o código</button>
        <button class="btn block" data-act="avResend" id="avRsBtn" data-email="${esc(s.email)}">Reenviar código</button>
        <div id="avRsMsg" class="sm mu" style="min-height:20px;margin-top:8px"></div>
        <button class="btn ghost block" data-act="avClose">Voltar ao login</button></div>`;
    }
    if (s.mode === 'resend') {
      return `<div class="login" style="max-width:420px"><h1>Criar ou redefinir senha</h1><p class="mu">Digite o e-mail da sua avaliação. Se houver conta, enviaremos um código de acesso.</p>
        <label class="f"><span>E-mail</span><input id="av_rsEmail" type="email" autocomplete="email" autocapitalize="off"></label>
        <div id="avRsMsg" class="sm" style="min-height:20px;margin-top:8px"></div>
        <button class="btn pri block" data-act="avResend" id="avRsBtn">Enviar código</button>
        <button class="btn block" data-act="avOpenCode">Já tenho um código</button>
        <button class="btn ghost block" data-act="avClose">Voltar ao login</button></div>`;
    }
    if (s.mode === 'code') {
      return `<div class="login" style="max-width:420px"><h1>Criar sua senha</h1><p class="mu">Digite o código que enviamos por e-mail e escolha sua senha (mínimo 8 caracteres, com letras e números).</p>
        <label class="f"><span>E-mail</span><input id="av_cdEmail" type="email" autocomplete="email" autocapitalize="off" value="${esc(s.email || '')}"></label>
        <label class="f"><span>Código do e-mail</span><input id="av_cdCode" inputmode="numeric" autocomplete="one-time-code" maxlength="10" placeholder="somente números"></label>
        <label class="f"><span>Nova senha</span><input id="av_pw1" type="password" autocomplete="new-password"></label>
        <label class="f"><span>Repita a senha</span><input id="av_pw2" type="password" autocomplete="new-password"></label>
        <div id="avPwMsg" class="sm" style="color:var(--bad);min-height:20px"></div>
        <button class="btn pri block" data-act="avCode" id="avPwBtn">Salvar e entrar</button>
        <button class="btn block" data-act="avOpenResend">Pedir novo código</button>
        <button class="btn ghost block" data-act="avClose">Voltar ao login</button></div>`;
    }
    if (s.mode === 'activate') {
      if (s.phase === 'checking') return `<div class="login"><h1>Verificando link…</h1><p class="mu">Só um instante.</p></div>`;
      if (s.phase === 'invalid') return `<div class="login"><h1>Link inválido ou expirado</h1><p class="mu">Os acessos por e-mail são de uso único e expiram em 1 hora. Peça um novo código.</p>
        <button class="btn pri block" data-act="avOpenResend">Receber novo código</button><button class="btn ghost block" data-act="avClose">Voltar ao login</button></div>`;
      return `<div class="login"><h1>Crie sua senha</h1><p class="mu">Ela dá acesso à sua avaliação e ao app. Use no mínimo 8 caracteres, com letras e números.</p>
        <label class="f"><span>Senha</span><input id="av_pw1" type="password" autocomplete="new-password"></label>
        <label class="f"><span>Repita a senha</span><input id="av_pw2" type="password" autocomplete="new-password"></label>
        <div id="avPwMsg" class="sm" style="color:var(--bad);min-height:20px"></div>
        <button class="btn pri block" data-act="avSetPw" id="avPwBtn">Salvar e entrar</button></div>`;
    }
    return null;
  }

  function takeover() {
    if (!AV.state) return null;
    const h = viewPublic();
    if (h && typeof document !== 'undefined') {
      document.body.classList.add('nologin');
      if (AV.state.mode === 'form') setTimeout(mountForm, 0);
    }
    return h;
  }

  function mountForm() {
    if (!document.getElementById('avForm') || !CFG.TURNSTILE_SITEKEY || !document.getElementById('avCf') || AV.cfMounted === document.getElementById('avCf')) return;
    const draw = () => { if (window.turnstile) { window.turnstile.render('#avCf', { sitekey: CFG.TURNSTILE_SITEKEY, callback: t => { AV.cf = t; }, 'expired-callback': () => { AV.cf = ''; } }); AV.cfMounted = document.getElementById('avCf'); } };
    if (window.turnstile) return draw();
    const sc = document.createElement('script'); sc.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; sc.async = true; sc.onload = draw; document.head.appendChild(sc);
  }

  /* ---------- ativação do link do e-mail ---------- */
  async function activate(token) {
    try {
      if (!sbInit()) throw new Error('config');
      const { data, error } = await SB.auth.verifyOtp({ token_hash: token, type: 'recovery' });
      if (error || !data || !data.session) { AV.state = { mode: 'activate', phase: 'invalid' }; render(); return; }
      AV.state = { mode: 'activate', phase: 'setpw' }; render();
    } catch (e) { AV.state = { mode: 'activate', phase: 'invalid' }; render(); }
  }

  function pwProblem(p1, p2) {
    if (p1.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.';
    if (!/[A-Za-z]/.test(p1) || !/\d/.test(p1)) return 'Use letras e números.';
    if (p1 !== p2) return 'As senhas não conferem.';
    return '';
  }

  // código de acesso do e-mail → valida → grava a senha → entra
  async function codeLogin() {
    const email = $('#av_cdEmail').value.trim().toLowerCase(), code = $('#av_cdCode').value.replace(/\D/g, '');
    const p1 = $('#av_pw1').value, p2 = $('#av_pw2').value, msg = $('#avPwMsg'), btn = $('#avPwBtn');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) { msg.textContent = 'Informe o e-mail da sua avaliação.'; return; }
    if (code.length < 6) { msg.textContent = 'Digite o código completo que chegou no e-mail.'; return; }
    const bad = pwProblem(p1, p2); if (bad) { msg.textContent = bad; return; }
    btn.disabled = true; btn.textContent = 'Verificando…'; msg.textContent = '';
    try {
      if (!sbInit()) throw new Error('config');
      const { data, error } = await SB.auth.verifyOtp({ email, token: code, type: 'recovery' });
      if (error || !data || !data.session) { msg.textContent = 'Código inválido ou expirado. Confira o e-mail ou peça um novo código.'; return; }
      btn.textContent = 'Salvando…';
      await savePassword(p1, msg);
    } catch (e) { msg.textContent = friendlyErr(e); }
    finally { if (btn.isConnected) { btn.disabled = false; btn.textContent = 'Salvar e entrar'; } }
  }

  async function savePassword(p1, msg) {
    const { error } = await SB.auth.updateUser({ password: p1 });
    if (error) { msg.textContent = /same|different/i.test(error.message) ? 'Escolha uma senha diferente da anterior.' : /weak|pwned|compromis/i.test(error.message) ? 'Essa senha é fraca ou apareceu em vazamentos. Escolha outra.' : error.message; return; }
    await enter();
  }

  async function setPassword() {
    const p1 = $('#av_pw1').value, p2 = $('#av_pw2').value, msg = $('#avPwMsg'), btn = $('#avPwBtn');
    const bad = pwProblem(p1, p2); if (bad) { msg.textContent = bad; return; }
    btn.disabled = true; btn.textContent = 'Salvando…'; msg.textContent = '';
    try {
      const { error } = await SB.auth.updateUser({ password: p1 });
      if (error) { msg.textContent = /same|different/i.test(error.message) ? 'Escolha uma senha diferente da anterior.' : /weak|pwned|compromis/i.test(error.message) ? 'Essa senha é fraca ou apareceu em vazamentos. Escolha outra.' : error.message; return; }
      await enter();
    } catch (e) { msg.textContent = friendlyErr(e); }
    finally { if (btn.isConnected) { btn.disabled = false; btn.textContent = 'Salvar e entrar'; } }
  }

  // mesmo caminho do login normal
  async function enter() {
    const { data: u } = await SB.auth.getUser();
    const uid = u && u.user && u.user.id;
    const { data: p, error } = await SB.from('profiles').select('id,name,email,role,active').eq('id', uid).single();
    if (error || !p || !p.active) { await SB.auth.signOut({ scope: 'local' }); AV.state = null; render(); toast('Conta indisponível. Fale com o administrador.'); return; }
    ME = p; localStorage.setItem('treino.me', JSON.stringify(ME)); localStorage.setItem('treino.lastEmail', p.email || '');
    loadUser(); V.tab = 'hoje'; V.stack = []; AV.state = null; AV.cache = { mine: null, byUser: {}, all: null, det: {} };
    render();
    try { await sync(); } catch (e) { /* offline: segue */ }
    go('aval', { welcome: 1 });
  }

  async function resend(btn) {
    const el = document.getElementById('av_rsEmail');
    const email = (el ? el.value : btn.dataset.email || '').trim();
    const msg = document.getElementById('avRsMsg');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) { msg.textContent = 'Informe um e-mail válido.'; msg.style.color = 'var(--bad)'; return; }
    if (Date.now() < AV.cooldown) { msg.textContent = 'Aguarde um instante antes de pedir de novo.'; return; }
    btn.disabled = true;
    try {
      if (!sbInit()) throw new Error('config');
      const { error } = await SB.functions.invoke(CFG.FN, { body: { action: 'resend', email, cf_token: AV.cf } });
      if (error) { const j = await fnError(error); msg.style.color = 'var(--bad)'; msg.textContent = j.error === 'rate_limited' ? 'Muitas tentativas. Tente mais tarde.' : 'Não foi possível enviar agora.'; return; }
      AV.cooldown = Date.now() + 60000;
      if (el) { AV.state = { mode: 'code', email }; render(); toast('Se houver conta com este e-mail, enviamos um código.'); return; }
      msg.style.color = 'var(--ok)'; msg.textContent = 'Se houver uma conta com este e-mail, um novo código foi enviado.';
    } catch (e) { msg.style.color = 'var(--bad)'; msg.textContent = 'Sem conexão.'; }
    finally { if (btn.isConnected) btn.disabled = false; }
  }

  /* ---------- análise: HTML ---------- */
  function resultHtml(row) {
    const R = analyze(row), a = row.answers || {};
    let h = '';
    if (R.flags.length) h += R.flags.map(f => `<div class="sug down" style="margin:8px 0">⚠️ ${esc(f)}</div>`).join('');
    h += `<div class="card" style="padding:6px 14px">`;
    h += kv('Peso', R.w ? f1(R.w) + ' kg' : '—', a.goal_weight ? 'Meta: ' + f1(a.goal_weight) + ' kg' : '');
    if (R.imc) h += kv('IMC', f1(R.imc.v), R.imc.txt, R.imc.c);
    if (R.tmb) h += kv('Taxa metabólica basal', R.tmb + ' kcal', 'Mifflin-St Jeor', 'ok');
    if (R.tdee) h += kv('Gasto diário estimado', R.tdee + ' kcal', `TMB × ${String(R.factor).replace('.', ',')} (nível de atividade informado)`, 'ok');
    if (R.bfScale != null) h += kv('% gordura · balança', f1(R.bfScale) + ' %', 'Bioimpedância (estimativa)' + (R.bfc && R.bf === R.bfScale ? ' · ' + R.bfc.txt : ''), R.bfc && R.bf === R.bfScale ? R.bfc.c : 'ok');
    if (R.bfTape) h += kv('% gordura · fita', f1(R.bfTape.v) + ' %', R.bfTape.method + (R.bfc && R.bf === R.bfTape.v ? ' · ' + R.bfc.txt : ''), R.bfc && R.bf === R.bfTape.v ? R.bfc.c : 'ok');
    if (R.fat != null) h += kv('Massa gorda / magra', `${f1(R.fat)} / ${f1(R.lean)} kg`, R.bfScale != null ? 'Calculado com o % da balança' : 'Calculado com o % da fita');
    if (R.rcq) h += kv('Cintura/quadril', R.rcq.v.toString().replace('.', ','), R.rcq.txt, R.rcq.c);
    if (R.rce) h += kv('Cintura/altura', R.rce.v.toString().replace('.', ','), R.rce.txt, R.rce.c);
    if (R.waterGoal) h += kv('Água sugerida', f1(R.waterGoal) + ' L/dia', a.water != null ? 'Você informou ' + f1(a.water) + ' L' : '', a.water != null && a.water < R.waterGoal * 0.8 ? 'warn' : 'ok');
    if (a.sleep_h != null) h += kv('Sono', f1(a.sleep_h) + ' h', a.sleep_h < 7 ? 'Abaixo do recomendado (7–9 h)' : 'Dentro do recomendado', a.sleep_h < 7 ? 'warn' : 'ok');
    h += `</div>`;
    if (R.bfScale != null) h += `<p class="mu xs">O % de gordura da balança é uma estimativa por bioimpedância e oscila com hidratação, horário e refeições. Compare sempre medidas feitas nas mesmas condições.</p>`;
    h += `<p class="mu xs">Valores estimados por fórmulas de campo; servem como ponto de partida e não substituem avaliação profissional.</p>`;
    return h;
  }

  function answersHtml(row) {
    const a = row.answers || {};
    const fmt = (q, v) => {
      if (q.t === 'parq') return PARQ.map((t, i) => `<div class="xs" style="margin-top:4px">${i + 1}. ${esc(t)} — <b style="color:${v[i] ? 'var(--warn)' : 'var(--ok)'}">${v[i] ? 'Sim' : 'Não'}</b></div>`).join('');
      if (q.t === 'sel' || q.t === 'radio' || q.t === 'radio2') return esc(optLabel(q, v));
      if (q.t === 'date') return esc(isoToBR(v));
      if (q.t === 'num') return esc(f1(v)) + ' ' + esc(q.u || '');
      return esc(v).replace(/\n/g, '<br>');
    };
    return SECTIONS.map(s => {
      const rows = s.qs.filter(q => a[q.k] != null && a[q.k] !== '').map(q => `<div style="padding:8px 0;border-top:1px solid var(--s3)"><div class="mu xs">${esc(q.l)}</div><div class="sm">${fmt(q, a[q.k])}</div></div>`).join('');
      return rows ? `<h3>${esc(s.t)}</h3><div class="card" style="padding:4px 14px">${rows}</div>` : '';
    }).join('');
  }

  /* ---------- fotos ---------- */
  const VIEWS_PH = [['front', 'Frente'], ['back', 'Costas'], ['left', 'Lado esquerdo'], ['right', 'Lado direito']];
  function photosHtml(row, canEdit) {
    return `<h3>Fotos</h3><div class="card"><div class="av-ph">${VIEWS_PH.map(([k, l]) => `<div class="slot"><div class="ph" id="avph_${k}">${fig(k)}</div><div class="sm" style="margin-top:6px"><b>${l}</b></div>${canEdit ? `<button class="btn smb" data-act="avPick" data-v="${k}" data-id="${row.id}">Enviar foto</button><input type="file" accept="image/*" id="avf_${k}" data-avph="${k}" data-id="${row.id}" data-uid="${row.user_id}" hidden>` : ''}</div>`).join('')}</div>
      <p class="mu xs" style="margin-top:10px">Tire as 4 fotos no mesmo lugar, com boa luz, roupa justa e o corpo inteiro no quadro (celular em pé). As fotos são reduzidas e enviadas de forma privada; só você e o profissional responsável veem.</p></div>`;
  }

  async function loadPhotos(row) {
    try {
      const folder = `${row.user_id}/${row.id}`;
      const { data: files } = await SB.storage.from(CFG.BUCKET).list(folder);
      for (const [k] of VIEWS_PH) {
        const f = (files || []).find(x => x.name === k + '.jpg'); if (!f) continue;
        const { data } = await SB.storage.from(CFG.BUCKET).createSignedUrl(`${folder}/${k}.jpg`, 300);
        const box = document.getElementById('avph_' + k);
        if (data && box && data.signedUrl) { box.innerHTML = `<img alt="${esc(k)}" src="${esc(data.signedUrl)}">`; }
      }
    } catch (e) { /* sem fotos */ }
  }

  async function shrink(file) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Imagem inválida')); i.src = url; });
      const max = 1280, sc = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * sc); c.height = Math.round(img.naturalHeight * sc);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); // recodificar remove EXIF (inclui localização)
      return await new Promise(r => c.toBlob(r, 'image/jpeg', 0.82));
    } finally { URL.revokeObjectURL(url); }
  }

  async function uploadPhoto(input) {
    const f = input.files && input.files[0]; if (!f) return;
    if (!/^image\//.test(f.type)) { toast('Escolha uma imagem'); return; }
    if (f.size > 25e6) { toast('Imagem muito grande'); return; }
    const k = input.dataset.avph;
    try {
      toast('Enviando foto…');
      const blob = await shrink(f);
      if (!blob || blob.size > 3e6) { toast('Foto muito grande'); return; }
      const path = `${input.dataset.uid}/${input.dataset.id}/${k}.jpg`;
      const { error } = await SB.storage.from(CFG.BUCKET).upload(path, blob, { contentType: 'image/jpeg', upsert: true });
      if (error) throw error;
      toast('Foto enviada ✔');
      const { data } = await SB.storage.from(CFG.BUCKET).createSignedUrl(path, 300);
      const box = document.getElementById('avph_' + k); if (data && box) box.innerHTML = `<img alt="${esc(k)}" src="${esc(data.signedUrl)}">`;
    } catch (e) { toast('Erro ao enviar: ' + friendlyErr(e)); }
    finally { input.value = ''; }
  }

  /* ---------- dados (logado) ---------- */
  const COLS = 'id,user_id,created_by,source,weight_kg,height_cm,bf_scale_pct,answers,consent_version,consent_at,created_at';
  function loadList(key, uid, then) {
    const c = key === 'mine' ? AV.cache.mine : AV.cache.byUser[uid];
    if (c) return c;
    const slot = { loading: true };
    if (key === 'mine') AV.cache.mine = slot; else AV.cache.byUser[uid] = slot;
    SB.from('assessments').select(COLS).eq('user_id', uid).order('created_at', { ascending: false }).limit(50).then(({ data, error }) => {
      const r = error ? { err: friendlyErr(error) } : { list: data || [] };
      (data || []).forEach(x => { AV.cache.det[x.id] = x; });
      if (key === 'mine') AV.cache.mine = r; else AV.cache.byUser[uid] = r;
      const t = topV(); if (t && ME) render();
    });
    return slot;
  }

  /* ---------- telas LOGADAS ---------- */
  function listCard(row, uid) {
    const a = row.answers || {}, alert = (a.parq || []).some(x => x === true);
    return `<div class="li tap row" data-act="avOpenDet" data-id="${row.id}" data-uid="${row.user_id}" style="padding:10px 0;border-top:1px solid var(--s3)"><span class="sp"><b>${esc(new Date(row.created_at).toLocaleDateString('pt-BR'))}</b>${alert ? ' <span class="pill" style="background:var(--warn);color:#201800">PAR-Q</span>' : ''}<div class="mu xs">${[row.weight_kg && f1(row.weight_kg) + ' kg', row.bf_scale_pct != null && f1(row.bf_scale_pct) + '% (balança)', row.source === 'master' ? 'pelo administrador' : row.source === 'public' ? 'formulário público' : null].filter(Boolean).join(' · ') || '—'}</div></span><span class="mu">›</span></div>`;
  }

  function viewMine(p) {
    const c = loadList('mine', ME.id);
    let h = hdr('Minha avaliação', 'Suas respostas e análise', !p.welcome ? true : false);
    if (p.welcome) h += `<div class="av-note">Senha criada! Esta é a sua análise. Abaixo você pode enviar as 4 fotos.</div>`;
    if (c.loading) return h + '<div class="empty">Carregando…</div>';
    if (c.err) return h + `<div class="card">Erro: ${esc(c.err)}</div>`;
    if (!c.list.length) return h + `<div class="empty">Nenhuma avaliação ainda.<div style="height:10px"></div><button class="btn pri" data-act="avNew">+ Fazer avaliação</button></div>`;
    const L = c.list[0];
    h += `<h3>Última · ${esc(new Date(L.created_at).toLocaleDateString('pt-BR'))}</h3>` + resultHtml(L) + photosHtml(L, true);
    setTimeout(() => loadPhotos(L), 0);
    h += `<h3>Histórico</h3><div class="card" style="padding:0 14px">${c.list.map(r => listCard(r)).join('')}</div>`;
    h += `<div style="height:8px"></div><button class="btn pri block" data-act="avNew">+ Nova avaliação</button><div style="height:8px"></div><button class="btn block" data-act="avOpenDet" data-id="${L.id}" data-uid="${L.user_id}">Ver minhas respostas</button>`;
    h += `<div style="height:8px"></div><button class="btn block" data-act="avDelAll" style="color:var(--bad)">Excluir meus dados de avaliação</button>`;
    return h;
  }

  function viewDet({ id, uid }) {
    const row = AV.cache.det[id];
    if (!row) { SB.from('assessments').select(COLS).eq('id', id).maybeSingle().then(({ data }) => { if (data) { AV.cache.det[id] = data; render(); } else { toast('Avaliação não encontrada'); } }); return hdr('Avaliação', '', true) + '<div class="empty">Carregando…</div>'; }
    const mine = row.user_id === ME.id, isM = ME.role === 'master';
    let h = hdr('Avaliação', esc(new Date(row.created_at).toLocaleDateString('pt-BR')) + (isM && !mine ? ' · ' + esc((USERS && USERS.list && (USERS.list.find(u => u.id === row.user_id) || {}).name) || 'cliente') : ''), true);
    h += resultHtml(row) + photosHtml(row, mine || isM) + answersHtml(row);
    h += `<p class="mu xs">Consentimento registrado em ${esc(new Date(row.consent_at).toLocaleString('pt-BR'))} (termo ${esc(row.consent_version)}).</p>`;
    h += `<div style="height:8px"></div><button class="btn block" data-act="avDelOne" data-id="${row.id}" style="color:var(--bad)">Excluir esta avaliação</button>`;
    setTimeout(() => loadPhotos(row), 0);
    return h;
  }

  function viewForm({ mode, uid, name }) {
    clearIfNew(mode + uid);
    return hdr(mode === 'master' ? 'Nova avaliação' : 'Nova avaliação', mode === 'master' ? 'para ' + esc(name || 'cliente') : '', true) +
      `<div id="avForm">${formHtml(mode, { uid })}</div>`;
  }
  let lastFormKey = null;
  function clearIfNew(k) { if (lastFormKey !== k) { clearDraft(); lastFormKey = k; } }

  function viewUser({ uid, name }) {
    const c = loadList('user', uid);
    let h = hdr('Avaliações', esc(name || ''), true);
    h += `<button class="btn pri block" data-act="avNewFor" data-uid="${uid}" data-name="${esc(name || '')}">+ Nova avaliação para este cliente</button>`;
    if (c.loading) return h + '<div class="empty">Carregando…</div>';
    if (c.err) return h + `<div class="card">Erro: ${esc(c.err)}</div>`;
    if (!c.list.length) return h + '<div class="empty">Nenhuma avaliação deste cliente.</div>';
    return h + `<h3>Mais recente</h3>${resultHtml(c.list[0])}<h3>Histórico</h3><div class="card" style="padding:0 14px">${c.list.map(r => listCard(r)).join('')}</div>`;
  }

  function viewAll() {
    let h = hdr('Avaliações recebidas', 'Todos os clientes', true);
    const c = AV.cache.all;
    if (!c) {
      AV.cache.all = { loading: true };
      SB.from('assessments').select('id,user_id,created_at,source,weight_kg,bf_scale_pct,parq:answers->parq,goal:answers->>goal,profiles!assessments_user_id_fkey(name,email)').order('created_at', { ascending: false }).limit(100)
        .then(({ data, error }) => { AV.cache.all = error ? { err: friendlyErr(error) } : { list: data || [] }; render(); });
      return h + '<div class="empty">Carregando…</div>';
    }
    if (c.loading) return h + '<div class="empty">Carregando…</div>';
    if (c.err) return h + `<div class="card">Erro: ${esc(c.err)}</div>`;
    if (!c.list.length) return h + '<div class="empty">Nenhuma avaliação recebida ainda.</div>';
    return h + `<div class="card" style="padding:0 14px">${c.list.map(r => {
      const alert = Array.isArray(r.parq) && r.parq.some(x => x === true);
      return `<div class="li tap row" data-act="avOpenDet" data-id="${r.id}" data-uid="${r.user_id}" style="padding:10px 0;border-top:1px solid var(--s3)"><span class="sp"><b>${esc((r.profiles && r.profiles.name) || '—')}</b>${alert ? ' <span class="pill" style="background:var(--warn);color:#201800">PAR-Q</span>' : ''}<div class="mu xs">${esc(new Date(r.created_at).toLocaleDateString('pt-BR'))} · ${esc(optLabel(QMAP.goal, r.goal) || '—')}${r.weight_kg ? ' · ' + f1(r.weight_kg) + ' kg' : ''}${r.bf_scale_pct != null ? ' · ' + f1(r.bf_scale_pct) + '% (balança)' : ''}${r.source === 'public' ? ' · público' : ''}</div></span><span class="mu">›</span></div>`;
    }).join('')}</div>`;
  }

  /* ---------- exclusão (LGPD) ---------- */
  async function deleteAssessment(row) {
    const folder = `${row.user_id}/${row.id}`;
    const { data: files } = await SB.storage.from(CFG.BUCKET).list(folder);
    if (files && files.length) await SB.storage.from(CFG.BUCKET).remove(files.map(f => `${folder}/${f.name}`));
    const { error } = await SB.from('assessments').delete().eq('id', row.id);
    if (error) throw new Error(friendlyErr(error));
  }

  /* ---------- instalação (chamada pelo index.html) ---------- */
  function install({ VIEWS, ACT }) {
    injectCss();
    VIEWS.aval = p => viewMine(p || {});
    VIEWS.avdet = viewDet;
    VIEWS.avform = viewForm;
    VIEWS.avuser = viewUser;
    VIEWS.avall = viewAll;
    Object.assign(ACT, {
      avOpen: () => { AV.state = { mode: 'form' }; render(); scrollTo(0, 0); },
      avOpenResend: () => { AV.state = { mode: 'resend' }; render(); },
      avClose: () => { AV.state = null; render(); scrollTo(0, 0); },
      avSubmit: () => submit(AV.state && AV.state.mode === 'form' ? 'public' : (topV().params.mode), topV() && topV().params),
      avResend: (d, b) => resend(b),
      avSetPw: () => setPassword(),
      avOpenCode: d => { AV.state = { mode: 'code', email: (d && d.email) || '' }; render(); scrollTo(0, 0); },
      avCode: () => codeLogin(),
      avNew: () => go('avform', { mode: 'self' }),
      avNewFor: d => go('avform', { mode: 'master', uid: d.uid, name: d.name }),
      avOpenDet: d => go('avdet', { id: d.id, uid: d.uid }),
      avPick: d => { const el = document.getElementById('avf_' + d.v); if (el) el.click(); },
      avOpenUser: d => { const u = USERS && USERS.list && USERS.list.find(x => x.id === d.id); go('avuser', { uid: d.id, name: u ? u.name : '' }); },
      avOpenAll: () => go('avall'),
      avDelOne: d => confirmBox('Excluir avaliação', '<p>Esta avaliação e as fotos dela serão apagadas <b>permanentemente</b>.</p>', 'Excluir', async () => {
        try { const row = AV.cache.det[d.id]; await deleteAssessment(row); AV.cache = { mine: null, byUser: {}, all: null, det: {} }; toast('Excluída'); V.stack.pop(); render(); } catch (e) { toast(e.message); }
      }, true),
      avDelAll: () => confirmBox('Excluir meus dados', '<p>Todas as suas avaliações e fotos serão apagadas <b>permanentemente</b>. Sua conta e seus treinos continuam.</p>', 'Excluir tudo', async () => {
        try { const l = (AV.cache.mine && AV.cache.mine.list) || []; for (const r of l) await deleteAssessment(r); AV.cache = { mine: null, byUser: {}, all: null, det: {} }; toast('Dados excluídos'); render(); } catch (e) { toast(e.message); }
      }, true),
    });
    // eventos do formulário (delegados)
    document.addEventListener('input', ev => { if (ev.target.closest && ev.target.closest('#avForm')) readDraft(); });
    document.addEventListener('change', ev => {
      const t = ev.target;
      if (t.dataset && t.dataset.avph) { uploadPhoto(t); return; }
      if (!(t.closest && t.closest('#avForm'))) return;
      readDraft();
      if (t.type === 'radio' || t.type === 'checkbox') {
        const grp = t.type === 'radio' ? document.querySelectorAll(`#avForm input[name="${t.name}"]`) : [t];
        grp.forEach(r => r.closest('.av-opt') && r.closest('.av-opt').classList.toggle('on', r.checked));
      }
      if (t.name === 'av_sex') { const c = document.getElementById('avc_pregnancy'); if (c) { c.hidden = t.value !== 'F'; renumber(); } }
    });
    // link antigo do e-mail (#acesso=...) → ativação (mantido por compatibilidade; o e-mail atual usa código)
    if (typeof location !== 'undefined') {
      const m = /^#acesso=([\w.\-~%]+)$/.exec(location.hash || '');
      if (m) {
        const token = decodeURIComponent(m[1]);
        history.replaceState(null, '', location.pathname + location.search); // tira o token da barra de endereço
        AV.state = { mode: 'activate', phase: 'checking' };
        activate(token);
      }
    }
  }

  AV.install = install; AV.takeover = takeover; AV.analyze = analyze; AV.SECTIONS = SECTIONS; AV.PARQ = PARQ; AV.collect = collect;
  if (typeof window !== 'undefined') window.AV = AV;
  if (typeof module !== 'undefined' && module.exports) module.exports = AV;
})();
