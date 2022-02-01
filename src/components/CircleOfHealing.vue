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
          <input class="form-check-input" type="checkbox" id="spirtualHealing" v-model="priestOptions['spirtualHealing']">
          <label class="form-check-label" for="spirtualHealing">Spirtual Healing</label>
        </div>

        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="mentalAgility" v-model="priestOptions['mentalAgility']">
          <label class="form-check-label" for="mentalAgility">Mental Agility</label>
        </div>

        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="crystalSpire" v-model="crystalSpire">
          <label class="form-check-label" for="crystalSpire">Crystal Spire of Karabor</label>
        </div>
        <div class="input-group mb-2" style="width: 50%" v-if="crystalSpire">
          <span class="input-group-text" id="basic-addon1">Spire Proc %</span>
          <input type="text" class="form-control" v-model="spireProcPercent">
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
import {circleOfHealing as spellData} from '../spells';
import {mixin} from '../calculator';
import {chartoptions} from '../shared_variables';

// https://stackoverflow.com/questions/38085352/how-to-use-two-y-axes-in-chart-js-v2

const NUMBER_OF_TARGETS_HIT = 5;

export default {
  name: 'CircleOfHealing',
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
    ...mapFields(['healingPower', 'critChance', 'hastePercent', 'overhealPercent',
        'crystalSpire', 'spireProcPercent', 'priestOptions']),
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

        if (this.priestOptions['mentalAgility']) {
          spell['mana'] *= 0.9;
        }

        spell['castTime'] /= (1 + this.hastePercent / 100);
        spell['baseHeal'] = (spell['min'] + spell['max']) / 2
          * (this.priestOptions['spirtualHealing'] ? 1.1 : 1)
          * NUMBER_OF_TARGETS_HIT
          * (100 - this.overhealPercent) / 100;

        // special formula for aoe coefficient
        let coefficient = (spell['levelPenalty'] * originalCastTime / 3.5) / 2;
        spell['bonusHeal'] = (this.healingPower * coefficient)
          * (this.priestOptions['spirtualHealing'] ? 1.1 : 1)
          * NUMBER_OF_TARGETS_HIT

        // crystalSpire can crit, but crit is considered in the calculateAndFormatMetrics function
        if (this.crystalSpire) {
          spell['bonusHeal'] += 200 * NUMBER_OF_TARGETS_HIT * this.spireProcPercent / 100
            * (this.priestOptions['spirtualHealing'] ? 1.1 : 1);
        }
        spell['bonusHeal'] *= (100 - this.overhealPercent) / 100;

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
