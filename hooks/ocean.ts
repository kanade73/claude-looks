import type { ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { delayCss, pick, rng, timingCss } from './timing'

// ---- 色：深い海の紺、アクアと珊瑚色の差し色 -------------------------------
const { theme, problems } = makeColors({
  label: 'Ocean',
  only: 'dark',
  roles: { accent: '#3fd0d4', danger: '#ff6f7d', success: '#6fe0a0', warning: '#ffc56b', pro: '#a99bff' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#04121f',
        'surface-1': '#081a2b',
        'surface-2': '#0c2236',
        'surface-3': '#0e2639',
        'text-primary': '#e9f7fb',
        'text-secondary': '#bcd8e2',
        'text-muted': '#93b4c2',
      },
    },
  },
})

export const OCEAN_PROBLEMS = problems

export const OCEAN_LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: 'ocean', glass: { blur: 2, tint: '#04121f', opacity: 0.3 } },
}

// ---- シーン：決まった種の乱数で毎回同じ海を作る --------------------------

const W = 1600
const H = 1000

// 水面を下から見上げた波。200px 周期なので 400px ずらすと継ぎ目なく回る
function surface(amp: number, base: number) {
  let d = `M-400 -40 L-400 ${base}`
  for (let x = -400; x < W + 400; x += 200) {
    d += ` Q${x + 50} ${base + amp} ${x + 100} ${base} T${x + 200} ${base}`
  }
  return `${d} L${W + 400} -40Z`
}

// 水面から差し込む光の筋
function rays(seed: number, count: number) {
  const r = rng(seed)
  let out = ''
  for (let i = 0; i < count; i++) {
    const x = ((W / count) * i + r() * 120).toFixed(0)
    const w = (50 + r() * 110).toFixed(0)
    const lean = (-260 + r() * 120).toFixed(0)
    const len = (620 + r() * 330).toFixed(0)
    out += `<path class="ray ${pick('y', 6, r)}" d="M${x} -20 l${w} 0 l${lean} ${len} l-${(+w * 2.2).toFixed(0)} 0Z" fill="url(#rayg)" opacity=".4"/>`
  }
  return out
}

// ゆっくり沈むマリンスノー。縦に2枚重ねて途切れないようにする
function snow(seed: number, count: number, rMin: number, rMax: number, cls: string) {
  const r = rng(seed)
  let out = ''
  for (let i = 0; i < count; i++) {
    const x = (r() * W).toFixed(0)
    const y = (r() * H).toFixed(0)
    const rad = (rMin + r() * (rMax - rMin)).toFixed(2)
    out += `<circle class="tw ${pick('t', 10, r)}" cx="${x}" cy="${y}" r="${rad}" fill="#cfeff5"/>`
  }
  return `<g class="${cls}"><g>${out}</g><g transform="translate(0 -${H})">${out}</g></g>`
}

// 泡。置いた位置が静止時の位置で、動くときはその上下を通り抜ける
function bubbles(seed: number, count: number) {
  const r = rng(seed)
  let out = ''
  for (let i = 0; i < count; i++) {
    const x = (r() * W).toFixed(0)
    const y = (80 + r() * (H - 120)).toFixed(0)
    const rad = 2 + r() * 7
    out += `<g transform="translate(${x} ${y})"><g class="bub ${pick('b', 10, r)}" opacity=".55"><g class="wob ${pick('w', 6, r)}"><circle r="${rad.toFixed(1)}" fill="#bff4ff" fill-opacity=".1" stroke="#d6f8ff" stroke-opacity=".7" stroke-width="${(0.6 + rad * 0.08).toFixed(2)}"/><circle cx="${(-rad * 0.35).toFixed(1)}" cy="${(-rad * 0.35).toFixed(1)}" r="${(rad * 0.22).toFixed(1)}" fill="#ffffff" fill-opacity=".8"/></g></g></g>`
  }
  return out
}

// 右向きに描いた小魚の群れ。flip で左向きに泳がせる
function school(seed: number, count: number, x: number, y: number, spread: number, size: number, fill: string, cls: string, flip: boolean) {
  const r = rng(seed)
  let out = ''
  for (let i = 0; i < count; i++) {
    const dx = ((r() - 0.5) * spread * 2).toFixed(0)
    const dy = ((r() - 0.5) * spread * 0.7).toFixed(0)
    const s = (size * (0.7 + r() * 0.6)).toFixed(2)
    out += `<g transform="translate(${dx} ${dy}) scale(${s})"><g class="fb ${pick('f', 8, r)}"><path d="M-12 0 Q0 -8 13 0 Q0 8 -12 0Z" fill="${fill}"/><path d="M-10 0 L-20 -7 L-17 0 L-20 7Z" fill="${fill}"/></g></g>`
  }
  return `<g transform="translate(${x} ${y})${flip ? ' scale(-1 1)' : ''}"><g class="${cls}">${out}</g></g>`
}

function jelly(x: number, y: number, scale: number, grad: string, line: string, cls: string) {
  let tent = ''
  for (let i = 0; i < 5; i++) {
    const tx = -20 + i * 10
    const len = i % 2 === 0 ? 34 : 26
    tent += `<path d="M${tx} 2 q7 ${len / 2} 0 ${len} q-7 ${len / 2} 0 ${len} q7 ${len / 2} 0 ${len}" fill="none" stroke="${line}" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/>`
  }
  return `<g transform="translate(${x} ${y}) scale(${scale})"><g class="jfloat ${cls}">
    <circle cy="-10" r="70" fill="url(#jglow)"/>
    <g class="tent">${tent}</g>
    <g class="bell">
      <path d="M-32 0 Q-34 -44 0 -44 Q34 -44 32 0 Q24 8 16 2 Q8 9 0 3 Q-8 9 -16 2 Q-24 8 -32 0Z" fill="url(#${grad})"/>
      <path d="M-20 -14 Q-16 -34 2 -36" fill="none" stroke="#ffffff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>
    </g>
  </g></g>`
}

function weed(x: number, base: number, h: number, color: string, cls: string) {
  const q = (h / 4).toFixed(0)
  return `<path class="sway ${cls}" d="M${x} ${base} q-16 -${q} 0 -${+q * 2} q16 -${q} 0 -${+q * 2}" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round"/>`
}

function coral(x: number, y: number, s: number, color: string) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${color}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M0 0 L0 -44 M0 -18 L-20 -40 L-22 -62 M-20 -40 L-36 -48 M0 -30 L20 -52 L18 -74 M20 -52 L36 -60 M0 -44 L-6 -70"/>
  </g>`
}

// 遠くを横切るクジラの影（右向き）
const WHALE = `<g transform="translate(330 250) scale(1.25)" opacity=".7"><g class="whale"><g class="whale-bob">
  <g class="fluke"><path d="M-138 2 L-204 -36 Q-184 0 -204 34Z" fill="#0d3a57"/></g>
  <path d="M-150 2 Q-92 -52 20 -48 Q112 -42 152 -8 Q162 4 150 14 Q92 40 -20 36 Q-92 32 -150 2Z" fill="#0d3a57"/>
  <path d="M-120 14 Q-20 44 150 14 Q92 40 -20 36 Q-80 33 -120 14Z" fill="#1a5876"/>
  <path d="M14 30 Q-4 72 -46 78 Q-22 54 -18 32Z" fill="#0a2f48"/>
  <circle cx="112" cy="-6" r="3" fill="#04121f"/>
</g></g></g>`

// ゆっくり泳ぐウミガメ（右向き）
const TURTLE = `<g transform="translate(300 640) rotate(-8) scale(1.2)"><g class="turtle"><g class="turtle-bob">
  <path d="M-36 4 L-64 20 L-42 12Z" fill="#3c8f6b"/>
  <g class="flap back"><path d="M-22 6 Q-34 30 -54 36 Q-40 20 -34 6Z" fill="#3c8f6b"/></g>
  <ellipse cx="62" cy="-4" rx="14" ry="10" fill="#4ba67c"/>
  <circle cx="68" cy="-7" r="2" fill="#04121f"/>
  <path d="M-42 2 Q-22 16 50 2 Q22 22 -30 12Z" fill="#d9c98a"/>
  <path d="M-42 2 Q-32 -34 10 -32 Q44 -28 50 2 Q20 10 -42 2Z" fill="#2c7a5c"/>
  <path d="M-18 -26 L-8 -4 M10 -31 L8 -3 M34 -22 L28 -2 M-30 -12 L40 -14" fill="none" stroke="#1d5a45" stroke-width="2.4" stroke-linecap="round"/>
  <g class="flap"><path d="M22 6 Q14 44 -18 58 Q-4 30 4 8Z" fill="#4ba67c"/></g>
</g></g></g>`

export const OCEAN_SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<style>
.surf{animation:surf 26s linear infinite}
.surf2{animation-duration:41s;animation-direction:reverse}
@keyframes surf{from{transform:translateX(0)}to{transform:translateX(-400px)}}
.ray{transform-box:fill-box;transform-origin:top center;animation:ray ease-in-out infinite alternate}
@keyframes ray{from{opacity:.15;transform:skewX(-3deg)}to{opacity:.6;transform:skewX(3deg)}}
.glow{animation:glow 9s ease-in-out infinite alternate}
@keyframes glow{from{opacity:.7}to{opacity:1}}
.tw{animation:tw ease-in-out infinite alternate}
@keyframes tw{from{opacity:.1}to{opacity:.7}}
.sfar{animation:sink 260s linear infinite}
.snear{animation:sink 150s linear infinite}
@keyframes sink{from{transform:translateY(0)}to{transform:translateY(${H}px)}}
.bub{animation:bub linear infinite}
@keyframes bub{0%{opacity:0;transform:translateY(1050px)}8%{opacity:.6}92%{opacity:.5}100%{opacity:0;transform:translateY(-1050px)}}
.wob{animation:wob ease-in-out infinite alternate}
@keyframes wob{from{transform:translateX(-9px)}to{transform:translateX(9px)}}
.sch1{animation:swim 80s linear infinite}
.sch2{animation:swim 110s linear infinite;animation-delay:-40s}
.sch3{animation:swim 150s linear infinite;animation-delay:-95s}
@keyframes swim{from{transform:translateX(-1500px)}to{transform:translateX(1500px)}}
.fb{animation:fb ease-in-out infinite alternate}
@keyframes fb{from{transform:translateY(-4px) rotate(-3deg)}to{transform:translateY(4px) rotate(3deg)}}
.whale{animation:whale 190s linear infinite;animation-delay:-70s}
@keyframes whale{from{transform:translateX(-1000px)}to{transform:translateX(1900px)}}
.whale-bob{animation:bob 14s ease-in-out infinite alternate}
@keyframes bob{from{transform:translateY(-12px)}to{transform:translateY(12px)}}
.fluke{transform-box:fill-box;transform-origin:right center;animation:fluke 5s ease-in-out infinite alternate}
@keyframes fluke{from{transform:rotate(-10deg)}to{transform:rotate(10deg)}}
.turtle{animation:turtle 120s linear infinite;animation-delay:-48s}
@keyframes turtle{from{transform:translateX(-750px)}to{transform:translateX(1700px)}}
.turtle-bob{animation:bob 9s ease-in-out infinite alternate}
.flap{transform-box:fill-box;transform-origin:top right;animation:flap 3.6s ease-in-out infinite alternate}
.flap.back{animation-duration:2.8s}
@keyframes flap{from{transform:rotate(-22deg)}to{transform:rotate(24deg)}}
.jfloat{animation:jfloat 13s ease-in-out infinite alternate}
.j2{animation-duration:17s;animation-delay:-6s}.j3{animation-duration:21s;animation-delay:-11s}
@keyframes jfloat{from{transform:translate(0,18px)}to{transform:translate(10px,-34px)}}
.bell{transform-box:fill-box;transform-origin:center bottom;animation:bell 3.4s ease-in-out infinite alternate}
@keyframes bell{from{transform:scale(1.08,.9)}to{transform:scale(.94,1.06)}}
.tent{transform-box:fill-box;transform-origin:top center;animation:tent 3.4s ease-in-out infinite alternate}
@keyframes tent{from{transform:scaleY(.86) skewX(-5deg)}to{transform:scaleY(1.08) skewX(5deg)}}
.sway{transform-box:fill-box;transform-origin:bottom center;animation:sway 6s ease-in-out infinite alternate}
@keyframes sway{from{transform:skewX(-9deg)}to{transform:skewX(9deg)}}
.hover{animation:hover 11s ease-in-out infinite alternate}
@keyframes hover{from{transform:translate(-26px,6px)}to{transform:translate(30px,-10px)}}
.pearl{animation:pearl 5s ease-in-out infinite alternate}
@keyframes pearl{from{opacity:.55}to{opacity:1}}
${timingCss('y', 6, 7, 16, 12, 301)}${timingCss('t', 10, 3, 8, 8, 302)}${timingCss('b', 10, 16, 34, 34, 303)}${timingCss('w', 6, 2, 5, 5, 304)}${timingCss('f', 8, 1.6, 3.4, 3, 305)}${delayCss('g', 8, 6, 306)}
</style>
<defs>
<linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#11607f"/><stop offset=".3" stop-color="#0a3a57"/><stop offset=".7" stop-color="#051d33"/><stop offset="1" stop-color="#020a15"/></linearGradient>
<radialGradient id="sun" cx="50%" cy="0%" r="100%"><stop offset="0" stop-color="#b8f6ff" stop-opacity=".55"/><stop offset=".5" stop-color="#4fd0e6" stop-opacity=".14"/><stop offset="1" stop-color="#4fd0e6" stop-opacity="0"/></radialGradient>
<linearGradient id="rayg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9fbff" stop-opacity=".42"/><stop offset="1" stop-color="#c9fbff" stop-opacity="0"/></linearGradient>
<linearGradient id="deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#020a15" stop-opacity="0"/><stop offset="1" stop-color="#01060e" stop-opacity=".8"/></linearGradient>
<radialGradient id="jglow"><stop offset="0" stop-color="#d9b8ff" stop-opacity=".3"/><stop offset="1" stop-color="#d9b8ff" stop-opacity="0"/></radialGradient>
<linearGradient id="jb1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb3e0" stop-opacity=".9"/><stop offset="1" stop-color="#a97bff" stop-opacity=".5"/></linearGradient>
<linearGradient id="jb2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8f8ff" stop-opacity=".9"/><stop offset="1" stop-color="#4aa8ff" stop-opacity=".45"/></linearGradient>
<linearGradient id="sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#123a4d"/><stop offset="1" stop-color="#061a28"/></linearGradient>
<radialGradient id="pearlg" cx="35%" cy="35%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c8d9ff"/></radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#sea)"/>
<rect class="glow" width="${W}" height="${H}" fill="url(#sun)"/>
${rays(11, 9)}
<path class="surf" d="${surface(16, 78)}" fill="#c9fbff" fill-opacity=".16"/>
<path class="surf surf2" d="${surface(11, 64)}" fill="#e6fdff" fill-opacity=".2"/>
${snow(17, 150, 0.5, 1.1, 'sfar')}
${school(61, 16, 1150, 300, 130, 0.55, '#1c5876', 'sch3', true)}
${WHALE}
${snow(29, 60, 1, 1.8, 'snear')}
${school(73, 14, 520, 430, 120, 1, '#9fd8e8', 'sch1', false)}
${school(85, 11, 1180, 720, 100, 1.25, '#ffcf7a', 'sch2', true)}
${TURTLE}
<svg x="0" y="0" width="${W}" height="${H}" viewBox="0 0 600 600" preserveAspectRatio="xMaxYMin meet">
  ${jelly(480, 170, 1.25, 'jb1', '#ffb3e0', 'j1')}
  ${jelly(385, 300, 0.7, 'jb2', '#b8f8ff', 'j2')}
</svg>
<svg x="0" y="0" width="${W}" height="${H}" viewBox="0 0 600 600" preserveAspectRatio="xMinYMid meet">
  ${jelly(70, 240, 0.9, 'jb2', '#b8f8ff', 'j3')}
</svg>
<rect width="${W}" height="${H}" fill="url(#deep)"/>
<svg x="0" y="0" width="${W}" height="${H}" viewBox="0 0 500 500" preserveAspectRatio="xMinYMax meet">
  ${weed(26, 470, 190, '#157a70', 'g0')}
  ${weed(62, 462, 240, '#1f8a6a', 'g1')}
  ${weed(100, 458, 170, '#2fae7c', 'g2')}
  ${weed(150, 466, 120, '#157a70', 'g3')}
  <path d="M0 500 L0 440 Q50 418 110 438 Q180 462 250 500Z" fill="url(#sand)"/>
  <ellipse cx="196" cy="486" rx="34" ry="20" fill="#0b2a3b"/>
  ${coral(196, 470, 0.7, '#ff7f8f')}
  ${coral(232, 494, 0.45, '#ffa46b')}
  <path d="M60 452 l4 10 l11 1 l-8 7 l3 11 l-10 -6 l-10 6 l3 -11 l-8 -7 l11 -1Z" fill="#ffb057"/>
</svg>
<svg x="0" y="0" width="${W}" height="${H}" viewBox="0 0 500 500" preserveAspectRatio="xMaxYMax meet">
  ${weed(478, 468, 220, '#1f8a6a', 'g4')}
  ${weed(446, 460, 160, '#2fae7c', 'g5')}
  ${weed(330, 480, 110, '#157a70', 'g6')}
  <path d="M500 500 L500 432 Q440 412 380 440 Q310 470 240 500Z" fill="url(#sand)"/>
  <path d="M352 500 Q350 458 384 452 Q420 448 426 500Z" fill="#0b2a3b"/>
  ${coral(388, 456, 0.85, '#ffa46b')}
  ${coral(300, 494, 0.5, '#ff7f8f')}
  ${coral(456, 444, 0.55, '#c98bff')}
  <g transform="translate(270 478)">
    <path d="M-20 4 Q-22 -16 0 -18 Q22 -16 20 4Z" fill="#e6c9d8"/>
    <path d="M-8 -16 L-10 3 M0 -18 L0 4 M8 -16 L10 3" fill="none" stroke="#b995ab" stroke-width="1.6"/>
    <path d="M-20 4 Q0 14 20 4 Q0 9 -20 4Z" fill="#b995ab"/>
    <circle class="pearl" cx="0" cy="3" r="4.5" fill="url(#pearlg)"/>
  </g>
  <g transform="translate(330 380) scale(-1 1)"><g class="hover">
    <path d="M-16 0 Q0 -12 17 0 Q0 12 -16 0Z" fill="#ff8a3d"/>
    <path d="M-13 0 L-26 -9 L-22 0 L-26 9Z" fill="#ff8a3d"/>
    <path d="M-4 -8 Q-1 0 -4 8 M6 -7 Q9 0 6 7" fill="none" stroke="#fff3e0" stroke-width="3" stroke-linecap="round"/>
    <circle cx="11" cy="-2" r="1.6" fill="#04121f"/>
  </g></g>
</svg>
${bubbles(53, 34)}
</svg>`
