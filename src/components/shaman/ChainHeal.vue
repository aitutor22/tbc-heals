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
          <input class="form-check-input" type="checkbox" id="improvedChainHeal" v-model="shamanOptions['improvedChainHeal']">
          <label class="form-check-label" for="improvedChainHeal">Improved Chain Heal</label>
        </div>

        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="2pT6" v-model="shamanOptions['2pT6']">
          <label class="form-check-label" for="2pT6">2px T6</label>
        </div>

        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="4pT6" v-model="shamanOptions['4pT6']">
          <label class="form-check-label" for="4pT6">4px T6</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="5pT2.5" v-model="shamanOptions['5pT2.5']">
          <label class="form-check-label" for="5pT2.5">5px T2.5</label>
        </div>

        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="crystalSpire" v-model="crystalSpire">
          <label class="form-check-label" for="crystalSpire">Crystal Spire of Karabor</label>
        </div>
        <div class="input-group mb-2" style="width: 50%" v-if="crystalSpire">
          <span class="input-group-text" id="basic-addon1">Spire Proc %</span>
          <input type="text" class="form-control" v-model="spireProcPercent">
        </div>

        <br>
        <h6>Totem of...</h6>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="flexRadioDefault" id="rain" value="rain" v-model="shamanOptions['totem']">
          <label class="form-check-label" for="rain">
            Healing Rains
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

    <p><i>Note: Unsure about the exact behaviour of Totem of Healing Rain. Assumed +87 from totem will be affected by  purification and 4pT6, but not improved chain heal.</i></p>
    <summary-table v-if="spells" :spells="spells"></summary-table>
  </div>
</template>

<script>
import {mapFields} from 'vuex-map-fields';
import {mapMutations} from 'vuex';
import BarChart from '../../chart.js';
import SummaryTable from './../SummaryTable.vue';
import {chainHeal as spellData} from '../../spells';
import {mixin} from '../../calculator';
import {chartoptions} from '../../shared_variables';

// https://stackoverflow.com/questions/38085352/how-to-use-two-y-axes-in-chart-js-v2
// note that HW rank 10 and below calculations differ from egregious as our level penalty formula is slightly different
export default {
  name: 'ChainHeal',
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
      'crystalSpire', 'spireProcPercent', 'shamanOptions']),
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
    ...mapMutations(['setClassName']),
    calculateHealing(spellRanks) {
      for (let i = 0; i < spellRanks.length; i++) {
        let spell = spellRanks[i];
        // spell coefficient is based off original casting time
        let originalCastTime = spell['castTime'];

        // from ptr, tidal focus and 2pT5 stacks together (0.85 * base)
        // rather than 0.9 * 0.95 * base
        let manaCostFactor = 1;
        if (this.shamanOptions['tidalFocus']) {
          manaCostFactor -= 0.05;
        }

        if (this.shamanOptions['2pT6']) {
          manaCostFactor -= 0.1;
        }

        spell['mana'] = Math.ceil(manaCostFactor * spell['mana']);

        // per lovelace, T2.5 0.4s applies first, then haste
        if (this.shamanOptions['5pT2.5']) {
          spell['castTime'] -= 0.4;
        }

        spell['castTime'] /= (1 + this.hastePercent / 100);
        // after ptr testing, shaman 4pt6 bonus is applied additively rather than multplicaltively wrt improved chain heal
        spell['baseHeal'] = (spell['min'] + spell['max']) / 2
          * ((this.shamanOptions['improvedChainHeal'] ? 1.2 : 1) + (this.shamanOptions['4pT6'] ? 0.05 : 0))
          * (this.shamanOptions['purification'] ? 1.1 : 1)
          * (1 + 0.5 + 0.25)
          * (100 - this.overhealPercent) / 100;

        let coefficient = spell['levelPenalty'] * originalCastTime / 3.5;
        // unsure about this behaviour - asume +87 from totem isn't affected by improved chain heal and casting coefficient and 4pT6
        // but affected by purification
        spell['bonusHeal'] = (this.healingPower * coefficient
          * ((this.shamanOptions['improvedChainHeal'] ? 1.2 : 1) + (this.shamanOptions['4pT6'] ? 0.05 : 0))
          + (this.shamanOptions['totem'] === 'rain' ? 87 : 0))
          * (this.shamanOptions['purification'] ? 1.1 : 1)
          * (1 + 0.5 + 0.25)

        // crystalSpire can crit, but crit is considered in the calculateAndFormatMetrics function
        if (this.crystalSpire) {
          // 3 being number of targets his
          spell['bonusHeal'] += 200 * 3 * this.spireProcPercent / 100
            * (this.shamanOptions['purification'] ? 1.1 : 1);
        }

        spell['bonusHeal'] *= (100 - this.overhealPercent) / 100;

        this.calculateAndFormatMetrics(spell, this.critChance, true);
      }
    },
  },
  mounted() {
    this.setClassName('shaman');
    this.baseChartData = this.init(spellData);
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
