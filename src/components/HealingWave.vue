<template>
  <div class="container">
    <div class="row">
      <div v-if="spells" class="col-12">
        <h1>{{ spells['name'] }}</h1>
      </div>
      <!-- only reason para code is so weird is to fit in double paras for COH -->
      <div v-if="spells" class="col-12">
        <p v-for="(para, index) in spells['description']" :key="index">{{ para }}</p>
      </div>
    </div>
    <div class="row">
      <div class="col-8">
        <bar-chart
          v-if="spells"
          id="chart"
          :chart-data="chartdata"
          :options="chartoptions"/>
      </div>

      <div class="col-4">
        <div class="input-group mb-2" style="width: 50%">
          <span class="input-group-text" id="basic-addon1">+Heal</span>
          <input type="text" class="form-control" v-model="healingPower">
        </div>

        <div class="input-group mb-2" style="width: 50%">
          <span class="input-group-text" id="basic-addon1">Crit %</span>
          <input type="text" class="form-control" v-model="critChance">
        </div>

        <div class="input-group mb-2" style="width: 50%">
          <span class="input-group-text" id="basic-addon1">Haste %</span>
          <input type="text" class="form-control" v-model="hastePercent">
        </div>

        <div class="input-group mb-2" style="width: 50%">
          <span class="input-group-text" id="basic-addon1">Overheal %</span>
          <input type="text" class="form-control" v-model="overhealPercent">
        </div>

        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="purification" v-model="shamanOptions['purification']">
          <label class="form-check-label" for="purification">Purification</label>
        </div>

        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="tidalFocus" v-model="shamanOptions['tidalFocus']">
          <label class="form-check-label" for="tidalFocus">Tidal Focus</label>
        </div>

        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="improvedHealingWave" v-model="shamanOptions['improvedHealingWave']">
          <label class="form-check-label" for="improvedHealingWave">Improved Healing Wave</label>
        </div>

        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="healingWay" v-model="shamanOptions['healingWay']">
          <label class="form-check-label" for="healingWay">Healing Way</label>
        </div>

<!--         <div class="form-check">
          <input class="form-check-input" type="checkbox" id="maelstrom" v-model="shamanOptions['maelstrom']">
          <label class="form-check-label" for="maelstrom">Totem of the Maelstrom</label>
        </div> -->

        <br>
        <h6>Totem of...</h6>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="flexRadioDefault" id="maelstrom" value="maelstrom" v-model="shamanOptions['totem']">
          <label class="form-check-label" for="maelstrom">
            Maelstrom
          </label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="flexRadioDefault" id="regrowth" value="regrowth" v-model="shamanOptions['totem']">
          <label class="form-check-label" for="regrowth">
            Regrowth
          </label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="flexRadioDefault" id="others" value="others" v-model="shamanOptions['totem']">
          <label class="form-check-label" for="others">
            Others
          </label>
        </div>
      </div>
    </div>

    <summary-table v-if="spells" :spells="spells"></summary-table>
  </div>
</template>

<script>
import {mapFields} from 'vuex-map-fields';
import BarChart from '../chart.js';
import SummaryTable from './SummaryTable.vue';
import {healingWave} from '../spells';
import {mixin} from '../calculator';
import {chartoptions} from '../shared_variables';

// https://stackoverflow.com/questions/38085352/how-to-use-two-y-axes-in-chart-js-v2
// note that HW rank 10 and below calculations differ from egregious as our level penalty formula is slightly different
export default {
  name: 'HealingWave',
  components: {BarChart, SummaryTable},
  props: {
  },
  mixins: [mixin],
  data() {
    return {
      baseChartData: null,
      chartoptions: chartoptions,
    };
  },

  computed: {
    ...mapFields(['healingPower', 'critChance', 'hastePercent', 'overhealPercent', 'shamanOptions']),
    spells() {
      if (!this.baseChartData) return;
      let _spells = JSON.parse(JSON.stringify(healingWave));
      this.calculateLevelPenalties(_spells['ranks']);
      this.calculateHealing(_spells['ranks']);
      return _spells;
    },
    chartdata() {
      if (!this.baseChartData) return;
      return this.createChartData(JSON.parse(JSON.stringify(this.baseChartData)));
    },
  },
  methods: {
    calculateHealing(spellRanks) {
      // maps level to increase in healing power (based off egregious' calculator)
      let totemRegrowth = {
        1: 10,
        2: 17,
        3: 24,
        4: 31,
        5: 38,
        6: 45,
        7: 52,
        8: 59,
        9: 66,
        10: 73,
        11: 80,
        12: 88
      }

      for (let i = 0; i < spellRanks.length; i++) {
        let spell = spellRanks[i];
        // spell coefficient is based off original casting time
        let originalCastTime = spell['castTime'];

        // assume maelstrom applies then tidal focus
        // haven't double tested, but mana cost values seem close enough
        // also, from discord, r1 hw cost is 1, which checks out
        if (this.shamanOptions['totem'] === 'maelstrom') {
          spell['mana'] -= 24;
        }

        if (this.shamanOptions['tidalFocus']) {
          spell['mana'] *= 0.95;
        }

        if (this.shamanOptions['improvedHealingWave']) {
          spell['castTime'] -= 0.5;
        }

        spell['castTime'] /= (1 + this.hastePercent / 100);
        spell['baseHeal'] = (spell['min'] + spell['max']) / 2 * (this.shamanOptions['purification'] ? 1.1 : 1)
          * (this.shamanOptions['healingWay'] ? 1.18 : 1)
          * (100 - this.overhealPercent) / 100;

        let coefficient = spell['levelPenalty'] * originalCastTime / 3.5;
        spell['bonusHeal'] = ((this.healingPower + (this.shamanOptions['totem'] === 'regrowth' ? totemRegrowth[spell['rank']] : 0)) * coefficient)
          * (this.shamanOptions['purification'] ? 1.1 : 1)
          * (this.shamanOptions['healingWay'] ? 1.18 : 1)
          * (100 - this.overhealPercent) / 100;

        spell['temp_coefficient'] = coefficient * 1.1;

        let uncritHeal = spell['baseHeal'] + spell['bonusHeal'];
        spell['critHeal'] = uncritHeal * 0.5 * this.critChance / 100;
        spell['totalHeal'] = uncritHeal + spell['critHeal'];

        spell['hps'] = Math.round(spell['totalHeal'] / spell['castTime']);
        spell['efficiency'] = this.roundToTwo(spell['totalHeal'] / spell['mana']);
        spell['inspiration_uptime'] = this.calculateInspirationUptime(this.critChance / 100, spell['castTime']);

        // do rounding for formatting only at the end
        spell['mana'] = Math.round(spell['mana']);
        spell['castTime'] = this.roundToTwo(spell['castTime']);
        spell['inspiration_uptime'] = Math.round(spell['inspiration_uptime'] * 100);
        spell['baseHeal'] = Math.round(spell['baseHeal']);
        spell['bonusHeal'] = Math.round(spell['bonusHeal']);
        spell['critHeal'] = Math.round(spell['critHeal']);
        spell['totalHeal'] = Math.round(spell['totalHeal']);
      }
    },
  },
  mounted() {
    console.log('healing wave');
    this.baseChartData = this.createEmptyChartData(healingWave);
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
