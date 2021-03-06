<template>
  <div class="container">
    <div class="row">
      <p>This calculator attempts to attribute an additional value to crit based on Ancestral Fortitude/Inspiration, and is based off Lovelace's theorycrafting in Shaman Discord.</p>
      <blockquote>
        <p>
          Although it doesn't show up on your healing meter, the ancestral fortitude buff from your shaman's critical heals reduces physical damage taken by your tanks and others, and should be still considered as providing effective healing.
        </p>
        <br><br>
        <p>
          This manner of healing is of course different from that of your direct healing spells: there is never any overhealing, and since it is pre-emptive can help prevent one-shots from hard hitting bosses (think of it as working like earth shield). Increasing your crit% from different gear or consume choices will increase the average uptime of the buff, and thus can improve your overall effective healing and raid performance, even if on paper your HPS is marginally lower. <b>Thinking about this is particularly important in T6, where the bosses hit harder, and healing gear has noticeably less crit rating than in earlier tiers</b>.
        </p>
        <br><br>
        <p>
          Using this calculator will let you estimate, given the parameters of your raid, how much +healing on gear provides the same effective healing while using Chain Heal rank 4 or 5 as 1 point of crit rating. - 
          <span class="community-yellow"><b>Lovelace</b></span>
        </p>
      </blockquote>
      <p>
        AF uptime is calculated by simulating 10,000 5-min fights, and thus values will differ slightly everytime. The calculator includes the possibility of another healer that is also applying AF to the tank. If you wish to sim you being the only healer, set the CPM of <b>"OTHER HEALER"</b> to 0. Please see other notes below.
      </p>
      <ul>
        <li>CPM refers to casts on the tank that can proc AF. If a healer casts 30 spells per min but only 10 of those spells are on the tank, CPM is 10.</li>
        <li>Raw DTPS is the amount of physical damage taken per second by the tank.</li>
        <li>6k Raw DTPS is how much a druid would take on Mother or on enraged Illidan.</li>
        <li>Damage Reduction % = (Armor / ([467.5 * Enemy_Level] + Armor - 22167.5)) * 100. Enemies are assumed to be level 73.</li>
      </ul>
    </div>

    <div class="row">
      <div class="col-4">
        <h3>TANK</h3>
        <div class="input-group mb-2" style="width: 70%">
          <span class="input-group-text" id="basic-addon1">Armor</span>
          <input type="text" class="form-control" v-model="tank['armor']">
        </div>

        <div class="input-group mb-2" style="width: 70%">
          <span class="input-group-text" id="basic-addon1">Raw DTPS</span>
          <input type="text" class="form-control" v-model="tank['rawDTPS']">
        </div>
      </div>

      <div class="col-4">
        <h3>YOU</h3>
        <div class="input-group mb-2" style="width: 70%">
          <span class="input-group-text" id="basic-addon1">Crit Chance</span>
          <input type="text" class="form-control" v-model="player['critChance']">
        </div>

        <div class="input-group mb-2" style="width: 70%">
          <span class="input-group-text" id="basic-addon1">CPM</span>
          <input type="text" class="form-control" v-model="player['cpm']">
        </div>

        <div class="input-group mb-2" style="width: 70%">
          <span class="input-group-text" id="basic-addon1">Overhealing %</span>
          <input type="text" class="form-control" v-model="player['overhealPercent']">
        </div>
      </div>

      <div class="col-4">
        <h3>OTHER HEALER</h3>
        <div class="input-group mb-2" style="width: 70%">
          <span class="input-group-text" id="basic-addon1">Crit Chance</span>
          <input type="text" class="form-control" v-model="otherHealer['critChance']">
        </div>

        <div class="input-group mb-2" style="width: 70%">
          <span class="input-group-text" id="basic-addon1">CPM</span>
          <input type="text" class="form-control" v-model="otherHealer['cpm']">
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-4">
        <button class="btn btn-success" @click="runSimulation">
          <span v-if="!fetching">Run Simulation</span>
          <span v-else>Loading...</span>
        </button>
      </div>
    </div>

    <div ref="results">
      <div class="row slight-offset-top" v-show="showResults">
        <div class="col-12">
          <ul>
            <li class="blue">DTPS Mitigated due to +1% Crit: <b>{{ dtpsMitigated }}</b></li>
            <li class="blue">Net HPS equivalent due to +1% Crit: <b>{{ hpsEquivalent }}</b></li>
            <li class="blue">Shaman +Heal value of AF for +1 crit rating: <b>{{ statweightShaman }}</b></li>
            <li class="blue">Shaman +Heal value for +1 crit rating: <b>{{ statweightShaman + 0.75}}</b></li>
            <hr>
            <li>Base AF Uptime: <b>{{ convertPercentage(baseUptime) }}%</b></li>
            <li>AF Uptime with +1% Crit: <b>{{ convertPercentage(higherCritUptime) }}%</b></li>
            <li>AF Uptime Gain with +1% Crit: <b>{{ convertPercentage(difference) }}%</b></li>
            <li>Base Damage Reduction: <b>{{ convertPercentage(baseDR) }}%</b></li>
            <li>Damage Reduction with AF: <b>{{ convertPercentage(afDR) }}%</b></li>
            <li>DR% Gain when AF is up: <b>{{ convertPercentage(differenceDR) }}%</b></li>
            <li>DR% Gain with +1% Crit: <b>{{ convertPercentage(marginalDRGainFromOnePercentCrit) }}%</b></li>
          </ul>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios';
import {mapMutations} from 'vuex';
// import {mapFields} from 'vuex-map-fields';
// import {mapGetters, mapMutations} from 'vuex';

// https://stackoverflow.com/questions/38085352/how-to-use-two-y-axes-in-chart-js-v2

export default {
  name: 'AncestralFortitudeSimulation',
  components: {},
  props: {
  },
  data() {
    return {
      fetching: false,
      showResults: false,
      tank: {
        armor: 25000,
        rawDTPS: 6000,
      },
      player: {
        critChance: 15,
        cpm: 24,
        overhealPercent: 30,
      },
      otherHealer: {
        critChance: 15,
        cpm: 10,
      },
      baseUptime: 0,
      higherCritUptime: 0,
      difference: 0,
      baseDR: 0,
      afDR: 0,
      differenceDR: 0,
      marginalDRGainFromOnePercentCrit: 0,
      dtpsMitigated: 0,
      hpsEquivalent: 0,
      statweightShaman: 0,
      statweightPriest: 0,
    };
  },

  computed: {
  },
  methods: {
    ...mapMutations(['setClassName']),
    goto(refName) {
      // https://shouts.dev/articles/vuejs-scroll-to-elements-on-the-page
      var element = this.$refs[refName];
      var top = element.offsetTop;
      console.log(element);
      console.log('going');
      console.log(top);
      window.scrollTo(0, top);
    },
    convertPercentage(num) {    
      return +(Math.round(num * 100 + "e+1")  + "e-1");
    },
    roundToOne(num) {    
      return +(Math.round(num + "e+1")  + "e-1");
    },
    convertToNumber(txt) {
      if (Number.isNaN(txt)) return 0;
      return Number(txt);
    },
    calculateDR(armor) {
      armor = this.convertToNumber(armor);
      // Damage Reduction % = (Armor / ([467.5 * Enemy_Level] + Armor - 22167.5)) * 100
      return Math.min(armor / (467.5 * 73 + armor - 22167.5), 0.75);
    },
    runSimulation() {
      if (this.player['cpm'] <= 0) {
        alert('Player CPM must be greater than 0');
        return;
      }

      this.fetching = true;
      this.showResults = false;
      let app = this;
      axios
        .post('http://spire-druid-prio.herokuapp.com/main/inspiration/', {
        // .post('http://localhost:8000/main/inspiration/', {
          tank: this.tank,
          player: this.player,
          otherHealer: this.otherHealer,
        })
        .then((response) => {
          app.fetching = false;
          this.showResults = true;
          this.baseUptime = response.data['base_uptime'];
          this.higherCritUptime = response.data['higher_crit_uptime'];
          this.difference = response.data['difference'];
          this.baseDR = this.calculateDR(this.tank['armor']);
          this.afDR = this.calculateDR(this.tank['armor'] * 1.25);
          this.differenceDR = this.afDR - this.baseDR;
          this.marginalDRGainFromOnePercentCrit = this.differenceDR * this.difference;
          this.dtpsMitigated = this.roundToOne(this.marginalDRGainFromOnePercentCrit 
            * this.convertToNumber(this.tank['rawDTPS']));
          this.hpsEquivalent = this.roundToOne(this.dtpsMitigated / (1 - this.player['overhealPercent'] / 100));
          this.statweightShaman = this.roundToOne(this.hpsEquivalent * 60 / (1.73 * this.player['cpm'] * 22.1));

          // need to have a slight delay otherwise wont work
          setTimeout(() => {
            this.goto('results');
          }, 100);
        })
        .catch(function (error) {
          app.fetching = false;
          console.log(error.toJSON());
          alert('Error running simulation');
        });
    },
  },
  mounted() {
    this.setClassName('shaman');
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.blue {
  color: blue;
}

.slight-offset-top {
  margin-top: 20px;
}

.slight-offset-left {
  margin-left: 10px;
}

blockquote {
  background: #f9f9f9;
  border-left: 10px solid #ccc;
  margin: 1em 10px;
  padding: 0.5em 10px;
  quotes: "\201C""\201D""\2018""\2019";
}
blockquote:before {
  color: #ccc;
  content: open-quote;
  font-size: 4em;
  line-height: 0.1em;
  margin-right: 0.25em;
  vertical-align: -0.4em;
}
blockquote p {
  display: inline;
}

.community-yellow {
  color: #ffd500;
}
</style>
