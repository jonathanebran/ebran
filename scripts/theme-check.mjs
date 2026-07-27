// Confere se a troca de tema realmente repinta o app inteiro.
// Para cada tema, coleta as cores usadas em várias telas e verifica que
// nenhuma delas ficou presa no laranja original.
//
//   npm run dev            (em outro terminal)
//   node scripts/theme-check.mjs

import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:5173';
const ROUTES = ['/', '/foco', '/metas', '/saude', '/financas', '/trabalho', '/perfil', '/configuracoes'];

// Cores do tema Fogo — não podem sobreviver a um tema frio.
const FOGO = ['200, 45, 0', '226, 88, 0', '241, 161, 0'];

const THEMES = [
  { id: 'fogo',     accent: '241, 161, 0' },
  { id: 'oceano',   accent: '1, 144, 234' },
  { id: 'floresta', accent: '91, 209, 73' },
];

// Cores fixas de propósito: risco, sucesso e marcas do Google.
const ALLOWED_FIXED = [
  '255, 107, 95',   // --color-danger
  '34, 197, 94',    // sucesso
  '66, 133, 244', '15, 157, 88', '244, 180, 0', '234, 67, 53', '251, 188, 4', // Google
];

async function collectColors(page) {
  return page.evaluate(() => {
    const out = new Set();
    for (const el of document.querySelectorAll('*')) {
      const s = getComputedStyle(el);
      for (const prop of ['color', 'backgroundColor', 'borderTopColor', 'fill', 'stroke']) {
        const v = s[prop];
        if (v && v.startsWith('rgb') && !v.includes('rgba(0, 0, 0, 0)')) out.add(v);
      }
      const bg = s.backgroundImage;
      if (bg && bg.includes('gradient')) {
        for (const m of bg.matchAll(/rgba?\(([^)]+)\)/g)) out.add('rgb(' + m[1] + ')');
      }
    }
    return [...out];
  });
}

const norm = (c) => c.replace(/rgba?\(/, '').replace(/\).*/, '').split(',').slice(0, 3).map(x => x.trim()).join(', ');

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
let problems = 0;

for (const theme of THEMES) {
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate((id) => {
    localStorage.setItem('ebran:theme:v1', JSON.stringify({ themeId: id, glassOpacity: 0.72 }));
  }, theme.id);

  console.log(`\n=== tema: ${theme.id} ===`);
  let accentSeen = 0;
  const strays = new Set();

  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const colors = (await collectColors(page)).map(norm);

    const hasAccent = colors.some(c => c === theme.accent);
    if (hasAccent) accentSeen++;

    // Em Configurações o seletor de temas mostra a paleta de todos os temas
    // de propósito — as cores do "Fogo" aparecem ali por design.
    if (theme.id !== 'fogo' && route !== '/configuracoes') {
      for (const c of colors) {
        if (FOGO.includes(c) && !ALLOWED_FIXED.includes(c)) strays.add(`${route}: rgb(${c})`);
      }
    }
    console.log(`  ${hasAccent ? '✓' : '·'} ${route}${hasAccent ? ' — cor do tema presente' : ''}`);
  }

  console.log(`  telas com a cor do tema: ${accentSeen}/${ROUTES.length}`);
  if (strays.size) {
    problems += strays.size;
    console.log(`  ✗ cor do tema "Fogo" sobrevivendo:`);
    for (const s of strays) console.log(`      ${s}`);
  } else if (theme.id !== 'fogo') {
    console.log('  ✓ nenhuma cor laranja original sobrou');
  }
  await page.close();
}

await browser.close();
console.log('\n' + '='.repeat(56));
console.log(problems === 0 ? '✓ Tema aplicado em todo o app.' : `✗ ${problems} ponto(s) sem seguir o tema.`);
process.exit(problems === 0 ? 0 : 1);
