import Heap from 'heap-js';

import {mapMutations} from 'vuex';

const CONSUMES = {
  'SUPER_MANA_POTION': {
    value: 2400,
    cooldown: 120,
    waitForInitialUses: [],
  },
  'DARK_RUNE': {
    value: 1200,
    cooldown: 120,
    // requires super mana potion to be used once first
    waitForInitialUses: ['SUPER_MANA_POTION'],
  },
  'SHADOWFIEND': {
    value: 0,
    cooldown: 60 * 5,
    waitForInitialUses: ['SUPER_MANA_POTION', 'DARK_RUNE'],
  },
};

export const mixin = {
  computed: {},
  methods: {
    ...mapMutations(['setClassName']),
    roundToTwo(num) {    
      return +(Math.round(num + "e+2")  + "e-2");
    },
    convertToNumber(txt) {
      if (Number.isNaN(txt)) return 0;
      return Number(txt);
    },
    // after consulting with currelius (pally) and knade (priest), the right formula should be
    // (level_rank_was_learned + 11) / 70
    calculateLevelPenalties(spellRanks) {
      for (let i = 0; i < spellRanks.length; i++) {
        let levelPenalty = Math.min((spellRanks[i]['level'] + 11) / 70, 1);
        // sub level 20 penalty
        if (spellRanks[i]['level'] < 20) {
          levelPenalty *= (1 - ((20 - spellRanks[i]['level']) * 0.0375))
        }
        spellRanks[i]['levelPenalty'] = levelPenalty
      }
    },
    calculateInspirationUptime(critChance, castTime) {
      let num_cast_in_15_sec = 15 / castTime;
      return 1 - (1 - critChance) ** num_cast_in_15_sec;
    },
    // given that a spell has baseHeal and bonusHeal, calculate various metrics
    calculateAndFormatMetrics(spell, critChance, includeInspiration) {
      let uncritHeal = spell['baseHeal'] + spell['bonusHeal'];
      spell['critHeal'] = uncritHeal * 0.5 * critChance / 100;
      spell['totalHeal'] = uncritHeal + spell['critHeal'];

      spell['hps'] = Math.round(spell['totalHeal'] / spell['castTime']);
      spell['efficiency'] = this.roundToTwo(spell['totalHeal'] / spell['mana']);

      if (includeInspiration) {
        spell['inspiration_uptime'] = Math.round(this.calculateInspirationUptime(critChance / 100, spell['castTime']) * 100);
      }

      // do rounding for formatting only at the end
      spell['mana'] = Math.round(spell['mana']);
      spell['castTime'] = this.roundToTwo(spell['castTime']);
      spell['baseHeal'] = Math.round(spell['baseHeal']);
      spell['bonusHeal'] = Math.round(spell['bonusHeal']);
      spell['critHeal'] = Math.round(spell['critHeal']);
      spell['totalHeal'] = Math.round(spell['totalHeal']);
    },
    // per currelius, blessing of Light is multiplied by level penalty but not cast time penalty
    // true if holy light, else flash of light
    calculateBlessingOfLightBonus(isHolyLight, levelPenalty) {
      let baseBlessingOfLight = isHolyLight ? 580 : 185;
      let libramSouls = isHolyLight ? 120 : 60;

      if (!this.paladinOptions['blessingLight']) {
        return 0
      }
      return (baseBlessingOfLight + (this.paladinOptions['libram'] === 'souls' ? libramSouls : 0)) * levelPenalty;
    },
    // we assume everyone has AI, MOTW, draenic wisdom and kings
    // user selected stuff are kreegs
    calculateTotalInt(args) {
      // Arcane Intellect - 40
      // Draenic Wisdom - 30
      // MoTW - 19
      // Kreegs - -5
      // Kings - +10%
      return (args['int'] + 40 + 30 + 19 + (args['kreegs'] ? -5 : 0)) * 1.1;
    },
    // we assume everyone has MOTW, food buff, draenic wisdom and kings
    // user selected stuff are kreegs
    calculateTotalSpirit(args) {
      // MoTW - 19
      // Draenic Wisdom - 30
      // Food Buff - 20
      // Scroll - 30
      // IDS - 50
      // Kreegs - 25
      // Spirit of Redemption - +5%
      // Kings - +10%
      // Human Racial - +10%
      let idsSpirit = 0,
        otherSpirit = 0;
      if (args['idsScroll'] === 'ids') {
        idsSpirit = 50;
      } else if (args['idsScroll'] === 'scroll') {
        idsSpirit = 30;
      }

      otherSpirit = (args['kreegs'] ? 25 : 0) + idsSpirit;
      return (args['spirit'] + 19 + 30 + 20 + otherSpirit)
        * 1.05 * 1.1
        * (args['isHuman'] ? 1.1 : 1);
    },
    calculateTotalOtherMp5(args, castTime) {
      // Brilliant Mana Oil - 12
      // Imp BoW - 49.2
      // Mana Spring - 50 * 1.25 (after talents)
      // IED - 5% proc rate to return 300, 15s icd
      // formula for IED is 15 + 20 * castTime

      return args['otherMP5'] + (args['mst'] ? 50 * 1.25: 0) + (args['bow'] ? 49.2: 0)
        + (args['ied'] ? 300 / (15 + 20 * castTime) * 5 : 0)
        + args['snowballMP5'] + 12;
    },
    // for priest, int/spirit are buffed numbers. other_mp5 refers to gear based mp5, BoW, food (but exclude mana pots and dark runes)
    // returns mp2
    calculateManaRegenPerTick(int, spirit, other_mp5=0) {
      let combat_spirit_based_mp2 = 0.0093271 * 2 * (int ** 0.5) * spirit * 0.3;
      return Math.floor(combat_spirit_based_mp2 + other_mp5 / 5 * 2);
    },
    // status - HEALING_SPELL_CAST, OOM
    logHelper(status, time, options) {
      let currentMana = options['currentMana'],
        manaPool = options['manaPool'],
        msg = '';

      if (status === 'OOM') {
        msg = `Ran out of mana after ${this.roundToTwo(time)}s`;
      } else if (status === 'HEALING_SPELL_CAST') {
       msg = `Casted healing spell at ${this.roundToTwo(time)}s. (${currentMana} / ${manaPool})`;
      } else if (status === 'MANA_TICK') {
        msg = `Mana tick at ${this.roundToTwo(time)}s. (${currentMana} / ${manaPool})`;
      } else if (status === 'SHADOWFIEND_MANA_TICK') {
        msg = `Shadowfiend attacked at ${this.roundToTwo(time)}s. (${currentMana} / ${manaPool})`;
      } else if (status === 'SUPER_MANA_POTION' || status === 'DARK_RUNE' || status === 'SHADOWFIEND') {
        msg = `Used ${status} at ${this.roundToTwo(time)}s. (${currentMana} / ${manaPool})`;
      }
      if (msg !== '') options['logs'].push(msg);
      if(status != 'HEALING_SPELL_CAST' && status !== 'MANA_TICK') {
        options['highlightedLogs'].push(msg);
      }
    },
    // bunch of magic numbers here, refactor in future
    // returns [boolean_indiciating_if_consume_used, mana_regen, message]
    consumeHelper(time, options) {
      let manaDeficit = options['manaPool'] - options['currentMana'];

      for (let key in CONSUMES) {
        let deficitToUse = key !== 'SHADOWFIEND' ? CONSUMES[key]['value'] :
          options['shadowfiendHealing'];

        if (time >= options['consumesOffCD'][key] && manaDeficit > deficitToUse) {
          // for dark rune and innervates, we need to check if previous consumes (e.g. super mana potion have been used)
          let haveUsedPreviousConsumes = CONSUMES[key]['waitForInitialUses'].map(i => options['consumesOffCD'][i] > 0);
          if (haveUsedPreviousConsumes.length > 0 && haveUsedPreviousConsumes.indexOf(false) > -1) {
            continue;
          }

          // if we do use a consume, we return as we should only use one consume at a time
          options['consumesOffCD'][key] = time + CONSUMES[key]['cooldown'];
          if (key !== 'SHADOWFIEND') {
            this.changeMana(options, CONSUMES[key]['value'], key);
          } else {
            this.addItemToQueue(options, time + options['intervalBetweenShadowfiendTick'], 'SHADOWFIEND_MANA_TICK');
            options['shadowfiendTicks'] = 0;
          }
          this.logHelper(key, time, options);
          return key;
        }
      }
      return null;
    },
    addItemToQueue(options, time, type) {
      options['priorityQueue'].push({
        time: time,
        type: type,
      });
    },
    // use this to track mana changes
    changeMana(options, value, type) {
      if (typeof options['manaSummary'][type] === 'undefined') options['manaSummary'][type] = 0;
      options['currentMana'] += value;
      // cannot exceed max mana
      if (options['currentMana'] > options['manaPool']) options['currentMana'] = options['manaPool'];
      options['manaSummary'][type] += value;
    },
    healingSpellCastHelper(options, nextEvent, castTime) {
      // assume that mana potion can only be used before a spell cast
      // we first check for consume usage
      let consumeResults = this.consumeHelper(nextEvent.time, options);
      // shadowfiend is handled differently as it doesnt add back mana immediately
      if (consumeResults === 'SHADOWFIEND') {
        // if we use shadowfiend, then we don't cast a healing spell during this gcd and instead cast it 1 gcd later
        this.addItemToQueue(options, nextEvent.time + options['GCD'], 'HEALING_SPELL_CAST');
        return;
      }

      if (options['currentMana'] < options['manaCost']) {
        // timeLastAction refers to our previously casted spell as we ran oom then
        this.logHelper('OOM', options['timeLastAction'], options);
        options['timeToOOM'] = options['timeLastAction'];
        options['status'] = 'ended'
        return;
      }
      // can cast
      this.changeMana(options, -options['manaCost'], 'HEALING_SPELL_CAST');
      options['timeLastAction'] = nextEvent.time;
      // timeLastAction refers to the time we cast the current spell
      this.logHelper('HEALING_SPELL_CAST', options['timeLastAction'], options);
      // adding next spellcast (based on cast time)
      this.addItemToQueue(options, nextEvent.time + castTime, 'HEALING_SPELL_CAST');
    },
    calculateTimeOOM(args) {
      let options = {
        'manaPool': args['manaPool'],
        'manaCost': args['manaCost'],
        'shadowfiendHealing': args['shadowfiendMana'],
        'intervalBetweenShadowfiendTick': 1.5, // heals over 10x 1.5s intervals
        'shadowfiendTicks': 0,
        'maxTime': 10 * 60, // in seconds,
        'GCD': 1.5,
        'timeLastAction': 0,
        'consumesOffCD': {
          'SUPER_MANA_POTION': 0,
          'DARK_RUNE': 0,
          'SHADOWFIEND': 0,
        },
        // can either be on-going or ended
        'status': 'ongoing',
        'logs': [],
        // to include consume use and shadowfiend only
        'highlightedLogs': [],
        'manaSummary': {},
        'scatterData': [],
      };
      let castTime = 60 / args['cpm'],
        buffedInt = this.calculateTotalInt(args),
        buffedSpirit = this.calculateTotalSpirit(args),
        otherMP5 = this.calculateTotalOtherMp5(args, castTime);

      let inCombatManaTick = this.calculateManaRegenPerTick(buffedInt, buffedSpirit, otherMP5);
      options['currentMana'] = options['manaPool'];
      options['shadowfiendHealingPerTick'] = options['shadowfiendHealing'] / 10;

      // console.log(args['int'], );
      const customPriorityComparator = (a, b) => a.time - b.time;
      options['priorityQueue'] = new Heap(customPriorityComparator);

      this.addItemToQueue(options, 0, 'HEALING_SPELL_CAST');
      this.addItemToQueue(options, 0.1, 'MANA_TICK');
  
      let nextEvent;
      do {
        nextEvent = options['priorityQueue'].pop();
        if (nextEvent.type === 'HEALING_SPELL_CAST') {
          this.healingSpellCastHelper(options, nextEvent, castTime);
        }
        else if (nextEvent.type === 'MANA_TICK') {
          this.changeMana(options, inCombatManaTick, 'MANA_TICK');
          this.logHelper('MANA_TICK', nextEvent.time, options);
          // adding next mana tick (based on 2s tick timer)
          this.addItemToQueue(options, nextEvent.time + 2, 'MANA_TICK');
        } else if (nextEvent.type === 'SHADOWFIEND_MANA_TICK') {
          options['shadowfiendTicks']++;
          this.changeMana(options, options['shadowfiendHealingPerTick'], 'SHADOWFIEND');
          this.logHelper('SHADOWFIEND_MANA_TICK', nextEvent.time, options);
          // once we readch 10 ticks, means shadowfiend has finished
          if (options['shadowfiendTicks'] < 10) {
            this.addItemToQueue(options, nextEvent.time + options['intervalBetweenShadowfiendTick'], 'SHADOWFIEND_MANA_TICK');
          }
        }

        // when we have multiple events at the same time, we only show the final currentMana for that time
        // this ensures graph is smoother
        if (options['scatterData'].length > 0) {
          let lastEntry = options['scatterData'][options['scatterData'].length - 1];
          if (nextEvent.time === lastEntry.x) {
            // console.log(lastEntry.x)
            options['scatterData'].pop();
          }
        }
        options['scatterData'].push({x: nextEvent.time, y: options['currentMana']});
      } while (nextEvent.time < options['maxTime'] && options['status'] === 'ongoing')

      return {
        // time: manaPool / manaCostPerSec,
        logs: options['logs'],
        highlightedLogs: options['highlightedLogs'],
        manaSummary: options['manaSummary'],
        statsSummary: {
          'buffedInt': Math.floor(buffedInt),
          'buffedSpirit': Math.floor(buffedSpirit),
          'totalOtherMP5': Math.floor(otherMP5)
        },
        scatterData: options['scatterData'],
        timeToOOM: Math.floor(options['timeToOOM']),
        inCombatManaTick: inCombatManaTick, 
      };
    },
    init(spellData) {
      this.setClassName(spellData['class']);
      // let numRanks = spellRanks.length;
      let baseChartData = {
        labels: spellData['ranks'].map(spell => `Rank ${spell['rank']}`),
        datasets: [],
      };
      return baseChartData;
    },
    createChartData(chartData) {
      chartData['datasets'].push({
        label: 'HPS',
        data: this.spells['ranks'].map(spell => spell['hps']),
        type: 'line',
        borderColor: 'green',
        fill: false,
        pointBorderWidth: 3,
        pointBorderColor: 'green',
        pointBackgroundColor: '#fff',
        borderWidth: 1,
        yAxisID: 'A',
      });

      chartData['datasets'].push({
        label: 'Efficiency',
        data: this.spells['ranks'].map(spell => spell['efficiency']),
        type: 'line',
        borderColor: 'blue',
        fill: false,
        pointBorderWidth: 3,
        pointBorderColor: 'blue',
        pointBackgroundColor: '#fff',
        borderWidth: 1,
        yAxisID: 'B',
      });

      chartData['datasets'].push({
        label: 'Base',
        data: this.spells['ranks'].map(spell => spell['baseHeal']),
        backgroundColor: '#8884d8',
        stack: 'bar-stacked',
      });

      chartData['datasets'].push({
        label: 'Bonus',
        data: this.spells['ranks'].map(spell => spell['bonusHeal']),
        backgroundColor: '#82ca9d',
        stack: 'bar-stacked',
      });

      if (typeof this.spells['ranks'][0]['critHeal'] !== 'undefined') {
        chartData['datasets'].push({
          label: 'Crit',
          data: this.spells['ranks'].map(spell => spell['critHeal']),
          backgroundColor: '#ffc658',
          stack: 'bar-stacked',
        });
      }

      return chartData;
    }
  },
  mounted() {
    // console.log('mounting');
    // console.log(this.$route.query);
  }
}