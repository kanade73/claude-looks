import type { ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// ---- 色：深い海の紺に白い文字 -------------------------------------------
const { theme, problems } = makeColors({
  label: 'Ocean',
  only: 'dark',
  roles: { accent: '#1f7a9c', danger: '#c0463a', success: '#2e8a6a', warning: '#b07a1e', pro: '#5b5fa8' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0b1c26',
        'surface-1': '#10242f',
        'surface-2': '#152b37',
        'surface-3': '#1a313e',
        'text-primary': '#ffffff',
        'text-secondary': '#dcebf0',
        'text-muted': '#a9c6cf',
      },
    },
  },
})

export const OCEAN_PROBLEMS = problems

export const OCEAN_LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: 'ocean', glass: { blur: 2, tint: '#0b1c26', opacity: 0.25 } },
}

// ---- シーン：光の筋、泡、海藻、魚の群れ、フグ、クラゲ --------------------
// アプリは style 属性を取り除くので、速さとずれはすべて <style> のクラスで指定する

const W = 1600
const H = 1000

type Jelly = { x: number; scale: number; color: string }

// 文字の列を避けて、左右の端を上っていく
const JELLIES: readonly Jelly[] = [
  { x: 230, scale: 1.1, color: '#f5b8e6' },
  { x: 330, scale: 0.7, color: '#c9b8ff' },
  { x: 1300, scale: 0.9, color: '#b8e6ff' },
  { x: 1220, scale: 0.6, color: '#f5b8e6' },
]
const JELLY_TIMING = [
  { rise: 46, delay: 6 },
  { rise: 58, delay: 30 },
  { rise: 52, delay: 18 },
  { rise: 64, delay: 44 },
]

const jellyCss = JELLY_TIMING.map(
  (t, i) =>
    `.j${i}{animation-duration:${t.rise}s;animation-delay:-${t.delay}s}` +
    `.js${i}{animation-delay:-${(t.delay / 3).toFixed(1)}s}`,
).join('')

const jellyMarkup = (j: Jelly, i: number) => `
<g class="jelly-rise j${i}">
  <g transform="translate(${j.x} 1020) scale(${j.scale})">
    <g class="jelly-sway js${i}">
      <g fill="none" stroke="${j.color}" stroke-opacity="0.6" stroke-width="3" stroke-linecap="round">
        <path class="tent" d="M14 44 Q6 70 16 96 T12 150"/>
        <path class="tent d06" d="M30 46 Q38 76 28 104 T34 164"/>
        <path class="tent d12" d="M50 46 Q42 76 52 104 T46 164"/>
        <path class="tent d18" d="M66 44 Q74 70 64 96 T68 150"/>
      </g>
      <g class="bell">
        <path d="M0 44 Q0 0 40 0 Q80 0 80 44 Q70 38 60 44 Q50 38 40 44 Q30 38 20 44 Q10 38 0 44 Z" fill="${j.color}" fill-opacity="0.55"/>
        <path d="M14 30 Q18 10 40 8 Q62 10 66 30" fill="none" stroke="#ffffff" stroke-opacity="0.45" stroke-width="3"/>
        <ellipse cx="40" cy="30" rx="16" ry="8" fill="#ffffff" fill-opacity="0.25"/>
      </g>
    </g>
  </g>
</g>`

export const OCEAN_SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<defs>
  <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2f8fb0"/>
    <stop offset="0.45" stop-color="#175d78"/>
    <stop offset="1" stop-color="#0a2a3d"/>
  </linearGradient>
  <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/>
    <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="sand" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#c9b48a"/>
    <stop offset="1" stop-color="#8a7552"/>
  </linearGradient>
  <symbol id="fish" viewBox="0 0 120 60">
    <path d="M20 30 L0 10 L4 30 L0 50 Z"/>
    <ellipse cx="62" cy="30" rx="44" ry="20"/>
    <circle cx="90" cy="25" r="4" fill="#0a2a3d"/>
  </symbol>
  <symbol id="puffer" viewBox="0 0 140 110">
    <g fill="#c98a2b">
      <path d="M70 6 L76 20 L64 20 Z"/>
      <path d="M40 14 L52 24 L40 28 Z"/>
      <path d="M100 14 L100 28 L88 24 Z"/>
      <path d="M24 40 L38 42 L30 52 Z"/>
      <path d="M116 40 L110 52 L102 42 Z"/>
      <path d="M26 74 L36 66 L38 80 Z"/>
      <path d="M114 74 L102 80 L104 66 Z"/>
      <path d="M48 96 L50 84 L60 92 Z"/>
      <path d="M92 96 L80 92 L90 84 Z"/>
      <path d="M70 104 L64 92 L76 92 Z"/>
    </g>
    <path d="M18 55 L0 40 L4 55 L0 70 Z" fill="#e8b44f"/>
    <circle cx="70" cy="55" r="42" fill="#f2c45c"/>
    <ellipse cx="74" cy="72" rx="30" ry="18" fill="#fbe7b0"/>
    <g fill="#b57a22" fill-opacity="0.6">
      <circle cx="56" cy="34" r="4"/><circle cx="72" cy="28" r="3.5"/><circle cx="86" cy="38" r="4"/>
      <circle cx="48" cy="50" r="3"/><circle cx="64" cy="44" r="3"/>
    </g>
    <circle cx="94" cy="46" r="9" fill="#ffffff"/>
    <circle cx="97" cy="46" r="5" fill="#0a2a3d"/>
    <ellipse cx="111" cy="62" rx="4" ry="3" fill="#c0463a"/>
    <path d="M60 64 Q48 74 54 84 Q62 76 60 64 Z" fill="#e8b44f"/>
  </symbol>
  <symbol id="weed" viewBox="0 0 40 300">
    <path d="M20 300 C0 240 40 200 20 150 C0 100 40 60 20 0" fill="none" stroke-width="10" stroke-linecap="round"/>
  </symbol>
</defs>
<style>
  .rays polygon { animation: shimmer 7s ease-in-out infinite alternate; }
  .rays polygon:nth-child(2) { animation-delay: -2s; }
  .rays polygon:nth-child(3) { animation-delay: -4s; }
  @keyframes shimmer { from { opacity: 0.25; } to { opacity: 0.8; } }

  .surface { animation: drift 9s linear infinite; }
  @keyframes drift { from { transform: translateX(0); } to { transform: translateX(-400px); } }

  .bubble { fill: none; stroke: #e6f7ff; stroke-opacity: 0.7; stroke-width: 2; animation: rise 12s linear infinite; }
  @keyframes rise { from { transform: translateY(0); opacity: 0; } 10% { opacity: 1; } to { transform: translateY(-1000px); opacity: 0; } }

  .weed { stroke: #2e8a6a; transform-box: fill-box; transform-origin: 50% 100%; animation: sway 5s ease-in-out infinite alternate; }
  .weed.dark { stroke: #1f6650; animation-duration: 6.5s; }
  @keyframes sway { from { transform: rotate(-5deg); } to { transform: rotate(5deg); } }

  .swim-r { animation: swim-r 28s linear infinite; }
  .swim-l { animation: swim-l 36s linear infinite; }
  @keyframes swim-r { from { transform: translateX(-300px); } to { transform: translateX(1900px); } }
  @keyframes swim-l { from { transform: translateX(1900px); } to { transform: translateX(-300px); } }
  .drift-puffer { animation: swim-l 60s linear infinite; }
  .puff { transform-box: fill-box; transform-origin: 50% 50%; animation: puff 6s ease-in-out infinite; }
  @keyframes puff { 0%, 60%, 100% { transform: scale(1); } 70%, 90% { transform: scale(1.35); } }

  .jelly-rise { animation: jelly-rise 50s linear infinite; }
  @keyframes jelly-rise { from { transform: translateY(0); opacity: 0; } 8% { opacity: 1; } 92% { opacity: 1; } to { transform: translateY(-1300px); opacity: 0; } }
  .jelly-sway { animation: jelly-sway 7s ease-in-out infinite alternate; }
  @keyframes jelly-sway { from { transform: translateX(-18px); } to { transform: translateX(18px); } }
  .bell { transform-box: fill-box; transform-origin: 50% 0%; animation: pulse 1.8s ease-in-out infinite; }
  @keyframes pulse { 0%, 100% { transform: scale(1, 1); } 50% { transform: scale(1.08, 0.82); } }
  .tent { transform-box: fill-box; transform-origin: 50% 0%; animation: wiggle 2.4s ease-in-out infinite alternate; }
  @keyframes wiggle { from { transform: skewX(-8deg); } to { transform: skewX(8deg); } }

  .bob { animation: bob 3s ease-in-out infinite alternate; }
  @keyframes bob { from { transform: translateY(-6px); } to { transform: translateY(6px); } }

  /* 速さ・ずれ：一括指定より後に置く */
  .slow { animation-duration: 42s; }
  .fast { animation-duration: 24s; }
  .bob4 { animation-duration: 4s; }
  .d04 { animation-delay: -0.4s; } .d05 { animation-delay: -0.5s; } .d06 { animation-delay: -0.6s; }
  .d07 { animation-delay: -0.7s; } .d10 { animation-delay: -1s; } .d12 { animation-delay: -1.2s; }
  .d15 { animation-delay: -1.5s; } .d18 { animation-delay: -1.8s; } .d20 { animation-delay: -2s; }
  .d24 { animation-delay: -2.4s; } .d30 { animation-delay: -3s; } .d40 { animation-delay: -4s; }
  .d70 { animation-delay: -7s; } .d90 { animation-delay: -9s; } .d100 { animation-delay: -10s; }
  .d180 { animation-delay: -18s; } .d200 { animation-delay: -20s; }
  ${jellyCss}
</style>

<rect width="${W}" height="${H}" fill="url(#water)"/>

<g class="rays">
  <polygon points="250,0 380,0 620,1000 300,1000" fill="url(#ray)"/>
  <polygon points="700,0 790,0 1000,1000 760,1000" fill="url(#ray)"/>
  <polygon points="1150,0 1260,0 1500,1000 1200,1000" fill="url(#ray)"/>
</g>

<g class="surface" fill="#bfe9f5" fill-opacity="0.35">
  <path d="M0 18 Q100 0 200 18 T400 18 T600 18 T800 18 T1000 18 T1200 18 T1400 18 T1600 18 T1800 18 T2000 18 V0 H0 Z"/>
</g>

${JELLIES.map(jellyMarkup).join('')}

<g class="swim-r" fill="#f2a65a" fill-opacity="0.85">
  <g class="bob"><use href="#fish" x="0" y="110" width="110" height="55"/></g>
  <g class="bob d10"><use href="#fish" x="-140" y="160" width="70" height="35"/></g>
  <g class="bob d20"><use href="#fish" x="-90" y="70" width="60" height="30"/></g>
  <g class="bob d15"><use href="#fish" x="-200" y="120" width="55" height="28"/></g>
  <g class="bob d07"><use href="#fish" x="-60" y="185" width="50" height="25"/></g>
</g>

<g class="swim-l fast d100" fill="#7fd1e8" fill-opacity="0.75">
  <g class="bob"><use href="#fish" x="0" y="230" width="70" height="35" transform="translate(70 0) scale(-1 1)"/></g>
  <g class="bob d10"><use href="#fish" x="80" y="260" width="55" height="28" transform="translate(215 0) scale(-1 1)"/></g>
  <g class="bob d20"><use href="#fish" x="140" y="215" width="50" height="25" transform="translate(330 0) scale(-1 1)"/></g>
  <g class="bob d04"><use href="#fish" x="60" y="200" width="45" height="22" transform="translate(165 0) scale(-1 1)"/></g>
</g>

<g class="swim-l" fill="#ffd36e" fill-opacity="0.8">
  <g class="bob d05"><use href="#fish" x="0" y="790" width="90" height="45" transform="translate(90 0) scale(-1 1)"/></g>
</g>

<g class="swim-r slow d180" fill="#f07f8a" fill-opacity="0.8">
  <g class="bob"><use href="#fish" x="0" y="845" width="65" height="32"/></g>
  <g class="bob d12"><use href="#fish" x="-90" y="870" width="50" height="25"/></g>
  <g class="bob d24"><use href="#fish" x="-170" y="830" width="45" height="22"/></g>
</g>

<g class="drift-puffer d200">
  <g class="bob bob4">
    <g transform="translate(0 680) translate(130 0) scale(-1 1)">
      <use class="puff" href="#puffer" x="0" y="0" width="130" height="102"/>
    </g>
  </g>
</g>

<g>
  <circle class="bubble" cx="140" cy="1000" r="8"/>
  <circle class="bubble d40" cx="170" cy="1000" r="5"/>
  <circle class="bubble d20" cx="1450" cy="1000" r="10"/>
  <circle class="bubble d70" cx="1480" cy="1000" r="6"/>
  <circle class="bubble d90" cx="1420" cy="1000" r="4"/>
  <circle class="bubble d100" cx="90" cy="1000" r="6"/>
</g>

<path d="M0 930 Q200 900 400 925 T800 920 T1200 930 T1600 915 V1000 H0 Z" fill="url(#sand)"/>

<g>
  <use class="weed" href="#weed" x="40" y="640" width="40" height="300"/>
  <use class="weed dark d20" href="#weed" x="85" y="700" width="34" height="240"/>
  <use class="weed d10" href="#weed" x="125" y="760" width="30" height="180"/>
  <use class="weed dark d30" href="#weed" x="1440" y="680" width="38" height="260"/>
  <use class="weed" href="#weed" x="1490" y="620" width="42" height="320"/>
  <use class="weed dark d15" href="#weed" x="1540" y="740" width="30" height="200"/>
</g>
</svg>`
