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
          <span class="input-group-text" id="basic-addon1">Haste %</span>
          <input type="text" class="form-control" v-model="hastePercent">
        </div>

        <div class="input-group mb-2" style="width: 50%">
          <span class="input-group-text" id="basic-addon1">Overheal %</span>
          <input type="text" class="form-control" v-model="overhealPercent">
        </div>

        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="improvedRenew" v-model="priestOptions['improvedRenew']">
          <label class="form-check-label" for="improvedRenew">Improved Renew</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="mentalAgility" v-model="priestOptions['mentalAgility']">
          <label class="form-check-label" for="mentalAgility">Mental Agility</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="spirtualHealing" v-model="priestOptions['spirtualHealing']">
          <label class="form-check-label" for="spirtualHealing">Spirtual Healing</label>
        </div>

        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="4pT5" v-model="priestOptions['4pT5']">
          <label class="form-check-label" for="4pT5">4px T5</label>
        </div>

        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="2pT3" v-model="priestOptions['2pT3']">
          <label class="form-check-label" for="2pT3">2px T3</label>
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
import {renew as spellData} from '../spells';
import {mixin} from '../calculator';
import {chartoptions} from '../shared_variables';

// https://stackoverflow.com/questions/38085352/how-to-use-two-y-axes-in-chart-js-v2

export default {
  name: 'Renew',
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
    ...mapFields(['healingPower', 'hastePercent', 'overhealPercent', 'priestOptions']),
    spells() {
      if (!this.baseChartData) return;
      let _spells = JSON.parse(JSON.stringify(spellData));
      this.calculateLevelPenalties(_spells['ranks']);
      this.calculateHealing(_spells['ranks']);
      console.log(_spells);
      return _spells;
    },
    chartdata() {
      if (!this.baseChartData) return;
      return this.createChartData(JSON.parse(JSON.stringify(this.baseChartData)));
    },
  },
  methods: {
    // ...mapMutations(['setHealingPower']),
    calculateHealing(spellRanks) {
      for (let i = 0; i < spellRanks.length; i++) {
        let spell = spellRanks[i];

        if (this.priestOptions['mentalAgility']) {
          spell['mana'] *= 0.9;
        }

        if (this.priestOptions['2pT3']) {
          spell['mana'] *= 0.88;
        }

        spell['castTime'] /= (1 + this.hastePercent / 100);

        spell['baseHeal'] = (spell['hotTick'] * 5) * (this.priestOptions['spirtualHealing'] ? 1.1 : 1)
          * (this.priestOptions['improvedRenew'] ? 1.15 : 1) 
          * (this.priestOptions['4pT5'] ? 1.2 : 1)
          * (100 - this.overhealPercent) / 100;

        // for renew, spell cast time coefficient is 1
        spell['bonusHeal'] = (this.healingPower * spell['levelPenalty'])
          * (this.priestOptions['spirtualHealing'] ? 1.1 : 1)
          * (this.priestOptions['improvedRenew'] ? 1.15 : 1)
          * (this.priestOptions['4pT5'] ? 1.2 : 1)
          * (100 - this.overhealPercent) / 100;

        // // renew cannot crit so don't include critHeal
        spell['inspiration_uptime'] = 0;
        spell['totalHeal'] = spell['baseHeal'] + spell['bonusHeal'];
        spell['tick'] = spell['totalHeal'] / (this.priestOptions['4pT5'] ? 6 : 5);

        spell['hps'] = Math.round(spell['totalHeal'] / spell['castTime']);
        spell['efficiency'] = this.roundToTwo(spell['totalHeal'] / spell['mana']);

        // do rounding for formatting only at the end
        spell['mana'] = Math.round(spell['mana']);
        spell['tick'] = Math.round(spell['tick']);
        spell['castTime'] = this.roundToTwo(spell['castTime']);
        spell['inspiration_uptime'] = Math.round(spell['inspiration_uptime'] * 100);
        spell['baseHeal'] = Math.round(spell['baseHeal']);
        spell['bonusHeal'] = Math.round(spell['bonusHeal']);
        spell['totalHeal'] = Math.round(spell['totalHeal']);
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
