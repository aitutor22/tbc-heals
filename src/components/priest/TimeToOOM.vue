<template>
  <div class="container">
<!--     <div class="row">
      <div v-if="spells" class="col-12">
        <h1>{{ spells['name'] }}</h1>
      </div>
      only reason para code is so weird is to fit in double paras for COH
      <div v-if="spells" class="col-12">
        <p v-for="(para, index) in spells['description']" :key="index">{{ para }}</p>
      </div>
    </div> -->
    <div class="row">
      <p>This is a general tool to visualise how long it takes for a priest to go OOM, especially as we get high haste in Sunwell. Rather than hardcode spells and trinket options, users can directly input information like CPM, average mana cost and MP5 that will allow you more flexibility.</p>
      <p>Importantly: other MP5 includes gear, oils, BoW, mana spring, etc, <b>BUT DO NOT INCLUDE mana pots, runes, mana tide totem, and shadowfiend as this is factored in separately.</b>. This tool assumes max fight time of 10 mins.</p>
    </div>
    <div class="row">
      <div class="col-8">
        <bar-chart
          v-if="chartdata"
          id="chart"
          :chart-data="chartdata"
          :options="chartoptions"/>
      </div>

      <div class="col-4">
        <div class="input-group mb-2" style="width: 100%">
          <span class="input-group-text" id="basic-addon1">CPM</span>
          <input type="text" class="form-control" v-model="oomOptions['cpm']">
        </div>
        <div class="input-group mb-2" style="width: 100%">
          <span class="input-group-text" id="basic-addon1">Average Mana Cost</span>
          <input type="text" class="form-control" v-model="oomOptions['manaCost']">
        </div>
        <div class="input-group mb-2" style="width: 100%">
          <span class="input-group-text" id="basic-addon1">Buffed Int</span>
          <input type="text" class="form-control" v-model="oomOptions['int']">
        </div>

        <div class="input-group mb-2" style="width: 100%">
          <span class="input-group-text" id="basic-addon1">Buffed Spirit</span>
          <input type="text" class="form-control" v-model="oomOptions['spirit']">
        </div>
        <div class="input-group mb-2" style="width: 100%">
          <span class="input-group-text" id="basic-addon1">Other MP5</span>
          <input type="text" class="form-control" v-model="oomOptions['otherMP5']">
        </div>

        <div class="input-group mb-2" style="width: 100%">
          <span class="input-group-text" id="basic-addon1">Mana Pool</span>
          <input type="text" class="form-control" v-model="oomOptions['manaPool']">
        </div>
        <button class="btn btn-primary" @click="drawChart">Draw Chart</button>
      </div>
    </div>
    <div class="row" v-if="results">
      <ul>
        <li>Time to oom: {{ results['timeToOOM'] }}s</li>
        <li>Mana regen excld. consumes/shadowfiend: {{ results['manaSummary']['MANA_TICK'] }} ({{ results['inCombatManaTick'] }} per tick)</li>
        <li>Mana from Super Mana Pots: {{ results['manaSummary']['SUPER_MANA_POTION'] }}</li>
        <li>Mana from Dark Runes: {{ results['manaSummary']['DARK_RUNE'] }}</li>
        <li>Mana from Shadowfiend: {{ results['manaSummary']['SHADOWFIEND'] }}</li>
      </ul>
    </div>

    <div class="row">
      <div class="col-6">
        <h2>Full Logs</h2>
        <textarea class="log" readonly="" v-model="logs"></textarea>  
      </div>
      <div class="col-6">
        <h2>Highlighted Logs</h2>
        <textarea class="log" readonly="" v-model="highlightedLogs"></textarea>
      </div>
    </div>
  </div>
</template>

<script>
import {mapFields} from 'vuex-map-fields';
import BarChart from '../../chart.js';
// import SummaryTable from './../SummaryTable.vue';
import {circleOfHealing as spellData} from '../../spells';
import {mixin} from '../../calculator';
import {oomchartoptions} from '../../shared_variables';

// https://stackoverflow.com/questions/38085352/how-to-use-two-y-axes-in-chart-js-v2

export default {
  name: 'TimeToOOM',
  components: {BarChart},
  props: {
  },
  mixins: [mixin],
  data() {
    return {
      baseChartData: null,
      chartoptions: oomchartoptions,
      results: null,
      chartdata: null,
    };
  },

  computed: {
    ...mapFields(['healingPower', 'critChance', 'hastePercent', 'overhealPercent',
        'crystalSpire', 'spireProcPercent', 'oomOptions']),
    logs() {
      if (!this.results || (typeof this.results['logs'] === 'undefined')) return;
      return this.results['logs'].join('\n');
    },
    highlightedLogs() {
      if (!this.results || (typeof this.results['highlightedLogs'] === 'undefined')) return;
      return this.results['highlightedLogs'].join('\n');
    },
  },
  methods: {
    drawChart() {
      this.results = this.calculateTimeOOM({
        manaCost: this.convertToNumber(this.oomOptions['manaCost']),
        manaPool: this.convertToNumber(this.oomOptions['manaPool']),
        cpm: this.convertToNumber(this.oomOptions['cpm']),
        int: this.convertToNumber(this.oomOptions['int']), 
        spirit: this.convertToNumber(this.oomOptions['spirit']),
        otherMP5: this.convertToNumber(this.oomOptions['otherMP5']),
      });
      this.chartdata = {
        type: 'line',
        datasets: [{
          label: 'Mana',
          data: this.results['scatterData'],
          type: 'line',
          borderColor: 'green',
          fill: 'red',
          pointBorderWidth: 1,
          pointBorderColor: 'green',
          pointBackgroundColor: '#fff',
          pointRadius: 0, 
          borderWidth: 1,
          yAxisID: 'A',
        }]
      };
    },
  },
  mounted() {
    this.setClassName(spellData['class']);
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.log {
  width: 100%;
  height: 400px
}
</style>
