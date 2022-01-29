export const mixin = {
  methods: {
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
      return 1 - (1 - critChance) ** num_cast_in_15_sec
    },
    createEmptyChartData(spellData) {
      // let numRanks = spellRanks.length;
      let baseChartData = {
        labels: spellData['ranks'].map(spell => `Rank ${spell['rank']}`),
        datasets: [],
      };
      return baseChartData;
    },
    createChartData(chartData) {
      chartData['datasets'].push({
        label: 'hps',
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
        label: 'efficiency',
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
      });

      chartData['datasets'].push({
        label: 'Bonus',
        data: this.spells['ranks'].map(spell => spell['bonusHeal']),
        backgroundColor: '#82ca9d',
      });

      if (typeof this.spells['ranks'][0]['critHeal'] !== 'undefined') {
        chartData['datasets'].push({
          label: 'Crit',
          data: this.spells['ranks'].map(spell => spell['critHeal']),
          backgroundColor: '#ffc658',
        });
      }

      return chartData;
    }
  }
}