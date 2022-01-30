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

        <br>
        <h6>Totem of...</h6>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="flexRadioDefault" id="plains" value="plains" v-model="shamanOptions['totem']">
          <label class="form-check-label" for="plains">
            Plains
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
import {lesserHealingWave as spellData} from '../spells';
import {mixin} from '../calculator';
import {chartoptions} from '../shared_variables';

// https://stackoverflow.com/questions/38085352/how-to-use-two-y-axes-in-chart-js-v2
// note that HW rank 10 and below calculations differ from egregious as our level penalty formula is slightly different
export default {
  name: 'LesserHealingWave',
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
      let _spells = JSON.parse(JSON.stringify(spellData));
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
      let totemPlains = {
        1: 13,
        2: 24,
        3: 35,
        4: 46,
        5: 57,
        6: 68,
        7: 79,
      }

      for (let i = 0; i < spellRanks.length; i++) {
        let spell = spellRanks[i];
        // spell coefficient is based off original casting time
        let originalCastTime = spell['castTime'];

        if (this.shamanOptions['tidalFocus']) {
          spell['mana'] *= 0.95;
        }

        spell['castTime'] /= (1 + this.hastePercent / 100);
        spell['baseHeal'] = (spell['min'] + spell['max']) / 2 * (this.shamanOptions['purification'] ? 1.1 : 1)
          * (100 - this.overhealPercent) / 100;

        let coefficient = spell['levelPenalty'] * originalCastTime / 3.5;
        // need to convertToNumber to prevent bugs where javascript uses string addition
        spell['bonusHeal'] = ((this.convertToNumber(this.healingPower) + (this.shamanOptions['totem'] === 'plains' ? totemPlains[spell['rank']] : 0)) * coefficient)
          * (this.shamanOptions['purification'] ? 1.1 : 1)
          * (100 - this.overhealPercent) / 100;

        this.calculateAndFormatMetrics(spell, this.critChance, true);
      }
    },
  },
  mounted() {
    this.baseChartData = this.createEmptyChartData(spellData);
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
