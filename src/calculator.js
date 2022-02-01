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
    // status - SPELL_CAST, OOM
    logHelper(status, timeLastAction, currentMana, totalManaPool) {
      if (status === 'OOM') {
        return `Ran out of mana after ${this.roundToTwo(timeLastAction)}s`;
      } else if (status === 'SPELL_CAST') {
       return `Casted spell at ${this.roundToTwo(timeLastAction)}s. (${currentMana} / ${totalManaPool})`;
      }
    },
    calculateTimeOOM(manaCost, castTime) {
      let baseManaPool = 10000;
      let shadowFiend = 0
      let totalManaPool = baseManaPool + shadowFiend;
      let currentMana = totalManaPool;
      let manaCostPerSec = manaCost / castTime;
      // evaluate to max of 20 mins
      let maxTime = 1 * 60;

      const customPriorityComparator = (a, b) => a.time - b.time;
      const priorityQueue = new Heap(customPriorityComparator);

      // sets up first spellcast event
      priorityQueue.push({
        time: 0,
        type: 'spellcast'
      });

      let logs = [];
      let timeLastAction = 0;
      let nextEvent;
      do {
        nextEvent = priorityQueue.pop();
        if (nextEvent.type === 'spellcast') {
          if (currentMana < manaCost) {
            // timeLastAction refers to our previously casted spell as we ran oom then
            logs.push(this.logHelper('OOM', timeLastAction, currentMana, totalManaPool));
            break;
          }
          // can cast
          currentMana -= manaCost;
          timeLastAction = nextEvent.time;
          // timeLastAction refers to the time we cast the current spell
          logs.push(this.logHelper('SPELL_CAST', timeLastAction, currentMana, totalManaPool));
          priorityQueue.push({
            time: nextEvent.time + castTime,
            type: 'spellcast'
          });

        }
      } while (nextEvent.time < maxTime)

      return {
        time: totalManaPool / manaCostPerSec,
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