// Confere que o formulário (avaliacao.js) e a validação do servidor (validate.ts) falam a mesma língua.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { SPEC, validateIntake, PARQ_COUNT } from '../supabase/functions/public-intake/validate.ts';
const require = createRequire(import.meta.url);
globalThis.window = undefined;
const AV = require('../avaliacao.js');

const clientKeys = AV.QS.map(q => q.k).sort();
const serverKeys = Object.keys(SPEC).sort();
assert.deepEqual(clientKeys, serverKeys, 'chaves do cliente e do servidor devem ser as mesmas');
assert.equal(AV.PARQ.length, PARQ_COUNT, 'quantidade de perguntas PAR-Q');

// limites e opções
for (const q of AV.QS) {
  const r = SPEC[q.k];
  const reqClient = !!q.req, reqServer = !!r.req;
  if (q.k !== 'pregnancy') assert.equal(reqClient, reqServer, `obrigatoriedade de ${q.k}`);
  if (q.t === 'num') { assert.ok(r.t === 'num' || r.t === 'int', q.k); assert.equal(q.min, r.min, q.k + ' min'); assert.equal(q.max, r.max, q.k + ' max'); }
  if (q.int) { assert.equal(r.t, 'int', q.k); assert.equal(Math.min(...q.opts.map(o => +o[0])), r.min, q.k + ' min'); assert.equal(Math.max(...q.opts.map(o => +o[0])), r.max, q.k + ' max'); }
  if (['sel', 'radio', 'radio2'].includes(q.t) && !q.int) { assert.equal(r.t, 'enum', q.k); assert.deepEqual(q.opts.map(o => String(o[0])).sort(), [...r.v].sort(), q.k + ' opções'); }
  if (q.t === 'area') { assert.equal(r.t, 'str', q.k); assert.equal(q.max, r.max, q.k + ' max'); }
}

// um conjunto completo e válido gerado a partir das perguntas passa nos dois lados
const sample = {};
for (const q of AV.QS) {
  if (q.t === 'parq') sample.parq = Array(PARQ_COUNT).fill(false);
  else if (q.t === 'num') sample[q.k] = String(Math.round((q.min + q.max) / 2)).replace('.', ',');
  else if (q.t === 'date') sample[q.k] = '1990-05-20';
  else if (q.t === 'tel') sample[q.k] = '(81) 99999-0000';
  else if (q.t === 'area') sample[q.k] = 'ok';
  else sample[q.k] = String(q.opts[0][0]);
}
sample.sex = 'F';
const body = { name: 'Maria Teste', email: 'Maria@Teste.com', answers: sample, consent: { accepted: true, version: 'v1' } };
const ok = validateIntake(body);
assert.ok(ok.ok, JSON.stringify(ok.errors));
assert.equal(ok.value.email, 'maria@teste.com');
assert.equal(ok.value.answers.whatsapp, '81999990000');
assert.equal(typeof ok.value.answers.weight, 'number');

// regras de segurança do servidor
const bad = (mut) => validateIntake({ ...body, answers: { ...sample, ...mut } });
assert.equal(bad({ birth: '2015-01-01' }).ok, false, 'menor de idade deve ser recusado');
assert.equal(bad({ weight: '9999' }).ok, false);
assert.equal(bad({ goal: 'hacker' }).ok, false);
assert.equal(bad({ parq: [true, false] }).ok, false);
assert.equal(bad({ parq: ['x', 0, 0, 0, 0, 0, 0] }).ok, false);
assert.equal(bad({ pregnancy: '' }).ok, false, 'gestação obrigatória para sexo F');
assert.equal(bad({ sex: 'M', pregnancy: '' }).ok, true, 'gestação não exigida para M');
assert.equal(validateIntake({ ...body, consent: { accepted: false, version: 'v1' } }).ok, false, 'sem consentimento');
assert.equal(validateIntake({ ...body, email: 'nao-e-email' }).ok, false);
const extra = bad({ admin: true, role: 'master', __proto__x: 1 });
assert.equal(extra.ok, true); assert.ok(!('admin' in extra.value.answers) && !('role' in extra.value.answers), 'campos extras são descartados');
assert.equal(bad({ notes: 'a'.repeat(1001) }).ok, false);
assert.equal(bad({ notes: 'oi\u0000\u0007x' }).value.answers.notes, 'oix', 'caracteres de controle removidos');
console.log('spec-sync OK —', clientKeys.length, 'campos');
