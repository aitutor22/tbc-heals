<template>
  <div class="container">
    <div class="row" v-if="showExplanation">
      <p>This is a general tool to visualise how long it takes for a priest to go OOM, especially as we get high haste in Sunwell. Rather than hardcode spells and trinket options, users can directly input information like CPM, average mana cost and MP5 that will allow you more flexibility.</p>
      <p>
        The tool assumes you always have Mark of the Wild, Arcane Intellect, Blessing of Kings, Elixir of Draenic Wisdom, Golden Fish Sticks and Brilliant Mana Oil. Average mana cost of 393 is based off 90% CoH5/R12 and 10% PoM.
      </p>
      <p>"Other MP5" includes regen from gear and trinkets and <b> DO NOT INCLUDE mana pots, runes, mana tide totem, and shadowfiend as this is factored in separately</b>. This tool assumes max fight time of 10 mins.</p>

      <p>
        Special thanks to Bael for providing valuable feedback on features and options.
      </p>
    </div>
    <div class="row">
      <div class="col-12">
        <bar-chart
          v-if="chartdata"
          id="chart"
          :chart-data="chartdata"
          :options="chartoptions"
           style="height: 350px" />
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
        <div class="input-group mb-2" style="width: 100%">
          <span class="input-group-text" id="basic-addon1">Mana from Shadowfiend</span>
          <input type="text" class="form-control" v-model="oomOptions['shadowfiendMana']">
        </div>
        <button class="btn btn-primary" @click="drawChart">Draw Chart</button>
      </div>

      <div class="col-4">
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="mentalStrength" v-model="oomOptions['mentalStrength']">
          <label class="form-check-label" for="mentalStrength">Mental Strength (<b>DISC TALENT</b>)</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="enlightenment" v-model="oomOptions['enlightenment']">
          <label class="form-check-label" for="enlightenment">Enlightenment (<b>DISC TALENT</b>)</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="sor" v-model="oomOptions['sor']">
          <label class="form-check-label" for="sor">Spirit of Redemption</label>
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
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="mtt" v-model="oomOptions['mtt']">
          <label class="form-check-label" for="mtt">Mana Tide Totem</label>
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
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="hasShadowPriest" v-model="oomOptions['hasShadowPriest']">
          <label class="form-check-label" for="hasShadowPriest">Shadow Priest?</label>
        </div>
        <div class="input-group mb-2" style="width: 100%" v-if="oomOptions['hasShadowPriest']">
          <span class="input-group-text" id="basic-addon1">Shadow Priest DPS</span>
          <input type="text" class="form-control" v-model="oomOptions['shadowPriestDPS']">
        </div>
        <h8><b>Trinkets</b></h8>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="alchemistStone" v-model="oomOptions['alchemistStone']">
          <label class="form-check-label" for="alchemistStone">Alchemist Stone</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="blueDragon" v-model="oomOptions['blueDragon']">
          <label class="form-check-label" for="blueDragon">Blue Dragon</label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="memento" v-model="oomOptions['memento']">
          <label class="form-check-label" for="memento">Memento</label>
        </div>
        <div class="form-check">
         <input class="form-check-input" type="checkbox" id="hasEoG" v-model="oomOptions['hasEoG']">
          <label class="form-check-label" for="hasEoG">Eye of Gruul?</label>
        </div>
        <div class="input-group mb-2" style="width: 100%" v-if="oomOptions['hasEoG']">
          <span class="input-group-text" id="basic-addon1">CoH Cast %</span>
          <input type="text" class="form-control" v-model="oomOptions['cohPercent']">
        </div>
      </div>
    </div>

    <div class="row slight-offset-top" v-if="results">
      <div class="col-4">
        <ul>
          <li>Time to OOM: <b>{{ results['timeToOOM'] }}s</b></li>
          <li>Mana Pool: <b>{{ results['manaPool'] }}</b></li>
          <li>Buffed Int: <b>{{ results['statsSummary']['buffedInt'] }}</b></li>
          <li>Buffed Spirit: <b>{{ results['statsSummary']['buffedSpirit'] }}</b></li>
          <li>Mana from Super Mana Pots: <b>{{ results['consumesManaSummary']['SUPER_MANA_POTION'] }}</b></li>
          <li>Mana from Dark Runes: <b>{{ results['consumesManaSummary']['DARK_RUNE'] }}</b></li>
          <li>Mana from Shadowfiend: <b>{{ results['consumesManaSummary']['SHADOWFIEND'] }}</b></li>
          <li v-if="results['consumesManaSummary']['MANA_TIDE_TOTEM']">
            Mana from Mana Tide Totem: <b>{{ results['consumesManaSummary']['MANA_TIDE_TOTEM'] }}</b>
          </li>
        </ul>
      </div>
      <div class="col-4">
        Total MP5: <b>{{ results['statsSummary']['totalOtherMP5'] }}</b>
        <ol>
          <li v-for="(item, index) in results['mp5Summary']" :key="index">
            {{ item.name }}: <b>{{ item.value }}</b>
          </li>
        </ol>
      </div>
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
    <div class="row slight-offset-top" v-if="results">
      <h3>Known Issues</h3>
      <ul>
        <li>When mana tide totem is used, it will override mana spring, which should cause a temporary slight dip in mana regen. This is not accounted for.</li>
      </ul>
    </div>
  </div>
</template>

<script>
import {mapFields} from 'vuex-map-fields';
import BarChart from '../../chart.js';
import {circleOfHealing as spellData} from '../../spells';
import {mixin} from '../../calculator';
import {oomMixin} from '../../timeToOOMHelper';
import {oomchartoptions} from '../../shared_variables';

// https://stackoverflow.com/questions/38085352/how-to-use-two-y-axes-in-chart-js-v2

export default {
  name: 'TimeToOOM',
  components: {BarChart},
  props: {
  },
  mixins: [mixin, oomMixin],
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
      if ((this.oomOptions['alchemistStone'] + this.oomOptions['blueDragon'] + this.oomOptions['memento'] + this.oomOptions['hasEoG']) > 2) {
        alert('You have selected more than two trinkets.');
        return;
      }

      this.showExplanation = false;
      this.results = this.calculateTimeOOM();
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
.slight-offset-top {
  margin-top: 20px;
}
</style>
