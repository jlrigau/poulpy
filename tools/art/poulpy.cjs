/*
 * Poulpy — all the game's art as parametric SVG (rendered to WebP/PNG).
 *   node .claude/skills/_shared/render-svg.cjs tools/art/poulpy.cjs [--only poulpy,turtle]
 * One source of truth per character: Poulpy (the little octopus) is always drawn by `octo()` /
 * `octoBack()` (race), the sea turtles by
 * `turtle()` (side view) / `turtleFront()` (close-up, icons) / `turtleBack()` (race), so the walk
 * sheets, menu thumbnails, close-up, race sprites, splash and app icon never drift apart.
 */
const K = require("../../.claude/skills/_shared/svg-kit.cjs");
const IK = require("../../.claude/skills/_shared/icon-kit.cjs");
const { sheet, job, shade, mix, lin, rad, glow, blur, rng, star } = K;

const INK = "#173a5e";                  // outline colour (deep sea navy)
const f2 = (n) => (+n).toFixed(2);
const stk = (w) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const SEA = { deep: "#0b3a66", mid: "#1670a8", light: "#3fb7d9", foam: "#d8f6ff" };
const SAND = "#ecd9a2";

/* ======================= Poulpy, the little octopus ======================= */
const OCTO = { body: "#ff8fa3", bodyD: "#e0567a", light: "#ffe0e7", spot: "#ffc4d1", cheek: "#ff4f7b" };
// one tentacle as a filled, tapering shape: from (x0,y0) via (cx,cy) to (x1,y1), then a small curl at the
// tip turning towards `curl` (-1 left / +1 right). Width goes from w at the root to ~0.3w at the tip.
function tentacle(x0, y0, cx, cy, x1, y1, curl, w, col) {
  const pts = [];
  for (let i = 0; i <= 14; i++) { const t = i / 14, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t; pts.push([a * x0 + b * cx + c * x1, a * y0 + b * cy + c * y1]); }
  // the curl: continue from the end direction and turn ~240° on a radius shrinking to 0
  const [px, py] = pts[pts.length - 2]; let ang = Math.atan2(y1 - py, x1 - px), R = w * 0.55, x = x1, y = y1;
  for (let i = 0; i < 8; i++) { ang += curl * 0.52; R *= 0.92; x += Math.cos(ang) * R; y += Math.sin(ang) * R; pts.push([x, y]); }
  const n = pts.length, L = [], Rr = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[Math.min(n - 1, i + 1)], dx = p1[0] - p0[0], dy = p1[1] - p0[1], d = Math.hypot(dx, dy) || 1;
    const hw = (w / 2) * (1 - 0.6 * i / (n - 1)), nx = -dy / d, ny = dx / d;
    L.push([pts[i][0] + nx * hw, pts[i][1] + ny * hw]); Rr.push([pts[i][0] - nx * hw, pts[i][1] - ny * hw]);
  }
  const tip = pts[n - 1], ring = L.concat([tip], Rr.reverse());
  const d = "M" + ring.map((q) => f2(q[0]) + " " + f2(q[1])).join(" L") + " Z";
  return `<path d="${d}" fill="${col}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`;
}
const octoDefs = (u) => rad(`${u}b`, [[0, "#fff2f5"], [0.45, OCTO.body], [1, OCTO.bodyD]], 0.4, 0.28, 0.8);
// the spotty mantle (head) centred on (cx, cy)
function mantle(u, cx, cy, rx, ry, rot) {
  let g = `<g transform="rotate(${rot || 0} ${cx} ${cy})"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${u}b)" ${stk(3.5)}/>`;
  [[-0.42, -0.5, 0.13], [0.3, -0.62, 0.16], [0.6, -0.15, 0.1], [-0.12, -0.78, 0.08]].forEach(([a, b, r]) => {
    g += `<ellipse cx="${f2(cx + a * rx)}" cy="${f2(cy + b * ry)}" rx="${f2(r * rx)}" ry="${f2(r * rx * 0.85)}" fill="${OCTO.spot}"/>`; });
  g += `<path d="M${f2(cx - rx * 0.72)} ${f2(cy - ry * 0.18)} Q${f2(cx - rx * 0.6)} ${f2(cy - ry * 0.72)} ${f2(cx - rx * 0.12)} ${f2(cy - ry * 0.86)}" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" opacity=".75"/>`;
  return g + `</g>`;
}
function octoEye(x, y, s, happy, look) {
  if (happy) return `<path d="M${x - 7 * s} ${y + 2 * s} Q${x} ${y - 8 * s} ${x + 7 * s} ${y + 2 * s}" fill="none" ${stk(3.5)}/>`;
  const lx = (look || 0) * 2 * s;
  return `<ellipse cx="${x}" cy="${y}" rx="${8.5 * s}" ry="${10 * s}" fill="#fff" ${stk(2.6)}/>` +
    `<ellipse cx="${x + lx}" cy="${y + 1.5 * s}" rx="${5.6 * s}" ry="${6.8 * s}" fill="${INK}"/>` +
    `<circle cx="${x + lx - 2 * s}" cy="${y - 1.6 * s}" r="${2.3 * s}" fill="#fff"/><circle cx="${x + lx + 2 * s}" cy="${y + 4 * s}" r="${1 * s}" fill="#fff" opacity=".8"/>`;
}
// dir: "down" | "left" | "up" (right = flipped left). opt: { seated, happy }
function octo(dir, phase, moving, u, opt) {
  opt = opt || {};
  const P = OCTO, side = dir === "left", seated = !!opt.seated;
  const bob = moving ? -Math.abs(Math.sin(phase)) * 3 : 0;
  const wv = (k) => (moving ? Math.sin(phase + k * 1.3) : 0);
  const defs = octoDefs(u);
  let g = `<g transform="translate(0 ${f2(bob)})">`;
  const W = 12, C = P.body, CD = shade(P.body, -0.1);
  if (seated && side) {
    // sitting on the shell: two tentacles draped down the front, two down the back, curled tips
    // sitting on the shell: tentacles draped along the dome, front pair down the front, back pair down the back
    g += tentacle(76, 88, 108, 88, 110, 114, 1, W + 1, CD) + tentacle(54, 88, 26, 90, 26, 114, -1, W + 1, CD);
    g += tentacle(72, 92, 100, 96, 98, 118, 1, W + 1, C) + tentacle(58, 92, 34, 98, 38, 118, -1, W + 1, C);
    g += tentacle(66, 94, 70, 106, 76, 118, 1, W, C);
    g += mantle(u, 66, 64, 31, 29, 8);
    g += octoEye(56, 70, 1, opt.happy, -1) + `<ellipse cx="46" cy="81" rx="5" ry="3" fill="${P.cheek}" opacity=".45"/>`;
    g += `<path d="M44 82 Q48 85 52 83" fill="none" ${stk(2.6)}/>`;
  } else if (side) {
    // walking to the left: tentacles reach forward and trail behind, alternating
    // far tentacles (dark) first, then the near ones; roots staggered, lengths varied
    const far = [[56, 76, -1, 36, 98], [72, 76, 1, 92, 104], [84, 78, 1, 112, 96]];
    const near = [[50, 82, -1, 28, 104], [60, 84, -1, 44, 110], [70, 84, 1, 66, 112], [78, 82, 1, 88, 110], [86, 80, 1, 106, 104]];
    far.forEach(([x0, y0, c, x1, y1], k) => { g += tentacle(x0, y0, (x0 + x1) / 2, y0 + 16, x1 + wv(k + 3) * 6, y1 - Math.max(0, wv(k + 4)) * 5, c, W - 1, CD); });
    near.forEach(([x0, y0, c, x1, y1], k) => { g += tentacle(x0, y0, (x0 + x1) / 2, y0 + 16, x1 + wv(k) * 6, y1 - Math.max(0, wv(k + 1)) * 5, c, W, C); });
    g += mantle(u, 68, 50, 32, 30, 10);
    g += octoEye(58, 60, 1, opt.happy, -1) + `<ellipse cx="48" cy="71" rx="5" ry="3" fill="${P.cheek}" opacity=".45"/>`;
    g += `<path d="M46 73 Q50 76 54 74" fill="none" ${stk(2.6)}/>`;
  } else {
    // front / back: six tentacles fanning out under the mantle
    g += tentacle(50, 76, 40, 90, 32, 96, -1, W - 1, CD) + tentacle(78, 76, 88, 90, 96, 96, 1, W - 1, CD);
    const t = [[44, 22, 108], [52, 34, 116], [60, 52, 120], [68, 76, 120], [76, 94, 116], [84, 106, 108]];
    t.forEach(([x0, x1, y1], k) => {
      const c = x1 < 64 ? -1 : 1, dx = wv(k) * 4, dy = Math.max(0, wv(k + 2)) * -5;
      g += tentacle(x0, 78, (x0 + x1) / 2, 100, x1 + dx, y1 + dy - 8, c, W, (k === 0 || k === 5) ? CD : C);
    });
    g += mantle(u, 64, 52, 34, 32, 0);
    if (dir === "down") {
      g += octoEye(51, 60, 1, opt.happy) + octoEye(77, 60, 1, opt.happy);
      g += `<ellipse cx="39" cy="72" rx="5.5" ry="3.2" fill="${P.cheek}" opacity=".45"/><ellipse cx="89" cy="72" rx="5.5" ry="3.2" fill="${P.cheek}" opacity=".45"/>`;
      g += `<path d="M58 72 Q64 78 70 72" fill="none" ${stk(2.8)}/>`;
    } else {
      // back of the head: just more spots, no marks at eye height (they read as a face)
      g += `<ellipse cx="54" cy="64" rx="5" ry="4" fill="${P.spot}"/><ellipse cx="76" cy="68" rx="4" ry="3.4" fill="${P.spot}"/>`;
    }
  }
  return { defs, body: g + `</g>` };
}
function octoFrame(dir, i, u) {
  const moving = i > 0, ph = moving ? ((i - 1) / 8) * Math.PI * 2 : 0;
  const r = octo(dir === "right" ? "left" : dir, ph, moving, u);
  const body = `<g transform="translate(64 121) scale(0.84) translate(-64 -127)">${r.body}</g>`;
  return { defs: r.defs, body: dir === "right" ? `<g transform="translate(128 0) scale(-1 1)">${body}</g>` : body };
}
function octoSheet() {
  let defs = "", frames = [];
  ["up", "left", "down", "right"].forEach((d, r) => { for (let i = 0; i < 9; i++) { const f = octoFrame(d, i, `p${r}${i}`); defs += f.defs; frames.push(f.body); } });
  return job("assets/sheet/poulpy.png", 128 * 9, 128 * 4, sheet(frames, 128, 128, 9), defs);
}
function octoThumb() { const r = octo("down", 0, false, "pt"); return job("assets/ui/poulpy_thumb.png", 128, 128, `<g transform="translate(64 66) scale(1.04) translate(-64 -70)">${r.body}</g>`, r.defs); }
function octoRide() {   // riding pose (side view facing left, one frame)
  const r = octo("left", 0, false, "pr", { seated: true });
  return job("assets/sheet/poulpy_ride.png", 128, 128, `<g transform="translate(64 120) scale(0.78) translate(-64 -128)">${r.body}</g>`, r.defs);
}

/* ======================= Sea turtle (the mount) ======================= */
const TURTLES = {
  vert: { skin: "#8fdc8a", shell: "#3fa05e", rim: "#c8e98a" },
  bleu: { skin: "#8fd6ee", shell: "#2f7fc0", rim: "#bfe6ff" },
  rose: { skin: "#ffc0cf", shell: "#e0608c", rim: "#ffd6a6" },
};
// Side view facing LEFT (the engine flips it for right). o: { v, ph (paddle phase), happy, uid }
function turtle(o) {
  const T = TURTLES[o.v], u = o.uid || "t", ph = o.ph || 0;
  const sk = T.skin, skD = shade(T.skin, -0.22), sh = T.shell, shD = shade(T.shell, -0.28);
  const defs = rad(`${u}s`, [[0, shade(sh, 0.45)], [0.6, sh], [1, shD]], 0.42, 0.25, 0.85) +
    rad(`${u}k`, [[0, "#ffffff"], [0.4, sk], [1, skD]], 0.4, 0.35, 0.8) + lin(`${u}p`, [[0, "#fff6d6"], [1, "#efd9a0"]]);
  const fl = Math.sin(ph) * 9, fl2 = Math.sin(ph + Math.PI) * 18, bob = Math.sin(ph * 2) * 1.5;
  const flipper = (x, y, ang, len, w, col) => `<path d="M${x} ${y} Q${x - len * 0.35} ${y + w} ${x - len} ${y + w * 0.7} Q${x - len * 0.75} ${y - w * 0.15} ${x} ${y - w * 0.6} Z" fill="${col}" ${stk(3)} transform="rotate(${f2(ang)} ${x} ${y})"/>`;
  let g = `<g transform="translate(0 ${f2(bob)})">`;
  // far flippers (darker, behind)
  g += flipper(48, 88, -30 - fl2, 30, 12, skD) + flipper(98, 90, 30 + fl2 * 0.6, 22, 9, skD);
  // tail
  g += `<path d="M104 86 Q120 88 118 94 Q110 96 102 92 Z" fill="${sk}" ${stk(3)}/>`;
  // neck + head (connected to the body under the shell's front rim)
  g += `<path d="M44 80 Q30 76 22 74 L22 92 Q34 94 46 92 Z" fill="url(#${u}k)" ${stk(3)}/>`;
  g += `<ellipse cx="22" cy="79" rx="19" ry="17" fill="url(#${u}k)" ${stk(3.2)}/>`;
  g += o.happy ? `<path d="M9 76 Q14 69 19 76" fill="none" ${stk(3.2)}/>`
    : `<ellipse cx="13" cy="75" rx="5" ry="6" fill="${INK}"/><circle cx="11.5" cy="72.8" r="2" fill="#fff"/>`;
  g += `<ellipse cx="17" cy="86" rx="4.5" ry="2.8" fill="#ff8fa8" opacity=".6"/>`;
  g += `<path d="M7 86 Q12 91 18 88" fill="none" ${stk(2.6)}/>`;
  // belly (plastron) + shell
  g += `<ellipse cx="72" cy="89" rx="38" ry="9" fill="url(#${u}p)" ${stk(3)}/>`;
  g += `<path d="M30 86 Q30 40 72 36 Q114 40 114 86 Z" fill="url(#${u}s)" ${stk(3.5)}/>`;
  // scutes: a central row of rounded hexagons + side plates
  const hex = (cx, cy, r) => { let d = ""; for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; d += (i ? "L" : "M") + f2(cx + Math.cos(a) * r * 1.15) + " " + f2(cy + Math.sin(a) * r * 0.82); } return d + "Z"; };
  g += `<path d="${hex(72, 58, 13)}" fill="${shade(sh, 0.18)}" stroke="${shD}" stroke-width="2.5" stroke-linejoin="round"/>`;
  g += `<path d="${hex(46, 68, 10)}" fill="${shade(sh, 0.1)}" stroke="${shD}" stroke-width="2.5" stroke-linejoin="round"/>`;
  g += `<path d="${hex(98, 68, 10)}" fill="${shade(sh, 0.1)}" stroke="${shD}" stroke-width="2.5" stroke-linejoin="round"/>`;
  // rim band (marginal scutes)
  g += `<path d="M31 80 Q72 92 113 80 L114 86 Q72 98 30 86 Z" fill="${T.rim}" ${stk(2.8)}/>`;
  [42, 56, 72, 88, 102].forEach((x) => { g += `<path d="M${x} ${83 + (x === 72 ? 3 : 1)} v5" stroke="${shade(T.rim, -0.35)}" stroke-width="2" stroke-linecap="round"/>`; });
  g += `<path d="M44 56 Q56 42 72 40" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"/>`;
  // near flippers (in front)
  g += flipper(52, 86, -12 + fl, 40, 11, sk) + flipper(100, 94, 20 - fl * 0.5, 24, 10, sk);
  g += `</g>`;
  return { defs, body: g };
}
function turtleSheet(v, happy) {
  let defs = "";
  const frames = [0, 1, 2, 3].map((i) => { const r = turtle({ v, ph: (i / 4) * Math.PI * 2, uid: `t${i}`, happy }); defs += r.defs; return `<g transform="translate(66 112) scale(0.9) translate(-64 -104)">${r.body}</g>`; });
  return job(`assets/sheet/turtle_${happy ? "happy_" : ""}${v}.png`, 512, 128, sheet(frames, 128, 128, 4), defs);
}
function turtleThumb(v) { const r = turtleFront({ v, uid: "tt" }); return job(`assets/ui/turtle_${v}.png`, 128, 128, `<g transform="translate(64 64) scale(0.15) translate(-450 -850)">${r.body}</g>`, r.defs); }

/* Front view (close-up backdrop, thumbnails, icon): a big face under a big domed shell, seen slightly from above.
   Drawn on the 900×1300 close-up grid. o: { v, happy, uid } */
function turtleFront(o) {
  const T = TURTLES[o.v], u = o.uid || "f";
  const sk = T.skin, skD = shade(sk, -0.22), sh = T.shell, shD = shade(sh, -0.3);
  const defs = rad(`${u}s`, [[0, shade(sh, 0.5)], [0.55, sh], [1, shD]], 0.45, 0.32, 0.75) +
    rad(`${u}k`, [[0, "#ffffff"], [0.45, sk], [1, skD]], 0.42, 0.35, 0.75) +
    rad(`${u}e`, [[0, "#3b5f8f"], [0.7, "#173a5e"], [1, "#0c2440"]], 0.45, 0.4, 0.6);
  let g = "";
  // flippers spread out on both sides
  g += `<path d="M200 760 Q60 760 40 880 Q140 900 250 840 Z" fill="url(#${u}k)" ${stk(12)}/>`;
  g += `<path d="M700 760 Q840 760 860 880 Q760 900 650 840 Z" fill="url(#${u}k)" ${stk(12)}/>`;
  // shell dome (seen from the front/top): big oval, rim, scutes
  g += `<ellipse cx="450" cy="560" rx="380" ry="330" fill="url(#${u}s)" ${stk(14)}/>`;
  const plate = (pts, c) => `<path d="M${pts.map((p) => p.join(" ")).join(" L")} Z" fill="${c}" stroke="${shD}" stroke-width="10" stroke-linejoin="round"/>`;
  g += plate([[450, 290], [560, 340], [570, 470], [450, 520], [330, 470], [340, 340]], shade(sh, 0.2));
  g += plate([[320, 330], [330, 470], [220, 560], [130, 500], [150, 380]], shade(sh, 0.1));
  g += plate([[580, 330], [570, 470], [680, 560], [770, 500], [750, 380]], shade(sh, 0.1));
  g += plate([[450, 540], [570, 490], [660, 580], [620, 690], [450, 720], [280, 690], [240, 580], [330, 490]], shade(sh, 0.14));
  g += `<ellipse cx="450" cy="560" rx="352" ry="302" fill="none" stroke="${T.rim}" stroke-width="22" opacity=".9"/>`;
  g += `<path d="M190 400 Q260 280 420 250" fill="none" stroke="#fff" stroke-width="26" stroke-linecap="round" opacity=".45"/>`;
  // head, coming out of the shell at the front (bottom)
  g += `<path d="M330 820 Q330 760 450 760 Q570 760 570 820 L560 860 L340 860 Z" fill="${skD}" ${stk(12)}/>`;
  g += `<ellipse cx="450" cy="930" rx="215" ry="175" fill="url(#${u}k)" ${stk(14)}/>`;
  if (o.happy) {
    g += `<path d="M330 905 Q370 850 410 905" fill="none" ${stk(16)}/><path d="M490 905 Q530 850 570 905" fill="none" ${stk(16)}/>`;
  } else {
    [370, 530].forEach((x) => {
      g += `<ellipse cx="${x}" cy="900" rx="52" ry="60" fill="#fff" ${stk(10)}/><ellipse cx="${x + 4}" cy="906" rx="36" ry="42" fill="url(#${u}e)"/>`;
      g += `<circle cx="${x - 10}" cy="890" r="14" fill="#fff"/><circle cx="${x + 16}" cy="922" r="6" fill="#fff" opacity=".8"/>`;
    });
  }
  g += `<ellipse cx="300" cy="985" rx="34" ry="20" fill="#ff8fa8" opacity=".6"/><ellipse cx="600" cy="985" rx="34" ry="20" fill="#ff8fa8" opacity=".6"/>`;
  g += o.happy ? `<path d="M380 1000 Q450 1070 520 1000 Q450 1030 380 1000 Z" fill="#c2405e" ${stk(10)}/>`
    : `<path d="M395 1010 Q450 1045 505 1010" fill="none" ${stk(11)}/>`;
  return { defs, body: g };
}


/* ======================= Race: rear views (200×170 frames, same grid for mount + rider) ======================= */
// The turtle seen from behind: a low, wide shell dome, front flippers paddling out on the sides, back flippers +
// tail at the bottom. The rider layer (octoBack) sits on the dome top (seat ≈ y 84).
function turtleBack(v) {
  const T = TURTLES[v], u = "tb", sk = T.skin, skD = shade(sk, -0.22), sh = T.shell, shD = shade(sh, -0.3);
  const defs = rad(`${u}s`, [[0, shade(sh, 0.45)], [0.6, sh], [1, shD]], 0.45, 0.2, 0.85) + rad(`${u}k`, [[0, "#ffffff"], [0.45, sk], [1, skD]], 0.4, 0.3, 0.8) + blur(`${u}bl`, 3);
  let g = `<ellipse cx="100" cy="160" rx="64" ry="7" fill="${INK}" opacity=".25" filter="url(#${u}bl)"/>`;
  // front flippers (sides), back flippers + tail (bottom)
  g += `<ellipse cx="100" cy="82" rx="13" ry="8" fill="url(#${u}k)" ${stk(3)}/>`;   // the head, peeking over the far rim
  g += `<path d="M44 112 Q14 104 4 92 Q28 90 52 100 Z" fill="url(#${u}k)" ${stk(3.5)}/><path d="M156 112 Q186 104 196 92 Q172 90 148 100 Z" fill="url(#${u}k)" ${stk(3.5)}/>`;
  g += `<path d="M70 140 Q50 158 40 162 Q62 166 82 148 Z" fill="${skD}" ${stk(3.2)}/><path d="M130 140 Q150 158 160 162 Q138 166 118 148 Z" fill="${skD}" ${stk(3.2)}/>`;
  g += `<path d="M94 146 Q100 164 106 146 Z" fill="${sk}" ${stk(3)}/>`;
  // shell
  g += `<ellipse cx="100" cy="116" rx="76" ry="38" fill="url(#${u}s)" ${stk(4)}/>`;
  g += `<path d="M26 120 Q100 168 174 120 Q172 132 166 138 Q100 170 34 138 Q28 132 26 120 Z" fill="${T.rim}" ${stk(3)}/>`;
  g += `<path d="M100 82 L122 92 L120 116 L100 124 L80 116 L78 92 Z" fill="${shade(sh, 0.16)}" stroke="${shD}" stroke-width="2.5" stroke-linejoin="round"/>`;
  g += `<path d="M74 94 L76 116 L50 124 L38 108 L50 92 Z M126 94 L124 116 L150 124 L162 108 L150 92 Z" fill="${shade(sh, 0.08)}" stroke="${shD}" stroke-width="2.5" stroke-linejoin="round"/>`;
  g += `<path d="M44 100 Q60 84 84 82" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".5"/>`;
  return job(`assets/img/turtle_back_${v}.png`, 200, 170, g, defs);
}
// Poulpy seen from behind, sitting on the shell: the spotty mantle up top, tentacles draped over the dome.
function octoBack() {
  const u = "ob", C = OCTO.body, CD = shade(OCTO.body, -0.1);
  let g = "";
  // tentacles drape over the dome (control points on the shell's curve), tips curling down over the rim
  [[88, 72, 70, 84, 112, -1, CD], [112, 128, 70, 116, 112, 1, CD],
   [92, 50, 72, 44, 112, -1, C], [108, 150, 72, 156, 112, 1, C], [96, 72, 82, 66, 122, -1, C], [104, 128, 82, 134, 122, 1, C]].forEach(([x0, cx, cy, x1, y1, c, col]) => {
    g += tentacle(x0, 58, cx, cy, x1, y1, c, 11, col); });
  g += mantle(u, 100, 36, 30, 29, 0);
  g += `<ellipse cx="90" cy="50" rx="5" ry="4" fill="${OCTO.spot}"/><ellipse cx="112" cy="54" rx="4" ry="3.4" fill="${OCTO.spot}"/>`;
  return job("assets/img/rider_back_poulpy.png", 200, 170, g, octoDefs(u));
}

/* ---- Rivals: sea animals seen from behind (200×170, base ≈ y 160), each with eyes peeking on the sides ---- */
const eyeSide = (x, y, r, look) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.1}" fill="#fff" ${stk(3)}/><ellipse cx="${x + look * r * 0.35}" cy="${y + 1}" rx="${r * 0.55}" ry="${r * 0.65}" fill="${INK}"/><circle cx="${x + look * r * 0.35 - r * 0.2}" cy="${y - r * 0.25}" r="${r * 0.22}" fill="#fff"/>`;
function rivalShadow(u, rx) { return `<ellipse cx="100" cy="160" rx="${rx}" ry="7" fill="${INK}" opacity=".22" filter="url(#${u}bl)"/>`; }
function rivalClown() {   // Filou the clownfish: orange body with white stripes, big tail fin in front
  const u = "rc", o = "#ff8a2a";
  const defs = rad(`${u}b`, [[0, "#ffd0a0"], [0.5, o], [1, "#d85a10"]], 0.4, 0.3, 0.8) + blur(`${u}bl`, 3);
  let g = rivalShadow(u, 46);
  g += `<path d="M58 96 Q30 104 26 122 Q46 118 62 110 Z M142 96 Q170 104 174 122 Q154 118 138 110 Z" fill="${o}" ${stk(3)}/>`;
  g += eyeSide(58, 54, 8, -1) + eyeSide(142, 54, 8, 1);   // eyes on the sides, half hidden behind the body
  g += `<ellipse cx="100" cy="88" rx="46" ry="52" fill="url(#${u}b)" ${stk(4)}/>`;
  g += `<path d="M58 70 Q100 54 142 70 Q140 82 136 88 Q100 74 64 88 Q60 82 58 70 Z" fill="#fff" ${stk(2.8)}/>`;
  g += `<path d="M56 108 Q100 94 144 108 Q140 120 134 126 Q100 114 66 126 Q60 120 56 108 Z" fill="#fff" ${stk(2.8)}/>`;
  g += `<path d="M84 40 Q100 22 116 40 Q100 36 84 40 Z" fill="${o}" ${stk(3)}/>`;
  // the tail fin seen from behind: a tall thin vertical blade with a dark edge
  g += `<path d="M100 130 Q80 146 78 164 Q90 158 100 150 Q110 158 122 164 Q120 146 100 130 Z" fill="#d85a10" ${stk(3.5)}/>`;
  return job("assets/img/rival_clown.png", 200, 170, g, defs);
}
function rivalPuffer() {  // Gonflo the pufferfish: a round spiky yellow ball
  const u = "rp", c = "#ffd23f";
  const defs = rad(`${u}b`, [[0, "#fffbe0"], [0.5, c], [1, "#e0a020"]], 0.4, 0.3, 0.8) + blur(`${u}bl`, 3);
  let g = rivalShadow(u, 44);
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, x = 100 + Math.cos(a) * 58, y = 92 + Math.sin(a) * 56, x2 = 100 + Math.cos(a) * 72, y2 = 92 + Math.sin(a) * 70;
    const px = Math.cos(a + 1.57) * 6, py = Math.sin(a + 1.57) * 6;
    g += `<path d="M${f2(x - px)} ${f2(y - py)} L${f2(x2)} ${f2(y2)} L${f2(x + px)} ${f2(y + py)} Z" fill="#fff3b0" ${stk(2.6)}/>`; }
  g += eyeSide(48, 64, 9, -1) + eyeSide(152, 64, 9, 1);
  g += `<circle cx="100" cy="92" r="60" fill="url(#${u}b)" ${stk(4)}/>`;
  [[80, 70], [120, 76], [96, 110], [70, 104], [128, 112], [104, 56]].forEach(([x, y]) => { g += `<circle cx="${x}" cy="${y}" r="5" fill="#c99a20" opacity=".5"/>`; });
  g += `<path d="M100 140 Q84 152 82 166 Q92 162 100 156 Q108 162 118 166 Q116 152 100 140 Z" fill="#e0a020" ${stk(3.2)}/>`;
  return job("assets/img/rival_puffer.png", 200, 170, g, defs);
}
function rivalRay() {     // Raymonde the manta ray: wide wings, long thin tail towards us
  const u = "rr", c = "#6a8fd8";
  const defs = lin(`${u}b`, [[0, "#a8c4ff"], [1, "#4a68b8"]]) + blur(`${u}bl`, 3);
  let g = rivalShadow(u, 80);
  g += eyeSide(86, 70, 6, -1) + eyeSide(114, 70, 6, 1);
  g += `<path d="M100 64 Q60 66 8 100 Q50 112 78 120 Q100 128 122 120 Q150 112 192 100 Q140 66 100 64 Z" fill="url(#${u}b)" ${stk(4)}/>`;
  g += `<path d="M84 68 Q74 50 80 44 Q88 52 92 66 Z M116 68 Q126 50 120 44 Q112 52 108 66 Z" fill="${c}" ${stk(3)}/>`;
  [[48, 98], [152, 98], [70, 106], [130, 106]].forEach(([x, y]) => { g += `<circle cx="${x}" cy="${y}" r="5" fill="#dfeaff" opacity=".8"/>`; });
  g += `<path d="M100 122 Q98 146 100 164" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M100 122 Q98 146 100 164" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
  return job("assets/img/rival_ray.png", 200, 170, g, defs);
}
function rivalCrab() {    // Pinça the crab: a wide red shell, big claws up, eyes on stalks
  const u = "rk", c = "#ff5a4a";
  const defs = rad(`${u}b`, [[0, "#ffc0a8"], [0.5, c], [1, "#c8302a"]], 0.45, 0.3, 0.8) + blur(`${u}bl`, 3);
  let g = rivalShadow(u, 64);
  // legs on both sides
  [[-1, 112], [-1, 124], [-1, 136], [1, 112], [1, 124], [1, 136]].forEach(([m, y]) => {
    const x0 = 100 + m * 50, d = `M${x0} ${y} q${m * 18} 4 ${m * 26} 22`;
    g += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`; });
  // claws raised
  [[-1], [1]].forEach(([m]) => {
    const ax = 100 + m * 56, d = `M${ax} 104 Q${ax + m * 22} 92 ${ax + m * 22} 66`;
    g += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round"/>`;
    const cx = ax + m * 22, cy = 52;
    g += `<path d="M${cx - 16} ${cy + 12} Q${cx - 22} ${cy - 16} ${cx - 2} ${cy - 22} L${cx} ${cy - 4} L${cx + 6} ${cy - 22} Q${cx + 24} ${cy - 14} ${cx + 16} ${cy + 12} Q${cx} ${cy + 22} ${cx - 16} ${cy + 12} Z" fill="url(#${u}b)" ${stk(3.5)}/>`;
  });
  // eye stalks (behind the shell top)
  [86, 114].forEach((x) => { g += `<path d="M${x} 96 V70" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M${x} 96 V70" stroke="${c}" stroke-width="4" stroke-linecap="round"/><circle cx="${x}" cy="66" r="8" fill="#fff" ${stk(3)}/><circle cx="${x + (x < 100 ? -3 : 3)}" cy="61" r="4" fill="${INK}"/>`; });
  // shell (carapace) seen from behind
  g += `<path d="M40 118 Q44 82 100 80 Q156 82 160 118 Q150 146 100 148 Q50 146 40 118 Z" fill="url(#${u}b)" ${stk(4)}/>`;
  [[76, 104], [124, 104], [100, 124]].forEach(([x, y]) => { g += `<circle cx="${x}" cy="${y}" r="5" fill="#ffd2c0" opacity=".7"/>`; });
  g += `<path d="M58 106 Q70 90 92 88" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".5"/>`;
  return job("assets/img/rival_crab.png", 200, 170, g, defs);
}
function rivalWhale() {   // Baleino the whale: a big blue back, tail flukes in front, a spout of bubbles
  const u = "rw", c = "#4f86d8";
  const defs = rad(`${u}b`, [[0, "#bcd8ff"], [0.5, c], [1, "#2f5aa8"]], 0.45, 0.25, 0.85) + blur(`${u}bl`, 3);
  let g = rivalShadow(u, 84);
  [[100, 20, 8], [87, 13, 5], [113, 12, 5], [94, 30, 4]].forEach(([x, y, r]) => { g += `<circle cx="${x}" cy="${y}" r="${r}" fill="#e8f9ff" ${stk(2.5)}/>`; });
  g += `<path d="M18 108 Q24 46 100 40 Q176 46 182 108 Q160 134 100 134 Q40 134 18 108 Z" fill="url(#${u}b)" ${stk(4)}/>`;
  g += `<ellipse cx="100" cy="46" rx="9" ry="4" fill="#2f5aa8" ${stk(2.5)}/>`;
  g += `<path d="M40 80 Q70 58 110 56" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".45"/>`;
  // tail flukes, lifted above the body base, with the central notch
  // the tail rises from the back: a stalk, then flukes with a clear central notch
  // the tail, nearest to us: a stalk coming out of the body, then big flukes low in front (no eyes: unseen from behind)
  g += `<path d="M86 118 Q90 132 94 142 L106 142 Q110 132 114 118 Z" fill="#3f70c0" ${stk(3.2)}/>`;
  g += `<path d="M100 140 Q74 132 30 142 Q40 168 80 166 Q94 164 100 152 Q106 164 120 166 Q160 168 170 142 Q126 132 100 140 Z" fill="#2f5aa8" ${stk(3.5)}/>`;
  g += `<path d="M44 150 Q66 144 88 150" fill="none" stroke="#7fa8e8" stroke-width="4" stroke-linecap="round" opacity=".7"/>`;
  return job("assets/img/rival_whale.png", 200, 170, g, defs);
}

/* ---- Race props: jellyfish (obstacle), rock (obstacle), start gate (coral arch + chequered banner) ---- */
function jellyfish() {
  const W = 130, H = 160, u = "jf";
  const defs = rad(`${u}b`, [[0, "#ffffff", 0.95], [0.5, "#ffb8e0", 0.9], [1, "#e070b8", 0.9]], 0.4, 0.3, 0.8) + glow(`${u}g`, 3) + rad(`${u}h`, [[0, "#ff9ed8", 0.45], [1, "#ff9ed8", 0]]);
  let g = `<ellipse cx="65" cy="62" rx="64" ry="58" fill="url(#${u}h)"/>`;
  [30, 48, 66, 84, 100].forEach((x, i) => { g += `<path d="M${x} 78 q${i % 2 ? 10 : -10} 18 0 34 q${i % 2 ? -10 : 10} 16 0 34" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M${x} 78 q${i % 2 ? 10 : -10} 18 0 34 q${i % 2 ? -10 : 10} 16 0 34" fill="none" stroke="#ffc8ea" stroke-width="3.5" stroke-linecap="round"/>`; });
  g += `<path d="M14 80 Q14 20 65 18 Q116 20 116 80 Q104 88 92 80 Q78 90 65 80 Q52 90 38 80 Q26 88 14 80 Z" fill="url(#${u}b)" ${stk(4)}/>`;
  g += `<ellipse cx="50" cy="56" rx="5" ry="6" fill="${INK}"/><ellipse cx="80" cy="56" rx="5" ry="6" fill="${INK}"/><circle cx="48.5" cy="54" r="1.8" fill="#fff"/><circle cx="78.5" cy="54" r="1.8" fill="#fff"/>`;
  g += `<path d="M58 68 Q65 74 72 68" fill="none" ${stk(3)}/><ellipse cx="40" cy="66" rx="5" ry="3" fill="#ff7ab0" opacity=".6"/><ellipse cx="90" cy="66" rx="5" ry="3" fill="#ff7ab0" opacity=".6"/>`;
  g += `<path d="M30 46 Q36 30 54 26" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85"/>`;
  return job("assets/img/jellyfish.png", W, H, g, defs);
}
function seaRock(file, seed, deco) {   // rounded sea rock with a little coral / anemone tuft (base y≈104)
  const W = 160, H = 120, u = "sr" + seed;
  const defs = rad(`${u}r`, [[0, "#c9d6e6"], [0.5, "#8c9fbd"], [1, "#55698f"]], 0.35, 0.3, 0.85) + blur(`${u}bl`, 3);
  let g = `<ellipse cx="80" cy="108" rx="64" ry="8" fill="${INK}" opacity=".25" filter="url(#${u}bl)"/>`;
  g += `<path d="${K.blob(80, 72, 66, 36, 11, 0.12, rng(seed))}" fill="url(#${u}r)" ${stk(4)}/>`;
  g += `<path d="M34 66 Q46 44 76 40" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".5"/>`;
  if (deco) {
    for (let i = 0; i < 7; i++) { const a = -2.6 + i * 0.35, x = 104 + Math.cos(a) * 4, y = 44; g += `<path d="M${x} ${y} q${f2(Math.cos(a) * 22)} ${f2(Math.sin(a) * 22)} ${f2(Math.cos(a) * 26)} ${f2(Math.sin(a) * 24)}" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M${x} ${y} q${f2(Math.cos(a) * 22)} ${f2(Math.sin(a) * 22)} ${f2(Math.cos(a) * 26)} ${f2(Math.sin(a) * 24)}" fill="none" stroke="#ff8fb8" stroke-width="4.5" stroke-linecap="round"/>`; }
    g += `<ellipse cx="104" cy="46" rx="12" ry="6" fill="#ff6fa0" ${stk(3)}/>`;
    g += `<path d="${star(46, 88, 12, 5, 5)}" fill="#ffb347" ${stk(2.6)}/>`;
  }
  return job(`assets/img/${file}.png`, W, H, g, defs);
}
function startGate() {    // two coral pillars and a chequered banner held up by bubbles
  const W = 400, H = 220, u = "sg";
  const defs = lin(`${u}p`, [[0, "#ffb0c8"], [1, "#e0608c"]], 0, 0, 1, 0) + glow(`${u}g`, 3);
  let g = "";
  [[30, 1], [370, -1]].forEach(([x, m]) => {
    g += `<path d="M${x - 14} 216 Q${x - 10} 120 ${x - 4} 40 Q${x} 26 ${x + 6} 40 Q${x + 12} 120 ${x + 16} 216 Z" fill="url(#${u}p)" ${stk(4)}/>`;
    [[70, 1], [110, -1], [150, 1]].forEach(([y, s]) => { g += `<path d="M${x} ${y} q${s * m * 12} -8 ${s * m * 16} -24" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M${x} ${y} q${s * m * 12} -8 ${s * m * 16} -24" fill="none" stroke="#ff9cbc" stroke-width="7" stroke-linecap="round"/>`; });
    g += `<circle cx="${x + 1}" cy="34" r="10" fill="#ffd23f" ${stk(3)}/>`;
  });
  const x0 = 40, x1 = 360, y0 = 22, y1 = 62;
  g += `<path d="M${x0} ${y0} Q200 ${y0 + 14} ${x1} ${y0} L${x1} ${y1} Q200 ${y1 + 14} ${x0} ${y1} Z" fill="#fff" ${stk(4)}/>`;
  const n = 16, cw = (x1 - x0) / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) if ((i + j) % 2 === 0) {
    const xa = x0 + i * cw, xb = xa + cw, sag = (x) => 14 * (1 - ((x - 200) / 160) ** 2);
    const ya = y0 + j * 20, yb = ya + 20;
    g += `<path d="M${f2(xa)} ${f2(ya + sag(xa))} L${f2(xb)} ${f2(ya + sag(xb))} L${f2(xb)} ${f2(yb + sag(xb))} L${f2(xa)} ${f2(yb + sag(xa))} Z" fill="${INK}"/>`;
  }
  g += `<path d="M${x0} ${y0} Q200 ${y0 + 14} ${x1} ${y0} L${x1} ${y1} Q200 ${y1 + 14} ${x0} ${y1} Z" fill="none" ${stk(4)}/>`;
  [[80, 12, 6], [200, 12, 8], [320, 13, 6], [140, 15, 5], [262, 14, 5]].forEach(([x, y, r]) => { g += `<circle cx="${x}" cy="${y}" r="${r}" fill="#e8f9ff" stroke="#fff" stroke-width="2" opacity=".9"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.3}" fill="#fff"/>`; });
  return job("assets/img/start_gate.png", W, H, g, defs);
}

/* ======================= World: seabed, plaza, lagoon ======================= */
function wrapAll(W, H, fn) { let g = ""; for (const ox of [-W, 0, W]) for (const oy of [-H, 0, H]) g += fn(ox, oy); return g; }
function ground() {   // sunny sand with ripples, pebbles and dancing light (caustics) — seamless 512
  const S = 512, R = rng(21);
  let g = `<rect width="${S}" height="${S}" fill="#e3cf98"/>`;
  const blobs = []; for (let i = 0; i < 14; i++) blobs.push([R() * S, R() * S, 40 + R() * 70, R() < 0.5 ? "#ecdaa8" : "#d9c38b"]);
  g += wrapAll(S, S, (ox, oy) => blobs.map(([x, y, r, c]) => `<ellipse cx="${f2(x + ox)}" cy="${f2(y + oy)}" rx="${f2(r)}" ry="${f2(r * 0.6)}" fill="${c}" opacity=".55"/>`).join(""));
  // ripples
  const rip = []; for (let i = 0; i < 26; i++) rip.push([R() * S, R() * S, 30 + R() * 50]);
  g += wrapAll(S, S, (ox, oy) => rip.map(([x, y, w]) => `<path d="M${f2(x + ox - w)} ${f2(y + oy)} Q${f2(x + ox)} ${f2(y + oy - 8)} ${f2(x + ox + w)} ${f2(y + oy)}" fill="none" stroke="#c9b177" stroke-width="3" stroke-linecap="round" opacity=".55"/>`).join(""));
  // caustics: a net of soft light lines
  const cells = []; for (let i = 0; i < 22; i++) cells.push([R() * S, R() * S, 34 + R() * 30, R() * 6.28]);
  g += wrapAll(S, S, (ox, oy) => cells.map(([x, y, r, a]) => `<path d="${K.blob(x + ox, y + oy, r, r * 0.8, 7, 0.25, rng(Math.floor(a * 1000)))}" fill="none" stroke="#fffbe6" stroke-width="3" opacity=".42"/>`).join(""));
  const peb = []; for (let i = 0; i < 30; i++) peb.push([R() * S, R() * S, 2 + R() * 4, R() < 0.3 ? "#f3e6c4" : "#bba57a"]);
  g += wrapAll(S, S, (ox, oy) => peb.map(([x, y, r, c]) => `<ellipse cx="${f2(x + ox)}" cy="${f2(y + oy)}" rx="${f2(r)}" ry="${f2(r * 0.7)}" fill="${c}"/>`).join(""));
  return job("assets/img/ground.png", S, S, g);
}
function plazaTile() {   // rounded shell-mosaic cobbles (seamless 256)
  const S = 256, R = rng(5);
  let g = `<rect width="${S}" height="${S}" fill="#d8cdb8"/>`;
  const cols = ["#f4e6d6", "#e8d6c6", "#f2dcd8", "#dfe8ee", "#efe2c8"];
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const cx = x * 32 + 16 + (y % 2 ? 16 : 0), cy = y * 32 + 16, c = cols[Math.floor(R() * cols.length)];
    g += wrapAll(S, S, (ox, oy) => `<rect x="${cx + ox - 14}" y="${cy + oy - 14}" width="28" height="28" rx="11" fill="${c}" stroke="#b9a891" stroke-width="2"/><path d="M${cx + ox - 8} ${cy + oy - 6} Q${cx + ox - 4} ${cy + oy - 10} ${cx + ox + 2} ${cy + oy - 10}" fill="none" stroke="#fff" stroke-width="2" opacity=".6" stroke-linecap="round"/>`);
  }
  return job("assets/img/plaza.png", S, S, g);
}
function lagoonFloor(w, h) {   // the turtles' lagoon: a sea-grass meadow ringed with round stones (drawn at 1.5× the zone)
  const W = w * 1.5, H = h * 1.5, R = rng(8), r = 120;
  const defs = rad("lf", [[0, "#9ad8b0"], [0.7, "#6cc29a"], [1, "#4aa588"]], 0.5, 0.45, 0.75);
  let g = `<rect x="34" y="34" width="${W - 68}" height="${H - 68}" rx="${r}" fill="url(#lf)"/>`;
  for (let i = 0; i < 90; i++) { const x = 60 + R() * (W - 120), y = 60 + R() * (H - 120), s = 0.7 + R() * 0.6;
    g += `<path d="M${f2(x)} ${f2(y)} q-6 -14 -4 -24 M${f2(x)} ${f2(y)} q0 -16 2 -28 M${f2(x)} ${f2(y)} q6 -12 8 -20" fill="none" stroke="${R() < 0.5 ? "#3f9c6e" : "#5bb886"}" stroke-width="${f2(4 * s)}" stroke-linecap="round" opacity=".8"/>`; }
  for (let i = 0; i < 6; i++) { const x = 100 + R() * (W - 200), y = 100 + R() * (H - 200); g += `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${40 + R() * 40}" ry="${20 + R() * 20}" fill="#fffbe6" opacity=".14"/>`; }
  // border stones, evenly spaced along a rounded rectangle (straight sides + quarter arcs)
  const x0 = 50, y0 = 50, x1 = W - 50, y1 = H - 50, rr = 100;
  const segs = [
    (t) => [x0 + rr + t * (x1 - x0 - 2 * rr), y0], (t) => arc(x1 - rr, y0 + rr, -Math.PI / 2, t),
    (t) => [x1, y0 + rr + t * (y1 - y0 - 2 * rr)], (t) => arc(x1 - rr, y1 - rr, 0, t),
    (t) => [x1 - rr - t * (x1 - x0 - 2 * rr), y1], (t) => arc(x0 + rr, y1 - rr, Math.PI / 2, t),
    (t) => [x0, y1 - rr - t * (y1 - y0 - 2 * rr)], (t) => arc(x0 + rr, y0 + rr, Math.PI, t),
  ];
  function arc(cx, cy, a0, t) { const a = a0 + t * Math.PI / 2; return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]; }
  const lens = [x1 - x0 - 2 * rr, Math.PI * rr / 2, y1 - y0 - 2 * rr, Math.PI * rr / 2, x1 - x0 - 2 * rr, Math.PI * rr / 2, y1 - y0 - 2 * rr, Math.PI * rr / 2];
  const per = lens.reduce((a, b) => a + b, 0), n = Math.round(per / 52);
  for (let i = 0; i < n; i++) {
    let d = i / n * per, k = 0; while (d > lens[k]) { d -= lens[k]; k++; }
    const [cx, cy] = segs[k](d / lens[k]);
    const c = ["#e9e2d6", "#d6dde6", "#f0d8d0"][i % 3];
    g += `<ellipse cx="${f2(cx)}" cy="${f2(cy)}" rx="${24 + R() * 5}" ry="${17 + R() * 3}" fill="${c}" ${stk(3.5)}/>`;
  }
  return job("assets/img/lagoon_floor.png", W, H, g, defs);
}

/* ======================= Scenery (origin bottom-centre, soft shadow) ======================= */
const shadowE = (cx, cy, rx, u) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${f2(Math.min(rx * 0.16, 7))}" fill="${INK}" opacity=".25" filter="url(#${u})"/>`;
function kelp() {   // tall wavy kelp (base y≈252)
  const W = 130, H = 260, u = "kp";
  const defs = lin(`${u}s`, [[0, "#9be06a"], [1, "#3f9a4a"]], 0, 0, 1, 0) + blur(`${u}bl`, 3);
  let g = shadowE(65, 252, 40, `${u}bl`);
  const strand = (x0, h, sw, ph) => {
    let d = `M${x0} 252`; for (let i = 1; i <= 6; i++) d += ` Q${x0 + Math.sin(ph + i) * sw * 1.6} ${252 - h * (i - 0.5) / 6} ${x0 + Math.sin(ph + i + 0.5) * sw} ${252 - h * i / 6}`;
    let leaves = ""; for (let i = 1; i < 6; i++) { const y = 252 - h * i / 6, x = x0 + Math.sin(ph + i + 0.5) * sw, m = i % 2 ? 1 : -1;
      leaves += `<path d="M${f2(x)} ${f2(y)} q${m * 22} -6 ${m * 30} -24 q${-m * 18} 4 ${-m * 30} 24 Z" fill="url(#${u}s)" ${stk(3)}/>`; }
    return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#5fb85a" stroke-width="5.5" stroke-linecap="round"/>` + leaves;
  };
  g += strand(46, 200, 10, 0) + strand(86, 236, 12, 2) + strand(64, 150, 8, 4);
  [[86, 16], [46, 52]].forEach(([x, y]) => { g += `<ellipse cx="${x}" cy="${y}" rx="9" ry="12" fill="#ffd23f" ${stk(3)}/>`; });
  return job("assets/img/kelp.png", W, H, g, defs);
}
function coral(file, c, seed) {   // branching coral (base y≈144)
  const W = 170, H = 162, u = "co" + seed, R = rng(seed);
  const defs = blur(`${u}bl`, 3);
  let g = shadowE(85, 144, 54, `${u}bl`);
  const br = (x, y, a, len, w, d) => {
    if (d > 3 || len < 10) return "";
    const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
    let s = `<path d="M${f2(x)} ${f2(y)} L${f2(x2)} ${f2(y2)}" stroke="${INK}" stroke-width="${w + 6}" stroke-linecap="round"/><path d="M${f2(x)} ${f2(y)} L${f2(x2)} ${f2(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
    s += br(x2, y2, a - 0.45 - R() * 0.2, len * 0.72, w * 0.8, d + 1) + br(x2, y2, a + 0.45 + R() * 0.2, len * 0.72, w * 0.8, d + 1);
    return s;
  };
  g += br(85, 142, -Math.PI / 2, 46, 18, 0);
  g += `<path d="M50 142 Q85 126 120 142 Z" fill="${shade(c, -0.2)}" ${stk(3.5)}/>`;
  for (let i = 0; i < 9; i++) g += `<circle cx="${f2(40 + R() * 90)}" cy="${f2(30 + R() * 80)}" r="2.5" fill="#fff" opacity=".7"/>`;
  return job(`assets/img/${file}.png`, W, H, g, defs);
}
function house(file, kind) {   // homes of the underwater city (base y≈H-10)
  const u = "h" + kind;
  const W = 260, H = kind === "tower" ? 300 : 250;
  const defs = blur(`${u}bl`, 4) + glow(`${u}g`, 4) +
    lin(`${u}a`, [[0, "#fff1e0"], [1, "#f2b98e"]], 0, 0, 1, 0) + lin(`${u}b`, [[0, "#ffb0c8"], [1, "#d8507c"]], 0, 0, 1, 0) +
    rad(`${u}d`, [[0, "#ffffff", 0.7], [0.7, "#bdefff", 0.4], [1, "#7fd0f0", 0.6]], 0.4, 0.3, 0.8) + lin(`${u}m`, [[0, "#9fb4d6"], [1, "#58709c"]]);
  const win = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffe9a0" ${stk(4)} filter="url(#${u}g)"/><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#c7a46a" stroke-width="4"/><path d="M${x - r * 0.5} ${y - r * 0.2} Q${x - r * 0.4} ${y - r * 0.6} ${x} ${y - r * 0.6}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`;
  const door = (x, y, w, h, c) => `<path d="M${x - w / 2} ${y} V${y - h + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w / 2} ${y - h + w / 2} V${y} Z" fill="${c}" ${stk(4)}/><circle cx="${x + w * 0.25}" cy="${y - h * 0.45}" r="3" fill="#ffd23f"/>`;
  let g = shadowE(130, H - 10, 100, `${u}bl`);
  if (kind === "shell") {   // a big spiral conch
    g += `<path d="M40 ${H - 10} Q20 140 80 80 Q130 30 190 70 Q240 110 222 ${H - 10} Z" fill="url(#${u}a)" ${stk(5)}/>`;
    g += `<path d="M70 ${H - 30} Q60 150 110 110 Q160 80 190 120 Q205 150 170 ${H - 50}" fill="none" stroke="#e0956a" stroke-width="6" stroke-linecap="round"/>`;
    g += `<path d="M120 ${H - 60} Q110 150 145 140 Q170 140 160 170" fill="none" stroke="#e0956a" stroke-width="6" stroke-linecap="round"/>`;
    g += `<path d="M150 64 Q190 20 214 30 Q206 56 186 74" fill="#ffd6bc" ${stk(5)}/>`;
    g += door(100, H - 10, 50, 74, "#7a5aa8") + win(176, 160, 18);
  } else if (kind === "tower") {   // a pink coral tower with portholes
    g += `<path d="M70 ${H - 10} Q60 160 84 60 Q100 30 130 28 Q160 30 176 60 Q200 160 190 ${H - 10} Z" fill="url(#${u}b)" ${stk(5)}/>`;
    [[96, 70], [160, 90], [104, 160], [170, 200]].forEach(([x, y]) => { g += `<circle cx="${x}" cy="${y}" r="7" fill="#ffd2e0" opacity=".8"/>`; });
    g += `<path d="M130 28 Q120 16 128 12 M130 28 Q146 16 154 18" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M130 28 Q120 16 128 12 M130 28 Q146 16 154 18" fill="none" stroke="#ff9cbc" stroke-width="6" stroke-linecap="round"/>`;
    g += door(130, H - 10, 52, 76, "#3f6fa8") + win(130, 104, 20) + win(130, 172, 15);
  } else {   // a glass dome house on a stone base
    g += `<rect x="30" y="${H - 70}" width="200" height="60" rx="16" fill="url(#${u}m)" ${stk(5)}/>`;
    g += `<path d="M44 ${H - 66} Q44 40 130 36 Q216 40 216 ${H - 66} Z" fill="url(#${u}d)" ${stk(5)}/>`;
    g += `<path d="M70 ${H - 90} Q66 90 120 66" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".7"/>`;
    g += `<path d="M84 ${H - 66} Q90 120 130 112 Q170 120 176 ${H - 66}" fill="#6cc29a" ${stk(4)}/><circle cx="130" cy="112" r="8" fill="#ff8fb8" ${stk(3)}/>`;
    g += door(130, H - 10, 46, 60, "#e06a4a");
    [70, 190].forEach((x) => { g += `<circle cx="${x}" cy="${H - 40}" r="8" fill="#ffe9a0" ${stk(3)}/>`; });
    g += `<circle cx="130" cy="24" r="12" fill="#e8f9ff" stroke="#fff" stroke-width="2"/><circle cx="142" cy="8" r="6" fill="#e8f9ff" stroke="#fff" stroke-width="2"/>`;
  }
  return job(`assets/img/${file}.png`, W, H, g, defs);
}
function lamp() {   // street lamp: a glowing lantern-fish on a curly post (base y≈204)
  const W = 120, H = 210, u = "lp";
  const defs = blur(`${u}bl`, 3) + glow(`${u}g`, 6) + rad(`${u}l`, [[0, "#ffffff"], [0.5, "#fff3a8"], [1, "#ffc04a"]], 0.4, 0.35, 0.7) + lin(`${u}p`, [[0, "#7fa0c8"], [1, "#3f5f8f"]], 0, 0, 1, 0);
  let g = shadowE(60, 204, 26, `${u}bl`);
  g += `<path d="M48 204 Q60 196 72 204 Z" fill="url(#${u}p)" ${stk(4)}/>`;
  g += `<path d="M60 200 V90 Q60 56 84 50" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M60 200 V90 Q60 56 84 50" fill="none" stroke="#7fa0c8" stroke-width="6" stroke-linecap="round"/>`;
  // the lantern: a little round fish holding a light bulb
  g += `<path d="M64 84 Q60 104 76 104 Q92 102 88 84 Z" fill="#6a8fd8" ${stk(3.5)}/>`;
  g += `<circle cx="84" cy="66" r="18" fill="url(#${u}l)" ${stk(3.5)} filter="url(#${u}g)"/>`;
  g += `<path d="M76 60 Q80 54 88 54" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>`;
  return job("assets/img/lamp.png", W, H, g, defs);
}
function vent() {   // bubble vent: a small rocky chimney puffing bubbles (base y≈130)
  const W = 110, H = 140, u = "vt";
  const defs = blur(`${u}bl`, 3) + rad(`${u}r`, [[0, "#c9d6e6"], [1, "#6a7fa0"]], 0.35, 0.3, 0.8);
  let g = shadowE(55, 130, 34, `${u}bl`);
  g += `<path d="M24 130 Q30 96 42 80 L68 80 Q80 96 86 130 Z" fill="url(#${u}r)" ${stk(4)}/><ellipse cx="55" cy="80" rx="14" ry="5" fill="#3a4f78" ${stk(3)}/>`;
  [[55, 60, 9], [46, 38, 7], [62, 20, 6], [52, 6, 4]].forEach(([x, y, r]) => { g += `<circle cx="${x}" cy="${y}" r="${r}" fill="#e8f9ff" stroke="#fff" stroke-width="2.4" opacity=".9"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.3}" fill="#fff"/>`; });
  return job("assets/img/vent.png", W, H, g, defs);
}
function starfish(file, c) { const W = 70, H = 70; return job(`assets/img/${file}.png`, W, H, `<path d="${star(35, 37, 30, 13, 5)}" fill="${c}" ${stk(3.5)}/>` + [0, 1, 2, 3, 4].map((i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; return `<circle cx="${f2(35 + Math.cos(a) * 16)}" cy="${f2(37 + Math.sin(a) * 16)}" r="2.6" fill="#fff" opacity=".8"/>`; }).join("")); }
function clam() {   // giant clam with a big pearl (unlock; base y≈124)
  const W = 180, H = 140, u = "cl";
  const defs = blur(`${u}bl`, 3) + glow(`${u}g`, 6) + lin(`${u}s`, [[0, "#c8b0ff"], [1, "#7a5ad0"]]) + rad(`${u}p`, [[0, "#ffffff"], [0.6, "#ffe8f4"], [1, "#e6b8d8"]], 0.35, 0.3, 0.8);
  let g = shadowE(90, 126, 70, `${u}bl`);
  const scal = (y0, y1, flip) => { let d = `M18 ${y0}`; for (let i = 0; i < 6; i++) d += ` Q${f2(18 + (i + 0.5) * 24)} ${f2(y1)} ${f2(18 + (i + 1) * 24)} ${y0}`; return d; };
  g += `<path d="M18 92 Q20 30 90 22 Q160 30 162 92 Z" fill="url(#${u}s)" ${stk(4.5)}/>`;
  [50, 70, 90, 110, 130].forEach((x) => { g += `<path d="M90 26 L${x} 88" stroke="#5a3aa8" stroke-width="2.5" opacity=".5"/>`; });
  g += `<path d="M18 92 Q90 104 162 92 L160 112 Q90 136 20 112 Z" fill="#ff9cc0" ${stk(4)}/>`;
  g += `<circle cx="90" cy="94" r="20" fill="url(#${u}p)" ${stk(3.5)} filter="url(#${u}g)"/><circle cx="84" cy="88" r="5" fill="#fff"/>`;
  g += `<path d="M18 112 Q90 140 162 112 L160 120 Q90 150 20 120 Z" fill="url(#${u}s)" ${stk(4)}/>`;
  return job("assets/img/clam.png", W, H, g, defs);
}
function statue() {   // golden turtle trophy statue on a stone plinth (unlock; base y≈230)
  const W = 200, H = 240, u = "st";
  const defs = blur(`${u}bl`, 4) + lin(`${u}m`, [[0, "#c9d6e6"], [1, "#7f93b6"]], 0, 0, 1, 0) + glow(`${u}g`, 5);
  const r = turtle({ v: "vert", uid: "stt", happy: true });
  const goldDefs = r.defs.replace(/#[0-9a-f]{6}/gi, (h) => mix(h, "#ffc93c", 0.75));
  let g = shadowE(100, 232, 76, `${u}bl`);
  g += `<path d="M40 232 L52 150 H148 L160 232 Z" fill="url(#${u}m)" ${stk(5)}/><rect x="36" y="136" width="128" height="20" rx="8" fill="url(#${u}m)" ${stk(5)}/>`;
  g += `<path d="${star(100, 196, 18, 8, 5)}" fill="#ffd23f" ${stk(3)}/>`;
  g += `<g transform="translate(100 140) scale(1.3) translate(-66 -104)">${r.body.replace(/#[0-9a-f]{6}/gi, (h) => h.toLowerCase() === INK.toLowerCase() ? h : mix(h, "#ffc93c", 0.7))}</g>`;
  [[30, 70], [170, 60], [100, 20]].forEach(([x, y], i) => { g += `<path d="${star(x, y, 10 - i * 2, 3.5, 4)}" fill="#fff6c8" filter="url(#${u}g)"/>`; });
  return job("assets/img/statue.png", W, H, g, defs + goldDefs);
}

/* ======================= Stations ======================= */
function jarHouse() {   // Poulpy's home: a big terracotta amphora (octopuses love jars!) with a round door and a window (rest)
  const W = 240, H = 250, u = "jh";
  const defs = blur(`${u}bl`, 4) + glow(`${u}g`, 5) + rad(`${u}j`, [[0, "#ffd2a8"], [0.55, "#e8915a"], [1, "#b85a2a"]], 0.38, 0.32, 0.8) + lin(`${u}d`, [[0, "#5aa9d6"], [1, "#2f6fa8"]]);
  let g = shadowE(120, 240, 90, `${u}bl`);
  // handles
  g += `<path d="M78 70 Q40 60 44 100 Q48 120 70 118" fill="none" stroke="${INK}" stroke-width="18" stroke-linecap="round"/><path d="M78 70 Q40 60 44 100 Q48 120 70 118" fill="none" stroke="#d9804a" stroke-width="10" stroke-linecap="round"/>`;
  g += `<path d="M162 70 Q200 60 196 100 Q192 120 170 118" fill="none" stroke="${INK}" stroke-width="18" stroke-linecap="round"/><path d="M162 70 Q200 60 196 100 Q192 120 170 118" fill="none" stroke="#d9804a" stroke-width="10" stroke-linecap="round"/>`;
  // body + neck + rim
  g += `<path d="M90 46 L90 70 Q30 96 34 160 Q40 236 120 238 Q200 236 206 160 Q210 96 150 70 L150 46 Z" fill="url(#${u}j)" ${stk(5)}/>`;
  g += `<rect x="78" y="30" width="84" height="22" rx="10" fill="#e8915a" ${stk(5)}/>`;
  // painted band of waves
  let wv = "M44 130"; for (let k = 0; k < 8; k++) wv += ` q10 -12 20 0`;
  g += `<path d="${wv}" fill="none" stroke="#fff3e0" stroke-width="6" stroke-linecap="round" opacity=".85" transform="translate(-4 0)"/>`;
  g += `<path d="M60 112 Q70 88 96 80" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".5"/>`;
  // round door + porthole
  g += `<path d="M96 238 V200 A24 24 0 0 1 144 200 V238 Z" fill="url(#${u}d)" ${stk(4.5)}/><circle cx="134" cy="218" r="3.5" fill="#ffd23f" ${stk(2)}/>`;
  g += `<circle cx="160" cy="160" r="16" fill="#ffe9a0" ${stk(4)} filter="url(#${u}g)"/><path d="M146 160 H174 M160 146 V174" stroke="${INK}" stroke-width="3"/>`;
  // a sprig of seaweed growing out of the neck + bubbles
  g += `<path d="M112 34 Q104 18 112 10 M124 34 Q132 20 128 12" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M112 34 Q104 18 112 10 M124 34 Q132 20 128 12" fill="none" stroke="#5fb85a" stroke-width="5" stroke-linecap="round"/>`;
  return job("assets/img/jar_house.png", W, H, g, defs);
}
function mapBoard() {   // treasure-hunt board: a wooden sign with a treasure map, a chest and a bottle (missions)
  const W = 240, H = 220, u = "mb";
  const defs = blur(`${u}bl`, 4) + lin(`${u}w`, [[0, "#c98a52"], [1, "#8a5528"]], 0, 0, 1, 0) + lin(`${u}p`, [[0, "#fff6dc"], [1, "#f0d9a0"]]) + glow(`${u}g`, 4);
  let g = shadowE(120, 210, 96, `${u}bl`);
  g += `<rect x="54" y="90" width="16" height="120" rx="6" fill="url(#${u}w)" ${stk(4)}/><rect x="170" y="90" width="16" height="120" rx="6" fill="url(#${u}w)" ${stk(4)}/>`;
  g += `<rect x="26" y="16" width="188" height="120" rx="14" fill="url(#${u}w)" ${stk(5)}/>`;
  g += `<path d="M44 30 H196 V122 H44 Z" fill="url(#${u}p)" ${stk(3.5)}/>`;
  g += `<path d="M58 106 Q80 60 110 84 Q138 106 160 60" fill="none" stroke="#c2803a" stroke-width="4" stroke-dasharray="8 7" stroke-linecap="round"/>`;
  g += `<path d="M152 50 L172 70 M172 50 L152 70" stroke="#e0403a" stroke-width="7" stroke-linecap="round"/>`;
  g += `<path d="M58 50 Q70 40 84 50 Q76 62 58 50 Z" fill="#7fc6e8" opacity=".8"/>`;
  // treasure chest at the foot of the board + a message bottle
  // a little shovel leaning on the post (the chest itself is only ever the hidden treasure)
  g += `<g transform="rotate(-18 76 200)"><rect x="72" y="138" width="8" height="54" rx="4" fill="#c98a52" ${stk(3)}/><path d="M64 188 H88 V200 Q76 220 64 200 Z" fill="#b9c8dc" ${stk(3)}/></g>`;
  g += `<g transform="rotate(-24 186 196)"><rect x="170" y="186" width="40" height="18" rx="9" fill="#9fe0c8" opacity=".85" ${stk(3)}/><rect x="208" y="190" width="10" height="10" rx="3" fill="#c98a52" ${stk(2.5)}/><rect x="178" y="190" width="18" height="9" rx="2" fill="#fff6dc"/></g>`;
  return job("assets/img/map_board.png", W, H, g, defs);
}
// treasure chest drawn with its base centre at (x, y), scale s (used on the board, as the hunt marker, in icons)
function chestDefs(u) { return lin(`${u}w`, [[0, "#d08a4a"], [1, "#8a4f22"]]) + lin(`${u}g`, [[0, "#fff1a0"], [1, "#e8a820"]]) + glow(`${u}gl`, 4); }
function chest(x, y, s, u, open) {
  let g = `<g transform="translate(${x} ${y}) scale(${s}) translate(-60 -100)">`;
  if (open) {
    g += `<path d="M14 46 Q14 4 60 4 Q106 4 106 46 Z" fill="url(#${u}w)" ${stk(5)}/>`;
    g += `<ellipse cx="60" cy="50" rx="44" ry="14" fill="#fff3b0" filter="url(#${u}gl)"/>`;
    [[40, 48], [60, 44], [78, 48], [50, 52], [70, 52]].forEach(([a, b]) => { g += `<circle cx="${a}" cy="${b}" r="8" fill="#fff" ${stk(3)}/><circle cx="${a - 2.5}" cy="${b - 2.5}" r="2.5" fill="#fff" opacity=".9"/>`; });
  }
  g += `<rect x="12" y="50" width="96" height="50" rx="8" fill="url(#${u}w)" ${stk(5)}/>`;
  if (!open) g += `<path d="M12 54 Q12 18 60 16 Q108 18 108 54 Z" fill="url(#${u}w)" ${stk(5)}/>`;
  g += `<rect x="28" y="${open ? 50 : 18}" width="12" height="${open ? 50 : 82}" fill="url(#${u}g)" ${stk(3)}/><rect x="80" y="${open ? 50 : 18}" width="12" height="${open ? 50 : 82}" fill="url(#${u}g)" ${stk(3)}/>`;
  g += `<rect x="50" y="${open ? 56 : 44}" width="20" height="22" rx="4" fill="url(#${u}g)" ${stk(3.5)}/><circle cx="60" cy="${open ? 66 : 54}" r="3" fill="${INK}"/>`;
  return g + `</g>`;
}
function chestMarker() {   // the hidden treasure (mission marker): a glowing closed chest
  const W = 140, H = 130, u = "cm";
  const defs = chestDefs(u) + rad(`${u}h`, [[0, "#ffe680", 0.6], [1, "#ffe680", 0]]);
  let g = `<ellipse cx="70" cy="70" rx="70" ry="60" fill="url(#${u}h)"/>` + chest(70, 120, 0.95, u);
  [[20, 30], [120, 24], [116, 92]].forEach(([x, y], i) => { g += `<path d="${star(x, y, 10 - i * 2, 3.5, 4)}" fill="#fff6c8" ${stk(2)}/>`; });
  return job("assets/img/chest.png", W, H, g, defs);
}

/* ======================= Big treasure: the crab thief, the drop-off spot, the rare items ======================= */
// The crab thief (chase pursuer), seen from the front: crabs walk sideways, so the same drawing serves every
// direction (dirSheet rows identical); 2 frames = scuttling legs. A black bandit mask says "thief" without words.
function crabThief(frame, u) {
  const c = "#ff6a4a", cD = "#c8402a";
  const defs = rad(`${u}b`, [[0, "#ffc8b0"], [0.5, c], [1, cD]], 0.45, 0.3, 0.8) + blur(`${u}bl`, 2.5);
  let g = `<ellipse cx="64" cy="112" rx="40" ry="7" fill="${INK}" opacity=".25" filter="url(#${u}bl)"/>`;
  [-1, 1].forEach((m) => { [0, 1, 2].forEach((k) => {
    const up = (k + frame) % 2 ? -5 : 3, x0 = 64 + m * 30, y0 = 84 + k * 7, d = `M${x0} ${y0} q${m * 14} ${-4 + up} ${m * 22} ${14 + up}`;
    g += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`; }); });
  // claws, raised a little, snapping with the frame
  [-1, 1].forEach((m) => {
    const ax = 64 + m * 34, d = `M${ax} 76 Q${ax + m * 18} 66 ${ax + m * 18} 50`;
    g += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`;
    const cx = ax + m * 18, cy = 40, o = frame ? 3 : 0;
    g += `<path d="M${cx - 12} ${cy + 10} Q${cx - 17} ${cy - 12} ${cx - 2} ${cy - 16 - o} L${cx} ${cy - 2} L${cx + 5} ${cy - 16 + o} Q${cx + 18} ${cy - 10} ${cx + 12} ${cy + 10} Q${cx} ${cy + 17} ${cx - 12} ${cy + 10} Z" fill="url(#${u}b)" ${stk(3)}/>`;
  });
  // shell
  g += `<path d="M28 88 Q30 60 64 58 Q98 60 100 88 Q92 106 64 106 Q36 106 28 88 Z" fill="url(#${u}b)" ${stk(3.5)}/>`;
  g += `<path d="M40 74 Q48 64 62 63" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55"/>`;
  // eye stalks + the bandit mask across both eyes (with the knot ties flying on the side)
  [54, 74].forEach((x) => { g += `<path d="M${x} 66 V48" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M${x} 66 V48" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`; });
  g += `<path d="M100 40 Q108 36 112 44 M100 40 Q110 44 108 52" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
  g += `<rect x="40" y="35" width="62" height="14" rx="7" fill="${INK}"/>`;
  [54, 74].forEach((x) => { g += `<circle cx="${x}" cy="42" r="7" fill="#fff" ${stk(2.4)}/><circle cx="${x + 1.5}" cy="43" r="3.6" fill="${INK}"/><circle cx="${x}" cy="41" r="1.3" fill="#fff"/>`; });
  // cheeky grin
  g += `<path d="M54 86 Q64 94 74 86" fill="none" ${stk(3)}/><path d="M60 89 L60 92 M68 89 L68 92" stroke="#fff" stroke-width="2.4"/>`;
  return { defs, body: g };
}
function crabThiefSheet() {
  let defs = "", frames = [];
  for (let r = 0; r < 4; r++) for (let f = 0; f < 2; f++) { const x = crabThief(f, `ct${r}${f}`); defs += x.defs; frames.push(`<g transform="translate(64 116) scale(0.84) translate(-64 -116)">${x.body}</g>`); }
  return job("assets/sheet/crab_thief.png", 256, 512, sheet(frames, 128, 128, 2), defs);
}
// Drop-off spot in front of Poulpy's house: a glowing ring of shells on the sand (flat ground decal)
function homeTarget() {
  const W = 240, H = 140, u = "ht";
  const defs = rad(`${u}g`, [[0, "#fff6b0", 0.85], [0.6, "#ffd23f", 0.35], [1, "#ffd23f", 0]]) + glow(`${u}gl`, 4);
  let g = `<ellipse cx="120" cy="70" rx="116" ry="66" fill="url(#${u}g)"/>`;
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, x = 120 + Math.cos(a) * 92, y = 70 + Math.sin(a) * 48;
    g += `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="11" ry="8" fill="${["#ffe0ec", "#fff3dc", "#e0f2ff"][i % 3]}" ${stk(2.6)}/>`; }
  g += `<path d="${star(120, 70, 30, 12, 5)}" fill="#ffd23f" ${stk(3)} transform="scale(1 0.62) translate(0 ${f2(70 / 0.62 - 70)})"/>`;
  return job("assets/img/home_target.png", W, H, g, defs);
}
// The rare items of the big treasures, each on a little stone plinth (base y≈150)
function rareItem(file, kind) {
  const W = 130, H = 160, u = "ri" + kind;
  const defs = blur(`${u}bl`, 3) + glow(`${u}gl`, 5) + lin(`${u}g`, [[0, "#fff1a0"], [0.5, "#ffc93c"], [1, "#d8901a"]]) +
    lin(`${u}s`, [[0, "#d6dde6"], [1, "#8a9ab6"]]) + rad(`${u}h`, [[0, "#fff6b0", 0.6], [1, "#fff6b0", 0]]) + lin(`${u}gl2`, [[0, "#d8fff4", 0.9], [1, "#7fdcc8", 0.75]]);
  let g = `<ellipse cx="65" cy="60" rx="60" ry="56" fill="url(#${u}h)"/>`;
  g += shadowE(65, 152, 44, `${u}bl`);
  g += `<path d="M30 152 L36 112 H94 L100 152 Z" fill="url(#${u}s)" ${stk(3.5)}/><rect x="26" y="102" width="78" height="14" rx="6" fill="url(#${u}s)" ${stk(3.5)}/>`;
  if (kind === "crown") {
    g += `<path d="M26 96 L30 52 L48 74 L65 40 L82 74 L100 52 L104 96 Z" fill="url(#${u}g)" ${stk(3.5)}/>`;
    g += `<rect x="26" y="84" width="78" height="12" rx="4" fill="url(#${u}g)" ${stk(3)}/>`;
    [[46, 90, "#ff4f7b"], [65, 90, "#3fb7d9"], [84, 90, "#5fd38a"]].forEach(([x, y, c]) => { g += `<circle cx="${x}" cy="${y}" r="4.5" fill="${c}" ${stk(2)}/>`; });
    [[30, 52], [65, 40], [100, 52]].forEach(([x, y]) => { g += `<circle cx="${x}" cy="${y - 4}" r="5" fill="#fff" ${stk(2.4)}/>`; });
  } else if (kind === "spyglass") {
    g += `<path d="M52 102 L64 74 L76 102" fill="none" ${stk(4)}/>`;
    g += `<g transform="rotate(-24 65 62)"><rect x="22" y="54" width="34" height="18" rx="5" fill="url(#${u}g)" ${stk(3)}/><rect x="54" y="51" width="30" height="24" rx="5" fill="#a0603a" ${stk(3)}/><rect x="82" y="47" width="22" height="32" rx="6" fill="url(#${u}g)" ${stk(3)}/><ellipse cx="104" cy="63" rx="5" ry="15" fill="#bff2ff" ${stk(2.6)}/></g>`;
  } else if (kind === "bottle") {
    g += `<g transform="rotate(-12 65 70)"><path d="M50 100 Q42 98 42 86 V62 Q42 52 56 48 V30 H74 V48 Q88 52 88 62 V86 Q88 98 80 100 Z" fill="url(#${u}gl2)" ${stk(3.5)}/>`;
    g += `<rect x="54" y="20" width="22" height="12" rx="4" fill="#c98a52" ${stk(3)}/><rect x="52" y="60" width="26" height="30" rx="4" fill="#fff6dc" ${stk(2.4)}/><path d="M57 68 H73 M57 75 H73 M57 82 H68" stroke="#c2803a" stroke-width="2.4" stroke-linecap="round"/>`;
    g += `<path d="M48 64 Q48 54 56 52" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/></g>`;
  } else if (kind === "anchor") {
    g += `<circle cx="65" cy="32" r="10" fill="none" stroke="${INK}" stroke-width="11"/><circle cx="65" cy="32" r="10" fill="none" stroke="#ffc93c" stroke-width="5"/>`;
    g += `<path d="M65 42 V96 M48 54 H82 M34 74 Q38 96 65 98 Q92 96 96 74" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>`;
    g += `<path d="M65 42 V96 M48 54 H82 M34 74 Q38 96 65 98 Q92 96 96 74" fill="none" stroke="#ffc93c" stroke-width="6" stroke-linecap="round"/>`;
    g += `<path d="M28 80 L34 70 L40 80 Z M90 80 L96 70 L102 80 Z" fill="#ffc93c" ${stk(2.6)}/>`;
  } else {   // golden scallop shell
    let fan = "M65 98"; for (let k = 0; k <= 8; k++) { const a = Math.PI * (1.08 + k * 0.105), x = 65 + Math.cos(a) * 46, y = 92 + Math.sin(a) * 58; fan += (k ? " Q" + f2(65 + Math.cos(a - 0.05) * 52) + " " + f2(92 + Math.sin(a - 0.05) * 64) + " " : " L") + f2(x) + " " + f2(y); }
    g += `<path d="${fan} Z" fill="url(#${u}g)" ${stk(3.5)}/>`;
    for (let k = 1; k < 8; k++) { const a = Math.PI * (1.08 + k * 0.105); g += `<path d="M65 96 L${f2(65 + Math.cos(a) * 44)} ${f2(92 + Math.sin(a) * 55)}" stroke="#d8901a" stroke-width="3" stroke-linecap="round"/>`; }
    g += `<path d="M50 102 L56 92 H74 L80 102 Z" fill="url(#${u}g)" ${stk(3)}/><path d="M44 58 Q52 44 64 40" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>`;
  }
  [[22, 30], [110, 22], [112, 92]].forEach(([x, y], i) => { g += `<path d="${star(x, y, 8 - i, 3, 4)}" fill="#fff6c8" filter="url(#${u}gl)"/>`; });
  return job(`assets/img/${file}.png`, W, H, g, defs);
}

/* ======================= Underwater backdrop (close-up, splash, icon) ======================= */
function waterDefs() {
  return lin("sea", [[0, "#7fdcf0"], [0.35, "#2f9fd0"], [1, "#0e4c86"]]) + lin("ray", [[0, "#ffffff", 0.45], [1, "#ffffff", 0]]) +
    lin("sandB", [[0, "#f2dea8"], [1, "#d9bf84"]]) + blur("wbl", 6);
}
function water(W, H, seed, o) {
  o = o || {};
  const R = rng(seed);
  let g = `<rect width="${W}" height="${H}" fill="url(#sea)"/>`;
  for (let i = 0; i < 6; i++) { const x = W * (0.05 + i * 0.18 + R() * 0.06), w = W * (0.05 + R() * 0.06);
    g += `<path d="M${f2(x)} 0 L${f2(x + w)} 0 L${f2(x + w * 2.6 + W * 0.1)} ${f2(H * 0.8)} L${f2(x + W * 0.1)} ${f2(H * 0.8)} Z" fill="url(#ray)" opacity=".5"/>`; }
  if (o.sand !== false) {
    const sy = H * (o.sandY || 0.84);
    g += `<path d="M0 ${f2(sy)} Q${W * 0.25} ${f2(sy - H * 0.03)} ${W * 0.5} ${f2(sy)} Q${W * 0.75} ${f2(sy + H * 0.03)} ${W} ${f2(sy - H * 0.01)} V${H} H0 Z" fill="url(#sandB)"/>`;
    for (let i = 0; i < 18; i++) g += `<ellipse cx="${f2(R() * W)}" cy="${f2(sy + R() * (H - sy))}" rx="${f2(4 + R() * 8)}" ry="${f2(3 + R() * 4)}" fill="#c9ae74" opacity=".6"/>`;
  }
  for (let i = 0; i < (o.bubbles || 26); i++) { const x = R() * W, y = R() * H * 0.85, r = 3 + R() * 12;
    g += `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="#e8f9ff" fill-opacity=".25" stroke="#fff" stroke-width="${f2(Math.max(1.5, r / 5))}" opacity=".7"/><circle cx="${f2(x - r * 0.35)}" cy="${f2(y - r * 0.35)}" r="${f2(r * 0.25)}" fill="#fff" opacity=".9"/>`; }
  return g;
}
const seaweedSide = (x, H, h, m, c) => {   // decorative kelp in a backdrop corner
  let d = `M${x} ${H + 10}`; for (let i = 1; i <= 5; i++) d += ` Q${x + m * (i % 2 ? 30 : -10)} ${H - h * (i - 0.5) / 5} ${x + m * (i % 2 ? 10 : 0)} ${H - h * i / 5}`;
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="34" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="22" stroke-linecap="round"/>`;
};

/* ======================= Close-up: brush the algae off the turtle's shell ======================= */
// The turtle front view is drawn on a 900×1300 grid, shrunk by CU.s around (450, 660) so it stays inside a
// phone's portrait crop (x 150..750). Spot areas (config: brush.closeup.spots.area) sit on the shell plates.
const CU = { W: 900, H: 1300, s: 0.78, cx: 450, cy: 660 };
function closeup(v, done) {
  const { W, H, s, cx, cy } = CU, r = turtleFront({ v, uid: "z", happy: done });
  let g = water(W, H, 31, { sandY: 0.8 });
  g += seaweedSide(70, H, 520, 1, "#5fb85a") + seaweedSide(830, H, 600, -1, "#7fcf6a") + seaweedSide(150, H, 300, -1, "#3f9a4a");
  if (done) g += `<circle cx="450" cy="640" r="520" fill="url(#doneglow)"/>`;
  g += `<g transform="translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})">${r.body}</g>`;
  if (done) [[0.2, 0.22], [0.8, 0.2], [0.16, 0.62], [0.84, 0.66], [0.5, 0.12]].forEach(([a, b], i) => { g += `<path d="${star(W * a, H * b, 34 - i * 3, 11, 4)}" fill="#fff6c8" filter="url(#sg)"/>`; });
  const defs = waterDefs() + r.defs + glow("sg", 6) + rad("doneglow", [[0, "#ffffff", 0.45], [1, "#ffffff", 0]]);
  return job(`assets/img/turtle_closeup_${v}${done ? "_done" : ""}.png`, W, H, g, defs);
}
// little clumps of algae with faces (two looks), the scrubbing sponge, the "brush me" bubble
function algae(file, c, seed) {
  const R = rng(seed);
  const defs = rad("al", [[0, shade(c, 0.35)], [1, shade(c, -0.25)]], 0.4, 0.35, 0.7);
  let g = "";
  for (let i = 0; i < 5; i++) { const a = -2.6 + i * 0.5; g += `<path d="M64 60 q${f2(Math.cos(a) * 30)} ${f2(Math.sin(a) * 26)} ${f2(Math.cos(a) * 42)} ${f2(Math.sin(a) * 44)}" fill="none" stroke="${shade(c, -0.5)}" stroke-width="13" stroke-linecap="round"/><path d="M64 60 q${f2(Math.cos(a) * 30)} ${f2(Math.sin(a) * 26)} ${f2(Math.cos(a) * 42)} ${f2(Math.sin(a) * 44)}" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`; }
  g += `<path d="${K.blob(64, 74, 40, 34, 10, 0.16, R)}" fill="url(#al)" stroke="${shade(c, -0.5)}" stroke-width="4"/>`;
  g += `<circle cx="52" cy="72" r="6" fill="${INK}"/><circle cx="76" cy="72" r="6" fill="${INK}"/><circle cx="50" cy="70" r="2" fill="#fff"/><circle cx="74" cy="70" r="2" fill="#fff"/>`;
  g += `<path d="M56 88 Q64 82 72 88" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
  return job(`assets/img/${file}.png`, 128, 128, g, defs);
}
function sponge() {
  const defs = lin("sp", [[0, "#fff38a"], [1, "#ffc93c"]]);
  let g = `<g transform="rotate(-16 64 64)"><rect x="20" y="28" width="88" height="64" rx="20" fill="url(#sp)" ${stk(4)}/>`;
  [[36, 46, 5], [56, 60, 7], [80, 44, 5], [90, 70, 6], [40, 76, 4], [66, 80, 4]].forEach(([x, y, r]) => { g += `<circle cx="${x}" cy="${y}" r="${r}" fill="#e0a020" opacity=".55"/>`; });
  g += `<rect x="20" y="78" width="88" height="14" rx="7" fill="#6cc29a" ${stk(4)}/></g>`;
  [[104, 20, 8], [114, 40, 5]].forEach(([x, y, r]) => { g += `<circle cx="${x}" cy="${y}" r="${r}" fill="#e8f9ff" stroke="#fff" stroke-width="2"/>`; });
  return job("assets/img/brush.png", 128, 128, g, defs);
}
function wantBubble() {
  let g = `<path d="M14 12 H114 Q122 12 122 20 V82 Q122 90 114 90 H74 L64 106 L54 90 H14 Q6 90 6 82 V20 Q6 12 14 12 Z" fill="#ffffff" ${stk(5)}/>`;
  const R = rng(3);
  g += `<path d="${K.blob(64, 54, 24, 20, 9, 0.18, R)}" fill="#6cbf5a" stroke="#2f6a2a" stroke-width="3.5"/>`;
  g += `<path d="M48 40 q-6 -12 -2 -20 M64 36 q0 -12 4 -20 M80 40 q6 -10 4 -18" fill="none" stroke="#3f9a4a" stroke-width="5" stroke-linecap="round"/>`;
  g += `<circle cx="56" cy="52" r="4" fill="${INK}"/><circle cx="72" cy="52" r="4" fill="${INK}"/><path d="M58 64 Q64 60 70 64" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
  return job("assets/img/want_algae.png", 128, 112, g);
}

/* ======================= Icons ======================= */
const PAL = { ink: INK, blue: "#3fb7d9", teal: "#3ec9bd", pink: "#ff6fa5", purple: "#a77bff", gold: "#ffc93c", green: "#5fd38a", orange: "#ff9f43" };
const IP = Object.assign({}, IK.DEF, PAL);
const ist = (w) => IK.st(IP, w);
function checkerFlag(x, y, w, h, sw, wave) {
  const cols = 4, rows = 3, P = (a, b) => [x + a * w, y + b * h + Math.sin(a * Math.PI * 1.6) * wave];
  let g = "";
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const a = P(i / cols, j / rows), b = P((i + 1) / cols, j / rows), c = P((i + 1) / cols, (j + 1) / rows), d = P(i / cols, (j + 1) / rows);
    g += `<path d="M${f2(a[0])} ${f2(a[1])} L${f2(b[0])} ${f2(b[1])} L${f2(c[0])} ${f2(c[1])} L${f2(d[0])} ${f2(d[1])} Z" fill="${(i + j) % 2 ? INK : "#f4f6ff"}"/>`;
  }
  const pts = []; for (let i = 0; i <= 12; i++) pts.push(P(i / 12, 0)); for (let i = 12; i >= 0; i--) pts.push(P(i / 12, 1));
  return g + `<path d="M${pts.map((p) => f2(p[0]) + " " + f2(p[1])).join(" L")} Z" fill="none" ${ist(sw)}/>`;
}
const GAME_ICONS = {
  pearl: () => { const defs = rad("ipl", [[0, "#ffffff"], [0.55, "#ffeef8"], [1, "#d8a8d0"]], 0.35, 0.3, 0.8) + lin("ips", [[0, "#ffb8d0"], [1, "#e0608c"]]);
    let b = `<path d="M10 92 Q64 132 118 92 Q110 118 64 120 Q18 118 10 92 Z" fill="url(#ips)" ${ist(6)}/>`;
    b += `<circle cx="64" cy="62" r="40" fill="url(#ipl)" ${ist(7)}/>${IK.shine("M40 52 Q44 34 60 30")}`;
    b += `<path d="${star(102, 22, 14, 4.5, 4)}" fill="#fff" ${ist(3.5)}/>`;
    return { defs, body: b }; },
  seaweed: () => { const [d, f] = IK.fill(IP.green);
    let b = `<path d="M64 114 Q48 88 62 64 Q76 42 60 20" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M64 114 Q48 88 62 64 Q76 42 60 20" fill="none" stroke="#3f9a4a" stroke-width="8" stroke-linecap="round"/>`;
    [[56, 96, -1], [62, 72, 1], [64, 50, -1], [62, 36, 1]].forEach(([x, y, m]) => { b += `<path d="M${x} ${y} q${m * 34} -6 ${m * 44} -30 q${-m * 28} 2 ${-m * 44} 30 Z" fill="${f}" ${ist(5)}/>`; });
    return { defs: d, body: b }; },
  brush: () => { const r = sponge(); return { defs: lin("sp", [[0, "#fff38a"], [1, "#ffc93c"]]), body: `<g transform="translate(64 64) scale(1.05) translate(-64 -60)">${r.svg.replace(/^.*?<\/defs>/, "").replace(/<\/svg>$/, "")}</g>` }; },
  turtle: () => { const r = turtle({ v: "vert", uid: "itu" }); return { defs: r.defs, body: `<g transform="translate(66 70) scale(0.94) translate(-64 -72)">${r.body}</g>` }; },
  octo: () => { const r = octo("down", 0, false, "ioc"); return { defs: r.defs, body: `<g transform="translate(64 64) scale(1.06) translate(-64 -70)">${r.body}</g>` }; },
  ride: () => { const t = turtle({ v: "vert", uid: "irt" }), c = octo("left", 0, false, "irc", { seated: true });
    return { defs: t.defs + c.defs, body: `<g transform="translate(64 118) scale(0.98) translate(-66 -104)">${t.body}</g><g transform="translate(70 64) scale(0.66) translate(-64 -96)">${c.body}</g>` }; },
  chest: () => ({ defs: chestDefs("ich"), body: chest(64, 116, 1.0, "ich", true) }),
  crab: () => { const r = crabThief(0, "icr"); return { defs: r.defs, body: `<g transform="translate(64 66) scale(0.88) translate(-64 -70)">${r.body}</g>` }; },
  map: () => { const defs = lin("imp", [[0, "#fff6dc"], [1, "#f0d9a0"]]);
    let b = `<path d="M14 26 L46 16 L82 28 L114 18 V102 L82 112 L46 100 L14 110 Z" fill="url(#imp)" ${ist(7)}/><path d="M46 16 V100 M82 28 V112" stroke="${INK}" stroke-width="4" opacity=".5"/>`;
    b += `<path d="M26 92 Q44 60 64 74 Q84 88 92 50" fill="none" stroke="#c2803a" stroke-width="5" stroke-dasharray="7 6" stroke-linecap="round"/>`;
    b += `<path d="M84 34 L102 52 M102 34 L84 52" stroke="#e0403a" stroke-width="9" stroke-linecap="round"/>`;
    return { defs, body: b }; },
  flag: () => ({ defs: "", body: `<rect x="16" y="12" width="12" height="106" rx="5" fill="#c9cde2" ${ist(6)}/><circle cx="22" cy="12" r="8" fill="${IP.gold}" ${ist(5)}/>` + checkerFlag(28, 20, 86, 62, 7, 8) }),
  timer: () => { const [d, f] = IK.fill(IP.teal);
    let b = `<rect x="54" y="6" width="20" height="16" rx="4" fill="#8d93b8" ${ist(6)}/>`;
    b += `<circle cx="64" cy="70" r="48" fill="${f}" ${ist(7)}/><circle cx="64" cy="70" r="36" fill="#fff" ${ist(5)}/>`;
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; b += `<path d="M${f2(64 + Math.cos(a) * 29)} ${f2(70 + Math.sin(a) * 29)} L${f2(64 + Math.cos(a) * 34)} ${f2(70 + Math.sin(a) * 34)}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`; }
    b += `<path d="M64 70 L64 44" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M64 70 L82 80" stroke="${IP.pink}" stroke-width="6" stroke-linecap="round"/><circle cx="64" cy="70" r="5" fill="${INK}"/>`;
    return { defs: d, body: b }; },
  distance: () => { const [d, f] = IK.fill(IP.pink);
    let b = `<path d="M30 120 L52 42 H76 L98 120 Z" fill="#e8d29a" ${ist(7)}/><path d="M64 48 V58 M64 72 V86 M64 100 V114" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`;
    b += `<path d="M64 76 Q40 50 40 34 Q40 10 64 10 Q88 10 88 34 Q88 50 64 76 Z" fill="${f}" ${ist(7)}/><circle cx="64" cy="34" r="10" fill="#fff" ${ist(5)}/>`;
    return { defs: d, body: b }; },
  speed: () => { const [d, f] = IK.fill(IP.purple);
    let b = `<path d="M18 98 A50 50 0 1 1 110 98 Z" fill="${f}" ${ist(7)}/><path d="M28 92 A38 38 0 1 1 100 92" fill="none" stroke="#fff" stroke-width="12" opacity=".95"/>`;
    b += `<path d="M28 92 A38 38 0 0 1 40 46" fill="none" stroke="${IP.green}" stroke-width="10"/><path d="M50 37 A38 38 0 0 1 82 37" fill="none" stroke="${IP.gold}" stroke-width="10"/><path d="M92 48 A38 38 0 0 1 100 92" fill="none" stroke="${IP.pink}" stroke-width="10"/>`;
    b += `<path d="M64 80 L94 50" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M64 80 L94 50" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="64" cy="80" r="10" fill="${IP.teal}" ${ist(5)}/>`;
    b += `<rect x="40" y="96" width="48" height="18" rx="7" fill="#2f6fa8" ${ist(6)}/>`;
    return { defs: d, body: b }; },
  quit: () => { const [d, f] = IK.fill(IP.blue), [d2, fp] = IK.fill(IP.pink);
    let b = `<rect x="16" y="12" width="58" height="104" rx="8" fill="#1f4f7a" ${ist(7)}/><path d="M24 20 L62 28 V112 L24 108 Z" fill="${f}" ${ist(6)}/><circle cx="52" cy="70" r="5" fill="${IP.gold}" ${ist(3)}/>`;
    b += `<path d="M64 54 H86 V36 L118 66 L86 96 V78 H64 Z" fill="${fp}" ${ist(7)}/>${IK.shine("M72 62 H90")}`;
    return { defs: d + d2, body: b }; },
  left: () => { const [d, f] = IK.fill(IP.teal); return { defs: d, body: `<path d="M12 64 L58 18 V44 H112 V84 H58 V110 Z" fill="${f}" ${ist(8)}/>${IK.shine("M64 54 H100")}` }; },
  right: () => { const [d, f] = IK.fill(IP.teal); return { defs: d, body: `<path d="M116 64 L70 18 V44 H16 V84 H70 V110 Z" fill="${f}" ${ist(8)}/>${IK.shine("M28 54 H64")}` }; },
};
function gameIcons() { return Object.entries(GAME_ICONS).map(([n, fn]) => { const r = fn(); return IK.job(`assets/ui/icons/${n}.png`, r.body, r.defs); }); }

/* ======================= App icon, logo, home splash ======================= */
// Poulpy riding his turtle, on the sea backdrop. `safe` < 1 shrinks it into the maskable safe zone.
function riderGroup(v, u, look) {
  const t = turtle({ v, uid: u + "t", happy: true }), c = octo("left", 0, false, u + "c", { seated: true });
  return { defs: t.defs + c.defs, body: `<g>${t.body}</g><g transform="translate(70 52) scale(0.8) translate(-64 -96)">${c.body}</g>` };
}
function icon(file, size, safe = 1) {
  const S = 512, r = riderGroup("vert", "i");
  let g = water(S, S, 9, { sandY: 0.8, bubbles: 14 });
  g += `<circle cx="256" cy="270" r="${200 * safe}" fill="url(#ih)"/>`;
  g += `<g transform="translate(262 316) scale(${2.95 * safe}) translate(-64 -64)">${r.body}</g>`;
  return Object.assign(job(file, S, S, g, waterDefs() + r.defs + rad("ih", [[0, "#ffffff", 0.45], [1, "#ffffff", 0]])), { scale: size / S });
}
function logo() {   // Poulpy on his turtle with bubbles and a pearl (the title itself is HTML text under it)
  const W = 420, H = 300, r = riderGroup("vert", "l");
  const fish = (x, y, s, c, m) => `<g transform="translate(${x} ${y}) scale(${s * m} ${s})"><path d="M-20 0 Q0 -16 20 0 Q0 16 -20 0 Z M20 0 L32 -10 L30 10 Z" fill="${c}" ${stk(3)}/><circle cx="-10" cy="-2" r="3" fill="${INK}"/></g>`;
  let g = `<ellipse cx="210" cy="170" rx="200" ry="130" fill="url(#lh)"/>`;
  g += fish(70, 90, 1.3, "#ff8a2a", 1) + fish(350, 70, 1.1, "#ffd23f", -1) + fish(360, 230, 0.9, "#b07ae8", -1);
  g += `<g transform="translate(206 196) scale(2.15) translate(-64 -70)">${r.body}</g>`;
  [[60, 200, 12], [80, 236, 7], [340, 140, 10], [320, 112, 6], [210, 20, 8]].forEach(([x, y, q]) => { g += `<circle cx="${x}" cy="${y}" r="${q}" fill="#e8f9ff" fill-opacity=".35" stroke="#fff" stroke-width="2.5"/><circle cx="${x - q * 0.35}" cy="${y - q * 0.35}" r="${q * 0.3}" fill="#fff"/>`; });
  return job("assets/img/logo.png", W, H, g, r.defs + rad("lh", [[0, "#bff2ff", 0.55], [1, "#bff2ff", 0]]));
}
function splash() {   // the underwater city at the bottom, turtles and sea friends in the middle band
  const W = 900, H = 1600, R = rng(77);
  let defs = waterDefs() + blur("sbl", 3);
  let g = water(W, H, 4, { sandY: 0.8, bubbles: 40 });
  // the underwater city in the distance: domes and towers with lit windows, a little paler (depth)
  const by = H * 0.82;
  const dome = (x, w, h, c) => `<path d="M${x} ${by} V${by - h + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${by - h + w / 2} V${by} Z" fill="${c}" ${stk(4)} stroke-opacity=".35"/>`;
  [[20, 130, 330, "#5aa9d6"], [180, 100, 230, "#6cb6de"], [600, 140, 360, "#5aa9d6"], [760, 120, 270, "#6cb6de"], [390, 110, 200, "#7cc0e4"]].forEach(([x, w, h, c]) => {
    g += dome(x, w, h, c);
    for (let k = 0; k < 3; k++) g += `<circle cx="${x + w / 2}" cy="${by - h + w / 2 + 30 + k * 60}" r="${k ? 11 : 15}" fill="#ffe9a0" opacity=".9"/>`;
  });
  // sea friends (rivals) around
  const fishSide = (x, y, s, c, m, stripe) => `<g transform="translate(${x} ${y}) scale(${s * m} ${s})"><path d="M30 0 L52 -18 L50 18 Z" fill="${shade(c, -0.1)}" ${stk(3)}/><ellipse cx="0" cy="0" rx="36" ry="24" fill="${c}" ${stk(3.5)}/>${stripe ? `<path d="M-6 -23 Q-12 0 -6 23 M12 -21 Q8 0 12 21" stroke="#fff" stroke-width="7" fill="none"/>` : ""}<circle cx="-18" cy="-4" r="6" fill="#fff" ${stk(2.5)}/><circle cx="-19" cy="-4" r="3" fill="${INK}"/><path d="M-30 8 Q-26 12 -22 9" fill="none" ${stk(2.5)}/></g>`;
  g += fishSide(130, 640, 1.2, "#ff8a2a", 1, true) + fishSide(790, 620, 1.0, "#ffd23f", -1) + fishSide(680, 1110, 1.1, "#b07ae8", -1);
  // a ray gliding at the top right
  g += `<g transform="translate(790 150) scale(1.1)"><path d="M0 -26 Q-40 -20 -80 10 Q-30 14 0 24 Q30 14 80 10 Q40 -20 0 -26 Z" fill="#6a8fd8" ${stk(3.5)}/><path d="M0 24 Q4 50 -6 70" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle cx="-10" cy="-10" r="4" fill="${INK}"/><circle cx="10" cy="-10" r="4" fill="${INK}"/></g>`;
  const t2 = turtle({ v: "rose", uid: "s2", happy: true }), t3 = turtle({ v: "bleu", uid: "s3" });
  defs += t2.defs + t3.defs;
  g += `<g transform="translate(250 760) scale(1.9) translate(-64 -104)">${t3.body}</g>`;
  g += `<g transform="translate(640 750) scale(-1.6 1.6) translate(-64 -104)">${t2.body}</g>`;
  [[120, 760, 1], [820, 820, 0.8]].forEach(([x, y, s]) => { g += `<path d="${star(x, y, 18 * s, 6 * s, 4)}" fill="#fff6c8"/>`; });
  return K.job("assets/img/splash.png", W, H, g, defs);
}

/* ======================= Build ======================= */
module.exports = () => K.hidpi(build([]), HIDPI);
// Resolution per family: world sprites ×2 (config `res: 2`), menu thumbnails ×6, icons ×2, backdrops ×2.
const HIDPI = [
  [/favicon|apple-touch|icon-192|icon-maskable/, { keep: true }],
  [/closeup|splash/, { scale: 2, type: "webp", ext: ".webp" }],
  [/logo/, { scale: 2.5, type: "webp", ext: ".webp" }],
  [/ui\/icons\//, { scale: 2, type: "webp", ext: ".webp" }],
  [/assets\/ui\//, { scale: 6, type: "webp", ext: ".webp" }],
  [/algae|brush/, { scale: 3, type: "webp", ext: ".webp" }],
  [/lagoon_floor/, { scale: 1.4, type: "webp", ext: ".webp" }],
  [/assets\/(img|sheet)\//, { scale: 2, type: "webp", ext: ".webp" }],
];
const LAGOON = { w: 640, h: 460 };   // = zones[0].rect size in game.config.js
function build(jobs) {
  jobs.push(octoSheet(), octoThumb(), octoRide(), octoBack());
  Object.keys(TURTLES).forEach((v) => jobs.push(turtleSheet(v), turtleThumb(v), turtleBack(v), closeup(v, false), closeup(v, true)));
  jobs.push(rivalClown(), rivalPuffer(), rivalRay(), rivalCrab(), rivalWhale(), jellyfish(), seaRock("rock", 4, true), seaRock("rock_b", 9, false), startGate());
  jobs.push(ground(), plazaTile(), lagoonFloor(LAGOON.w, LAGOON.h), kelp(), coral("coral_pink", "#ff8fb8", 3), coral("coral_orange", "#ffa04a", 7),
    house("house_shell", "shell"), house("house_tower", "tower"), house("house_dome", "dome"), lamp(), vent(),
    starfish("starfish", "#ff9f43"), starfish("starfish_b", "#ff6fa5"), clam(), statue(), jarHouse(), mapBoard(), chestMarker());
  jobs.push(crabThiefSheet(), homeTarget(), rareItem("item_crown", "crown"), rareItem("item_spyglass", "spyglass"), rareItem("item_bottle", "bottle"),
    rareItem("item_anchor", "anchor"), rareItem("item_shell", "shell"));
  jobs.push(algae("algae", "#6cbf5a", 2), algae("algae_b", "#a8a050", 6), sponge(), wantBubble());
  jobs.push(icon("assets/favicon.png", 512), icon("assets/apple-touch-icon.png", 180), icon("assets/icon-192.png", 192), icon("assets/icon-maskable.png", 512, 0.8), logo(), splash());
  jobs.push(...gameIcons(), ...IK.jobs(PAL, ["star", "heart", "heartEmpty", "sound", "soundOff", "help", "avatar", "goals", "close", "play", "resume", "check", "calendar", "gift", "hand", "sparkle", "moon", "refresh", "arrow", "trophy", "palette", "battery", "smile", "meh", "sad", "joy", "home", "lock"]));
  return jobs;
}
