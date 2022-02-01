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
          <input class="form-check-input" type="checkbox" id="improvedHealing" v-model="priestOptions['improvedHealing']">
          <label class="form-check-label" for="improvedHealing">Improved Healing</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="divineFury" v-model="priestOptions['divineFury']">
          <label class="form-check-label" for="divineFury">Divine Fury</label>
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
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="2pT5" v-model="priestOptions['2pT5']">
          <label class="form-check-label" for="2pT5">2px T5</label>
        </div>

        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="4pT6" v-model="priestOptions['4pT6']">
          <label class="form-check-label" for="4pT6">4px T6</label>
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
import {greaterHeal as spellData} from '../spells';
import {mixin} from '../calculator';
import {chartoptions} from '../shared_variables';

// https://stackoverflow.com/questions/38085352/how-to-use-two-y-axes-in-chart-js-v2

export default {
  name: 'GreaterHeal',
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

        if (this.priestOptions['improvedHealing']) {
          spell['mana'] *= 0.85;
        }

        if (this.priestOptions['holyConcentration']) {
          spell['mana'] *= (1 - 0.06);
        }

        if (this.priestOptions['2pT5']) {
          spell['mana'] -= 100;
        }

        if (this.priestOptions['divineFury']) {
          spell['castTime'] = 2.5;
        }

        spell['castTime'] /= (1 + this.hastePercent / 100);
        spell['baseHeal'] = (spell['min'] + spell['max']) / 2 * (this.priestOptions['spirtualHealing'] ? 1.1 : 1)
          * (this.priestOptions['4pT6'] ? 1.05 : 1)
          * (100 - this.overhealPercent) / 100;
        let coefficient = spell['levelPenalty'] * originalCastTime / 3.5;
        // this can be quite confusing but basically, empowered healing needs to be discounted by level penalty
        // if levelPenalty < 1
        // https://tbc.wowhead.com/guides/priest-healer-stat-priority-burning-crusade-classic
        coefficient += (this.priestOptions['empoweredHealing'] ? 0.2 * spell['levelPenalty']: 0);
        spell['bonusHeal'] = (this.healingPower * coefficient)
          * (this.priestOptions['spirtualHealing'] ? 1.1 : 1)
          * (this.priestOptions['4pT6'] ? 1.05 : 1)
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
