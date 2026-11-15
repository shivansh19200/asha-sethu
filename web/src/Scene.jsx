import React from 'react'

// Animated version of the cover: the alert travels from the doorstep to the health centre.
const hangers = []
for (let x = 450; x <= 1470; x += 70) {
  const t = (x - 330) / 1260
  hangers.push([x, (1 - t) * (1 - t) * 880 + 2 * t * (1 - t) * 230 + t * t * 880])
}
export default function Scene() {
  return (
    <svg className="scene" viewBox="0 300 1920 780" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Animated picture: a health worker on a bridge sends an alert from a village home to the health centre">
      <defs>
        <linearGradient id="sc-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF8EA" /><stop offset=".6" stopColor="#FDE6BE" /><stop offset="1" stopColor="#F8C37A" /></linearGradient>
        <radialGradient id="sc-glow"><stop offset="0" stopColor="#FFD58A" stopOpacity=".9" /><stop offset="1" stopColor="#FFD58A" stopOpacity="0" /></radialGradient>
        <path id="sc-route" d="M1060 785Q1330 580 1700 706" />
      </defs>
      <rect y="300" width="1920" height="780" fill="url(#sc-sky)" />
      <circle cx="1360" cy="700" r="380" fill="url(#sc-glow)" />
      <g className="sc-rays" stroke="#F2A33A" strokeWidth="10" strokeLinecap="round"><path d="M1360 440V380M1180 500L1140 450M1540 500L1580 450" /></g>
      <g className="sc-cloud c1" fill="#fff" opacity=".85"><ellipse cx="300" cy="400" rx="90" ry="26" /><ellipse cx="360" cy="384" rx="60" ry="26" /></g>
      <g className="sc-cloud c2" fill="#fff" opacity=".7"><ellipse cx="1000" cy="450" rx="110" ry="30" /><ellipse cx="1070" cy="432" rx="66" ry="28" /></g>
      <g className="sc-bird b1" stroke="#0B3A2C" strokeWidth="5" fill="none" strokeLinecap="round"><path d="M0 0q14-16 28 0q14-16 28 0" /></g>
      <g className="sc-bird b2" stroke="#0B3A2C" strokeWidth="4" fill="none" strokeLinecap="round"><path d="M0 0q10-12 20 0q10-12 20 0" /></g>
      <circle className="sc-sun" cx="1360" cy="700" r="170" fill="#F2A33A" />
      <path d="M0 760Q260 640 520 740T1040 730T1560 740T1920 700V1080H0Z" fill="#B9DEC8" />
      <path d="M0 820Q300 730 620 800T1260 790T1920 780V1080H0Z" fill="#7FC2A0" />
      <g transform="translate(150 640)"><rect x="30" y="60" width="200" height="130" fill="#F3E2C4" /><path d="M0 70L130 0L260 70Z" fill="#C98A3B" /><rect x="110" y="106" width="44" height="84" rx="4" fill="#8A5A2B" /><rect x="170" y="92" width="36" height="34" fill="#8A5A2B" opacity=".55" /></g>
      <g transform="translate(1650 640) scale(.84)"><rect y="70" width="300" height="190" fill="#fff" /><rect y="70" width="300" height="26" fill="#0E6B4F" /><rect x="118" y="150" width="64" height="110" fill="#D8E6DE" /><circle cx="150" cy="30" r="40" fill="#fff" stroke="#0E6B4F" strokeWidth="6" /><path d="M150 12V48M132 30H168" stroke="#B3261E" strokeWidth="10" strokeLinecap="round" /><rect x="30" y="120" width="56" height="44" fill="#D8E6DE" /><rect x="214" y="120" width="56" height="44" fill="#D8E6DE" /></g>
      <rect x="0" y="880" width="1920" height="200" fill="#4FB6C4" />
      <g className="sc-boat"><path d="M560 1000h150l-22 34h-106z" fill="#C98A3B" /><path d="M635 940v60M635 944l50 44h-50z" stroke="#0B3A2C" strokeWidth="5" fill="#fff" /></g>
      <g className="sc-waves" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".6" fill="none"><path d="M120 960q40-16 80 0t80 0M520 990q40-16 80 0t80 0M900 1020q40-16 80 0t80 0M1250 985q40-16 80 0t80 0M1600 1010q40-16 80 0t80 0" /></g>
      <path d="M0 884L330 900Q372 990 310 1080H0Z" fill="#3E9F78" /><path d="M1920 884L1600 900Q1560 990 1620 1080H1920Z" fill="#3E9F78" />
      <path d="M330 880Q960 230 1590 880" fill="none" stroke="#0B3A2C" strokeWidth="20" strokeLinecap="round" />
      <g stroke="#0B3A2C" strokeWidth="7" opacity=".8">{hangers.map(([x, y]) => <line key={x} x1={x} x2={x} y1={y} y2="872" />)}</g>
      <path d="M300 886H1620" stroke="#0B3A2C" strokeWidth="34" strokeLinecap="round" />
      <g transform="translate(900 738)">
        <path d="M10 120Q0 60 30 30Q60 0 90 30Q120 60 110 120Z" fill="#D4572A" /><path d="M30 30Q55 70 100 60L112 120H80Q70 80 30 30Z" fill="#F7E7C8" opacity=".95" />
        <rect x="48" y="14" width="24" height="24" rx="10" fill="#D9A57A" /><circle cx="60" cy="-4" r="30" fill="#D9A57A" />
        <path d="M30 -8Q32 -42 62 -40Q92 -38 90 -6Q70 -28 30 -8Z" fill="#2B2118" /><circle cx="60" cy="-48" r="13" fill="#2B2118" />
        <circle cx="50" cy="-2" r="2.6" fill="#2B2118" /><circle cx="70" cy="-2" r="2.6" fill="#2B2118" /><path d="M52 12q8 6 16 0" stroke="#8A4B2F" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M2 118H118L112 132H8Z" fill="#B8481F" />
        <ellipse cx="14" cy="74" rx="26" ry="20" fill="#F4E3C8" transform="rotate(-18 14 74)" /><circle cx="-6" cy="62" r="13" fill="#E0AE86" /><path d="M-14 58q8-10 18-2" stroke="#2B2118" strokeWidth="4" fill="none" strokeLinecap="round" />
        <g transform="rotate(14 112 66)"><rect x="98" y="30" width="46" height="78" rx="8" fill="#10261E" /><rect x="103" y="37" width="36" height="64" rx="4" fill="#fff" /><rect className="sc-screen" x="103" y="37" width="36" height="22" rx="4" fill="#B3261E" /><path d="M121 43V52M121 55v1" stroke="#fff" strokeWidth="3" strokeLinecap="round" /><path d="M108 70h26M108 80h20M108 90h24" stroke="#BFD3C8" strokeWidth="3" strokeLinecap="round" /></g>
      </g>
      <use href="#sc-route" fill="none" stroke="#B3261E" strokeWidth="7" strokeDasharray="4 20" strokeLinecap="round" className="sc-route" />
      <circle r="14" fill="#B3261E"><animateMotion dur="3.6s" repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes="0;0.2;0.8;1" calcMode="linear"><mpath href="#sc-route" /></animateMotion></circle>
      <g className="sc-label" transform="translate(1180 565)"><rect width="210" height="54" rx="27" fill="#B3261E" /><text x="105" y="35" textAnchor="middle" fill="#fff" fontSize="26" fontWeight="600">Red · go now</text></g>
      <g className="sc-ping"><circle cx="1700" cy="690" r="26" fill="none" stroke="#1E7A3C" strokeWidth="6" /></g>
      <g className="sc-ping p2"><circle cx="1700" cy="690" r="26" fill="none" stroke="#1E7A3C" strokeWidth="6" /></g>
      <g className="sc-ok" transform="translate(1700 690)"><circle r="26" fill="#1E7A3C" /><path d="M-11 0l8 8 15-17" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
    </svg>
  )
}
