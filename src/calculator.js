import Heap from 'heap-js';

import {mapMutations} from 'vuex';

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
    // for priest, int/spirit are buffed numbers. other_mp5 refers to gear based mp5, BoW, food (but exclude mana pots and dark runes)
    // returns mp2
    calculateManaRegenPerTick(int, spirit, other_mp5=0) {
      let combat_spirit_based_mp2 = 0.0093271 * 2 * (int ** 0.5) * spirit * 0.3;
      return Math.floor(combat_spirit_based_mp2 + other_mp5 / 5 * 2);
    },
    // status - HEALING_SPELL_CAST, OOM
    logHelper(status, timeLastAction, currentMana, totalManaPool) {
      if (status === 'OOM') {
        return `Ran out of mana after ${this.roundToTwo(timeLastAction)}s`;
      } else if (status === 'HEALING_SPELL_CAST') {
       return `Casted healing spell at ${this.roundToTwo(timeLastAction)}s. (${currentMana} / ${totalManaPool})`;
      } else if (status === 'SHADOWFIEND_SPELL_CAST') {
       return `Casted shadowfiend at ${this.roundToTwo(timeLastAction)}s. (${currentMana} / ${totalManaPool})`;
      } else if (status === 'MANA_TICK') {
        return `Mana tick at ${this.roundToTwo(timeLastAction)}s. (${currentMana} / ${totalManaPool})`;
      } else if (status === 'SHADOWFIEND_MANA_TICK') {
        return `Shadowfiend attacked at ${this.roundToTwo(timeLastAction)}s. (${currentMana} / ${totalManaPool})`;
      } else if (status === 'SUPER_MANA_POTION' || status === 'DARK_RUNE') {
        return `Used ${status} at ${this.roundToTwo(timeLastAction)}s. (${currentMana} / ${totalManaPool})`;
      }
    },
    // bunch of magic numbers here, refactor in future
    // returns [boolean_indiciating_if_consume_used, mana_regen, message]
    consumeHelper(time, consumesOffCD, currentMana, totalManaPool) {
      let manaDeficit = totalManaPool - currentMana;

      if (time >= consumesOffCD['SUPER_MANA_POTION'] && manaDeficit > 2400) {
        consumesOffCD['SUPER_MANA_POTION'] = time + 120;
        return [true, 2400, 'SUPER_MANA_POTION'];
      } else if (time >= consumesOffCD['DARK_RUNE'] && manaDeficit > 1200 && consumesOffCD['SUPER_MANA_POTION'] > 0) {
        // our very first consume usage should be super mana potion and not dark rune
        consumesOffCD['DARK_RUNE'] = time + 120;
        return [true, 1200, 'DARK_RUNE'];
      }
      else if (time >= consumesOffCD['SHADOWFIEND'] && manaDeficit > 5000 && consumesOffCD['SUPER_MANA_POTION'] > 0 &&
        consumesOffCD['DARK_RUNE'] > 0) {
        // our very first consume usage should be super mana potion and not dark rune
        consumesOffCD['SHADOWFIEND'] = time + 60 * 5;
        return [true, 0, 'SHADOWFIEND'];
      }
      else {
        return [false, null];
      }
    },
    addItemToQueue(queue, time, type) {
      queue.push({
        time: time,
        type: type,
      });
    },
    healingSpellCastHelper(options, nextEvent, manaCost, castTime, logs) {
      // assume that mana potion can only be used before a spell cast
      // we first check for consume usage
      // consumeResults - [boolean_indiciating_if_consume_used, mana_regen, message]
      let consumeResults = this.consumeHelper(nextEvent.time, options['consumesOffCD'], options['currentMana'], options['manaPool']);
      if (consumeResults[0]) {
        // shadowfiend is handled differently
        if (consumeResults[2] !== 'SHADOWFIEND') {
          options['currentMana'] += consumeResults[1];
          logs.push(this.logHelper(consumeResults[2], nextEvent.time, options['currentMana'], options['manaPool']));
        } else {
          // if we use shadowfiend, then we don't cast a healing spell during this gcd and instead cast it 1 gcd later
          this.addItemToQueue(options['priorityQueue'], nextEvent.time + options['GCD'], 'HEALING_SPELL_CAST');
          this.addItemToQueue(options['priorityQueue'], nextEvent.time + options['intervalBetweenShadowfiendTick'], 'SHADOWFIEND_MANA_TICK');
          options['shadowfiendTicks'] = 0;
          logs.push(this.logHelper('SHADOWFIEND_SPELL_CAST', nextEvent.time, options['currentMana'], options['manaPool']));
          return;
        }
      }

      if (options['currentMana'] < manaCost) {
        // timeLastAction refers to our previously casted spell as we ran oom then
        logs.push(this.logHelper('OOM', options['timeLastAction'], options['currentMana'], options['manaPool']));
        return;
      }
      // can cast
      options['currentMana'] -= manaCost;
      options['timeLastAction'] = nextEvent.time;
      // timeLastAction refers to the time we cast the current spell
      logs.push(this.logHelper('HEALING_SPELL_CAST', options['timeLastAction'], options['currentMana'], options['manaPool']));
      // adding next spellcast (based on cast time)
      this.addItemToQueue(options['priorityQueue'], nextEvent.time + castTime, 'HEALING_SPELL_CAST');
    },
    calculateTimeOOM(manaCost, castTime) {
      let options = {
        'manaPool': 12000,
        'shadowfiendHealing': 7000,
        'intervalBetweenShadowfiendTick': 1.5, // heals over 10x 1.5s intervals
        'shadowfiendTicks': 0,
        'maxTime': 4 * 60, // in seconds,
        'gcd': 1.5,
        'timeLastAction': 0,
        'consumesOffCD': {
          'SUPER_MANA_POTION': 0,
          'DARK_RUNE': 0,
          'SHADOWFIEND': 0,
        },
      }
      options['currentMana'] = options['manaPool'];
      options['shadowfiendHealingPerTick'] = options['shadowfiendHealing'] / 10;

      const customPriorityComparator = (a, b) => a.time - b.time;
      options['priorityQueue'] = new Heap(customPriorityComparator);

      this.addItemToQueue(options['priorityQueue'], 0, 'HEALING_SPELL_CAST');
      this.addItemToQueue(options['priorityQueue'], 0.1, 'MANA_TICK');

      // // let manaPool = 12000;
      // // heals over 10x 1.5s intervals
      // // let shadowfiendHealing = 7000;
      // // let shadowfiendHealingPerTick = shadowfiendHealing / 10;
      // // let intervalBetweenShadowfiendTick = 1.5;
      // // let shadowfiendTicks = 0;
      // // let currentMana = manaPool;
      // // evaluate to max of 20 mins
      // let maxTime = 4 * 60;
      // // hardcoded for now
      let inCombatManaTick = this.calculateManaRegenPerTick(650, 600, 300);
      // let GCD = 1.5;

      let logs = [];
      let nextEvent;
      do {
        nextEvent = options['priorityQueue'].pop();
        if (nextEvent.type === 'HEALING_SPELL_CAST') {
          this.healingSpellCastHelper(options, nextEvent, manaCost, castTime, logs);
        }
        else if (nextEvent.type === 'MANA_TICK') {
          options['currentMana'] += inCombatManaTick;
          logs.push(this.logHelper('MANA_TICK', nextEvent.time, options['currentMana'], options['manaPool']));
          // adding next mana tick (based on 2s tick timer)
          this.addItemToQueue(options['priorityQueue'], nextEvent.time + 2, 'MANA_TICK');
        } else if (nextEvent.type === 'SHADOWFIEND_MANA_TICK') {
          options['shadowfiendTicks']++;
          options['currentMana'] += options['shadowfiendHealingPerTick']; 
          logs.push(this.logHelper('SHADOWFIEND_MANA_TICK', nextEvent.time, options['currentMana'], options['manaPool']));
          // once we readch 10 ticks, means shadowfiend has finished
          if (options['shadowfiendTicks'] < 10) {
            this.addItemToQueue(options['priorityQueue'], nextEvent.time + options['intervalBetweenShadowfiendTick'], 'SHADOWFIEND_MANA_TICK');
          }
        }
      } while (nextEvent.time < options['maxTime'])

      console.log(options['consumesOffCD']);
      return {
        // time: manaPool / manaCostPerSec,
        logs: logs,
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