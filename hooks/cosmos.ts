import type { ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { pick, rng, timingCss } from './timing'

// ---- 色：深宇宙の紺、シアンとバイオレットの差し色 -------------------------
const { theme, problems } = makeColors({
  label: 'Cosmos',
  only: 'dark',
  roles: { accent: '#6ec8ff', danger: '#ff6b8a', success: '#7ee0a8', warning: '#ffc46b', pro: '#b79bff' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#070a1a',
        'surface-1': '#0d1228',
        'surface-2': '#121834',
        'surface-3': '#181f3e',
        'text-primary': '#eef1ff',
        'text-secondary': '#c3c9e8',
        'text-muted': '#9aa2c8',
      },
    },
  },
})

export const COSMOS_PROBLEMS = problems

export const COSMOS_LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: 'cosmos', glass: { blur: 2, tint: '#070a1a', opacity: 0.28 } },
}

// ---- シーン：決まった種の乱数で毎回同じ星空を作る ------------------------

const W = 1600
const H = 1000
const STAR_COLORS = ['#ffffff', '#dfe8ff', '#cfe0ff', '#fff2d8', '#e8d8ff']

function starLayer(seed: number, count: number, rMin: number, rMax: number, cls: string) {
  const r = rng(seed)
  let out = ''
  for (let i = 0; i < count; i++) {
    const x = (r() * W).toFixed(0)
    const y = (r() * H).toFixed(0)
    const rad = (rMin + r() * (rMax - rMin)).toFixed(2)
    const c = STAR_COLORS[Math.floor(r() * STAR_COLORS.length)]
    out += `<circle class="tw ${pick('t', 12, r)}" cx="${x}" cy="${y}" r="${rad}" fill="${c}"/>`
  }
  // 横に2枚並べて、ゆっくり流しても途切れないようにする
  return `<g class="${cls}"><g>${out}</g><g transform="translate(${W} 0)">${out}</g></g>`
}

function sparkles(seed: number, count: number) {
  const r = rng(seed)
  let out = ''
  for (let i = 0; i < count; i++) {
    const x = (r() * W).toFixed(0)
    const y = (r() * H).toFixed(0)
    const s = (0.6 + r() * 0.8).toFixed(2)
    out += `<g transform="translate(${x} ${y}) scale(${s})"><path class="sp ${pick('p', 8, r)}" d="M0 -9 L1.4 -1.4 L9 0 L1.4 1.4 L0 9 L-1.4 1.4 L-9 0 L-1.4 -1.4Z" fill="#ffffff"/></g>`
  }
  return out
}

function meteors(seed: number, count: number) {
  const r = rng(seed)
  let out = ''
  for (let i = 0; i < count; i++) {
    // 右上の帯から左下へ。角度・長さ・速さ・間隔をばらけさせる
    const x = (500 + r() * 1300).toFixed(0)
    const y = (-60 + r() * 360).toFixed(0)
    const ang = (140 + r() * 30).toFixed(0)
    const len = (90 + r() * 170).toFixed(0)
    const w = (1.2 + r() * 1.6).toFixed(1)
    out += `<g transform="translate(${x} ${y}) rotate(${ang})"><g class="meteor ${pick('m', 10, r)}"><path d="M0 -${w} L-${len} 0 L0 ${w}Z" fill="url(#tail)"/><circle cx="0" cy="0" r="${(+w + 0.6).toFixed(1)}" fill="#fff"/></g></g>`
  }
  return out
}

// 右向きに描いたロケット。外側の g で向きを決め、.rocket が前へ進む
const ROCKET = `<g transform="translate(-200 980) rotate(-30) scale(1.7)"><g class="rocket">
  <path d="M-24 -5 Q-140 -14 -280 -2 L-280 2 Q-140 14 -24 5Z" fill="url(#smoke)"/>
  <g class="flame"><path d="M-22 -7 Q-58 0 -22 7Z" fill="#ff8a3d"/><path d="M-22 -4 Q-44 0 -22 4Z" fill="#ffe08a"/></g>
  <path d="M-14 -9 L-26 -20 L-6 -9Z" fill="#ff5a7a"/>
  <path d="M-14 9 L-26 20 L-6 9Z" fill="#ff5a7a"/>
  <path d="M-22 -9 L20 -9 Q40 -9 52 0 Q40 9 20 9 L-22 9Z" fill="#eef1ff"/>
  <path d="M30 -7 Q44 -5 52 0 Q44 5 30 7Z" fill="#ff5a7a"/>
  <circle cx="12" cy="0" r="4.6" fill="#6ec8ff" stroke="#9aa2c8" stroke-width="1.6"/>
  <rect x="-22" y="-9" width="5" height="18" fill="#c3c9e8"/>
</g></g>`

export const COSMOS_SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<style>
.tw{animation:tw ease-in-out infinite alternate}
@keyframes tw{from{opacity:.15}to{opacity:1}}
.sp{transform-box:fill-box;transform-origin:center;animation:sp ease-in-out infinite}
@keyframes sp{0%,100%{opacity:0;transform:scale(.2) rotate(0)}50%{opacity:.95;transform:scale(1) rotate(45deg)}}
.far{animation:drift 420s linear infinite}
.mid{animation:drift 240s linear infinite}
.near{animation:drift 140s linear infinite}
@keyframes drift{from{transform:translateX(0)}to{transform:translateX(-${W}px)}}
.neb{transform-box:fill-box;transform-origin:center;animation:neb 40s ease-in-out infinite alternate}
.neb2{animation-duration:55s;animation-direction:alternate-reverse}
@keyframes neb{from{opacity:.35;transform:scale(1) rotate(0)}to{opacity:.7;transform:scale(1.15) rotate(8deg)}}
.meteor{opacity:0;animation:met linear infinite}
@keyframes met{0%{opacity:0;transform:translateX(0)}2%{opacity:1}13%{opacity:0;transform:translateX(900px)}100%{opacity:0;transform:translateX(900px)}}
.rocket{animation:fly 40s linear infinite}
@keyframes fly{0%{transform:translateX(0)}55%,100%{transform:translateX(1500px)}}
.flame{transform-box:fill-box;transform-origin:right center;animation:flick .12s ease-in-out infinite alternate}
@keyframes flick{from{transform:scaleX(.75)}to{transform:scaleX(1.15)}}
.ufo-path{animation:ufox 34s ease-in-out infinite alternate}
@keyframes ufox{0%{transform:translate(0,0)}25%{transform:translate(90px,25px)}50%{transform:translate(170px,-10px)}75%{transform:translate(250px,20px)}100%{transform:translate(260px,0)}}
.ufo{transform-box:fill-box;transform-origin:center;animation:wob 3s ease-in-out infinite alternate}
@keyframes wob{from{transform:translateY(-4px) rotate(-6deg)}to{transform:translateY(4px) rotate(6deg)}}
.ufo-light{animation:blink 1.2s steps(1) infinite}
.ufo-light.l2{animation-delay:.4s}.ufo-light.l3{animation-delay:.8s}
.beam{transform-box:fill-box;transform-origin:top center;animation:beam 9s ease-in-out infinite}
@keyframes beam{0%,55%,100%{opacity:0;transform:scaleY(.2)}65%,85%{opacity:.55;transform:scaleY(1)}}
.eye{transform-box:fill-box;transform-origin:center;animation:eye 5s infinite}
@keyframes eye{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}
.bh-glow{transform-box:fill-box;transform-origin:center;animation:bhp 6s ease-in-out infinite alternate}
@keyframes bhp{from{opacity:.7;transform:scale(.95)}to{opacity:1;transform:scale(1.08)}}
.bh-halo{animation:halo 4s ease-in-out infinite alternate}
@keyframes halo{from{stroke-opacity:.6}to{stroke-opacity:1}}
.bh-photon{animation:halo 1.8s ease-in-out infinite alternate}
.swirl{animation:swirl 3s linear infinite}
.s2{animation-duration:1.8s}.s3{animation-duration:5s}
@keyframes swirl{to{stroke-dashoffset:-180}}
.infall{transform-box:view-box;transform-origin:0 0;animation:infall 7s ease-in infinite}
.i2{animation-duration:9s;animation-delay:-3s}.i3{animation-duration:11s;animation-delay:-6s}
@keyframes infall{0%{opacity:0;transform:rotate(0) scale(1)}10%{opacity:1}90%{opacity:.8}100%{opacity:0;transform:rotate(300deg) scale(.15)}}
.ring-back,.ring-front{transform-box:fill-box;transform-origin:center}
.planet{animation:bob 18s ease-in-out infinite alternate}
@keyframes bob{from{transform:translateY(0)}to{transform:translateY(14px)}}
.orbit{transform-box:fill-box;transform-origin:center;animation:orb 30s linear infinite}
@keyframes orb{to{transform:rotate(360deg)}}
.bands{animation:bands 60s linear infinite}
@keyframes bands{from{transform:translateX(0)}to{transform:translateX(-200px)}}
.blink{animation:blink 1.6s steps(1) infinite}
@keyframes blink{0%{opacity:1}50%{opacity:.1}}
.gal{transform-box:fill-box;transform-origin:center;animation:orb 160s linear infinite}
${timingCss('t', 12, 2, 7, 7, 201)}${timingCss('p', 8, 3, 7, 6, 202)}${timingCss('m', 10, 5, 14, 14, 203)}
</style>
<defs>
<radialGradient id="sky" cx="30%" cy="20%" r="90%"><stop offset="0" stop-color="#151a40"/><stop offset=".55" stop-color="#090c22"/><stop offset="1" stop-color="#03040d"/></radialGradient>
<radialGradient id="n1"><stop offset="0" stop-color="#7b4dff" stop-opacity=".55"/><stop offset="1" stop-color="#7b4dff" stop-opacity="0"/></radialGradient>
<radialGradient id="n2"><stop offset="0" stop-color="#1fb6ff" stop-opacity=".45"/><stop offset="1" stop-color="#1fb6ff" stop-opacity="0"/></radialGradient>
<radialGradient id="n3"><stop offset="0" stop-color="#ff4fa3" stop-opacity=".35"/><stop offset="1" stop-color="#ff4fa3" stop-opacity="0"/></radialGradient>
<linearGradient id="tail" x1="1" x2="0"><stop offset="0" stop-color="#9fdcff" stop-opacity=".9"/><stop offset="1" stop-color="#9fdcff" stop-opacity="0"/></linearGradient>
<linearGradient id="smoke" x1="1" x2="0"><stop offset="0" stop-color="#ffb07a" stop-opacity=".55"/><stop offset=".3" stop-color="#c3c9e8" stop-opacity=".25"/><stop offset="1" stop-color="#c3c9e8" stop-opacity="0"/></linearGradient>
<radialGradient id="dome" cx="40%" cy="35%"><stop offset="0" stop-color="#e0fbff" stop-opacity=".9"/><stop offset="1" stop-color="#6ec8ff" stop-opacity=".35"/></radialGradient>
<linearGradient id="hull" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8dcea"/><stop offset="1" stop-color="#5b6390"/></linearGradient>
<linearGradient id="beamg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8dffcf" stop-opacity=".9"/><stop offset="1" stop-color="#8dffcf" stop-opacity="0"/></linearGradient>
<radialGradient id="bhglow"><stop offset=".25" stop-color="#ffb46b" stop-opacity=".75"/><stop offset=".5" stop-color="#ff6a2b" stop-opacity=".3"/><stop offset=".75" stop-color="#b14dff" stop-opacity=".15"/><stop offset="1" stop-color="#b14dff" stop-opacity="0"/></radialGradient>
<linearGradient id="bhring" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2a8"/><stop offset=".5" stop-color="#ff8a3d" stop-opacity=".6"/><stop offset="1" stop-color="#ffe2a8" stop-opacity=".9"/></linearGradient>
<linearGradient id="bhdisk" x1="0" x2="1"><stop offset="0" stop-color="#ff6a2b" stop-opacity=".3"/><stop offset=".35" stop-color="#ffd38a"/><stop offset=".55" stop-color="#fff6e0"/><stop offset="1" stop-color="#ff6a2b" stop-opacity=".3"/></linearGradient>
<radialGradient id="pl" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#ffd6a8"/><stop offset=".45" stop-color="#e0805a"/><stop offset="1" stop-color="#4a1d3a"/></radialGradient>
<radialGradient id="shade" cx="25%" cy="25%" r="85%"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#05030f" stop-opacity=".85"/></radialGradient>
<radialGradient id="glow"><stop offset=".6" stop-color="#ff9d6b" stop-opacity=".25"/><stop offset="1" stop-color="#ff9d6b" stop-opacity="0"/></radialGradient>
<linearGradient id="ring" x1="0" x2="1"><stop offset="0" stop-color="#c9b6ff" stop-opacity=".1"/><stop offset=".5" stop-color="#f3e7ff" stop-opacity=".85"/><stop offset="1" stop-color="#c9b6ff" stop-opacity=".1"/></linearGradient>
<radialGradient id="moon" cx="35%" cy="35%"><stop offset="0" stop-color="#e9eeff"/><stop offset="1" stop-color="#6b7399"/></radialGradient>
<radialGradient id="core"><stop offset="0" stop-color="#fff6e0"/><stop offset=".3" stop-color="#ffcf8a" stop-opacity=".6"/><stop offset="1" stop-color="#b48cff" stop-opacity="0"/></radialGradient>
<clipPath id="pclip"><circle r="120"/></clipPath>
</defs>
<rect width="${W}" height="${H}" fill="url(#sky)"/>
<ellipse class="neb" cx="380" cy="300" rx="520" ry="300" fill="url(#n1)"/>
<ellipse class="neb neb2" cx="1250" cy="760" rx="560" ry="320" fill="url(#n2)"/>
<ellipse class="neb" cx="900" cy="150" rx="380" ry="200" fill="url(#n3)"/>
${starLayer(7, 220, 0.4, 0.9, 'far')}
${starLayer(21, 110, 0.8, 1.4, 'mid')}
${starLayer(99, 40, 1.3, 2.1, 'near')}
${sparkles(5, 14)}
${meteors(42, 14)}
${ROCKET}
<svg x="0" y="0" width="${W}" height="${H}" viewBox="0 0 400 400" preserveAspectRatio="xMinYMax meet">
  <g transform="translate(90 330)" opacity=".75">
    <g class="gal">
      <ellipse rx="70" ry="22" fill="none" stroke="#b48cff" stroke-opacity=".35" stroke-width="6"/>
      <ellipse rx="50" ry="15" fill="none" stroke="#7fc8ff" stroke-opacity=".35" stroke-width="5" transform="rotate(30)"/>
      <ellipse rx="34" ry="10" fill="none" stroke="#ffd6a8" stroke-opacity=".4" stroke-width="4" transform="rotate(65)"/>
      <circle r="22" fill="url(#core)"/>
    </g>
  </g>
</svg>
<svg x="0" y="0" width="${W}" height="${H}" viewBox="0 0 680 680" preserveAspectRatio="xMaxYMin meet">
  <g transform="translate(500 170)"><g class="planet">
    <circle r="175" fill="url(#glow)"/>
    <g transform="rotate(-18)"><ellipse class="ring-back" rx="200" ry="38" fill="none" stroke="url(#ring)" stroke-width="10" opacity=".55"/></g>
    <circle r="120" fill="url(#pl)"/>
    <g clip-path="url(#pclip)" opacity=".22">
      <g class="bands">
        <rect x="-130" y="-60" width="460" height="14" fill="#ffe0b8"/>
        <rect x="-130" y="-20" width="460" height="22" fill="#8a3a4f"/>
        <rect x="-130" y="30" width="460" height="10" fill="#ffd2a0"/>
        <rect x="-130" y="62" width="460" height="18" fill="#6d2a48"/>
      </g>
    </g>
    <circle r="120" fill="url(#shade)"/>
    <g transform="rotate(-18)"><path d="M -200 0 A 200 38 0 0 0 200 0" fill="none" stroke="url(#ring)" stroke-width="10"/><path d="M -170 0 A 170 30 0 0 0 170 0" fill="none" stroke="#e8dcff" stroke-opacity=".35" stroke-width="4"/></g>
    <g class="orbit"><circle r="244" fill="none"/><circle cx="230" cy="0" r="14" fill="url(#moon)"/></g>
  </g></g>
</svg>
<svg x="0" y="0" width="${W}" height="${H}" viewBox="0 0 900 600" preserveAspectRatio="xMinYMin meet">
  <g transform="translate(90 110) scale(1.5)"><g class="ufo-path"><g class="ufo">
    <path class="beam" d="M-14 10 L14 10 L46 120 L-46 120Z" fill="url(#beamg)"/>
    <ellipse cx="0" cy="-8" rx="20" ry="18" fill="url(#dome)"/>
    <g transform="translate(0 -9)">
      <path d="M-5 -9 L-9 -19" stroke="#7ee0a8" stroke-width="1.6"/><circle cx="-9" cy="-19" r="2" fill="#ffc46b"/>
      <path d="M5 -9 L9 -19" stroke="#7ee0a8" stroke-width="1.6"/><circle cx="9" cy="-19" r="2" fill="#ffc46b"/>
      <ellipse cx="0" cy="0" rx="9" ry="10" fill="#7ee0a8"/>
      <ellipse class="eye" cx="-3.6" cy="-1" rx="2.6" ry="3.6" fill="#0d1228"/>
      <ellipse class="eye" cx="3.6" cy="-1" rx="2.6" ry="3.6" fill="#0d1228"/>
    </g>
    <ellipse cx="0" cy="4" rx="46" ry="12" fill="url(#hull)"/>
    <ellipse cx="0" cy="1" rx="30" ry="5" fill="#eef1ff" opacity=".5"/>
    <circle class="ufo-light" cx="-30" cy="6" r="2.6" fill="#ffc46b"/>
    <circle class="ufo-light l2" cx="0" cy="10" r="2.6" fill="#ff6b8a"/>
    <circle class="ufo-light l3" cx="30" cy="6" r="2.6" fill="#6ec8ff"/>
  </g></g></g>
</svg>
<svg x="0" y="0" width="${W}" height="${H}" viewBox="0 0 500 500" preserveAspectRatio="xMaxYMax meet">
  <g transform="translate(330 360)"><g transform="rotate(-12)">
    <circle class="bh-glow" r="150" fill="url(#bhglow)"/>
    <circle r="62" fill="none" stroke="#ff9d5c" stroke-opacity=".18" stroke-width="18"/>
    <ellipse class="bh-halo" rx="52" ry="50" fill="none" stroke="url(#bhring)" stroke-width="6"/>
    <path d="M -118 0 A 118 24 0 0 1 118 0" fill="none" stroke="#ff9d5c" stroke-opacity=".35" stroke-width="10"/>
    <circle r="40" fill="#000"/>
    <circle class="bh-photon" r="41.5" fill="none" stroke="#ffd9a0" stroke-width="2.2"/>
    <path d="M -118 0 A 118 24 0 0 0 118 0" fill="none" stroke="url(#bhdisk)" stroke-width="12"/>
    <path class="swirl" d="M -118 0 A 118 24 0 0 0 118 0" fill="none" stroke="#fff3d6" stroke-opacity=".7" stroke-width="2.5" stroke-dasharray="14 22"/>
    <path class="swirl s2" d="M -96 0 A 96 18 0 0 0 96 0" fill="none" stroke="#ffb46b" stroke-opacity=".8" stroke-width="3" stroke-dasharray="8 18"/>
    <path class="swirl s3" d="M -140 2 A 140 30 0 0 0 140 2" fill="none" stroke="#b79bff" stroke-opacity=".45" stroke-width="1.6" stroke-dasharray="4 26"/>
    <g class="infall"><circle cx="150" cy="-60" r="1.8" fill="#fff"/></g>
    <g class="infall i2"><circle cx="-160" cy="40" r="1.5" fill="#cfe0ff"/></g>
    <g class="infall i3"><circle cx="90" cy="110" r="1.6" fill="#fff2d8"/></g>
  </g></g>
</svg>
</svg>`
