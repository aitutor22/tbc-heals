<template>
  <div class="container">
    <div class="row" v-if="showExplanation">
      <p>This is a general tool to visualise how long it takes for a priest to go OOM, especially as we get high haste in Sunwell. Rather than hardcode spells and trinket options, users can directly input information like CPM, average mana cost and MP5 that will allow you more flexibility.</p>
      <p>
        The tool assumes you always have MoTW, Arcane Intellect, Blessing of Kings, Spirit of Redemption, Elixir of Draenic Wisdom, Golden Fish Sticks and Brilliant Mana Oil. 
      </p>
      <p>"Other MP5" includes regen from gear and sources like Shadow Priest that are not included in the options below. <b> DO NOT INCLUDE mana pots, runes, mana tide totem, and shadowfiend as this is factored in separately</b>. This tool assumes max fight time of 10 mins.</p>
    </div>
    <div class="row">
      <div class="col-12">
        <bar-chart
          v-if="chartdata"
          id="chart"
          :chart-data="chartdata"
          :options="chartoptions"/>
      </div>
    </div>

    <div class="row">
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
          <span class="input-group-text" id="basic-addon1">Int</span>
          <input type="text" class="form-control" v-model="oomOptions['int']">
        </div>

        <div class="input-group mb-2" style="width: 100%">
          <span class="input-group-text" id="basic-addon1">Spirit</span>
          <input type="text" class="form-control" v-model="oomOptions['spirit']">
        </div>
        <div class="input-group mb-2" style="width: 100%">
          <span class="input-group-text" id="basic-addon1">Other MP5</span>
          <input type="text" class="form-control" v-model="oomOptions['otherMP5']">
        </div>
        <button class="btn btn-primary" @click="drawChart">Draw Chart</button>
      </div>

      <div class="col-4">
        <div class="input-group mb-2" style="width: 100%">
          <span class="input-group-text" id="basic-addon1">Mana Pool</span>
          <input type="text" class="form-control" v-model="oomOptions['manaPool']">
        </div>
        <div class="input-group mb-2" style="width: 100%">
          <span class="input-group-text" id="basic-addon1">Mana from Shadowfiend</span>
          <input type="text" class="form-control" v-model="oomOptions['shadowfiendMana']">
        </div>
        <!-- spirit -->
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="kreegs" v-model="oomOptions['kreegs']">
          <label class="form-check-label" for="kreegs">Kreeg's Stout Beatdown</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="isHuman" v-model="oomOptions['isHuman']">
          <label class="form-check-label" for="isHuman">Human Racial</label>
        </div>

        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="flexRadioDefault" id="ids" value="ids" v-model="oomOptions['idsScroll']">
          <label class="form-check-label" for="ids">
            IDS
          </label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="flexRadioDefault" id="scroll" value="scroll" v-model="oomOptions['idsScroll']">
          <label class="form-check-label" for="scroll">
            Spirit Scroll
          </label>
        </div>
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" name="flexRadioDefault" id="none" value="none" v-model="oomOptions['idsScroll']">
          <label class="form-check-label" for="none">
            None
          </label>
        </div>

        <!-- mp5 -->
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="ied" v-model="oomOptions['ied']">
          <label class="form-check-label" for="ied">Insightful Earthstorm Diamond</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="mst" v-model="oomOptions['mst']">
          <label class="form-check-label" for="mst">Mana Spring Totem</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="bow" v-model="oomOptions['bow']">
          <label class="form-check-label" for="bow">Blessing of Wisdom</label>
        </div>
      </div>

      <div class="col-4">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="hasSnowball" v-model="oomOptions['hasSnowball']">
          <label class="form-check-label" for="hasSnowball">Snowball?</label>
        </div>
        <div class="input-group mb-2" style="width: 100%" v-if="oomOptions['hasSnowball']">
          <span class="input-group-text" id="basic-addon1">Snowball MP5</span>
          <input type="text" class="form-control" v-model="oomOptions['snowballMP5']">
        </div>
      </div>
    </div>

    <div class="row results" v-if="results">
      <h2>Results</h2>
      <ul>
        <li>Time to oom: <b>{{ results['timeToOOM'] }}s</b></li>
        <li>Buffed Int: <b>{{ results['statsSummary']['buffedInt'] }}</b></li>
        <li>Buffed Spirit: <b>{{ results['statsSummary']['buffedSpirit'] }}</b></li>
        <li>Total Other MP5: <b>{{ results['statsSummary']['totalOtherMP5'] }}</b></li>
        <li>Mana from Super Mana Pots: <b>{{ results['manaSummary']['SUPER_MANA_POTION'] }}</b></li>
        <li>Mana from Dark Runes: <b>{{ results['manaSummary']['DARK_RUNE'] }}</b></li>
        <li>Mana from Shadowfiend: <b>{{ results['manaSummary']['SHADOWFIEND'] }}</b></li>
        <li>Other mana regen: <b>{{ results['manaSummary']['MANA_TICK'] }} ({{ results['inCombatManaTick'] }} per tick)</b></li>
      </ul>
    </div>

    <div class="row" v-if="results">
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
      chartoptions: oomchartoptions,
      results: null,
      chartdata: null,
      showExplanation: true,
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
      this.showExplanation = false;
      this.results = this.calculateTimeOOM({
        manaCost: this.convertToNumber(this.oomOptions['manaCost']),
        manaPool: this.convertToNumber(this.oomOptions['manaPool']),
        cpm: this.convertToNumber(this.oomOptions['cpm']),
        int: this.convertToNumber(this.oomOptions['int']), 
        spirit: this.convertToNumber(this.oomOptions['spirit']),
        otherMP5: this.convertToNumber(this.oomOptions['otherMP5']),
        shadowfiendMana: this.convertToNumber(this.oomOptions['shadowfiendMana']),
        kreegs: this.oomOptions['kreegs'],
        isHuman: this.oomOptions['isHuman'],
        idsScroll: this.oomOptions['idsScroll'],
        ied: this.oomOptions['ied'],
        mst: this.oomOptions['mst'],
        bow: this.oomOptions['bow'],
        snowballMP5: !this.oomOptions['hasSnowball'] ? 0 : this.convertToNumber(this.oomOptions['snowballMP5']),
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
.results {
  margin-top: 20px;
}
</style>
