/* =========================================================
   GAME DEFINITION — "Poulpy" (kids 6–8)
   ---------------------------------------------------------
   This file is the ENTIRE game: data + asset references.
   The engine (engine.js) contains no game content; it reads
   this `window.GAME` object. See ENGINE.md for the schema.

   Theme: Poulpy, a little pink octopus, lives in a city
   under the sea. He looks after his sea turtles (feed,
   brush the algae off their shell in a close-up), rides them,
   races them against sea animals (a clownfish, a pufferfish,
   a ray, a crab, a whale) and goes on treasure hunts
   around the city. The city grows richer as he plays.
   All art is generated from tools/art/poulpy.cjs (SVG → WebP).
   Texts are in French (meta.lang); English in game.i18n.js.
   ========================================================= */

window.GAME = {
  /* ---- Identity, theming, UI strings ---- */
  meta: {
    lang: "fr",
    title: "Poulpy",
    titleIcon: "octo",
    logo: "assets/img/logo.webp",
    splash: "assets/img/splash.webp",
    shortName: "Poulpy",
    tagline: "Le petit poulpe de la cité sous la mer !",
    saveKey: "poulpy",
    audience: { minAge: 6, maxAge: 8, notes: "young kids 6–8: gentle, cute, no violence, almost no reading needed" },
    assetVersion: "v5",
    theme: { home: "#0e4c86", play: "#1670a8", closeup: "#0e4c86" },
    showCoins: true,
    coinIcon: "pearl",
    showCreatureCount: false,
    namePrompt: { label: "Le nom de ta cité :", placeholder: "Bulle-Ville" },
    startName: "Ma cité",
    namePromptYou: "Ton prénom",
    avatarPrompt: "Voici Poulpy !",
    createTitle: "Voici Poulpy !",
    createOkLabel: "On plonge !",
    startLabel: "Nouvelle partie",
    continueLabel: "Continuer",
    continueHint: "Tes tortues t’attendent !",
    helpTitle: "{i:help} Comment jouer",
    ageUnit: "j", and: "et",
    nightMessage: "{i:moon} La mer s’endort…",
    restBlockedHint: "Tu viens de te réveiller ! Occupe-toi d’abord d’une tortue.",
    neglectMessage: "Jour {day}. Occupe-toi de {names} !",
    morningMessage: "{i:sparkle} Jour {day} : tout le monde a bien dormi.",
    idleHint: "Touche une tortue ou une maison",
    notEnough: "Pas assez de perles !",
    strings: {
      dismountFirst: "{i:ride} Descends d’abord de ta tortue !",
      coinsLabel: "Perles",
      dayLabel: "Jour",
      goalsTitle: "{i:goals} Objectifs",
    },
  },

  /* ---- Illustrated UI icons (tools/art/poulpy.cjs → assets/ui/icons). Any text can embed {i:key}. ---- */
  icons: {
    star: "assets/ui/icons/star.webp", heart: "assets/ui/icons/heart.webp", heartEmpty: "assets/ui/icons/heartEmpty.webp", sound: "assets/ui/icons/sound.webp",
    soundOff: "assets/ui/icons/soundOff.webp", help: "assets/ui/icons/help.webp", avatar: "assets/ui/icons/octo.webp", goals: "assets/ui/icons/goals.webp",
    close: "assets/ui/icons/close.webp", play: "assets/ui/icons/play.webp", resume: "assets/ui/icons/resume.webp", check: "assets/ui/icons/check.webp",
    calendar: "assets/ui/icons/calendar.webp", gift: "assets/ui/icons/gift.webp", hand: "assets/ui/icons/hand.webp", sparkle: "assets/ui/icons/sparkle.webp",
    moon: "assets/ui/icons/moon.webp", refresh: "assets/ui/icons/refresh.webp", arrow: "assets/ui/icons/arrow.webp", trophy: "assets/ui/icons/trophy.webp",
    palette: "assets/ui/icons/palette.webp", battery: "assets/ui/icons/battery.webp", smile: "assets/ui/icons/smile.webp",
    meh: "assets/ui/icons/meh.webp", sad: "assets/ui/icons/sad.webp", joy: "assets/ui/icons/joy.webp", home: "assets/ui/icons/home.webp", lock: "assets/ui/icons/lock.webp",
    octo: "assets/ui/icons/octo.webp", turtle: "assets/ui/icons/turtle.webp", pearl: "assets/ui/icons/pearl.webp", seaweed: "assets/ui/icons/seaweed.webp",
    brush: "assets/ui/icons/brush.webp", crab: "assets/ui/icons/crab.webp", ride: "assets/ui/icons/ride.webp", chest: "assets/ui/icons/chest.webp", map: "assets/ui/icons/map.webp",
    flag: "assets/ui/icons/flag.webp", timer: "assets/ui/icons/timer.webp", distance: "assets/ui/icons/distance.webp", speed: "assets/ui/icons/speed.webp",
    quit: "assets/ui/icons/quit.webp", left: "assets/ui/icons/left.webp", right: "assets/ui/icons/right.webp",
  },

  /* ---- Look & feel: sunny shallow sea, bubbles rising ---- */
  render: {
    pixelArt: false,
    vignette: 0.32,
    selectColor: "#ffd23f",
    text: { color: "#ffffff", stroke: "#173a5e" },
    label: { bg: "#0e4c86", color: "#e8f9ff", border: "#7fdcf0", alpha: 0.9, size: 20 },
    ambient: { particle: "bubble", colors: ["#e8f9ff", "#bff2ff", "#ffffff"], count: 30, speed: 14, drift: "up", alpha: [0.3, 0.7], scale: [0.3, 0.8] },
    confetti: ["#ffd23f", "#ff6fa5", "#3fb7d9", "#5fd38a", "#ff9f43", "#ffffff"],
  },

  /* ---- Sound: all procedural, no files ---- */
  audio: {
    volume: 0.6,
    music: { tempo: 84, root: 60, scale: "majorPenta", progression: [0, 5, 7, 5], pad: "sine", lead: "triangle", density: 0.45, volume: 0.2 },
  },

  /* ---- A bouncing arrow shows which turtle needs Poulpy when the child is idle ---- */
  guide: { idle: 5, color: "#ff6fa5", moodBelow: 55 },

  /* ---- World: a sunny seabed with a shell-paved plaza and streets ---- */
  world: { width: 2400, height: 1800, groundTile: "ground", bg: "#1670a8",
    patches: [
      { x: 1000, y: 700, w: 520, h: 420, tile: "plaza" },        // Treasure Plaza
      { x: 930, y: 780, w: 80, h: 90, tile: "plaza" },           // lagoon → plaza
      { x: 1520, y: 860, w: 720, h: 90, tile: "plaza" },         // Shell Street (east)
      { x: 1215, y: 1120, w: 90, h: 520, tile: "plaza" },        // Coral Street (south)
    ] },
  camera: { fitW: 430, fitH: 600, min: 0.5, max: 1.3 },

  /* ---- Assets (all generated, CC0) ---- */
  assets: {
    images: {
      ground: { path: "assets/img/ground.webp", res: 2 }, plaza: { path: "assets/img/plaza.webp", res: 2 }, lagoon_floor: "assets/img/lagoon_floor.webp",
      kelp: { path: "assets/img/kelp.webp", res: 2 }, coral_pink: { path: "assets/img/coral_pink.webp", res: 2 }, coral_orange: { path: "assets/img/coral_orange.webp", res: 2 },
      rock: { path: "assets/img/rock.webp", res: 2 }, rock_b: { path: "assets/img/rock_b.webp", res: 2 },
      house_shell: { path: "assets/img/house_shell.webp", res: 2 }, house_tower: { path: "assets/img/house_tower.webp", res: 2 }, house_dome: { path: "assets/img/house_dome.webp", res: 2 },
      lamp: { path: "assets/img/lamp.webp", res: 2 }, vent: { path: "assets/img/vent.webp", res: 2 },
      starfish: { path: "assets/img/starfish.webp", res: 2 }, starfish_b: { path: "assets/img/starfish_b.webp", res: 2 },
      clam: { path: "assets/img/clam.webp", res: 2 }, statue: { path: "assets/img/statue.webp", res: 2 },
      jar_house: { path: "assets/img/jar_house.webp", res: 2 }, map_board: { path: "assets/img/map_board.webp", res: 2 }, chest: { path: "assets/img/chest.webp", res: 2 },
      home_target: { path: "assets/img/home_target.webp", res: 2 },
      item_crown: { path: "assets/img/item_crown.webp", res: 2 }, item_spyglass: { path: "assets/img/item_spyglass.webp", res: 2 }, item_bottle: { path: "assets/img/item_bottle.webp", res: 2 },
      item_anchor: { path: "assets/img/item_anchor.webp", res: 2 }, item_shell: { path: "assets/img/item_shell.webp", res: 2 },
      // close-up: algae to brush off, the sponge, the "brush me" bubble
      algae: "assets/img/algae.webp", algae_b: "assets/img/algae_b.webp", brush: "assets/img/brush.webp",
      want_algae: { path: "assets/img/want_algae.webp", res: 2 },
      turtle_closeup_vert: { path: "assets/img/turtle_closeup_vert.webp", res: 2 }, turtle_closeup_vert_done: { path: "assets/img/turtle_closeup_vert_done.webp", res: 2 },
      turtle_closeup_bleu: { path: "assets/img/turtle_closeup_bleu.webp", res: 2 }, turtle_closeup_bleu_done: { path: "assets/img/turtle_closeup_bleu_done.webp", res: 2 },
      turtle_closeup_rose: { path: "assets/img/turtle_closeup_rose.webp", res: 2 }, turtle_closeup_rose_done: { path: "assets/img/turtle_closeup_rose_done.webp", res: 2 },
      // race: rear views (mount + rider layer), rivals, obstacles, start arch
      turtle_back_vert: { path: "assets/img/turtle_back_vert.webp", res: 2 }, turtle_back_bleu: { path: "assets/img/turtle_back_bleu.webp", res: 2 },
      turtle_back_rose: { path: "assets/img/turtle_back_rose.webp", res: 2 }, rider_back_poulpy: { path: "assets/img/rider_back_poulpy.webp", res: 2 },
      rival_clown: { path: "assets/img/rival_clown.webp", res: 2 }, rival_puffer: { path: "assets/img/rival_puffer.webp", res: 2 }, rival_ray: { path: "assets/img/rival_ray.webp", res: 2 },
      rival_crab: { path: "assets/img/rival_crab.webp", res: 2 }, rival_whale: { path: "assets/img/rival_whale.webp", res: 2 },
      jellyfish: { path: "assets/img/jellyfish.webp", res: 2 }, start_gate: { path: "assets/img/start_gate.webp", res: 2 },
    },
    sheets: {
      poulpy: { path: "assets/sheet/poulpy.webp", frameWidth: 128, frameHeight: 128, res: 2 },
      poulpy_ride: { path: "assets/sheet/poulpy_ride.webp", frameWidth: 128, frameHeight: 128, res: 2 },
      turtle_vert: { path: "assets/sheet/turtle_vert.webp", frameWidth: 128, frameHeight: 128, res: 2 },
      turtle_bleu: { path: "assets/sheet/turtle_bleu.webp", frameWidth: 128, frameHeight: 128, res: 2 },
      turtle_rose: { path: "assets/sheet/turtle_rose.webp", frameWidth: 128, frameHeight: 128, res: 2 },
      crab_thief: { path: "assets/sheet/crab_thief.webp", frameWidth: 128, frameHeight: 128, res: 2 },
    },
  },

  /* ---- Player: Poulpy the little octopus ---- */
  player: {
    scale: 0.82,
    speed: { walk: 210, run: 360, rideWalk: 300, rideRun: 460 },
    spawn: { x: 600, y: 790 },
    nameY: -110,
    shadow: { w: 44, h: 12 },
  },
  characters: [
    { id: "poulpy", name: "Poulpy", sheet: "poulpy", rideSheet: "poulpy_ride", raceRider: "rider_back_poulpy", thumb: "assets/ui/poulpy_thumb.webp" },
  ],

  /* ---- The sea turtles: 2 needs, feed + brush (close-up), ride + race ---- */
  creature: {
    label: "tortues", icon: "turtle",
    sheet: "turtle_vert",
    scale: 1.15,
    origin: { x: 0.5, y: 0.86 },
    walk: { start: 0, end: 3, frameRate: 6, hop: 3, hopPeriod: 420, speed: 40 },   // a slow, swimming glide
    shadow: { w: 84, h: 18 },
    spacing: 80,
    // Mood = average of Energy and Clean; brushing a turtle all clean makes it celebrate.
    moodNeed: "propre",
    moodFrom: ["energie", "propre"],
    moodFaces: ["sad", "meh", "smile", "joy"],
    moodDay: { base: -12, lowPenalty: -6, lowAt: 25, highBonus: 4, highAt: 60 },
    needs: [
      { id: "energie", icon: "seaweed", label: "Énergie", start: 75, perDay: -25 },
      { id: "propre", icon: "sparkle", label: "Propreté", start: 45, perDay: -30 },
    ],
    // a turtle with algae on its shell pops a "brush me" bubble now and then
    wantBubble: { sprite: "want_algae", need: "propre", below: 50, withMood: true,
      intermittent: true, scale: 0.42, lift: 26, showFor: 2.8, hideMin: 4, hideMax: 9 },
    allHappy: { mood: 75, message: "{i:trophy} Jour {day} : toutes les tortues sont heureuses, bravo !" },
    variants: [
      { id: "vert", name: "Verte", color: "#5fd38a", sheet: "turtle_vert", raceSprite: "turtle_back_vert", closeupBg: "turtle_closeup_vert", closeupBgDone: "turtle_closeup_vert_done", thumb: "assets/ui/turtle_vert.webp" },
      { id: "bleu", name: "Bleue", color: "#3fb7d9", sheet: "turtle_bleu", raceSprite: "turtle_back_bleu", closeupBg: "turtle_closeup_bleu", closeupBgDone: "turtle_closeup_bleu_done", thumb: "assets/ui/turtle_bleu.webp" },
      { id: "rose", name: "Rose", color: "#ff6fa5", sheet: "turtle_rose", raceSprite: "turtle_back_rose", closeupBg: "turtle_closeup_rose", closeupBgDone: "turtle_closeup_rose_done", thumb: "assets/ui/turtle_rose.webp" },
    ],
    actions: [
      { id: "feed", label: "Algues", icon: "seaweed", color: "#5fd38a",
        effects: { energie: 40 }, stat: "feed",
        anim: { motion: "nod", particle: "bubble", colors: ["#e8f9ff", "#bff2ff", "#ffffff"], count: 8, y0: 40 },
        message: "{i:seaweed} {name} adore les algues !" },
      // the signature close-up: zoom onto the turtle and rub the algae off its shell with the sponge
      { id: "brush", type: "closeup", label: "Brosser", icon: "brush", color: "#ffc93c", stat: "brush",
        closeup: {
          bg: "turtle_closeup_vert", spotSprites: ["algae", "algae_b"], brush: "brush", brushTip: { x: 0.5, y: 0.45 },
          spots: { base: 3, growEvery: 2, max: 8, rubs: 3, size: 120, minGap: 0.1,
                   // on the shell plates (left, top, right) — never on the face
                   area: [{ x: 0.27, y: 0.36, w: 0.12, h: 0.14 }, { x: 0.42, y: 0.28, w: 0.16, h: 0.2 }, { x: 0.61, y: 0.36, w: 0.12, h: 0.14 }] },
          finishParticles: ["star", "sparkle", "heart"],
          foam: { colors: ["#ffffff", "#e8f9ff", "#fff6c8"] },
          keepVisible: [{ x: 0.27, y: 0.55, w: 0.46, h: 0.3 }],
        },
        effects: { propre: 100 }, reward: 2,
        message: "{i:sparkle} {name} brille comme un trésor !", celebrateMessage: "{i:joy} {name} est toute propre !" },
      { id: "ride", type: "ride", label: "Monter", icon: "ride", color: "#3fb7d9", dismountLabel: "Descendre", dismountIcon: "close" },
      { id: "race", type: "race", label: "Course", icon: "flag", color: "#ff6fa5" },
    ],
    ride: {
      minEnergy: 10, fatigueNeed: "energie", empty: "slow", emptySpeed: 0.35,
      sitY: -44, sitX: 6, nameY: -150,
      tooTired: "{name} est trop fatiguée. Donne-lui des algues !",
      mountMessage: "{i:ride} En route sur {name} !",
      dismountMessage: "Tu descends de {name}.",
      emptyMessage: "{i:seaweed} {name} n’a plus d’énergie et nage tout doucement. Descends et donne-lui des algues !",
    },
    celebrate: { mode: "hop", actions: ["brush"], particle: "bubble", colors: ["#ffffff", "#bff2ff", "#fff6c8"], count: 10 },
    names: ["Pistache", "Bulle", "Caramel", "Galet", "Coquille", "Perlette", "Plouf", "Câline"],
    startCount: 2,
    startCreatures: [{ name: "Pistache", variant: "vert" }, { name: "Bulle", variant: "bleu" }],
  },

  /* ---- The Reef Race: ride a turtle, overtake the sea animals ---- */
  race: {
    time: 60, stat: "raceWin", hitPenalty: 2, drain: 0.6,
    sprite: "turtle_back_vert",
    roadside: ["kelp", "coral_pink", "coral_orange", "house_tower", "rock_b"], roadsideScale: 7,
    spriteZoom: 0.13, rideWidth: 0.4, horizon: 0.42,
    track: { segments: 760, speed: 0.85, steer: 2.2, centrifugal: 0.45 },
    obstacles: [
      { sprite: "jellyfish", every: 34, phase: 0, scale: 2.6, hw: 0.2, spread: 0.6 },
      { sprite: "rock", every: 50, phase: 20, scale: 3.4, hw: 0.3, spread: 0.45 },
    ],
    rivals: {
      list: [
        { name: "Filou le poisson-clown", sprite: "rival_clown", color: "#ff8a2a" },
        { name: "Gonflo le poisson-globe", sprite: "rival_puffer", color: "#ffd23f" },
        { name: "Raymonde la raie", sprite: "rival_ray", color: "#6a8fd8", scale: 7.5, hw: 0.36 },
        { name: "Pinça le crabe", sprite: "rival_crab", color: "#ff5a4a" },
        { name: "Baleino la baleine", sprite: "rival_whale", color: "#4f86d8", scale: 7.5, hw: 0.36 },
      ],
      scale: 6.5, hw: 0.3, skill: [0.8, 0.95], gridGap: 3, gridFirst: 5, startGate: "start_gate", startGateScale: 17, lanes: [-0.6, 0.6],
      avoid: [0.6, 0.9],
      rewards: [20, 12, 8, 4, 3, 2],
      placeLabels: ["1er", "2e", "3e"], placeSuffix: "e",
      placeMessages: ["{i:trophy} Tu as gagné la Grande Course du Récif !", "{i:star} 2e, presque !", "{i:star} 3e : tu es sur le podium !", "Tu finis {place}. Tu feras mieux la prochaine fois !"],
      resultsTitle: "{i:flag} Résultats",
      startMessage: "{i:flag} Dépasse tous les animaux et arrive le premier !",
      bumpMessage: "Boing ! Tu as touché {name}.",
      goLabel: "PARTEZ !",
    },
    colors: { sky: ["#0e4c86", "#2f9fd0", "#9fe6f6"], sun: false, stars: { count: 70, color: "#e8f9ff" }, skyline: false, ground: "#3a9a8a",
              grass: ["#5ab79a", "#4fab8f"], road: ["#f0dca6", "#e6cf94"], rumble: ["#ff6fa5", "#ffffff"], lane: "#fff6dc", finish: ["#ffffff", "#173a5e"] },
    icons: { time: "timer", distance: "distance", speed: "speed", quit: "quit", left: "left", right: "right", place: "flag" },
    speedUnit: "km/h", distUnit: "m",
    quitLabel: "Quitter", hint: "Touche à gauche ou à droite pour tourner",
    startMessage: "{i:flag} 3… 2… 1… Partez !",
    hitMessage: "Aïe ! −{n} s",
    winMessage: "{i:trophy} Tu as gagné ! +{r}",
    loseMessage: "{i:timer} Temps écoulé ! Essaie encore !",
    quitMessage: "{i:flag} Tu as quitté la course.",
    tiredMessage: "{i:seaweed} {name} est fatiguée et ralentit…",
  },

  /* ---- Zone: the turtles' lagoon (a sea-grass meadow) ---- */
  zones: [
    { id: "lagoon", home: true, rect: { x: 280, y: 280, w: 640, h: 460 }, floor: "lagoon_floor", fence: false, label: "Le lagon des tortues", labelLift: 20 },
  ],

  /* ---- Stations: Poulpy's jar house (rest) and the treasure board (treasure hunts) ---- */
  stations: [
    { type: "home", x: 520, y: 1010, sprite: "jar_house", scale: 0.85, label: "La maison de Poulpy", labelY: -222, whileRiding: true,
      box: { dx: -86, dy: -56, w: 172, h: 58 }, action: "nextDay", actionLabel: "Dormir", icon: "moon", color: "#7b6cff", hint: "Dormir jusqu’au lendemain" },
    { type: "treasure", x: 1260, y: 900, sprite: "map_board", scale: 0.8, label: "Chasse au trésor", labelY: -184, glow: "#ffe680", whileRiding: true,
      box: { dx: -80, dy: -40, w: 160, h: 42 }, action: "missions", actionLabel: "Chercher un trésor", icon: "map", color: "#ffc93c", hint: "Suis la flèche jusqu’au trésor caché" },
  ],

  /* ---- Treasure hunts: two different ways to play ----
     Small treasure: follow the arrow to a chest hidden in the city, open it there.
     Big treasure: fetch the big chest far away, then bring it back HOME (the shell ring in front of
     Poulpy's house) while the crab thief chases you; each big treasure also holds a rare item
     (unlocks below) that joins the treasure corner by the house. */
  missions: {
    title: "{i:map} Chasse au trésor", subtitle: "Quel trésor veux-tu chercher ?",
    stat: "treasure", radius: 80, color: "#ffc93c", marker: "chest", markerScale: 0.7,
    cargoIcon: "chest", cargoLabel: "Trésor",
    offers: [
      { label: "Petit trésor", sub: "Suis la flèche jusqu’au coffre caché : {i:pearl} 10", icon: "chest", pay: 10 },
      { label: "Grand trésor", sub: "Rapporte le coffre à la maison sans te faire attraper par le crabe voleur ! {i:pearl} 25 + un objet rare", icon: "crab", pay: 25, heat: 1,
        stat: "bigTreasure", markerScale: 0.95,
        pickups: [
          { x: 200, y: 1500, name: "la forêt d’algues" }, { x: 2200, y: 300, name: "le grand corail" }, { x: 2250, y: 1550, name: "les rochers" },
          { x: 1250, y: 1650, name: "le bout de la rue du Corail" }, { x: 2200, y: 900, name: "le bout de la rue des Coquillages" }, { x: 1600, y: 300, name: "la maison-bulle" },
        ],
        dests: [{ x: 520, y: 1100, name: "la maison de Poulpy" }],
        target: "home_target", targetScale: 0.75,
        takenMessage: "{i:map} Le grand trésor est caché vers {p}. Suis la flèche !",
        hotPickedMessage: "{i:crab} Tu l’as ! Vite, rapporte-le à la maison… le crabe voleur arrive !",
        doneMessage: "{i:chest} Grand trésor rapporté à la maison ! +{p}" },
    ],
    dests: [
      { x: 200, y: 1500, name: "la forêt d’algues" }, { x: 2200, y: 300, name: "le grand corail" }, { x: 2250, y: 1550, name: "les rochers" },
      { x: 1250, y: 1650, name: "le bout de la rue du Corail" }, { x: 2200, y: 900, name: "le bout de la rue des Coquillages" },
      { x: 1600, y: 300, name: "la maison-bulle" }, { x: 150, y: 220, name: "le jardin d’étoiles de mer" }, { x: 800, y: 1550, name: "la cheminée à bulles" },
    ],
    takenMessage: "{i:map} Un trésor est caché vers {d}. Suis la flèche !",
    doneMessage: "{i:chest} Trésor trouvé ! +{p}",
    busyMessage: "{i:map} Trouve d’abord ton trésor !",
    chaseEndMessage: "{i:crab} Trop tard pour le crabe : le trésor est à l’abri !",
  },

  /* ---- The crab thief (big treasure): slower than Poulpy, so a child can always outrun it.
     If it catches you it only pinches a few pearls and runs off — the treasure stays yours. ---- */
  chase: {
    sprite: "crab_thief", dirSheet: { cols: 2 }, blinkRate: 8, scale: 0.84, originY: 0.85, icon: "crab", label: "Crabe voleur",
    maxLevel: 1, maxUnits: 1, speed: 150, catchRadius: 56, catchSeconds: 2.5, loseRadius: 950, loseAfter: 8, fine: 5, spawnDist: 520,
    caughtKeepsMission: true,
    escapedMessage: "{i:crab} Le crabe voleur a abandonné !",
    caughtMessage: "{i:crab} Le crabe voleur t’a pincé {f} perles et s’enfuit ! Le trésor est toujours à toi.",
  },

  /* ---- The city: houses, kelp, corals, rocks (with collision footprints on the solid ones) ---- */
  scenery: [
    // around the Treasure Plaza
    { x: 1080, y: 690, sprite: "house_shell", scale: 0.9, box: { dx: -100, dy: -44, w: 200, h: 46 } },
    { x: 1440, y: 690, sprite: "house_tower", scale: 0.85, box: { dx: -60, dy: -40, w: 120, h: 42 } },
    { x: 1030, y: 1110, sprite: "lamp", scale: 0.6, glow: "#ffe680", glowY: 90, box: { dx: -10, dy: -8, w: 20, h: 10 } },
    { x: 1500, y: 1110, sprite: "lamp", scale: 0.6, glow: "#ffe680", glowY: 90, box: { dx: -10, dy: -8, w: 20, h: 10 } },
    { x: 1150, y: 1000, sprite: "starfish", scale: 0.6, ground: true },
    { x: 1400, y: 820, sprite: "starfish_b", scale: 0.55, ground: true },
    // Shell Street (east)
    { x: 1700, y: 850, sprite: "house_dome", scale: 0.85, box: { dx: -90, dy: -40, w: 180, h: 42 } },
    { x: 2000, y: 850, sprite: "house_tower", scale: 0.8, box: { dx: -56, dy: -38, w: 112, h: 40 } },
    { x: 1850, y: 1110, sprite: "house_shell", scale: 0.85, flip: true, box: { dx: -96, dy: -42, w: 192, h: 44 } },
    { x: 2150, y: 1120, sprite: "coral_pink", scale: 0.8, box: { dx: -40, dy: -16, w: 80, h: 20 } },
    // Coral Street (south)
    { x: 1090, y: 1380, sprite: "house_dome", scale: 0.8, box: { dx: -84, dy: -38, w: 168, h: 40 } },
    { x: 1430, y: 1420, sprite: "house_tower", scale: 0.8, box: { dx: -56, dy: -38, w: 112, h: 40 } },
    { x: 1420, y: 1640, sprite: "coral_orange", scale: 0.8, box: { dx: -40, dy: -16, w: 80, h: 20 } },
    // nature all around: kelp forests, corals, rocks, bubble vents
    { x: 120, y: 1350, sprite: "kelp", scale: 0.9, anim: "sway", box: false },
    { x: 260, y: 1420, sprite: "kelp", scale: 1.0, anim: "sway", box: false, flip: true },
    { x: 330, y: 1650, sprite: "kelp", scale: 0.85, anim: "sway", box: false },
    { x: 2280, y: 200, sprite: "coral_pink", scale: 1.0, box: { dx: -50, dy: -18, w: 100, h: 22 } },
    { x: 2100, y: 260, sprite: "coral_orange", scale: 0.9, box: { dx: -45, dy: -16, w: 90, h: 20 } },
    { x: 2360, y: 1450, sprite: "rock", scale: 0.9, box: { dx: -60, dy: -24, w: 120, h: 28 } },
    { x: 2120, y: 1600, sprite: "rock_b", scale: 0.8, box: { dx: -54, dy: -22, w: 108, h: 26 } },
    { x: 900, y: 1640, sprite: "vent", scale: 0.8, anim: "pulse", box: { dx: -28, dy: -14, w: 56, h: 18 } },
    { x: 1700, y: 380, sprite: "house_dome", scale: 0.75, box: { dx: -80, dy: -36, w: 160, h: 38 } },
    { x: 1250, y: 330, sprite: "kelp", scale: 0.8, anim: "sway", box: false },
    { x: 1950, y: 560, sprite: "rock", scale: 0.7, box: { dx: -46, dy: -18, w: 92, h: 22 } },
    { x: 80, y: 150, sprite: "starfish", scale: 0.7, ground: true }, { x: 240, y: 200, sprite: "starfish_b", scale: 0.6, ground: true },
    { x: 120, y: 700, sprite: "coral_pink", scale: 0.75, box: { dx: -38, dy: -14, w: 76, h: 18 } },
    { x: 620, y: 1350, sprite: "rock_b", scale: 0.7, box: { dx: -46, dy: -18, w: 92, h: 22 } },
    { x: 1000, y: 250, sprite: "coral_orange", scale: 0.7, box: { dx: -36, dy: -14, w: 72, h: 18 } },
    { x: 860, y: 1180, sprite: "kelp", scale: 0.7, anim: "sway", box: false },
  ],

  /* ---- Unlocks: the city gets prettier as Poulpy plays (no reading needed) ---- */
  unlocks: [
    { id: "lamps", when: { stat: "feed", atLeast: 3 }, message: "{i:gift} Des lampes-poissons s’allument dans le lagon !",
      scenery: { x: 950, y: 560, sprite: "lamp", scale: 0.65, glow: "#ffe680", glowY: 95, box: { dx: -10, dy: -8, w: 20, h: 10 } } },
    { id: "clam", when: { stat: "treasure", atLeast: 2 }, message: "{i:gift} Une palourde géante avec une perle est apparue sur la place !",
      scenery: { x: 1130, y: 1060, sprite: "clam", scale: 0.7, glow: "#ffd6ef", glowY: 50, box: { dx: -56, dy: -22, w: 112, h: 26 } } },
    { id: "statue", when: (s) => (s.stats.racePodium || 0) >= 1 || (s.stats.raceWin || 0) >= 1, message: "{i:trophy} Une statue de champion pour ta tortue !",
      scenery: { x: 1400, y: 1060, sprite: "statue", scale: 0.6, glow: "#ffe680", glowY: 80, box: { dx: -46, dy: -18, w: 92, h: 22 } } },
    // the treasure corner by Poulpy's house: one rare item per big treasure brought home
    { id: "crown", when: { stat: "bigTreasure", atLeast: 1 }, message: "{i:gift} Dans le grand coffre : une couronne ! Elle rejoint le coin des trésors.",
      scenery: { x: 300, y: 1190, sprite: "item_crown", scale: 0.6, box: { dx: -24, dy: -12, w: 48, h: 14 } } },
    { id: "spyglass", when: { stat: "bigTreasure", atLeast: 2 }, message: "{i:gift} Dans le grand coffre : une longue-vue !",
      scenery: { x: 390, y: 1210, sprite: "item_spyglass", scale: 0.6, box: { dx: -24, dy: -12, w: 48, h: 14 } } },
    { id: "bottle", when: { stat: "bigTreasure", atLeast: 3 }, message: "{i:gift} Dans le grand coffre : une bouteille à message !",
      scenery: { x: 650, y: 1210, sprite: "item_bottle", scale: 0.6, box: { dx: -24, dy: -12, w: 48, h: 14 } } },
    { id: "anchor", when: { stat: "bigTreasure", atLeast: 4 }, message: "{i:gift} Dans le grand coffre : une ancre en or !",
      scenery: { x: 740, y: 1190, sprite: "item_anchor", scale: 0.6, box: { dx: -24, dy: -12, w: 48, h: 14 } } },
    { id: "goldshell", when: { stat: "bigTreasure", atLeast: 5 }, message: "{i:trophy} Dans le grand coffre : le coquillage d’or ! Ta collection est complète !",
      scenery: { x: 520, y: 1260, sprite: "item_shell", scale: 0.65, box: { dx: -26, dy: -12, w: 52, h: 14 } } },
  ],

  /* ---- Objectives: three small levels ---- */
  objectives: {
    extraStats: ["ride", "bigTreasure"],
    levels: [
      { name: "Petit explorateur", goals: [
        { id: "feed1", name: "Miam !", desc: "Donne des algues à une tortue {i:seaweed}", check: (s) => (s.stats.feed || 0) >= 1 },
        { id: "brush1", name: "Toute propre", desc: "Brosse une tortue {i:brush}", check: (s) => (s.stats.brush || 0) >= 1 },
        { id: "ride1", name: "En selle !", desc: "Monte sur une tortue {i:ride}", check: (s) => (s.stats.ride || 0) >= 1 },
        { id: "treasure1", name: "Chercheur de trésor", desc: "Trouve un trésor {i:chest}", check: (s) => (s.stats.treasure || 0) >= 1 },
      ] },
      { name: "Champion du récif", goals: [
        { id: "race1", name: "Sur le podium", desc: "Finis une course dans les 3 premiers {i:flag}", check: (s) => (s.stats.racePodium || 0) >= 1 || (s.stats.raceWin || 0) >= 1 },
        { id: "treasure3", name: "Chasseur de trésors", desc: "Trouve 3 trésors {i:chest}", check: (s) => (s.stats.treasure || 0) >= 3 },
        { id: "win1", name: "Champion !", desc: "Gagne une course {i:trophy}", check: (s) => (s.stats.raceWin || 0) >= 1 },
        { id: "big1", name: "Plus malin que le crabe", desc: "Rapporte un grand trésor à la maison {i:crab}", check: (s) => (s.stats.bigTreasure || 0) >= 1 },
      ] },
      { name: "Grand collectionneur", goals: [
        { id: "big5", name: "Le coin des trésors", desc: "Rapporte 5 grands trésors : couronne, longue-vue, bouteille, ancre et coquillage d’or {i:chest}", check: (s) => (s.stats.bigTreasure || 0) >= 5 },
      ] },
    ],
  },

  /* ---- Help screen ---- */
  help: [
    "<b>Bienvenue dans la cité sous la mer !</b>",
    "{i:hand} <b>Bouger :</b> touche le sable, Poulpy y va. Touche une tortue ou une maison pour l’utiliser.",
    "{i:turtle} <b>Tes tortues :</b> {i:seaweed} donne-leur des algues pour l’énergie, et {i:brush} brosse leur carapace : frotte les algues avec ton doigt !",
    "{i:ride} <b>Monter :</b> monte sur une tortue pour nager plus vite dans la cité.",
    "{i:flag} <b>La course :</b> sur ta tortue, touche Course. Touche à gauche ou à droite pour dépasser le poisson-clown, le poisson-globe, la raie, le crabe et la baleine. Évite les méduses !",
    "{i:map} <b>Chasse au trésor :</b> va au panneau du trésor sur la place. <b>Petit trésor</b> : suis la flèche jusqu’au coffre caché. <b>Grand trésor</b> : va chercher le gros coffre, puis rapporte-le devant la maison de Poulpy sans te faire attraper par le {i:crab} crabe voleur. Chaque grand trésor contient un objet rare pour ta collection !",
    "{i:gift} <b>Surprises :</b> plus tu joues, plus la cité devient jolie.",
    "{i:moon} <b>Dormir :</b> dans la maison de Poulpy, pour passer au jour suivant. Le jeu se sauvegarde tout seul.",
  ],
};
