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
          <input class="form-check-input" type="checkbox" id="holyLight" v-model="paladinOptions['holyLight']">
          <label class="form-check-label" for="holyLight">Healing Light</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="lightGrace" v-model="paladinOptions['lightGrace']">
          <label class="form-check-label" for="lightGrace">Light's Grace</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="illumination" v-model="paladinOptions['illumination']">
          <label class="form-check-label" for="illumination">Illumination</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="sanctifiedLight" v-model="paladinOptions['sanctifiedLight']">
          <label class="form-check-label" for="sanctifiedLight">Sanctified Light</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="2pT6" v-model="paladinOptions['2pT6']">
          <label class="form-check-label" for="2pT6">2px T6</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="blessingLight" v-model="paladinOptions['blessingLight']">
          <label class="form-check-label" for="blessingLight">Blessing of Light</label>
        </div>

        <br>
        <h6>Libram of...</h6>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="flexRadioDefault" id="lightbringer" value="lightbringer" v-model="paladinOptions['libram']">
          <label class="form-check-label" for="lightbringer">
            Lightbringer
          </label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="flexRadioDefault" id="truth" value="truth" v-model="paladinOptions['libram']">
          <label class="form-check-label" for="truth">
            Absolute Truth
          </label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="flexRadioDefault" id="others" value="others" v-model="paladinOptions['libram']">
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
import {holyLight} from '../spells';
import {mixin} from '../calculator';
import {chartoptions} from '../shared_variables';

// https://stackoverflow.com/questions/38085352/how-to-use-two-y-axes-in-chart-js-v2
// note that HW rank 10 and below calculations differ from egregious as our level penalty formula is slightly different
export default {
  name: 'HolyLight',
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
    ...mapFields(['healingPower', 'critChance', 'hastePercent', 'overhealPercent', 'paladinOptions']),
    spells() {
      if (!this.baseChartData) return;
      let _spells = JSON.parse(JSON.stringify(holyLight));
      this.calculateLevelPenalties(_spells['ranks']);
      this.calculateHealing(_spells['ranks']);
      console.log(_spells)
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
        let originalManaCost = spell['mana'];
        let modifiedCritChance = this.convertToNumber(this.critChance)
          + (this.paladinOptions['sanctifiedLight'] ? 6 : 0)
          + (this.paladinOptions['2pT6'] ? 5 : 0);

        if (this.paladinOptions['lightGrace']) {
          spell['castTime'] -= 0.5;
        }

        if (this.paladinOptions['illumination']) {
          // spell['mana'] = modifiedCritChance / 100 * originalManaCost * 0.4 + (100 - modifiedCritChance) / 100 * spell['mana'];
          // if there is a crit, spell only cost 40%
          // the way illumination works is a bit weird, got this formula from currelius who has tested it extensively
          spell['mana'] = originalManaCost * (100 - (modifiedCritChance * 0.6)) / 100 - (this.paladinOptions['libram'] === 'truth' ? 34: 0);
        } else {
          spell['mana'] = originalManaCost - (this.paladinOptions['libram'] === 'truth' ? 34: 0);
        }

        spell['castTime'] /= (1 + this.hastePercent / 100);
        spell['baseHeal'] = (spell['min'] + spell['max']) / 2 * (this.paladinOptions['holyLight'] ? 1.12 : 1)
          * (100 - this.overhealPercent) / 100;

        let coefficient = spell['levelPenalty'] * originalCastTime / 3.5;
        // need to convertToNumber to prevent bugs where javascript uses string addition
        spell['bonusHeal'] = (this.convertToNumber(this.healingPower)
            + (this.paladinOptions['libram'] === 'lightbringer' ? 87 : 0)
            + (this.paladinOptions['blessingLight'] ? 580 : 0))
          * coefficient
          * (this.paladinOptions['holyLight'] ? 1.12 : 1)
          * (100 - this.overhealPercent) / 100;

        let uncritHeal = spell['baseHeal'] + spell['bonusHeal'];
        spell['critHeal'] = uncritHeal * 0.5 * modifiedCritChance / 100;
        spell['totalHeal'] = uncritHeal + spell['critHeal'];

        spell['hps'] = Math.round(spell['totalHeal'] / spell['castTime']);
        spell['efficiency'] = this.roundToTwo(spell['totalHeal'] / spell['mana']);

        // do rounding for formatting only at the end
        spell['mana'] = Math.round(spell['mana']);
        spell['castTime'] = this.roundToTwo(spell['castTime']);
        spell['baseHeal'] = Math.round(spell['baseHeal']);
        spell['bonusHeal'] = Math.round(spell['bonusHeal']);
        spell['critHeal'] = Math.round(spell['critHeal']);
        spell['totalHeal'] = Math.round(spell['totalHeal']);
      }
    },
  },
  mounted() {
    console.log('holy light');
    this.baseChartData = this.createEmptyChartData(holyLight);
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
