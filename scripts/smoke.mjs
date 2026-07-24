// Varredura automática do app: visita todas as rotas, clica em tudo e
// reporta erros de console, exceções não capturadas e telas em branco.
//
// Requer o Playwright, instalado só quando for rodar a varredura — fora do
// package.json de propósito, para não pesar o build de produção:
//
//   npm i -D playwright && npx playwright install chromium
//
//   npm run dev                (em outro terminal)
//   npm run smoke              (usa http://localhost:5173)
//   BASE=<url> npm run smoke   (aponta para outro servidor)

import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:5173';

const ROUTES = [
  '/', '/foco', '/metas', '/metas/nova', '/saude', '/financas', '/trabalho',
  '/novo-registro', '/ai-hub', '/perfil', '/contas', '/permissoes-google',
  '/modo-economia', '/meu-perfil', '/configuracoes', '/entrar', '/cadastro',
];

const findings = [];
const record = (route, kind, detail) => {
  findings.push({ route, kind, detail });
  console.log(`  ✗ [${kind}] ${detail}`);
};

// Ruído externo que não é bug do app (Google OAuth, service worker, favicon).
const IGNORE = [
  /accounts\.google\.com/i,
  /gsi\/client/i,
  /favicon/i,
  /ServiceWorker/i,
  /Download the React DevTools/i,
  // Recursos externos bloqueados pelo proxy do ambiente de teste — não é bug do app.
  /ERR_CONNECTION_RESET/i,
  /ERR_BLOCKED_BY_CLIENT/i,
  /ERR_NAME_NOT_RESOLVED/i,
  /net::ERR_/i,
];
const isNoise = (text) => IGNORE.some((re) => re.test(text));

async function attachListeners(page, ctx) {
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (isNoise(text)) return;
    record(ctx.route, 'console.error', text.slice(0, 300));
  });
  page.on('pageerror', (err) => {
    const text = String(err.message || err);
    if (isNoise(text)) return;
    record(ctx.route, 'CRASH', text.slice(0, 300));
  });
}

async function isBlank(page) {
  return page.evaluate(() => {
    const root = document.getElementById('root');
    return !root || root.innerText.trim().length === 0;
  });
}

async function run() {
  const browser = await chromium.launch({
    // Sem CHROME_PATH o Playwright usa o Chromium que ele mesmo instalou.
    executablePath: process.env.CHROME_PATH || undefined,
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  // ── Passo 1: cada rota carrega sem erro? ────────────────────────────────
  console.log('\n=== PASSO 1: carregamento das rotas ===');
  for (const route of ROUTES) {
    const ctx = { route };
    const page = await context.newPage();
    await attachListeners(page, ctx);
    try {
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(600);
      if (await isBlank(page)) record(route, 'TELA EM BRANCO', 'root vazio após carregar');
      else console.log(`  ✓ ${route}`);
    } catch (e) {
      record(route, 'falha ao carregar', String(e.message).slice(0, 200));
    }
    await page.close();
  }

  // ── Passo 2: clicar em cada elemento interativo de cada rota ──────────────
  console.log('\n=== PASSO 2: clicando em todos os elementos ===');
  for (const route of ROUTES) {
    const ctx = { route };
    const page = await context.newPage();
    await attachListeners(page, ctx);
    try {
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(400);

      const count = await page.locator('button, a[href], [role="button"]').count();
      let clicked = 0;

      for (let i = 0; i < count; i++) {
        // Volta à rota antes de cada clique para isolar o efeito.
        if (page.url() !== BASE + route) {
          await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 15000 });
          await page.waitForTimeout(250);
        }
        const el = page.locator('button, a[href], [role="button"]').nth(i);
        try {
          if (!(await el.isVisible())) continue;
          const label = ((await el.innerText().catch(() => '')) || `#${i}`)
            .replace(/\s+/g, ' ').trim().slice(0, 30);
          ctx.route = `${route} → clique "${label}"`;
          await el.click({ timeout: 3000, force: true });
          await page.waitForTimeout(350);
          clicked++;
          // Sair da origem (ex.: "voltar" sem histórico) não é crash do app.
          const left = !page.url().startsWith(BASE);
          if (!left && (await isBlank(page))) {
            record(ctx.route, 'TELA EM BRANCO', `app sumiu após o clique (url: ${page.url()})`);
            await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
          }
        } catch {
          /* elemento saiu da tela / não clicável — ignorado */
        }
        ctx.route = route;
      }
      console.log(`  ✓ ${route} — ${clicked} elementos clicados`);
    } catch (e) {
      record(route, 'falha na interação', String(e.message).slice(0, 200));
    }
    await page.close();
  }

  await browser.close();

  // ── Relatório ─────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  if (findings.length === 0) {
    console.log('✓ Nenhum problema encontrado.');
    return 0;
  }
  console.log(`✗ ${findings.length} problema(s) encontrado(s):\n`);
  const grouped = {};
  for (const f of findings) (grouped[f.kind] ||= []).push(f);
  for (const [kind, list] of Object.entries(grouped)) {
    console.log(`\n### ${kind} (${list.length})`);
    const seen = new Set();
    for (const f of list) {
      const key = f.detail.slice(0, 120);
      if (seen.has(key)) continue;
      seen.add(key);
      console.log(`  • ${f.route}\n    ${f.detail}`);
    }
  }
  return 1;
}

run().then((code) => process.exit(code)).catch((e) => {
  console.error(e);
  process.exit(1);
});
