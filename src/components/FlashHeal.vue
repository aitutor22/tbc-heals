<template>
  <div class="container">
    <div class="row">
      <div v-if="spells" class="col-12">
        <h1>{{ spells['name'] }}</h1>
      </div>
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
          <input class="form-check-input" type="checkbox" id="spirtualHealing" v-model="priestOptions['spirtualHealing']">
          <label class="form-check-label" for="spirtualHealing">Spirtual Healing</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="empoweredHealing" v-model="priestOptions['empoweredHealing']">
          <label class="form-check-label" for="empoweredHealing">Empowered Healing</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="holyConcentration" v-model="priestOptions['holyConcentration']">
          <label class="form-check-label" for="holyConcentration">Holy Concentration</label>
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
import {flashHeal as spellData} from '../spells';
import {mixin} from '../calculator';
import {chartoptions} from '../shared_variables';

// https://stackoverflow.com/questions/38085352/how-to-use-two-y-axes-in-chart-js-v2

export default {
  name: 'FlashHeal',
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
    ...mapFields(['healingPower', 'critChance', 'hastePercent', 'overhealPercent', 'priestOptions']),
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
      for (let i = 0; i < spellRanks.length; i++) {
        let spell = spellRanks[i];
        // spell coefficient is based off original casting time
        let originalCastTime = spell['castTime'];

        spell['castTime'] /= (1 + this.hastePercent / 100);
        if (this.priestOptions['holyConcentration']) {
          spell['mana'] *= (1 - 0.06);
        }

        spell['baseHeal'] = (spell['min'] + spell['max']) / 2
          * (this.priestOptions['spirtualHealing'] ? 1.1 : 1)
          * (100 - this.overhealPercent) / 100;

        let coefficient = spell['levelPenalty'] * originalCastTime / 3.5;
        // this can be quite confusing but basically, empowered healing needs to be discounted by level penalty
        // if levelPenalty < 1
        // https://tbc.wowhead.com/guides/priest-healer-stat-priority-burning-crusade-classic
        coefficient += (this.priestOptions['empoweredHealing'] ? 0.1 * spell['levelPenalty']: 0);
        spell['bonusHeal'] = (this.healingPower * coefficient)
          * (this.priestOptions['spirtualHealing'] ? 1.1 : 1)
          * (100 - this.overhealPercent) / 100;

        this.calculateAndFormatMetrics(spell, this.critChance, true);
      }
    },
  },
  mounted() {
    this.baseChartData = this.init(spellData);
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
