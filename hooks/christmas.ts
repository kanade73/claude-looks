import type { ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { delayCss, pick, rng, timingCss } from './timing'

// ---- 色：雪の夜のもみの木色に、金・赤・緑の差し色 --------------------------
const { theme, problems } = makeColors({
  label: 'Christmas',
  only: 'dark',
  roles: { accent: '#f2c14e', danger: '#ff5d6c', success: '#5fd38d', warning: '#ff9f43', pro: '#c79bff' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#08120f',
        'surface-1': '#0e1c17',
        'surface-2': '#13241e',
        'surface-3': '#152620',
        'text-primary': '#f6f2ea',
        'text-secondary': '#d3d0c4',
        'text-muted': '#a6ab9e',
      },
    },
  },
})

export const CHRISTMAS_PROBLEMS = problems

export const CHRISTMAS_LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: 'christmas', glass: { blur: 2, tint: '#08120f', opacity: 0.28 } },
}

// ---- シーン ----------------------------------------------------------------

const W = 1600
const H = 1000

function stars(seed: number, count: number) {
  const r = rng(seed)
  let out = ''
  for (let i = 0; i < count; i++) {
    const x = (r() * W).toFixed(0)
    const y = (r() * H * 0.55).toFixed(0)
    const rad = (0.4 + r() * 1.1).toFixed(2)
    out += `<circle class="tw ${pick('t', 12, r)}" cx="${x}" cy="${y}" r="${rad}" fill="#fff8e6"/>`
  }
  return out
}

// 雪：外側の g が左右に揺れ、内側が落ちる。遠い雪ほど小さく遅い
// 雪：CSS ではなく SVG 自体のアニメーション（SMIL）で動かす。
// 縦は cy を上から下へ、横は cx を左右に揺らす。遠い雪ほど小さく遅い
function snow(seed: number, count: number, rMin: number, rMax: number, fallMin: number, fallMax: number, opacity: number) {
  const r = rng(seed)
  let out = ''
  for (let i = 0; i < count; i++) {
    const x = r() * W
    const rad = (rMin + r() * (rMax - rMin)).toFixed(1)
    const fall = fallMin + r() * (fallMax - fallMin)
    const sway = 3 + r() * 4
    const amp = 8 + r() * 10
    out += `<circle cx="${x.toFixed(0)}" cy="-12" r="${rad}"><animate attributeName="cy" values="-12;${H + 12}" dur="${fall.toFixed(1)}s" begin="-${(r() * fall).toFixed(1)}s" repeatCount="indefinite"/><animate attributeName="cx" values="${(x - amp).toFixed(0)};${(x + amp).toFixed(0)};${(x - amp).toFixed(0)}" dur="${sway.toFixed(1)}s" begin="-${(r() * sway).toFixed(1)}s" repeatCount="indefinite"/></circle>`
  }
  return `<g fill="#fff" opacity="${opacity}">${out}</g>`
}

const BULB_COLORS = ['#ff5d6c', '#f2c14e', '#5fd38d', '#6ec8ff', '#ff9f43', '#c79bff']

// もみの木（原点が幹の根元）。電飾の玉は段ごとに弧を描いて並べる
function tree() {
  const r = rng(12)
  let bulbs = ''
  const tiers = [
    { y: -70, w: 110 },
    { y: -140, w: 88 },
    { y: -205, w: 64 },
    { y: -262, w: 40 },
  ]
  tiers.forEach((t, ti) => {
    const n = 7 - ti
    for (let i = 0; i < n; i++) {
      const f = (i + 0.5) / n
      const x = (-t.w + 2 * t.w * f) * 0.86
      const y = t.y + 6 - Math.sin(f * Math.PI) * -10
      const c = BULB_COLORS[Math.floor(r() * BULB_COLORS.length)]
      bulbs += `<circle class="bulb ${pick('b', 12, r)}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.2" fill="${c}"/>`
    }
  })
  return `
  <rect x="-14" y="-24" width="28" height="30" fill="#5a3a24"/>
  <path d="M-125 -18 L0 -112 L125 -18Z" fill="#14553a"/>
  <path d="M-102 -86 L0 -176 L102 -86Z" fill="#186544"/>
  <path d="M-78 -152 L0 -236 L78 -152Z" fill="#1c744e"/>
  <path d="M-52 -212 L0 -290 L52 -212Z" fill="#208259"/>
  <path d="M-125 -18 Q-60 -8 0 -22 Q60 -8 125 -18" fill="none" stroke="#e9f4ff" stroke-width="5" stroke-linecap="round" opacity=".9"/>
  <path d="M-102 -86 Q-50 -76 0 -90 Q50 -76 102 -86" fill="none" stroke="#e9f4ff" stroke-width="4" stroke-linecap="round" opacity=".85"/>
  <path d="M-78 -152 Q-40 -143 0 -156 Q40 -143 78 -152" fill="none" stroke="#e9f4ff" stroke-width="3.5" stroke-linecap="round" opacity=".8"/>
  <path d="M-90 -40 Q0 -10 80 -64" fill="none" stroke="#f2c14e" stroke-width="2" opacity=".7"/>
  <path d="M-70 -110 Q0 -84 64 -130" fill="none" stroke="#f2c14e" stroke-width="2" opacity=".7"/>
  <path d="M-50 -176 Q0 -156 44 -196" fill="none" stroke="#f2c14e" stroke-width="2" opacity=".7"/>
  ${bulbs}
  <g transform="translate(0 -296)">
    <circle class="star-glow" r="26" fill="url(#starglow)"/>
    <path class="topstar" d="M0 -18 L5 -6 L18 -6 L8 2 L12 15 L0 7 L-12 15 L-8 2 L-18 -6 L-5 -6Z" fill="#ffd76b" stroke="#fff3c4" stroke-width="1.2"/>
  </g>`
}

function gifts() {
  const g = (x: number, w: number, h: number, box: string, rib: string) =>
    `<g transform="translate(${x} 0)"><rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="2" fill="${box}"/><rect x="-3" y="${-h}" width="6" height="${h}" fill="${rib}"/><rect x="${-w / 2}" y="${-h * 0.6}" width="${w}" height="5" fill="${rib}"/><path d="M0 ${-h} q-12 -12 -14 -2 q2 6 14 2 q12 -12 14 -2 q-2 6 -14 2" fill="${rib}"/></g>`
  return g(-92, 40, 32, '#c8323f', '#f2c14e') + g(-50, 30, 24, '#2f6fd1', '#f6f2ea') + g(84, 44, 36, '#f2c14e', '#c8323f') + g(126, 28, 22, '#5fd38d', '#c8323f')
}

function snowman() {
  return `
  <ellipse cx="0" cy="0" rx="40" ry="8" fill="#000" opacity=".18"/>
  <circle cx="0" cy="-34" r="36" fill="#f4f8ff"/>
  <circle cx="0" cy="-90" r="26" fill="#f8fbff"/>
  <circle cx="0" cy="-132" r="20" fill="#ffffff"/>
  <path d="M-22 -114 Q0 -104 22 -114 L24 -106 Q0 -96 -24 -106Z" fill="#c8323f"/>
  <rect x="10" y="-112" width="9" height="26" rx="3" fill="#c8323f" transform="rotate(12 14 -110)"/>
  <rect x="-18" y="-160" width="36" height="6" rx="2" fill="#1b1b22"/>
  <rect x="-12" y="-182" width="24" height="24" rx="2" fill="#1b1b22"/>
  <rect x="-12" y="-164" width="24" height="5" fill="#c8323f"/>
  <circle class="blinkeye" cx="-7" cy="-136" r="2.6" fill="#1b1b22"/>
  <circle class="blinkeye" cx="7" cy="-136" r="2.6" fill="#1b1b22"/>
  <path d="M0 -130 L16 -126 L0 -124Z" fill="#ff9f43"/>
  <path d="M-8 -122 Q0 -117 8 -122" stroke="#1b1b22" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="0" cy="-96" r="2.6" fill="#1b1b22"/><circle cx="0" cy="-84" r="2.6" fill="#1b1b22"/><circle cx="0" cy="-48" r="3" fill="#1b1b22"/>
  <path d="M-24 -94 L-60 -116 M-48 -109 L-56 -124" stroke="#5a3a24" stroke-width="3.5" stroke-linecap="round"/>
  <g class="wave"><path d="M24 -94 L58 -118 M48 -111 L60 -122" stroke="#5a3a24" stroke-width="3.5" stroke-linecap="round"/></g>`
}

// 屋根のふちに沿って並ぶ電飾。x0..x1 を y で、少したわませて並べる
function eaveLights(seed: number, x0: number, x1: number, y: number, n: number) {
  const r = rng(seed)
  let out = `<path d="M${x0} ${y} Q${(x0 + x1) / 2} ${y + 14} ${x1} ${y}" stroke="#2a2a2a" stroke-width="1.2" fill="none"/>`
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const x = x0 + (x1 - x0) * t
    const yy = y + 14 * 2 * t * (1 - t) + 4
    const c = BULB_COLORS[i % BULB_COLORS.length]
    out += `<ellipse class="bulb ${pick('b', 12, r)}" cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" rx="2.6" ry="3.4" fill="${c}"/>`
  }
  return out
}

function icicles(seed: number, x0: number, x1: number, y: number) {
  const r = rng(seed)
  let out = ''
  for (let x = x0 + 6; x < x1 - 4; x += 9 + r() * 8) {
    const len = 6 + r() * 14
    out += `<path d="M${x.toFixed(1)} ${y} l3 0 l-1.5 ${len.toFixed(1)}Z" fill="#dff1ff" opacity=".85"/>`
  }
  return out
}

function logLines(x0: number, x1: number, y0: number, y1: number, color: string) {
  let out = ''
  for (let y = y0 + 10; y < y1; y += 10) {
    out += `<path d="M${x0} ${y} H${x1}" stroke="${color}" stroke-width="1.4" opacity=".55"/>`
  }
  return out
}

function windowBox(x: number, y: number, w: number, h: number, frame: string, cls: string, extra = '') {
  return `<g>
    <rect x="${x - 10}" y="${y - 10}" width="${w + 20}" height="${h + 20}" rx="10" fill="url(#winglow)" class="${cls}"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffcf6e" class="${cls}"/>
    <rect x="${x}" y="${y + h * 0.55}" width="${w}" height="${h * 0.45}" fill="#ffb347" opacity=".45"/>
    ${extra}
    <path d="M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}" stroke="${frame}" stroke-width="2.6"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${frame}" stroke-width="3"/>
    <path d="M${x - 4} ${y + h + 2} H${x + w + 4} Q${x + w + 4} ${y + h + 7} ${x + w / 2} ${y + h + 6} Q${x - 4} ${y + h + 7} ${x - 4} ${y + h + 2}Z" fill="#f4f8ff"/>
  </g>`
}

const CANDLE = (x: number, y: number) =>
  `<rect x="${x - 2}" y="${y}" width="4" height="9" fill="#fff6e0"/><path class="flicker" d="M${x} ${y - 7} q3 4 0 6 q-3 -2 0 -6Z" fill="#ff9f43"/>`

function chimney(x: number, y: number, h: number) {
  return `<rect x="${x}" y="${y - h}" width="18" height="${h}" fill="#6b4a45"/>
    <path d="M${x} ${y - h + 8} H${x + 18} M${x} ${y - h + 18} H${x + 18} M${x + 9} ${y - h + 8} V${y - h + 18}" stroke="#4b3330" stroke-width="1.2"/>
    <rect x="${x - 3}" y="${y - h - 6}" width="24" height="7" rx="3" fill="#f4f8ff"/>
    <g class="smoke"><circle cx="${x + 9}" cy="${y - h - 12}" r="7" fill="#dfe6f0" opacity=".55"/></g>
    <g class="smoke s2"><circle cx="${x + 9}" cy="${y - h - 12}" r="9" fill="#dfe6f0" opacity=".45"/></g>
    <g class="smoke s3"><circle cx="${x + 9}" cy="${y - h - 12}" r="6" fill="#dfe6f0" opacity=".5"/></g>`
}

// 丸太小屋：横板の壁、雪の積もった屋根、つらら、電飾、窓のロウソク、ドアのリースとランタン
function cabin(seed: number, wall: string, line: string, roof: string) {
  return `
    ${chimney(34, -150, 44)}
    <rect x="-76" y="-96" width="152" height="96" fill="${wall}"/>
    ${logLines(-76, 76, -96, 0, line)}
    <path d="M-92 -92 L0 -160 L92 -92Z" fill="${roof}"/>
    <path d="M-96 -90 Q-60 -104 -40 -122 Q-20 -150 0 -164 Q20 -150 40 -122 Q60 -104 96 -90 Q92 -82 84 -86 Q78 -80 70 -86 Q50 -98 0 -150 Q-50 -98 -70 -86 Q-78 -80 -84 -86 Q-92 -82 -96 -90Z" fill="#f4f8ff"/>
    ${icicles(seed, -92, 92, -88)}
    ${eaveLights(seed + 1, -88, 88, -94, 16)}
    <circle cx="0" cy="-118" r="11" fill="#ffcf6e" class="win"/><path d="M0 -129 V-107 M-11 -118 H11" stroke="${roof}" stroke-width="2.4"/><circle cx="0" cy="-118" r="11" fill="none" stroke="${roof}" stroke-width="2.6"/>
    ${windowBox(-62, -72, 32, 30, '#4a2e22', 'win', CANDLE(-46, -56))}
    ${windowBox(30, -72, 32, 30, '#4a2e22', 'win w2', CANDLE(46, -56))}
    <rect x="-15" y="-52" width="30" height="52" rx="3" fill="#7a2a2a"/>
    <path d="M-15 -36 H15 M-15 -20 H15" stroke="#5a1e1e" stroke-width="1.4"/>
    <circle cx="9" cy="-26" r="2" fill="#f2c14e"/>
    <circle cx="0" cy="-42" r="8" fill="none" stroke="#1c744e" stroke-width="5"/><path d="M-3 -34 l3 -3 l3 3" fill="#ff5d6c"/>
    <g transform="translate(-22 -44)"><circle class="lamp" r="12" fill="url(#winglow)"/><rect x="-3.5" y="-5" width="7" height="10" rx="1.5" fill="#ffd27a" stroke="#2a2a2a" stroke-width="1.2"/></g>
    <path d="M-86 0 Q-70 -10 -50 -2 Q-30 -8 -18 0 Z M18 0 Q34 -9 54 -2 Q72 -10 88 0Z" fill="#f4f8ff"/>`
}

// 2階建ての家：縦長、上下に窓、屋根の雪とつらら、電飾
function townhouse(seed: number, wall: string, trim: string, roof: string) {
  return `
    ${chimney(-40, -170, 34)}
    <rect x="-52" y="-150" width="104" height="150" fill="${wall}"/>
    <path d="M-62 -146 L0 -206 L62 -146Z" fill="${roof}"/>
    <path d="M-66 -144 Q-30 -170 0 -210 Q30 -170 66 -144 Q62 -137 54 -141 Q30 -160 0 -196 Q-30 -160 -54 -141 Q-62 -137 -66 -144Z" fill="#f4f8ff"/>
    ${icicles(seed, -62, 62, -143)}
    ${eaveLights(seed + 3, -58, 58, -150, 11)}
    ${windowBox(-38, -128, 24, 30, trim, 'win w2')}
    ${windowBox(14, -128, 24, 30, trim, 'win', `<circle cx="26" cy="-118" r="5" fill="#5fd38d" opacity=".9"/>`)}
    ${windowBox(-38, -74, 24, 30, trim, 'win')}
    <rect x="10" y="-50" width="28" height="50" rx="2" fill="#2f4a6e"/>
    <circle cx="16" cy="-24" r="2" fill="#f2c14e"/>
    <circle cx="24" cy="-40" r="7" fill="none" stroke="#1c744e" stroke-width="4"/>
    <path d="M-52 -6 Q-30 -14 -10 -4 L-10 0 L-52 0Z M2 0 Q24 -8 52 -4 L52 0Z" fill="#f4f8ff"/>`
}

function pine(x: number, y: number, s: number, dark: string) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-4" y="-10" width="8" height="12" fill="#3a2a20"/>
    <path d="M-30 -8 L0 -50 L30 -8Z M-24 -36 L0 -76 L24 -36Z M-17 -62 L0 -98 L17 -62Z" fill="${dark}"/>
    <path d="M-30 -8 Q-15 -14 0 -9 Q15 -14 30 -8 L24 -12 Q0 -20 -24 -12Z M-24 -36 Q0 -46 24 -36 L18 -40 Q0 -48 -18 -40Z M-17 -62 Q0 -70 17 -62 L12 -66 Q0 -72 -12 -66Z M-5 -90 L0 -98 L5 -90Z" fill="#f4f8ff"/>
  </g>`
}

function lampPost(x: number, y: number) {
  return `<g transform="translate(${x} ${y})">
    <circle class="lamp" cx="0" cy="-118" r="34" fill="url(#winglow)"/>
    <rect x="-3" y="-104" width="6" height="104" fill="#22262e"/>
    <rect x="-8" y="-8" width="16" height="8" fill="#22262e"/>
    <path d="M-10 -104 H10 L7 -128 H-7Z" fill="#ffe2a0" stroke="#22262e" stroke-width="2.4"/>
    <path d="M-12 -128 H12 L0 -138Z" fill="#22262e"/>
    <path d="M-13 -130 Q0 -144 13 -130 Q0 -134 -13 -130Z" fill="#f4f8ff"/>
    <path d="M3 -84 q14 -4 18 8 q-8 6 -18 2Z" fill="#c8323f"/><path d="M3 -84 q-4 12 -12 16" stroke="#c8323f" stroke-width="3" fill="none"/>
  </g>`
}

function fence(x0: number, x1: number, y: number) {
  let out = `<path d="M${x0} ${y - 22} H${x1} M${x0} ${y - 10} H${x1}" stroke="#6b4a3a" stroke-width="3.5"/>`
  for (let x = x0; x <= x1; x += 16) {
    out += `<rect x="${x - 3}" y="${y - 30}" width="6" height="30" fill="#7a5644"/><rect x="${x - 4}" y="${y - 33}" width="8" height="4" rx="2" fill="#f4f8ff"/>`
  }
  return out
}

function sled(x: number, y: number) {
  return `<g transform="translate(${x} ${y}) rotate(-8)">
    <rect x="-26" y="-14" width="52" height="7" rx="2" fill="#c8323f"/>
    <path d="M-24 -7 V0 M0 -7 V0 M22 -7 V0" stroke="#5a3a24" stroke-width="2.4"/>
    <path d="M-30 1 H26 Q36 1 34 -10" stroke="#9aa2b8" stroke-width="2.4" fill="none"/>
  </g>`
}

// 丘の上の遠い森と、ぽつぽつ灯る遠くの家の窓
function forest(seed: number) {
  const r = rng(seed)
  let out = ''
  for (let x = -20; x < W + 20; x += 14 + r() * 22) {
    const base = H - 160 - Math.sin((x / W) * Math.PI * 1.6 + 0.4) * 22 - 8
    const s = 0.35 + r() * 0.35
    out += `<g transform="translate(${x.toFixed(0)} ${base.toFixed(0)}) scale(${s.toFixed(2)})"><path d="M-30 -8 L0 -50 L30 -8Z M-24 -36 L0 -76 L24 -36Z M-17 -62 L0 -98 L17 -62Z" fill="#163a35"/><path d="M-17 -62 Q0 -70 17 -62 L12 -66 Q0 -72 -12 -66Z M-24 -36 Q0 -46 24 -36 L18 -40 Q0 -48 -18 -40Z" fill="#c9d6e6" opacity=".8"/></g>`
    if (r() < 0.12) {
      out += `<rect x="${(x + 10).toFixed(0)}" y="${(base - 12).toFixed(0)}" width="5" height="5" fill="#ffcf6e" class="win ${pick('wd', 6, r)}"/>`
    }
  }
  return out
}

// 画面の上端にたわんで下がる電飾のガーランド
function garland(seed: number) {
  const r = rng(seed)
  const spans = 6
  const sw = W / spans
  let out = ''
  for (let s = 0; s < spans; s++) {
    const x0 = s * sw
    const x1 = x0 + sw
    const sag = 46 + r() * 16
    out += `<path d="M${x0} 6 Q${x0 + sw / 2} ${6 + sag * 2} ${x1} 6" stroke="#1d3a2c" stroke-width="5" fill="none"/>`
    out += `<path d="M${x0} 6 Q${x0 + sw / 2} ${6 + sag * 2} ${x1} 6" stroke="#2b5a40" stroke-width="2" stroke-dasharray="3 5" fill="none"/>`
    const n = 9
    for (let i = 1; i < n; i++) {
      const t = i / n
      const x = x0 + sw * t
      const y = 6 + sag * 2 * 2 * t * (1 - t) + 6
      const c = BULB_COLORS[(i + s) % BULB_COLORS.length]
      out += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><rect x="-2" y="-6" width="4" height="4" fill="#3a3a3a"/><ellipse class="bulb ${pick('b', 12, r)}" cx="0" cy="2" rx="4" ry="6" fill="${c}"/></g>`
    }
    out += `<g transform="translate(${x1} 6)"><circle r="7" fill="#c8323f"/><path d="M-10 4 L0 0 L-8 -6Z M10 4 L0 0 L8 -6Z" fill="#c8323f"/></g>`
  }
  return out
}

// 左端：見切れても困らない、大きなもみの木・キャンディケイン・道しるべ・凍った池とトナカイ
// 注意：<text> や @media を入れるとアプリで背景のアニメーションが全部止まったので使わない
function lightedPine(x: number, y: number, sc: number, seed: number) {
  const r = rng(seed)
  let bulbs = ''
  const rows = [[-14, 26], [-42, 20], [-68, 13]] as const
  rows.forEach(([yy, w]) => {
    for (let i = 0; i < 5; i++) {
      const bx = -w + (2 * w * (i + 0.5)) / 5
      bulbs += `<circle class="bulb ${pick('b', 12, r)}" cx="${bx.toFixed(1)}" cy="${yy + 2}" r="1.8" fill="${BULB_COLORS[Math.floor(r() * 6)]}"/>`
    }
  })
  return `<g transform="translate(${x} ${y}) scale(${sc})">${pine(0, 0, 1, '#123f33').replace(/^<g transform="translate\(0 0\) scale\(1\)">/, '<g>')}${bulbs}</g>`
}

function candyCane(x: number, y: number, rot: number) {
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0 V-46 Q0 -60 12 -60 Q24 -60 24 -48" stroke="#ffffff" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M0 0 V-46 Q0 -60 12 -60 Q24 -60 24 -48" stroke="#c8323f" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="5 6"/></g>`
}

function signpost(x: number, y: number) {
  return `<g transform="translate(${x} ${y})">
    <rect x="-3" y="-92" width="6" height="92" fill="#6b4a3a"/>
    <path d="M-4 -86 H52 L62 -78 L52 -70 H-4Z" fill="#8a5a3c"/><path d="M8 -78 H44 M12 -74 H40" stroke="#f6f2ea" stroke-width="2" stroke-linecap="round" opacity=".8"/><circle cx="50" cy="-78" r="2" fill="#f2c14e"/>
    <path d="M4 -62 H-50 L-60 -54 L-50 -46 H4Z" fill="#7a4e34"/><path d="M-44 -54 H-8 M-40 -50 H-12" stroke="#f6f2ea" stroke-width="2" stroke-linecap="round" opacity=".8"/><circle cx="-50" cy="-54" r="2" fill="#f2c14e"/>
    <path d="M-6 -94 Q0 -100 6 -94Z M-6 -88 H54 Q50 -92 -6 -92Z M-52 -64 H6 Q2 -67 -52 -66Z" fill="#f4f8ff"/>
    <path d="M-22 0 Q0 -10 22 0Z" fill="#f4f8ff"/>
  </g>`
}

function pond(x: number, y: number) {
  return `<g transform="translate(${x} ${y})">
    <ellipse rx="110" ry="20" fill="#9fc3e0"/>
    <ellipse rx="100" ry="16" fill="#bcd8ef"/>
    <path class="glint" d="M-60 -4 L-20 -8 M10 4 L56 0" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
    <path d="M-30 6 q20 -10 40 0 q20 10 40 -2" stroke="#ffffff" stroke-width="1.4" fill="none" opacity=".7"/>
  </g>`
}

function reindeer(x: number, y: number, sc: number) {
  return `<g transform="translate(${x} ${y}) scale(${sc})">
    <path d="M-26 -30 Q-24 -42 -4 -42 L14 -42 Q20 -52 24 -62 L32 -60 L30 -46 Q28 -32 16 -30 Z" fill="#7a5236"/>
    <path d="M22 -60 Q16 -72 20 -80 M20 -72 L12 -76 M28 -62 Q34 -74 30 -82 M31 -72 L38 -76" stroke="#d8c2a0" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <circle cx="33" cy="-51" r="2.6" fill="#2a1c14"/><circle cx="26" cy="-56" r="1.4" fill="#111"/>
    <path d="M-20 -32 V0 M-10 -32 V0 M6 -32 V0 M14 -32 V0" stroke="#6a4630" stroke-width="4" stroke-linecap="round"/>
    <path d="M-28 -36 q-6 -4 -4 -10" stroke="#f4f8ff" stroke-width="3" fill="none"/>
    <path d="M12 -42 Q18 -36 24 -42" stroke="#c8323f" stroke-width="3" fill="none"/><circle cx="18" cy="-37" r="2.6" fill="#f2c14e"/>
    <g class="headbob"><path d="M28 -62 L34 -66" stroke="#7a5236" stroke-width="3"/></g>
  </g>`
}

// ソリとトナカイ（右向きに描き、左右反転して右から左へ飛ばす）
function sleigh() {
  const deer = (x: number, lead: boolean) => `<g transform="translate(${x} 0)">
      <g class="gallop">
        <path d="M-16 0 Q-10 -10 8 -8 L14 -14 L22 -16 L24 -10 L16 -6 Q12 4 -2 4 L-16 4Z" fill="#2a1c14"/>
        <path d="M18 -16 L14 -26 L10 -22 M20 -16 L22 -27 L26 -24" stroke="#2a1c14" stroke-width="2" fill="none"/>
        <path d="M-12 4 L-16 14 M-6 4 L-4 14 M4 4 L2 14 M10 2 L14 12" stroke="#2a1c14" stroke-width="2.2"/>
      </g>
      ${lead ? '<circle class="nose" cx="25" cy="-12" r="2.8" fill="#ff3b4e"/>' : ''}
    </g>`
  return `<g class="sleigh-path"><g transform="scale(-1 1)"><g class="sleigh-bob">
    <path d="M-150 -2 L-40 -6" stroke="#f2c14e" stroke-width="1" opacity=".7"/>
    <path d="M-70 -6 Q-90 -8 -110 4 L-150 4 Q-170 4 -170 -14 L-166 -26 L-110 -24 Q-100 -12 -70 -10Z" fill="#c8323f"/>
    <path d="M-176 10 L-100 10 Q-88 10 -84 2" stroke="#f2c14e" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <circle cx="-140" cy="-36" r="9" fill="#f1c7a8"/>
    <path d="M-150 -38 L-140 -60 L-128 -40Z" fill="#c8323f"/><circle cx="-140" cy="-60" r="3" fill="#fff"/>
    <path d="M-148 -32 Q-140 -18 -132 -32" fill="#ffffff"/>
    <rect x="-152" y="-30" width="22" height="16" rx="4" fill="#c8323f"/>
    <path d="M-166 -26 L-156 -44 L-148 -26Z" fill="#7a4a24"/>
    ${deer(-40, false)}${deer(0, false)}${deer(40, true)}
  </g></g></g>`
}

export const CHRISTMAS_SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<style>
.tw{animation:tw ease-in-out infinite alternate}
@keyframes tw{from{opacity:.15}to{opacity:1}}
.moon-glow{transform-box:fill-box;transform-origin:center;animation:glow 7s ease-in-out infinite alternate}
@keyframes glow{from{opacity:.55;transform:scale(.96)}to{opacity:.9;transform:scale(1.06)}}
.aurora{animation:aur 18s ease-in-out infinite alternate}
.aurora.a2{animation-duration:24s;animation-direction:alternate-reverse}
@keyframes aur{from{opacity:.25;transform:translateX(-40px)}to{opacity:.55;transform:translateX(40px)}}
.bulb{animation:bulb ease-in-out infinite alternate}
@keyframes bulb{from{opacity:.35}to{opacity:1}}
.topstar{transform-box:fill-box;transform-origin:center;animation:topstar 4s ease-in-out infinite alternate}
@keyframes topstar{from{transform:scale(.92) rotate(-6deg)}to{transform:scale(1.08) rotate(6deg)}}
.star-glow{transform-box:fill-box;transform-origin:center;animation:glow 2.4s ease-in-out infinite alternate}
.win{animation:win 3.2s ease-in-out infinite alternate}
.w2{animation-duration:4.1s;animation-delay:-1s}
@keyframes win{0%{opacity:.85}40%{opacity:1}55%{opacity:.78}100%{opacity:.95}}
.smoke{transform-box:fill-box;transform-origin:center;animation:smoke 6s ease-out infinite}
.smoke.s2{animation-delay:-2s}.smoke.s3{animation-delay:-4s}
.flicker{transform-box:fill-box;transform-origin:bottom center;animation:flicker .35s ease-in-out infinite alternate}
@keyframes flicker{from{transform:scaleY(.8) rotate(-4deg)}to{transform:scaleY(1.15) rotate(4deg)}}
.glint{animation:win 2.2s ease-in-out infinite alternate}
.lamp{animation:win 2.6s ease-in-out infinite alternate}
@keyframes smoke{0%{opacity:0;transform:translate(0,0) scale(.6)}20%{opacity:.6}100%{opacity:0;transform:translate(-30px,-90px) scale(1.8)}}
.wave{transform-box:fill-box;transform-origin:left bottom;animation:wave 1.6s ease-in-out infinite alternate}
@keyframes wave{from{transform:rotate(-10deg)}to{transform:rotate(14deg)}}
.blinkeye{transform-box:fill-box;transform-origin:center;animation:blinkeye 5s infinite}
@keyframes blinkeye{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.15)}}
.sleigh-path{animation:sleigh 46s linear infinite}
@keyframes sleigh{0%{transform:translate(0,0)}50%,100%{transform:translate(-2300px,140px)}}
.sleigh-bob{animation:bob 1.6s ease-in-out infinite alternate}
@keyframes bob{from{transform:translateY(-6px)}to{transform:translateY(6px)}}
.gallop{transform-box:fill-box;transform-origin:center;animation:gallop .5s ease-in-out infinite alternate}
@keyframes gallop{from{transform:rotate(-6deg)}to{transform:rotate(6deg)}}
.nose{animation:nose .8s ease-in-out infinite alternate}
@keyframes nose{from{opacity:.5}to{opacity:1}}
.shoot{opacity:0;animation:shoot 14s linear infinite}
@keyframes shoot{0%{opacity:0;transform:translateX(0)}2%{opacity:1}8%{opacity:0;transform:translateX(600px)}100%{opacity:0;transform:translateX(600px)}}
${timingCss('t', 12, 2, 6, 6, 105)}${timingCss('b', 12, 0.7, 2.4, 2, 106)}${delayCss('wd', 6, 3, 107)}
</style>
<defs>
<linearGradient id="xsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050b1c"/><stop offset=".55" stop-color="#0b1a2c"/><stop offset="1" stop-color="#123028"/></linearGradient>
<radialGradient id="xmoon" cx="40%" cy="38%"><stop offset="0" stop-color="#fffdf2"/><stop offset=".7" stop-color="#f4ead0"/><stop offset="1" stop-color="#d9cfb2"/></radialGradient>
<radialGradient id="xmoonglow"><stop offset=".35" stop-color="#fff6d8" stop-opacity=".5"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>
<radialGradient id="winglow"><stop offset=".2" stop-color="#ffd27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
<radialGradient id="starglow"><stop offset="0" stop-color="#fff3c4" stop-opacity=".9"/><stop offset="1" stop-color="#ffd76b" stop-opacity="0"/></radialGradient>
<linearGradient id="aur1" x1="0" x2="1"><stop offset="0" stop-color="#5fd38d" stop-opacity="0"/><stop offset=".5" stop-color="#5fd38d" stop-opacity=".55"/><stop offset="1" stop-color="#6ec8ff" stop-opacity="0"/></linearGradient>
<linearGradient id="aur2" x1="0" x2="1"><stop offset="0" stop-color="#c79bff" stop-opacity="0"/><stop offset=".5" stop-color="#c79bff" stop-opacity=".4"/><stop offset="1" stop-color="#5fd38d" stop-opacity="0"/></linearGradient>
<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9f1fb"/><stop offset="1" stop-color="#b9c8dc"/></linearGradient>
<linearGradient id="ground2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfdcec"/><stop offset="1" stop-color="#9fb2c9"/></linearGradient>
<linearGradient id="shtail" x1="1" x2="0"><stop offset="0" stop-color="#fff8e6" stop-opacity=".9"/><stop offset="1" stop-color="#fff8e6" stop-opacity="0"/></linearGradient>
<filter id="soft" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="28"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="url(#xsky)"/>
<g filter="url(#soft)"><path class="aurora" d="M-100 260 Q300 140 700 240 T1700 200 L1700 300 Q1200 330 700 320 T-100 340Z" fill="url(#aur1)"/>
<path class="aurora a2" d="M-100 200 Q400 90 900 180 T1700 120 L1700 190 Q1200 240 800 230 T-100 260Z" fill="url(#aur2)"/></g>
${stars(3, 160)}
<g transform="translate(1100 80) rotate(160)"><g class="shoot"><path d="M0 -1.6 L-140 0 L0 1.6Z" fill="url(#shtail)"/><circle r="2.2" fill="#fff"/></g></g>
${snow(8, 85, 0.8, 1.6, 22, 34, 0.55)}
<svg x="0" y="0" width="${W}" height="${H}" viewBox="0 0 600 600" preserveAspectRatio="xMaxYMin meet">
  <g transform="translate(470 150)">
    <circle class="moon-glow" r="95" fill="url(#xmoonglow)"/>
    <circle r="46" fill="url(#xmoon)"/>
    <circle cx="-14" cy="-8" r="7" fill="#e6dcc0" opacity=".7"/><circle cx="12" cy="14" r="9" fill="#e6dcc0" opacity=".6"/><circle cx="16" cy="-16" r="4" fill="#e6dcc0" opacity=".6"/>
  </g>
</svg>
<g transform="translate(1800 240)">${sleigh()}</g>
<path d="M0 ${H - 150} Q260 ${H - 215} 560 ${H - 160} T1100 ${H - 170} T1600 ${H - 190} L1600 ${H} L0 ${H}Z" fill="url(#ground2)"/>
${forest(77)}
<path d="M0 ${H - 90} Q320 ${H - 150} 700 ${H - 95} T1600 ${H - 110} L1600 ${H} L0 ${H}Z" fill="url(#ground)"/>
<svg x="0" y="0" width="${W}" height="${H - 70}" viewBox="0 0 700 700" preserveAspectRatio="xMinYMax meet"><g transform="translate(0 -200)">
  ${lightedPine(-10, 880, 2.4, 61)}
  ${pine(40, 900, 1.9, '#14423a')}
  ${pine(100, 870, 1.4, '#17463a')}
  ${pond(330, 880)}
  ${reindeer(300, 872, 1.1)}
  ${signpost(190, 892)}
  ${candyCane(120, 896, -8)}${candyCane(140, 898, 6)}
  ${pine(470, 878, 0.9, '#1a5040')}
  <path d="M-20 900 Q120 860 260 892 Q360 870 520 900Z" fill="#eef4fb"/>
</g></svg>
<svg x="0" y="0" width="${W}" height="${H - 70}" viewBox="0 0 900 900" preserveAspectRatio="xMaxYMax meet">
  <g transform="translate(200 872) scale(.8)">${snowman()}</g>
  <g transform="translate(380 860)">${tree()}${gifts()}</g>
  <g transform="translate(270 260)">
  ${pine(590, 590, 1.1, '#17463a')}
  ${pine(250, 600, 0.8, '#1a5040')}
  <g transform="translate(520 596) scale(.78)">${townhouse(31, '#4f5d8a', '#e9e4d8', '#2e3555')}</g>
  ${fence(276, 340, 616)}
  <g transform="translate(400 612)">${cabin(17, '#8a5a3c', '#5e3a26', '#5b2b2b')}</g>
  ${lampPost(300, 618)}
  ${sled(474, 622)}
  ${pine(610, 630, 0.7, '#1c5a46')}
</g></svg>
${snow(21, 80, 1.6, 2.6, 14, 22, 0.8)}
${snow(55, 38, 2.8, 4.2, 9, 14, 0.95)}
<g transform="translate(0 45)">${garland(9)}</g>
</svg>`
