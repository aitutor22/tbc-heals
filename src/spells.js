// values taken from https://docs.google.com/spreadsheets/d/1p_7OSqFV-wXPFtFAfFlePsmTJNmX2BnQ9fwzB8da4-c/edit#gid=0
// https://tbc-twinhead.twinstar.cz/?spell=25233
export const flashHeal = {
  name: 'Flash Heal',
  description: ['Heals a friendly target'],
  direct: true,
  hot: false,
  class: 'priest',
  ranks: [
    { 'rank': 1, 'mana': 125, 'level': 20, 'castTime': 1.5, 'min': 202, 'max': 247, 'hotTick': 0 },
    { 'rank': 2, 'mana': 155, 'level': 26, 'castTime': 1.5, 'min': 268, 'max': 325, 'hotTick': 0 },
    { 'rank': 3, 'mana': 185, 'level': 32, 'castTime': 1.5, 'min': 339, 'max': 406, 'hotTick': 0 },
    { 'rank': 4, 'mana': 215, 'level': 38, 'castTime': 1.5, 'min': 413, 'max': 492, 'hotTick': 0 },
    { 'rank': 5, 'mana': 265, 'level': 44, 'castTime': 1.5, 'min': 534, 'max': 633, 'hotTick': 0 },
    { 'rank': 6, 'mana': 315, 'level': 50, 'castTime': 1.5, 'min': 662, 'max': 783, 'hotTick': 0 },
    { 'rank': 7, 'mana': 380, 'level': 56, 'castTime': 1.5, 'min': 828, 'max': 975, 'hotTick': 0 },
    { 'rank': 8, 'mana': 400, 'level': 61, 'castTime': 1.5, 'min': 913, 'max': 1060, 'hotTick': 0 },
    { 'rank': 9, 'mana': 470, 'level': 67, 'castTime': 1.5, 'min': 1101, 'max': 1280, 'hotTick': 0 },
  ],
};

export const greaterHeal = {
  name: 'Greater Heal',
  description: ['A slow casting spell that heals a single target'],
  direct: true,
  hot: false,
  class: 'priest',
  ranks: [
    {'rank': 1, 'mana': 370, 'level': 40, 'castTime': 3, 'min': 924, 'max': 1039, 'hotTick': 0},
    {'rank': 2, 'mana': 455, 'level': 46, 'castTime': 3, 'min': 1177, 'max': 1318, 'hotTick': 0},
    {'rank': 3, 'mana': 545, 'level': 52, 'castTime': 3, 'min': 1469, 'max': 1642, 'hotTick': 0},
    {'rank': 4, 'mana': 655, 'level': 58, 'castTime': 3, 'min': 1812, 'max': 2021, 'hotTick': 0},
    {'rank': 5, 'mana': 710, 'level': 60, 'castTime': 3, 'min': 1965, 'max': 2194, 'hotTick': 0},
    {'rank': 6, 'mana': 750, 'level': 63, 'castTime': 3, 'min': 2074, 'max': 2410, 'hotTick': 0},
    {'rank': 7, 'mana': 825, 'level': 68, 'castTime': 3, 'min': 2396, 'max': 2784, 'hotTick': 0},
  ],
};

export const renew = {
  name: 'Renew',
  description: ['Heals the target of damage over a period of time.'],
  direct: false,
  hot: true,
  class: 'priest',
  ranks: [
  { 'rank': 1, 'mana': 30, 'level': 8, 'castTime': 1.5, 'hotTick': 45/5, 'duration': 15 },
  { 'rank': 2, 'mana': 65, 'level': 14, 'castTime': 1.5, 'hotTick': 100/5, 'duration': 15 },
  { 'rank': 3, 'mana': 105, 'level': 20, 'castTime': 1.5, 'hotTick': 175/5, 'duration': 15 },
  { 'rank': 4, 'mana': 140, 'level': 26, 'castTime': 1.5, 'hotTick': 245/5, 'duration': 15 },
  { 'rank': 5, 'mana': 170, 'level': 32, 'castTime': 1.5, 'hotTick': 315/5, 'duration': 15 },
  { 'rank': 6, 'mana': 205, 'level': 38, 'castTime': 1.5, 'hotTick': 400/5, 'duration': 15 },
  { 'rank': 7, 'mana': 250, 'level': 44, 'castTime': 1.5, 'hotTick': 510/5, 'duration': 15 },
  { 'rank': 8, 'mana': 305, 'level': 50, 'castTime': 1.5, 'hotTick': 650/5, 'duration': 15 },
  { 'rank': 9, 'mana': 365, 'level': 56, 'castTime': 1.5, 'hotTick': 810/5, 'duration': 15 },
  { 'rank': 10, 'mana': 410, 'level': 60, 'castTime': 1.5, 'hotTick': 970/5, 'duration': 15 },
  { 'rank': 11, 'mana': 430, 'level': 65, 'castTime': 1.5, 'hotTick': 1010/5, 'duration': 15 },
  { 'rank': 12, 'mana': 450, 'level': 70, 'castTime': 1.5, 'hotTick': 1110/5, 'duration': 15 },
  ],
};

export const circleOfHealing = {
  name: 'Circle of Healing',
  description: ["Blizzard needed to add a cooldown to Circle of Healing before releasing Classic TBC, this is such a stupid spell that takes no skills to use, how did they let that spell untouched for an entire expansion and also at the start of WOTLK is beyond me...", "Healing 5 people at once instantly with no cooldown, this should not be allowed, I remember seeing those 2 holy priests on pserver duo healing the entirety of SWP by mindlessly spamming CoH and with a shadow priest in their group ontop of that...", "As a Druid main, it's really frustrating having to heal against this crap... And soon in Black Temple they'll be getting the mace from Illidan which will make things a lot worse... I don't get the choice of not nerfing the spell, why not give the same nerf it was given in WOTLK, a 6 sec cooldown, to give more room to the other healers..."],
  direct: true,
  hot: false,
  class: 'priest',
  ranks: [
    {'rank': 1, 'mana': 300, 'level': 50, 'castTime': 1.5, 'min': 246, 'max': 271, 'hotTick': 0},
    {'rank': 2, 'mana': 337, 'level': 56, 'castTime': 1.5, 'min': 288, 'max': 319, 'hotTick': 0},
    {'rank': 3, 'mana': 375, 'level': 60, 'castTime': 1.5, 'min': 327, 'max': 361, 'hotTick': 0},
    {'rank': 4, 'mana': 412, 'level': 65, 'castTime': 1.5, 'min': 370, 'max': 408, 'hotTick': 0},
    {'rank': 5, 'mana': 450, 'level': 70, 'castTime': 1.5, 'min': 409, 'max': 451, 'hotTick': 0},
  ],
};

export const healingWave = {
  name: 'Healing Wave',
  description: ['A slow casting spell that heals a single target'],
  direct: true,
  hot: false,
  class: 'shaman',
  ranks: [
    // {'rank': 1, 'mana': 25, 'level': 1, 'castTime': 1.5, 'min': 34, 'max': 45, 'hotTick': 0},
    // {'rank': 2, 'mana': 45, 'level': 6, 'castTime': 2, 'min': 64, 'max': 78, 'hotTick': 0},
    {'rank': 3, 'mana': 80, 'level': 12, 'castTime': 2.5, 'min': 129, 'max': 155, 'hotTick': 0},
    {'rank': 4, 'mana': 155, 'level': 18, 'castTime': 3, 'min': 268, 'max': 316, 'hotTick': 0},
    {'rank': 5, 'mana': 200, 'level': 24, 'castTime': 3, 'min': 367, 'max': 440, 'hotTick': 0},
    {'rank': 6, 'mana': 265, 'level': 32, 'castTime': 3, 'min': 536, 'max': 622, 'hotTick': 0},
    {'rank': 7, 'mana': 340, 'level': 40, 'castTime': 3, 'min': 740, 'max': 854, 'hotTick': 0},
    {'rank': 8, 'mana': 440, 'level': 48, 'castTime': 3, 'min': 1017, 'max': 1167, 'hotTick': 0},
    {'rank': 9, 'mana': 560, 'level': 56, 'castTime': 3, 'min': 1367, 'max': 1561, 'hotTick': 0},
    {'rank': 10, 'mana': 620, 'level': 60, 'castTime': 3, 'min': 1620, 'max': 1850, 'hotTick': 0},
    {'rank': 11, 'mana': 655, 'level': 63, 'castTime': 3, 'min': 1725, 'max': 1969, 'hotTick': 0},
    {'rank': 12, 'mana': 720, 'level': 69, 'castTime': 3, 'min': 2134, 'max': 2436, 'hotTick': 0},    
  ],
};

export const lesserHealingWave = {
  name: 'Lesser Healing Wave',
  description: ['Heals a friendly target.'],
  direct: true,
  hot: false,
  class: 'shaman',
  ranks: [
    { 'rank': 1, 'mana': 105, 'level': 20, 'castTime': 1.5, 'min': 162, 'max': 186, 'hotTick': 0 },
    { 'rank': 2, 'mana': 145, 'level': 28, 'castTime': 1.5, 'min': 247, 'max': 281, 'hotTick': 0 },
    { 'rank': 3, 'mana': 185, 'level': 36, 'castTime': 1.5, 'min': 337, 'max': 381, 'hotTick': 0 },
    { 'rank': 4, 'mana': 235, 'level': 44, 'castTime': 1.5, 'min': 458, 'max': 514, 'hotTick': 0 },
    { 'rank': 5, 'mana': 305, 'level': 52, 'castTime': 1.5, 'min': 631, 'max': 705, 'hotTick': 0 },
    { 'rank': 6, 'mana': 380, 'level': 60, 'castTime': 1.5, 'min': 832, 'max': 928, 'hotTick': 0 },
    { 'rank': 7, 'mana': 440, 'level': 66, 'castTime': 1.5, 'min': 1039, 'max': 1185, 'hotTick': 0 },
  ],
};

export const chainHeal = {
  name: 'Chain Heal',
  description: ['Heals the friendly target, then jumps to heal additional nearby targets. If cast on a party member, the heal will only jump to other party members. Each jump is 50% as effective as the previous target. Heals 3 total targets.'],
  direct: true,
  hot: false,
  class: 'shaman',
  ranks: [
    { 'rank': 1, 'mana': 260, 'level': 40, 'castTime': 2.5, 'min': 320, 'max': 368, 'hotTick': 0 },
    { 'rank': 2, 'mana': 315, 'level': 46, 'castTime': 2.5, 'min': 405, 'max': 465, 'hotTick': 0 },
    { 'rank': 3, 'mana': 405, 'level': 54, 'castTime': 2.5, 'min': 551, 'max': 629, 'hotTick': 0 },
    { 'rank': 4, 'mana': 435, 'level': 61, 'castTime': 2.5, 'min': 605, 'max': 691, 'hotTick': 0 },
    { 'rank': 5, 'mana': 540, 'level': 68, 'castTime': 2.5, 'min': 826, 'max': 943, 'hotTick': 0 },
  ],
};

export const flashOfLight = {
  name: 'Flash Of Light',
  description: ['Heals a friendly target'],
  class: 'paladin',
  direct: true,
  hot: false,
  ranks: [
    { 'rank': 1, 'mana': 35, 'level': 20, 'castTime': 1.5, 'min': 67, 'max': 77, 'hotTick': 0 },
    { 'rank': 2, 'mana': 50, 'level': 26, 'castTime': 1.5, 'min': 102, 'max': 117, 'hotTick': 0 },
    { 'rank': 3, 'mana': 70, 'level': 34, 'castTime': 1.5, 'min': 153, 'max': 171, 'hotTick': 0 },
    { 'rank': 4, 'mana': 90, 'level': 42, 'castTime': 1.5, 'min': 206, 'max': 231, 'hotTick': 0 },
    { 'rank': 5, 'mana': 115, 'level': 50, 'castTime': 1.5, 'min': 278, 'max': 310, 'hotTick': 0 },
    { 'rank': 6, 'mana': 140, 'level': 58, 'castTime': 1.5, 'min': 348, 'max': 389, 'hotTick': 0 },
    { 'rank': 7, 'mana': 180, 'level': 66, 'castTime': 1.5, 'min': 458, 'max': 513, 'hotTick': 0 },
  ],
};

export const holyLight = {
  name: 'Holy Light',
  description: ['Heals a friendly target'],
  class: 'paladin',
  direct: true,
  hot: false,
  ranks: [
    // { 'rank': 1, 'mana': 35, 'level': 1, 'castTime': 2.5, 'min': 42, 'max': 51, 'hotTick': 0 },
    // { 'rank': 2, 'mana': 60, 'level': 6, 'castTime': 2.5, 'min': 81, 'max': 96, 'hotTick': 0 },
    { 'rank': 3, 'mana': 110, 'level': 14, 'castTime': 2.5, 'min': 167, 'max': 196, 'hotTick': 0 },
    { 'rank': 4, 'mana': 190, 'level': 22, 'castTime': 2.5, 'min': 322, 'max': 368, 'hotTick': 0 },
    { 'rank': 5, 'mana': 275, 'level': 30, 'castTime': 2.5, 'min': 506, 'max': 569, 'hotTick': 0 },
    { 'rank': 6, 'mana': 365, 'level': 38, 'castTime': 2.5, 'min': 717, 'max': 799, 'hotTick': 0 },
    { 'rank': 7, 'mana': 465, 'level': 46, 'castTime': 2.5, 'min': 968, 'max': 1076, 'hotTick': 0 },
    { 'rank': 8, 'mana': 580, 'level': 54, 'castTime': 2.5, 'min': 1272, 'max': 1414, 'hotTick': 0 },
    { 'rank': 9, 'mana': 660, 'level': 60, 'castTime': 2.5, 'min': 1590, 'max': 1770, 'hotTick': 0 },
    { 'rank': 10, 'mana': 710, 'level': 62, 'castTime': 2.5, 'min': 1773, 'max': 1917, 'hotTick': 0 },
    { 'rank': 11, 'mana': 840, 'level': 70, 'castTime': 2.5, 'min': 2196, 'max': 2447, 'hotTick': 0 },
    ],
};