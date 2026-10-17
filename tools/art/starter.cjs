/*
 * Starter game (mini Nebula Nursery) — all its art as parametric SVG (rendered to PNG).
 *   node .claude/skills/_shared/render-svg.cjs tools/art/starter.cjs [--only keeper,critter]
 * One source of truth: the critter drawn in the world, in the close-up, in the
 * customize preview and on the app icon all come from the same `critter()` function,
 * so they never drift apart.
 */
const K = require("../../.claude/skills/_shared/svg-kit.cjs");
const IK = require("../../.claude/skills/_shared/icon-kit.cjs");
const { svg, sheet, job, shade, mix, lin, rad, glow, blur, rng, star } = K;

const INK = "#1d2147";                 // outline colour (deep navy)
const VARIANTS = {                       // critter variants: [main colour]
  rose: "#ff5db1", amber: "#ffb43a", aqua: "#3fe0e8", lime: "#86e55a", violet: "#a97bff",
};

/* ---------------- Critter ---------------- */
// A round, glowing alien blob with one big eye, two antennae and three stubby feet.
// opts: { c (variant colour), eye:"open"|"happy", feet: -1|0|1 (walk), sq (squash), look (-1..1), uid,
//         turn (0..1): the whole face turns towards the LEFT (3/4 view) — walk sheets, flipped by the engine for right }
function critter(o) {
  const c = o.c, u = o.uid || "c";
  const body = mix("#ffffff", c, 0.28), bodyD = mix("#c9d6ff", c, 0.35);
  const sq = o.sq || 0, look = o.look != null ? o.look : -0.25;
  const rx = 40 * (1 + sq), ry = 36 * (1 - sq), cy = 66 + sq * 18;
  const defs = rad(`${u}b`, [[0, "#ffffff"], [0.55, body], [1, bodyD]], 0.42, 0.32, 0.75) +
    rad(`${u}g`, [[0, c, 0.55], [1, c, 0]], 0.5, 0.5, 0.5) +
    rad(`${u}e`, [[0, "#3a4590"], [0.7, "#1b1f4a"], [1, "#0e1030"]], 0.45, 0.4, 0.6) +
    rad(`${u}t`, [[0, "#ffffff"], [0.35, shade(c, 0.3)], [1, c]], 0.4, 0.35, 0.6) + glow(`${u}gl`, 3);
  const f = o.feet || 0;
  const foot = (x, lift) => `<ellipse cx="${x}" cy="${103 - lift}" rx="8.5" ry="6" fill="${bodyD}" stroke="${INK}" stroke-width="3"/>`;
  const tn = o.turn || 0, ft = -15 * tn;             // face shift for the 3/4 turn
  const eyeX = 64 + look * 7 + ft, eyeY = cy - 4;
  const eye = o.eye === "happy"
    ? `<path d="M${eyeX - 15} ${eyeY + 3} Q${eyeX} ${eyeY - 13} ${eyeX + 15} ${eyeY + 3}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`
    : `<circle cx="${eyeX}" cy="${eyeY}" r="17" fill="#ffffff" stroke="${INK}" stroke-width="3"/>
       <circle cx="${eyeX + look * 4}" cy="${eyeY + 1}" r="11.5" fill="url(#${u}e)"/>
       <circle cx="${eyeX + look * 4 - 4}" cy="${eyeY - 4}" r="4.2" fill="#ffffff"/>
       <circle cx="${eyeX + look * 4 + 4}" cy="${eyeY + 4}" r="1.8" fill="#ffffff" opacity=".8"/>`;
  const ant = (x0, x1, y1) => `<path d="M${x0} ${cy - ry + 8} Q${(x0 + x1) / 2} ${y1 + 8} ${x1} ${y1}" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
    <circle cx="${x1}" cy="${y1}" r="7.5" fill="url(#${u}t)" stroke="${INK}" stroke-width="2.5" filter="url(#${u}gl)"/>`;
  return { defs, body: `
    <ellipse cx="64" cy="${cy}" rx="${rx + 16}" ry="${ry + 14}" fill="url(#${u}g)"/>
    ${foot(44, f > 0 ? 5 : 0)}${foot(84, f < 0 ? 5 : 0)}${foot(64, 0)}
    ${ant(52 + tn * 4, 38 - sq * 6 + tn * 8, cy - ry - 18 + sq * 10)}${ant(76 + tn * 4, 90 + sq * 6 + tn * 8, cy - ry - 18 + sq * 10)}
    <ellipse cx="64" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${u}b)" stroke="${INK}" stroke-width="3.5"/>
    <ellipse cx="${64 - rx * 0.42}" cy="${cy - ry * 0.5}" rx="${rx * 0.22}" ry="${ry * 0.14}" fill="#ffffff" opacity=".85" transform="rotate(-25 ${64 - rx * 0.42} ${cy - ry * 0.5})"/>
    ${eye}
    <ellipse cx="${46 + look * 4 + ft * 0.75}" cy="${cy + 13}" rx="${6 - tn * 1.5}" ry="3.6" fill="${c}" opacity=".45"/>
    <ellipse cx="${82 + look * 4 + ft * 0.8}" cy="${cy + 13}" rx="6" ry="3.6" fill="${c}" opacity=".45"/>
    <path d="M${57 + look * 5 + ft} ${cy + 17} Q${64 + look * 5 + ft} ${cy + 23} ${71 + look * 5 + ft} ${cy + 17}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>` };
}
function critterSheet(v, happy) {
  const c = VARIANTS[v];
  // 4-frame walk: squash ↔ stretch with alternating feet (the engine adds the hop)
  const params = [{ sq: 0.0, feet: 1 }, { sq: -0.05, feet: 0 }, { sq: 0.0, feet: -1 }, { sq: 0.05, feet: 0 }];
  let defs = "";
  const frames = params.map((p, i) => { const r = critter({ c, uid: `k${i}`, sq: p.sq, feet: p.feet, eye: happy ? "happy" : "open", look: -0.8, turn: 0.65 }); defs += r.defs; return `<g transform="translate(64 109) scale(0.88) translate(-64 -109)">${r.body}</g>`; });
  return job(`assets/sheet/critter_${happy ? "happy_" : ""}${v}.png`, 512, 128, sheet(frames, 128, 128, 4), defs);
}
function critterThumb(v) {
  const r = critter({ c: VARIANTS[v], uid: "t" });
  return job(`assets/ui/critter_${v}.png`, 128, 128, r.body, r.defs);
}

/* ---------------- Keeper robot (LPC layout: 9 cols × 4 rows: up, left, down, right) ---------------- */
// opt.seated: riding pose — no hover glow / thruster, arms reaching forward, little legs
// bent at the knee dangling forward (side views) — see robotSeated().
function robot(dir, phase, moving, pal, u, opt) {
  const seated = !!(opt && opt.seated);
  const bob = moving ? Math.sin(phase * 2) * 2.4 : 0;
  const tilt = moving ? (dir === "left" ? -5 : dir === "right" ? 5 : Math.sin(phase) * 2) : 0;
  const swing = moving ? Math.sin(phase) * 22 : 0;
  const B = pal.body, BD = shade(pal.body, -0.18), A = pal.accent;
  const defs = rad(`${u}h`, [[0, "#ffffff"], [0.6, B], [1, BD]], 0.38, 0.3, 0.8) +
    lin(`${u}v`, [[0, "#2b3370"], [1, "#11153a"]]) +
    rad(`${u}j`, [[0, A, 0.9], [1, A, 0]], 0.5, 0.5, 0.5) + glow(`${u}gl`, 2.5) + blur(`${u}bl`, 4);
  const side = dir === "left" || dir === "right";
  const flip = dir === "right" ? `translate(128,0) scale(-1,1)` : "";
  const armL = (x, y, ang, front) => `<g transform="rotate(${ang} ${x} ${y})"><rect x="${x - 6}" y="${y - 3}" width="12" height="26" rx="6" fill="${front ? B : BD}" stroke="${INK}" stroke-width="3"/><circle cx="${x}" cy="${y + 25}" r="6.5" fill="${A}" stroke="${INK}" stroke-width="2.5"/></g>`;
  let g = "";
  // hover glow + thruster
  if (!seated) g += `<ellipse cx="64" cy="118" rx="${22 - bob}" ry="6" fill="url(#${u}j)" filter="url(#${u}bl)"/>`;
  g += `<g transform="translate(0 ${bob}) rotate(${tilt} 64 96)">`;
  if (dir === "up") {
    g += armL(36, 70, 10 - swing * 0.6, true) + armL(92, 70, -10 + swing * 0.6, true);
  } else if (!side) {
    g += armL(36, 70, 12 + swing * 0.6, false) + armL(92, 70, -12 - swing * 0.6, false);
  } else {
    g += armL(70, 70, seated ? 44 : -swing, false);   // far arm (behind)
  }
  // seated legs (side view): thigh forward, shin down, foot pointing forward. Far leg first.
  const leg = (dx, dy, c) => `<path d="M${66 + dx} ${99 + dy} L${45 + dx} ${101 + dy} L${43 + dx} ${112 + dy}" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="M${66 + dx} ${99 + dy} L${45 + dx} ${101 + dy} L${43 + dx} ${112 + dy}" fill="none" stroke="${c}" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<ellipse cx="${38 + dx}" cy="${116 + dy}" rx="9" ry="5" fill="${shade(A, -0.25)}" stroke="${INK}" stroke-width="3"/>`;
  if (seated && side) g += leg(9, -2, shade(BD, -0.12));
  if (!seated) {
    g += `<path d="M50 104 L78 104 L73 113 L55 113 Z" fill="${shade(A, -0.25)}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
    g += `<ellipse cx="64" cy="114" rx="8" ry="3" fill="${A}" filter="url(#${u}gl)"/>`;
  }
  // body
  g += `<path d="M42 66 Q40 104 64 106 Q88 104 86 66 Z" fill="url(#${u}h)" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`;
  if (dir === "down") {
    g += `<rect x="54" y="78" width="20" height="14" rx="5" fill="#1a1f4a" stroke="${INK}" stroke-width="2.5"/><circle cx="60" cy="85" r="2.8" fill="${A}" filter="url(#${u}gl)"/><circle cx="68" cy="85" r="2.8" fill="#ff7ab8"/>`;
  } else if (dir === "up") {
    g += `<path d="M52 80 L76 80 M52 88 L76 88" stroke="${BD}" stroke-width="3" stroke-linecap="round"/>`;
  } else {
    g += `<circle cx="52" cy="85" r="4" fill="${A}" filter="url(#${u}gl)"/>`;
  }
  if (seated && side) g += leg(0, 0, B);
  // head
  if (dir === "up") g += keeperBackCollar(BD);
  g += `<line x1="64" y1="22" x2="64" y2="9" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
  g += `<circle cx="64" cy="8" r="6.5" fill="${A}" stroke="${INK}" stroke-width="2.5" filter="url(#${u}gl)"/>`;
  g += `<ellipse cx="64" cy="46" rx="33" ry="27" fill="url(#${u}h)" stroke="${INK}" stroke-width="3.5"/>`;
  g += `<ellipse cx="52" cy="32" rx="9" ry="5" fill="#ffffff" opacity=".9" transform="rotate(-20 52 32)"/>`;
  if (dir === "down") {
    g += `<rect x="38" y="40" width="52" height="22" rx="11" fill="url(#${u}v)" stroke="${INK}" stroke-width="3"/>`;
    g += `<ellipse cx="53" cy="51" rx="6" ry="7" fill="${A}" filter="url(#${u}gl)"/><ellipse cx="75" cy="51" rx="6" ry="7" fill="${A}" filter="url(#${u}gl)"/>`;
    g += `<circle cx="51" cy="48" r="2" fill="#fff"/><circle cx="73" cy="48" r="2" fill="#fff"/>`;
    g += `<ellipse cx="38" cy="58" rx="5" ry="3" fill="#ff8fc4" opacity=".55"/><ellipse cx="90" cy="58" rx="5" ry="3" fill="#ff8fc4" opacity=".55"/>`;
  } else if (side) {
    g += `<g transform="${flip}"><rect x="30" y="40" width="30" height="22" rx="11" fill="url(#${u}v)" stroke="${INK}" stroke-width="3"/>`;
    g += `<ellipse cx="42" cy="51" rx="5.5" ry="7" fill="${A}" filter="url(#${u}gl)"/><circle cx="40" cy="48" r="2" fill="#fff"/>`;
    g += `<circle cx="80" cy="48" r="7" fill="${BD}" stroke="${INK}" stroke-width="2.5"/></g>`;
  } else {   // back of the head: battery hatch with vertical vents (see keeperBackHatch)
    g += keeperBackHatch(B, BD);
  }
  if (dir === "up") { /* arms already behind */ } else if (side) {
    g += `<g transform="${flip}">${armL(58, 70, seated ? 54 : swing, true)}</g>`;
  }
  g += `</g>`;
  return { defs, body: dir === "left" ? g : g };
}
// Back of the keeper's head (local 128 px): a collar ring under the head + a small battery hatch with
// vertical vents. No status dot below horizontal lines: that read as a sleepy FACE at phone size.
function keeperBackCollar(BD) { return `<ellipse cx="64" cy="73" rx="15" ry="4.5" fill="${BD}" stroke="${INK}" stroke-width="3"/>`; }
function keeperBackHatch(B, BD) {   // small, low on the head, low contrast (it must never read as a mouth)
  return `<rect x="57" y="54" width="14" height="10" rx="3.5" fill="${shade(B, -0.07)}"/>` +
    `<path d="M61 57 V61 M64 57 V61 M67 57 V61" stroke="${BD}" stroke-width="2" stroke-linecap="round"/>`;
}
function keeperSheet(name, pal) {
  const dirs = ["up", "left", "down", "right"];
  let defs = "", frames = [];
  dirs.forEach((d, r) => {
    for (let i = 0; i < 9; i++) {
      const u = `r${r}${i}`;
      const res = robot(d, i === 0 ? 0 : ((i - 1) / 8) * Math.PI * 2, i > 0, pal, u);
      defs += res.defs; frames.push(`<g transform="translate(64 124) scale(0.9) translate(-64 -124)">${res.body}</g>`);
    }
  });
  return job(`assets/sheet/${name}.png`, 128 * 9, 128 * 4, sheet(frames, 128, 128, 9), defs);
}
function keeperThumb(name, pal) {
  const r = robot("down", 0, false, pal, "t");
  return job(`assets/ui/${name}_thumb.png`, 128, 128, r.body, r.defs);
}
const KEEPERS = { keeper: { body: "#eef2ff", accent: "#3fe0e8" }, keeper_amber: { body: "#fff1df", accent: "#ffad3b" } };

/* ---------------- Ground: metal deck panels (tileable 512) ---------------- */
function ground() {
  const R = rng(7), S = 512, P = 128;
  let g = `<rect width="${S}" height="${S}" fill="#141c43"/>`;
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
    const v = R(), col = mix("#172150", "#1b2658", v);
    g += `<rect x="${x * P + 2}" y="${y * P + 2}" width="${P - 4}" height="${P - 4}" rx="10" fill="${col}"/>`;
    g += `<rect x="${x * P + 2}" y="${y * P + 2}" width="${P - 4}" height="${P - 4}" rx="10" fill="none" stroke="#24316b" stroke-width="2" opacity=".7"/>`;
    g += `<path d="M${x * P + 10} ${y * P + P - 4} L${x * P + P - 10} ${y * P + P - 4}" stroke="#0c1233" stroke-width="3" opacity=".8"/>`;
    [[12, 12], [P - 12, 12], [12, P - 12], [P - 12, P - 12]].forEach(([a, b]) => { g += `<circle cx="${x * P + a}" cy="${y * P + b}" r="3" fill="#2a3876"/><circle cx="${x * P + a - 0.8}" cy="${y * P + b - 0.8}" r="1.2" fill="#3c4d96"/>`; });
    const k = R();
    if (k < 0.18) g += `<g opacity=".8">${[0, 1, 2, 3].map((i) => `<rect x="${x * P + 40}" y="${y * P + 44 + i * 11}" width="48" height="5" rx="2.5" fill="#0e1538"/>`).join("")}</g>`;
    else if (k < 0.3) g += `<circle cx="${x * P + 64}" cy="${y * P + 64}" r="9" fill="#0f1640"/><circle cx="${x * P + 64}" cy="${y * P + 64}" r="4" fill="#3fe0e8" opacity=".55"/>`;
    else if (k < 0.4) g += `<path d="M${x * P + 30} ${y * P + 64} H${x * P + 98}" stroke="#22306a" stroke-width="4" stroke-linecap="round"/>`;
  }
  for (let i = 0; i < 40; i++) { const x = R() * S, y = R() * S, r = R() * 1.3 + 0.3; g += `<circle cx="${x}" cy="${y}" r="${r}" fill="#9fb3ff" opacity="${0.15 + R() * 0.3}"/>`; }
  return job("assets/img/ground.png", S, S, g);
}

/* ---------------- Nursery mat (zone floor, drawn at 1.5× the zone rect) ---------------- */
function penFloor(w, h) {
  const W = w * 1.5, H = h * 1.5, r = 60;
  const defs = rad("pf", [[0, "#2d5f8f"], [0.6, "#21477a"], [1, "#1a3463"]], 0.5, 0.45, 0.75) + glow("pg", 8) +
    `<pattern id="hex" width="60" height="52" patternUnits="userSpaceOnUse"><path d="M15 0 L45 0 L60 26 L45 52 L15 52 L0 26 Z" fill="none" stroke="#5fd8ff" stroke-width="1.6" opacity=".16"/></pattern>` +
    rad("spot", [[0, "#7ff3ff", 0.22], [1, "#7ff3ff", 0]]);
  let g = `<rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="${r}" fill="url(#pf)"/>`;
  g += `<rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="${r}" fill="url(#hex)"/>`;
  [[0.3, 0.35], [0.7, 0.6], [0.45, 0.78]].forEach(([a, b]) => { g += `<ellipse cx="${W * a}" cy="${H * b}" rx="${W * 0.2}" ry="${H * 0.16}" fill="url(#spot)"/>`; });
  g += `<rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="${r}" fill="none" stroke="#3fe0e8" stroke-width="7" opacity=".55" filter="url(#pg)"/>`;
  g += `<rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="${r - 10}" fill="none" stroke="#a8f6ff" stroke-width="2" opacity=".35" stroke-dasharray="14 12"/>`;
  return job("assets/img/pen_floor.png", W, H, g, defs);
}

/* ---------------- Force-field fence (3 frames of 80×80, drawn at scale .5) ---------------- */
function fence() {
  const defs = glow("fg", 3) + lin("fp", [[0, "#cfd8ff"], [1, "#6c78b8"]], 0, 0, 1, 0);
  const pylon = (x, y, big) => `<rect x="${x - (big ? 8 : 6)}" y="${y - (big ? 34 : 26)}" width="${big ? 16 : 12}" height="${big ? 36 : 28}" rx="${big ? 7 : 6}" fill="url(#fp)" stroke="${INK}" stroke-width="3"/>
    <circle cx="${x}" cy="${y - (big ? 34 : 26)}" r="${big ? 7 : 5.5}" fill="#3fe0e8" stroke="${INK}" stroke-width="2.5" filter="url(#fg)"/>`;
  const beamH = `<rect x="0" y="46" width="80" height="6" rx="3" fill="#3fe0e8" opacity=".45" filter="url(#fg)"/><rect x="0" y="47.5" width="80" height="3" fill="#c8fbff" opacity=".9"/>`;
  const beamV = `<rect x="37" y="0" width="6" height="80" rx="3" fill="#3fe0e8" opacity=".4" filter="url(#fg)"/><rect x="38.5" y="0" width="3" height="80" fill="#c8fbff" opacity=".8"/>`;
  const f0 = beamH + pylon(40, 58);
  const f1 = beamV + pylon(40, 58);
  const f2 = pylon(40, 60, true);
  return job("assets/sheet/fence.png", 240, 80, sheet([f0, f1, f2], 80, 80, 3), defs);
}

/* ---------------- Recharge pod (station) ---------------- */
function pod() {
  const W = 240, H = 210;
  const defs = lin("pm", [[0, "#5a67a8"], [1, "#2a3270"]]) + rad("pd", [[0, "#ffffff", 0.75], [0.5, "#b8f6ff", 0.35], [1, "#57d6ff", 0.25]], 0.4, 0.3, 0.8) +
    rad("pc", [[0, "#ffd6f0"], [1, "#d58ac9"]], 0.5, 0.35, 0.7) + glow("pg2", 4) + rad("halo", [[0, "#3fe0e8", 0.45], [1, "#3fe0e8", 0]]);
  let g = `<ellipse cx="120" cy="178" rx="112" ry="30" fill="url(#halo)"/>`;
  g += `<ellipse cx="120" cy="170" rx="98" ry="26" fill="#1c2257" stroke="${INK}" stroke-width="4"/>`;
  g += `<path d="M22 152 Q22 176 120 182 Q218 176 218 152 L218 140 L22 140 Z" fill="url(#pm)" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
  g += `<ellipse cx="120" cy="140" rx="98" ry="26" fill="#3a4790" stroke="${INK}" stroke-width="4"/>`;
  g += `<ellipse cx="120" cy="140" rx="84" ry="19" fill="none" stroke="#3fe0e8" stroke-width="4" filter="url(#pg2)"/>`;
  g += `<ellipse cx="120" cy="134" rx="62" ry="15" fill="url(#pc)" stroke="${INK}" stroke-width="3"/>`;
  g += `<ellipse cx="90" cy="128" rx="16" ry="7" fill="#fff" opacity=".9"/>`;
  g += `<path d="M30 140 Q30 40 120 34 Q210 40 210 140" fill="url(#pd)" stroke="#c9f8ff" stroke-width="3" opacity=".95"/>`;
  g += `<path d="M30 140 Q30 40 120 34 Q210 40 210 140" fill="none" stroke="${INK}" stroke-width="4" opacity=".9"/>`;
  g += `<path d="M58 110 Q60 60 110 50" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity=".75"/>`;
  g += `<path d="M126 74 a20 20 0 1 0 22 22 a16 16 0 1 1 -22 -22 Z" fill="#fff4b8" stroke="${INK}" stroke-width="2.5" filter="url(#pg2)"/>`;
  [[166, 70], [152, 104], [84, 92]].forEach(([x, y], i) => { g += `<path d="${star(x, y, 7 - i, 2.8 - i * 0.4, 4)}" fill="#fff6c8"/>`; });
  [60, 120, 180].forEach((x) => { g += `<circle cx="${x}" cy="${168 + (x === 120 ? 4 : 0)}" r="4" fill="#3fe0e8" filter="url(#pg2)"/>`; });
  return job("assets/img/pod_rest.png", W, H, g, defs);
}

/* ---------------- Scenery ---------------- */
function crystal(file, c1, c2) {
  const W = 170, H = 190;
  const defs = lin("cA", [[0, shade(c1, 0.55)], [0.5, c1], [1, shade(c2, -0.2)]], 0, 0, 1, 1) + lin("cB", [[0, shade(c2, 0.4)], [1, shade(c2, -0.35)]], 1, 0, 0, 1) +
    rad("cH", [[0, c1, 0.55], [1, c1, 0]]) + glow("cg", 4);
  const shard = (x, base, h, w, lean, fill) => {
    const tx = x + lean, top = base - h;
    return `<path d="M${x - w} ${base} L${x - w * 0.9} ${top + h * 0.28} L${tx} ${top} L${x + w * 0.9} ${top + h * 0.28} L${x + w} ${base} Z" fill="${fill}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M${tx} ${top} L${x - w * 0.15} ${base}" stroke="#ffffff" stroke-width="2" opacity=".5"/>
      <path d="M${x - w * 0.9} ${top + h * 0.28} L${tx} ${top} L${x + w * 0.1} ${top + h * 0.3} Z" fill="#ffffff" opacity=".35"/>`;
  };
  let g = `<ellipse cx="85" cy="150" rx="78" ry="44" fill="url(#cH)"/>`;
  g += `<ellipse cx="85" cy="176" rx="58" ry="10" fill="#0b1030" opacity=".45"/>`;
  g += `<path d="M30 176 Q40 160 85 158 Q130 160 140 176 Z" fill="#3a4790" stroke="${INK}" stroke-width="3.5"/>`;
  g += shard(52, 172, 70, 15, -10, "url(#cB)") + shard(120, 172, 80, 16, 12, "url(#cB)");
  g += shard(86, 174, 132, 24, 2, "url(#cA)");
  g += shard(66, 176, 44, 11, -4, "url(#cA)") + shard(104, 176, 50, 12, 6, "url(#cA)");
  [[60, 40], [128, 70], [40, 100]].forEach(([x, y], i) => { g += `<path d="${star(x, y, 8 - i * 2, 3 - i * 0.6, 4)}" fill="#ffffff" filter="url(#cg)"/>`; });
  return job(`assets/img/${file}.png`, W, H, g, defs);
}
function alienPlant() {
  const W = 170, H = 210, c = "#7cf0c0", bulb = "#ff7ad9";
  const defs = rad("bb", [[0, "#ffffff"], [0.4, shade(bulb, 0.3)], [1, bulb]], 0.4, 0.35, 0.7) + glow("bg", 4) +
    lin("st", [[0, "#5fd6a8"], [1, "#2f8f7a"]]) + rad("bh", [[0, bulb, 0.45], [1, bulb, 0]]);
  let g = `<ellipse cx="85" cy="90" rx="80" ry="80" fill="url(#bh)"/>`;
  g += `<ellipse cx="85" cy="194" rx="46" ry="8" fill="#0b1030" opacity=".45"/>`;
  const stem = (x0, x1, y1) => `<path d="M${x0} 192 Q${(x0 + x1) / 2 + (x1 - x0) * 0.3} ${(192 + y1) / 2} ${x1} ${y1}" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M${x0} 192 Q${(x0 + x1) / 2 + (x1 - x0) * 0.3} ${(192 + y1) / 2} ${x1} ${y1}" fill="none" stroke="url(#st)" stroke-width="6.5" stroke-linecap="round"/>`;
  const b = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#bb)" stroke="${INK}" stroke-width="3.5" filter="url(#bg)"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.25}" fill="#fff" opacity=".9"/>`;
  g += stem(80, 40, 88) + stem(88, 128, 70) + stem(84, 86, 40);
  g += `<path d="M60 192 Q40 150 22 160 Q40 172 60 192 Z M110 192 Q130 150 150 158 Q130 172 110 192 Z" fill="${c}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>`;
  g += b(40, 82, 15) + b(128, 64, 17) + b(86, 34, 20);
  return job("assets/img/alienplant.png", W, H, g, defs);
}
function orbLamp() {
  const W = 140, H = 190;
  const defs = rad("ol", [[0, "#ffffff"], [0.45, "#fff3a8"], [1, "#ffb84a"]], 0.4, 0.35, 0.7) + glow("og", 6) + lin("op", [[0, "#8592d6"], [1, "#3b4588"]], 0, 0, 1, 0);
  let g = `<ellipse cx="70" cy="180" rx="34" ry="7" fill="#0b1030" opacity=".45"/>`;
  g += `<path d="M48 178 Q70 166 92 178 Z" fill="url(#op)" stroke="${INK}" stroke-width="3.5"/>`;
  g += `<rect x="64" y="70" width="12" height="104" rx="6" fill="url(#op)" stroke="${INK}" stroke-width="3.5"/>`;
  g += `<circle cx="70" cy="52" r="34" fill="url(#ol)" stroke="${INK}" stroke-width="3.5" filter="url(#og)"/>`;
  g += `<path d="M50 40 Q56 26 70 24" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85"/>`;
  return job("assets/img/orblamp.png", W, H, g, defs);
}
function starBall() {
  const W = 100, H = 100;
  const defs = rad("sb", [[0, "#ffffff"], [0.5, "#a8e6ff"], [1, "#5b7cff"]], 0.38, 0.32, 0.75);
  let g = `<ellipse cx="50" cy="90" rx="30" ry="6" fill="#0b1030" opacity=".45"/>`;
  g += `<circle cx="50" cy="54" r="34" fill="url(#sb)" stroke="${INK}" stroke-width="3.5"/>`;
  g += `<path d="${star(50, 56, 17, 7)}" fill="#ffd24a" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
  g += `<path d="M24 46 Q30 30 44 26" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
  return job("assets/img/starball.png", W, H, g, defs);
}
function fountain() {
  const W = 220, H = 210;
  const defs = lin("fb", [[0, "#6c79c2"], [1, "#2c3577"]]) + rad("fw", [[0, "#ffffff"], [0.5, "#9ff7ff"], [1, "#3fb5e8"]], 0.5, 0.4, 0.7) + glow("fgl", 5) + rad("fh", [[0, "#ff5db1", 0.35], [1, "#ff5db1", 0]]);
  let g = `<ellipse cx="110" cy="120" rx="108" ry="90" fill="url(#fh)"/>`;
  g += `<ellipse cx="110" cy="196" rx="84" ry="10" fill="#0b1030" opacity=".45"/>`;
  g += `<path d="M30 160 Q30 194 110 196 Q190 194 190 160 Z" fill="url(#fb)" stroke="${INK}" stroke-width="4"/>`;
  g += `<ellipse cx="110" cy="160" rx="80" ry="22" fill="#3a4790" stroke="${INK}" stroke-width="4"/>`;
  g += `<ellipse cx="110" cy="160" rx="66" ry="15" fill="url(#fw)" opacity=".9"/>`;
  g += `<rect x="102" y="100" width="16" height="60" rx="6" fill="url(#fb)" stroke="${INK}" stroke-width="3.5"/>`;
  g += `<path d="M110 104 Q70 70 56 150 M110 104 Q150 70 164 150 M110 104 Q110 40 110 30" fill="none" stroke="#9ff7ff" stroke-width="7" stroke-linecap="round" opacity=".85" filter="url(#fgl)"/>`;
  g += `<circle cx="110" cy="30" r="13" fill="#ff8fd0" stroke="${INK}" stroke-width="3" filter="url(#fgl)"/>`;
  [[70, 60], [150, 52], [134, 120], [82, 122]].forEach(([x, y], i) => { g += `<path d="${star(x, y, 7 - (i % 2) * 2, 2.6, 4)}" fill="#fff6c8" filter="url(#fgl)"/>`; });
  return job("assets/img/fountain.png", W, H, g, defs);
}

/* ---------------- Close-up: a big critter face on a starfield ---------------- */
function starfield(W, H, seed, n = 160) {
  const R = rng(seed);
  let g = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  g += `<ellipse cx="${W * 0.2}" cy="${H * 0.18}" rx="${W * 0.5}" ry="${H * 0.2}" fill="url(#neb1)"/>`;
  g += `<ellipse cx="${W * 0.85}" cy="${H * 0.85}" rx="${W * 0.55}" ry="${H * 0.22}" fill="url(#neb2)"/>`;
  for (let i = 0; i < n; i++) { const x = R() * W, y = R() * H, r = R() * 2.2 + 0.4; g += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#fff" opacity="${(0.3 + R() * 0.7).toFixed(2)}"/>`; }
  for (let i = 0; i < Math.round(n / 16); i++) { const x = R() * W, y = R() * H; g += `<path d="${star(x, y, 9 + R() * 6, 2.5, 4)}" fill="#fff" opacity=".85"/>`; }
  return g;
}
function skyDefs() {
  return lin("sky", [[0, "#1b1150"], [0.5, "#121a48"], [1, "#0b1029"]]) +
    rad("neb1", [[0, "#7a3fc0", 0.55], [1, "#7a3fc0", 0]]) + rad("neb2", [[0, "#1f8fb0", 0.5], [1, "#1f8fb0", 0]]);
}
// Close-up geometry: where the 128-px critter() is drawn (scale s, translate tx/ty) in each backdrop.
// Portrait 900x1300 (the original); WIDE 1600x900 for landscape phones: the same face, centred,
// as big as the height allows without clipping (solid art spans local y 3..111, x 22..106;
// its glow halo, 112 local px wide, fills the middle ~55% of the width).
const CLOSEUP = {
  tall: (() => { const W = 900, H = 1300, s = 7.2; return { W, H, s, tx: W / 2 - 64 * s, ty: H * 0.56 - 66 * s }; })(),
  // wide: fits between y 0.17 (antenna balls, below the progress bar of a 2.16:1 phone) and 0.88 (feet)
  wide: (() => { const W = 1600, H = 900, s = 5.9; return { W, H, s, tx: W / 2 - 64 * s, ty: H * 0.525 - 56.875 * s }; })(),
};
// The polish spot areas of the PORTRAIT backdrop (copy of game.config.js, action "polish",
// closeup.spots.area): left cheek, right cheek, forehead, chin — around the big eye.
const TALL_AREAS = [{ x: 0.25, y: 0.45, w: 0.1, h: 0.2 }, { x: 0.65, y: 0.45, w: 0.1, h: 0.2 },
  { x: 0.40, y: 0.385, w: 0.2, h: 0.02 }, { x: 0.40, y: 0.70, w: 0.2, h: 0.03 }];
// The same 4 areas (same order) as fractions of the WIDE backdrop → closeup.wide.area.
function wideAreas() {
  const T = CLOSEUP.tall, Wd = CLOSEUP.wide, r4 = (n) => Math.round(n * 10000) / 10000;
  return TALL_AREAS.map((a) => {
    const lx = (a.x * T.W - T.tx) / T.s, ly = (a.y * T.H - T.ty) / T.s;   // portrait fraction -> critter-local px
    return { x: r4((Wd.tx + lx * Wd.s) / Wd.W), y: r4((Wd.ty + ly * Wd.s) / Wd.H),
      w: r4(a.w * T.W / T.s * Wd.s / Wd.W), h: r4(a.h * T.H / T.s * Wd.s / Wd.H) };
  });
}
// Station details for the wide backdrop's side wings (kept outside the critter's middle band):
// a ringed planet + a distant ring station in the sky, and two curved deck rims with lights.
function stationWings(W, H) {
  let g = "";
  // ringed planet, top-left: back half of the ring, planet, then the front half over it
  const ringArc = (front) => `<path d="M80 215 A150 34 0 0 ${front ? 0 : 1} 380 215" fill="none" stroke="${INK}" stroke-width="15" opacity="${front ? 0.9 : 0.6}"/><path d="M80 215 A150 34 0 0 ${front ? 0 : 1} 380 215" fill="none" stroke="#d9c4ff" stroke-width="8" opacity="${front ? 0.95 : 0.6}"/>`;
  g += `<g transform="rotate(-16 230 215)">${ringArc(false)}</g>`;
  g += `<circle cx="230" cy="215" r="74" fill="url(#wplanet)" stroke="${INK}" stroke-width="5"/>`;
  g += `<path d="M168 196 Q230 176 292 200" fill="none" stroke="#ffffff" stroke-width="6" opacity=".18"/><path d="M164 236 Q230 222 296 240" fill="none" stroke="${INK}" stroke-width="5" opacity=".18"/>`;
  g += `<circle cx="196" cy="186" r="14" fill="#ffffff" opacity=".35"/>`;
  g += `<g transform="rotate(-16 230 215)">${ringArc(true)}</g>`;
  // distant ring station, top-right: hub on a spoke, the ring's front half passes in front of it
  const sArc = (front, col, w) => `<path d="M-96 0 A96 30 0 0 ${front ? 0 : 1} 96 0" fill="none" stroke="${col}" stroke-width="${w}"/>`;
  g += `<g transform="translate(1390 190)">${sArc(false, INK, 15)}${sArc(false, "#6f7fd0", 8)}`;
  g += `<rect x="-7" y="-30" width="14" height="60" rx="5" fill="#5a67a8" stroke="${INK}" stroke-width="4"/>`;
  g += `<circle r="20" fill="url(#wpm)" stroke="${INK}" stroke-width="4.5"/>`;
  g += `${sArc(true, INK, 15)}${sArc(true, "#6f7fd0", 8)}`;
  [-70, -35, 35, 70].forEach((x) => { g += `<circle cx="${x}" cy="${Math.sqrt(1 - (x / 96) ** 2) * 30}" r="4.5" fill="#3fe0e8" filter="url(#wlg)"/>`; });
  g += `<circle cx="0" cy="-36" r="5" fill="#ff8fd0" filter="url(#wlg)"/></g>`;
  // curved deck rims rising from the bottom corners (mirrored), with panel seams and lights
  const rim = (m) => {
    const X = (x) => (m ? W - x : x), d = `M${X(-12)} ${H * 0.62 - 3} Q${X(190)} ${H * 0.7} ${X(434)} ${H + 12} L${X(-12)} ${H + 12} Z`;
    let r = `<path d="${d}" fill="url(#wdeck)" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
    r += `<path d="M${X(0)} ${H * 0.62 + 26} Q${X(176)} ${H * 0.7 + 24} ${X(398)} ${H}" fill="none" stroke="#3fe0e8" stroke-width="5" opacity=".8" filter="url(#wlg)"/>`;
    [[60, 0.72], [150, 0.8], [240, 0.9]].forEach(([x, y]) => { r += `<path d="M${X(x)} ${H * y} L${X(x - 40)} ${H}" stroke="${INK}" stroke-width="3" opacity=".45"/>`; });
    [[34, 0.68], [126, 0.74], [214, 0.82], [296, 0.93]].forEach(([x, y], i) => { r += `<circle cx="${X(x)}" cy="${H * y + 4}" r="${i % 2 ? 6 : 7.5}" fill="${i % 2 ? "#ff8fd0" : "#ffd24a"}" stroke="${INK}" stroke-width="2.5" filter="url(#wlg)"/>`; });
    return r;
  };
  g += rim(false) + rim(true);
  return g;
}
function stationWingDefs() {
  return rad("wplanet", [[0, "#ffc4e6"], [0.55, "#c27ad9"], [1, "#5b3a9e"]], 0.38, 0.32, 0.8) +
    rad("wpm", [[0, "#ffffff"], [0.6, "#a9b6ff"], [1, "#5a67a8"]], 0.4, 0.35, 0.7) +
    lin("wdeck", [[0, "#4a58a8"], [1, "#1f275e"]]) + glow("wlg", 4);
}
function closeup(v, done, wide) {
  const G = wide ? CLOSEUP.wide : CLOSEUP.tall, { W, H, s, tx, ty } = G, c = VARIANTS[v];
  const r = critter({ c, uid: "z", eye: done ? "happy" : "open", look: 0 });
  let g = starfield(W, H, 11, wide ? 230 : 160);
  if (wide) g += stationWings(W, H);
  const gcx = tx + 64 * s, gcy = ty + 56.875 * s;   // wide: glow on the critter centre
  if (done) g += `<circle cx="${gcx}" cy="${wide ? gcy : H * 0.55}" r="${wide ? H * 0.6 : W * 0.62}" fill="url(#doneglow)"/>`;
  g += `<g transform="translate(${tx} ${ty}) scale(${s})">${r.body}</g>`;
  const sparkles = wide ? [[0.31, 0.27], [0.69, 0.25], [0.28, 0.74], [0.72, 0.76], [0.16, 0.52], [0.84, 0.5]]
    : [[0.2, 0.3], [0.8, 0.26], [0.16, 0.7], [0.84, 0.72], [0.5, 0.12]];
  if (done) sparkles.forEach(([a, b], i) => { g += `<path d="${star(W * a, H * b, 34 - (i % 5) * 3, 11, 4)}" fill="#fff6c8" filter="url(#sg)"/>`; });
  const defs = skyDefs() + r.defs + glow("sg", 6) + rad("doneglow", [[0, c, 0.5], [1, c, 0]]) + (wide ? stationWingDefs() : "");
  return job(`assets/img/critter_closeup_${v}${wide ? "_wide" : ""}${done ? "_done" : ""}.png`, W, H, g, defs);
}
// a fluffy cosmic dust bunny (two variants), the polishing sponge, and the "polish me" bubble
function dust(file, col) {
  const R = rng(file.length * 7);
  const defs = rad("dd", [[0, shade(col, 0.35)], [1, shade(col, -0.25)]], 0.4, 0.35, 0.7);
  let g = `<path d="${K.blob(64, 66, 46, 42, 11, 0.16, R)}" fill="url(#dd)" stroke="${shade(col, -0.5)}" stroke-width="4"/>`;
  for (let i = 0; i < 9; i++) { const a = R() * 6.28, d = R() * 28; g += `<circle cx="${64 + Math.cos(a) * d}" cy="${66 + Math.sin(a) * d}" r="${2 + R() * 3}" fill="${shade(col, -0.45)}" opacity=".6"/>`; }
  g += `<circle cx="52" cy="62" r="6" fill="${INK}"/><circle cx="76" cy="62" r="6" fill="${INK}"/><circle cx="50" cy="60" r="2" fill="#fff"/><circle cx="74" cy="60" r="2" fill="#fff"/>`;
  g += `<path d="M56 80 Q64 74 72 80" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
  return job(`assets/img/${file}.png`, 128, 128, g, defs);
}
function cloth() {
  const defs = lin("cl", [[0, "#ffd0ec"], [1, "#ff7ac0"]]) + glow("clg", 3);
  let g = `<g transform="rotate(-18 64 64)"><rect x="22" y="24" width="84" height="64" rx="26" fill="url(#cl)" stroke="${INK}" stroke-width="4"/>`;
  g += `<path d="M30 50 Q64 38 98 50" fill="none" stroke="#fff" stroke-width="5" opacity=".55" stroke-linecap="round"/>`;
  for (let i = 0; i < 6; i++) g += `<circle cx="${36 + i * 11}" cy="${70 + (i % 2) * 6}" r="3" fill="#fff" opacity=".6"/>`;
  g += `<rect x="52" y="86" width="24" height="34" rx="10" fill="#7b86d6" stroke="${INK}" stroke-width="4"/></g>`;
  g += `<path d="${star(100, 22, 12, 4, 4)}" fill="#fff6c8" filter="url(#clg)"/>`;
  return job("assets/img/cloth.png", 128, 128, g, defs);
}
function wantBubble() {
  const defs = glow("wg", 2);
  let g = `<path d="M14 12 H114 Q122 12 122 20 V82 Q122 90 114 90 H74 L64 106 L54 90 H14 Q6 90 6 82 V20 Q6 12 14 12 Z" fill="#ffffff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
  const R = rng(3);
  g += `<path d="${K.blob(64, 52, 26, 22, 9, 0.18, R)}" fill="#a49bb8" stroke="#5b5270" stroke-width="3.5"/>`;
  g += `<circle cx="56" cy="50" r="4" fill="${INK}"/><circle cx="72" cy="50" r="4" fill="${INK}"/><path d="M58 62 Q64 58 70 62" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
  g += `<path d="${star(102, 28, 10, 3.6, 4)}" fill="#ffd24a" filter="url(#wg)"/>`;
  return job("assets/img/want_dust.png", 128, 112, g, defs);
}

/* ---------------- Icons & logo (same critter as in the game) ---------------- */
// App icon (home screen): drawn on a 512 grid, rendered at any size. `safe` < 1 shrinks the
// subject into the central safe zone for Android "maskable" icons (cropped to a circle).
function icon(file, size, safe = 1) {
  const S = 512, r = critter({ c: VARIANTS.aqua, uid: "i", look: 0 });
  const defs = skyDefs() + r.defs + rad("ih", [[0, "#3fe0e8", 0.55], [1, "#3fe0e8", 0]]) + glow("ig", 8) + rad("pl", [[0, "#ff9ed8"], [1, "#b2479a"]], 0.35, 0.3, 0.8);
  let g = `<rect width="${S}" height="${S}" fill="url(#sky)"/>`;
  g += `<ellipse cx="120" cy="90" rx="330" ry="170" fill="url(#neb1)"/><ellipse cx="420" cy="460" rx="300" ry="160" fill="url(#neb2)"/>`;
  const R = rng(5); for (let i = 0; i < 40; i++) g += `<circle cx="${R() * S}" cy="${R() * S}" r="${R() * 2.4 + 0.8}" fill="#fff" opacity="${0.4 + R() * 0.6}"/>`;
  g += `<g transform="translate(400 112) scale(${safe})"><circle r="44" fill="url(#pl)"/><ellipse rx="78" ry="16" fill="none" stroke="#ffd6ef" stroke-width="7" opacity=".85" transform="rotate(-20)"/></g>`;
  g += `<circle cx="256" cy="282" r="${190 * safe}" fill="url(#ih)"/>`;
  // the critter spans x 14..114, y 4..112 of its 128 box: fit it inside ~74% of the icon
  const s = 3.4 * safe;
  g += `<g transform="translate(256 290) scale(${s}) translate(-64 -60)">${r.body}</g>`;
  [[88, 140, 22], [440, 300, 16], [110, 420, 14]].forEach(([x, y, q]) => { g += `<path d="${star(x, y, q * safe, q * 0.33 * safe, 4)}" fill="#fff6c8" filter="url(#ig)"/>`; });
  return Object.assign(job(file, S, S, g, defs), { scale: size / S });
}
function logo() {
  const W = 420, H = 300;
  const a = critter({ c: VARIANTS.aqua, uid: "la", look: 0.3 }), b = critter({ c: VARIANTS.rose, uid: "lb", look: -0.4, sq: 0.06 }), c = critter({ c: VARIANTS.lime, uid: "lc", look: -0.2, sq: -0.04 });
  const defs = a.defs + b.defs + c.defs + glow("lg", 5) + rad("lh", [[0, "#3fe0e8", 0.35], [1, "#3fe0e8", 0]]);
  let g = `<ellipse cx="210" cy="170" rx="200" ry="130" fill="url(#lh)"/>`;
  g += `<g transform="translate(36 70) scale(1.25)">${b.body}</g>`;
  g += `<g transform="translate(224 76) scale(1.2)">${c.body}</g>`;
  g += `<g transform="translate(110 40) scale(1.55)">${a.body}</g>`;
  [[40, 40], [380, 60], [350, 250], [60, 250], [210, 18]].forEach(([x, y], i) => { g += `<path d="${star(x, y, 13 - i, 4, 4)}" fill="#fff6c8" filter="url(#lg)"/>`; });
  return job("assets/img/logo.png", W, H, g, defs);
}


/* ---------------- UI icons (shared kit, Nebula palette) + game icons ---------------- */
const PAL = { ink: "#1d2147", blue: "#3fb8ff", teal: "#3fe0e8", pink: "#ff5db1", purple: "#a97bff", gold: "#ffc93c", green: "#6ee08a" };
function critterIcon() {   // the creature icon: the same critter, framed as an icon
  const r = critter({ c: VARIANTS.aqua, uid: "ci", look: 0 });
  return IK.job("assets/ui/icons/critter.png", `<g transform="translate(64 70) scale(1.05) translate(-64 -66)">${r.body}</g>`, r.defs);
}
function robotIcon() {
  const r = robot("down", 0, false, KEEPERS.keeper, "ri");
  return IK.job("assets/ui/icons/keeper.png", `<g transform="translate(64 64) scale(1.0) translate(-64 -62)">${r.body}</g>`, r.defs);
}
function polishIcon() {   // the polish mitt with a sparkle
  const defs = lin("pm", [[0, "#ffd0ec"], [1, "#ff7ac0"]]);
  let g = `<g transform="rotate(-18 64 70)"><rect x="20" y="30" width="88" height="64" rx="28" fill="url(#pm)" stroke="${INK}" stroke-width="7"/><path d="M32 52 Q64 40 96 52" fill="none" stroke="#fff" stroke-width="6" opacity=".6" stroke-linecap="round"/><rect x="50" y="90" width="28" height="30" rx="10" fill="#7b86d6" stroke="${INK}" stroke-width="7"/></g>`;
  g += `<path d="${star(102, 24, 18, 6, 4)}" fill="#ffd24a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`;
  return IK.job("assets/ui/icons/polish.png", g, defs);
}

/* ---------------- Home splash (portrait, behind the logo + bottom sheet) ---------------- */
function splash() {
  const W = 900, H = 1600, R = rng(77);
  const crit = (v, x, y, s, look, uid, sq) => { const r = critter({ c: VARIANTS[v], uid, look, sq }); return { d: r.defs, g: `<g transform="translate(${x} ${y}) scale(${s}) translate(-64 -66)">${r.body}</g>` }; };
  let defs = skyDefs() + rad("pl", [[0, "#5a4bd0"], [0.6, "#2e2a86"], [1, "#171a52"]], 0.4, 0.2, 0.8) + rad("plh", [[0, "#7ff3ff", 0.5], [1, "#7ff3ff", 0]]) + glow("sg", 6) + rad("ring", [[0, "#ff9ed8", 0.0], [0.85, "#ff9ed8", 0.0], [0.92, "#ff9ed8", 0.45], [1, "#ff9ed8", 0]]);
  let g = starfield(W, H, 3);
  g += `<circle cx="760" cy="300" r="110" fill="#ff8fd0" opacity=".9"/><circle cx="740" cy="280" r="110" fill="url(#pl)" opacity=".35"/><ellipse cx="760" cy="300" rx="190" ry="40" fill="none" stroke="#ffd6ef" stroke-width="10" opacity=".7" transform="rotate(-18 760 300)"/>`;
  g += `<ellipse cx="450" cy="${H + 420}" rx="900" ry="760" fill="url(#plh)"/>`;
  g += `<ellipse cx="450" cy="${H + 440}" rx="820" ry="700" fill="url(#pl)"/>`;
  for (let i = 0; i < 12; i++) g += `<ellipse cx="${80 + R() * 740}" cy="${H - 300 + R() * 260}" rx="${30 + R() * 60}" ry="${8 + R() * 14}" fill="#1a1d5a" opacity=".55"/>`;
  [[120, 520, 1], [800, 760, 0.8], [240, 900, 0.7], [680, 470, 0.6]].forEach(([x, y, s]) => { g += `<path d="${star(x, y, 18 * s, 6 * s, 4)}" fill="#fff6c8" filter="url(#sg)"/>`; });
  const cs = [crit("violet", 560, 760, 0.95, -0.2, "s3", 0.0), crit("amber", 330, 800, 0.9, 0.3, "s4", 0.04), crit("rose", 215, 900, 1.3, 0.4, "s1", 0.05), crit("lime", 690, 880, 1.2, -0.4, "s2", -0.03)];   // in the visible band between title and sheet
  cs.forEach((c) => { defs += c.d; g += c.g; });
  return K.job("assets/img/splash.png", W, H, g, defs);
}
const stk = (w) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

module.exports = () => K.hidpi(build([]), HIDPI);
// Resolution per family of images (see svg-kit.hidpi): world sprites x2 (config `res: 2`),
// menu thumbnails x6, icons x2, full-screen backdrops x2.
const HIDPI = [
  [/favicon|apple-touch|icon-192|icon-maskable/, { keep: true }],          // PWA icons: PNG at their own scale
  [/closeup|splash/, { scale: 2, type: "webp", ext: ".webp" }],
  [/logo/, { scale: 2.5, type: "webp", ext: ".webp" }],
  [/ui\/icons\//, { scale: 2, type: "webp", ext: ".webp" }],
  [/assets\/ui\//, { scale: 6, type: "webp", ext: ".webp" }],
  [/dust|cloth/, { scale: 3, type: "webp", ext: ".webp" }],
  [/pen_floor/, { scale: 1.4, type: "webp", ext: ".webp" }],
  [/assets\/(img|sheet)\//, { scale: 2, type: "webp", ext: ".webp" }],
];
function build(jobs) {
  Object.keys(VARIANTS).forEach((v) => { jobs.push(critterSheet(v), critterThumb(v), closeup(v, false), closeup(v, true)); });
  Object.entries(KEEPERS).forEach(([n, p]) => jobs.push(keeperSheet(n, p), keeperThumb(n, p)));
  jobs.push(ground(), penFloor(600, 470), fence(), pod(),
    crystal("crystal", "#ff8fd8", "#a45bff"), crystal("crystal_b", "#8ff6ff", "#3a7cff"),
    alienPlant(), orbLamp(), starBall(), fountain(),
    dust("dust", "#b7a9cf"), dust("dust_b", "#9fb0d8"), cloth(), wantBubble(),
    icon("assets/favicon.png", 512), icon("assets/apple-touch-icon.png", 180), icon("assets/icon-192.png", 192), icon("assets/icon-maskable.png", 512, 0.78), logo(), splash(),
    critterIcon(), robotIcon(), polishIcon(),
    ...IK.jobs(PAL, ["star", "heart", "heartEmpty", "sound", "soundOff", "help", "avatar", "goals", "close", "play", "resume", "check", "calendar", "gift", "hand", "sparkle", "moon", "refresh", "arrow", "trophy", "palette", "ball", "battery", "smile", "meh", "sad", "joy", "home", "lock"]));
  return jobs;
}
