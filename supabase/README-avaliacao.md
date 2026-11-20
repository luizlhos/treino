# Avaliação (anamnese) — como colocar no ar

Arquivos novos (nada existente foi alterado por eles):

| Arquivo | O que é |
|---|---|
| `avaliacao.js` | Formulário público, área do cliente, painel do master, análise |
| `supabase/migrations/20261117_avaliacao.sql` | Tabelas `assessments` e `intake_attempts`, RLS e bucket privado de fotos |
| `supabase/functions/public-intake/` | Edge Function pública (cria conta, grava, dispara o e-mail com o link) |
| `tests/spec-sync.test.mjs` | Garante que formulário e servidor validam as mesmas regras |

## Ordem de publicação
1. **Migração SQL** (aditiva): aplicar `20261117_avaliacao.sql` — já feito.
2. **Secrets** (Supabase → Edge Functions → Secrets — nada disso vai para o GitHub):
   `MAIL_MODE` = `auth`, `HASH_SALT` (texto aleatório longo).
   Opcionais: `APP_URL`, `ALLOWED_ORIGINS`, `TURNSTILE_SECRET`.
3. **Deploy** da função `public-intake` com `verify_jwt = false` (é pública; a defesa está no código).
4. **Auth do Supabase** (Dashboard → Authentication):
   - tamanho mínimo da senha: 8, com letras e números (o app exige o mesmo ao criar a senha);
   - *Leaked password protection*: ligar (se o plano permitir);
   - validade do link/OTP: 1 a 2 h é suficiente (o cliente pode pedir outro na tela de login);
   - *Site URL*: `https://luizlhos.github.io/treino/`.
5. **Publicar** `index.html`, `sw.js` e `avaliacao.js` no GitHub Pages.
6. Preencher `CFG.CONTROLLER` e `CFG.CONTACT` em `avaliacao.js` (identificação de quem responde pelos dados — LGPD).
7. **E-mail (Gmail via Supabase Auth) — já configurado:** Authentication → Emails → SMTP Settings com
   `smtp.gmail.com`, porta 587, usuário = Gmail do app e **senha de app**. Modelo *Reset password* = conteúdo de
   `supabase/templates/reset-password.html` (envia um **código** `{{ .Token }}`, sem link — com link o Gmail mandava para o spam).
   Rate limit de e-mails: 20/h. Validade do código: 3600 s. `MAIL_MODE` = `auth`.
8. **Modo de diagnóstico:** `MAIL_MODE=log` não envia e-mail e grava um link de acesso nos logs da função.
   Use só para depurar e volte para `auth` — com `log`, os clientes não recebem nada.
9. (Opcional) Turnstile: criar o site no Cloudflare, colocar a *site key* em `CFG.TURNSTILE_SITEKEY` e o `TURNSTILE_SECRET` na função.

## Como funciona
- **Público (sem login):** login → "Fazer minha avaliação gratuita" → formulário → a função valida, cria a conta com senha aleatória descartada e dispara um e-mail (pelo Supabase Auth) com um **código de acesso** de uso único, válido por 1 hora.
- **Criar a senha:** no app, "Digitar o código" (ou login → "Criar ou redefinir minha senha" → "Já tenho um código"): o cliente informa e-mail + código e escolhe a senha (mín. 8 caracteres, letras e números). Só então a análise e o upload das 4 fotos ficam disponíveis.
- **Cliente:** vê **somente** as próprias avaliações (RLS); pode fazer nova avaliação, enviar fotos e excluir seus dados.
- **Master:** vê todas (Ajustes → Avaliações recebidas, ou por cliente em Gerenciar usuários) e pode criar/editar avaliações de qualquer cliente.
- **% de gordura da balança:** campo opcional; aparece na análise ao lado do cálculo por fita (se houver) e vira a base de massa gorda/magra.

## Segurança (resumo)
- Visitante anônimo **não tem acesso a nenhuma tabela**; só a função, que limita tentativas por IP e por e-mail, usa honeypot, aceita só origem permitida e só campos da lista.
- Se o e-mail já tem conta, nada é gravado nela (evita injetar dados em conta alheia) e a resposta é idêntica (sem enumeração de contas).
- Fotos: bucket privado, só JPEG, até 3 MB, cada pessoa só acessa a própria pasta; o app reduz a imagem e remove EXIF/localização antes de enviar.
- Menores de 18 anos são recusados. Consentimento (versão + data/hora) é gravado com cada avaliação.
- IP e e-mail do controle de abuso ficam só como hash SHA-256.

## Testes que foram executados
Formulário/servidor (40 campos em sincronia) · RLS e Storage (29 verificações em Postgres local) · Edge Function (31 verificações com Supabase simulado, modos `auth` e `log`) · app completo em navegador simulado (login → formulário → ativação por link).
