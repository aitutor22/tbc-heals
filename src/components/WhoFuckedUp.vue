<template>
  <div class="container">
    <div class="row">
      <h1>This page is under construction</h1>
    </div>
    <div class="row">
      <div class="col-12">
        <div class="input-group mb-2" style="width: 70%">
          <span class="input-group-text" id="basic-addon1">Log URL</span>
          <input type="text" class="form-control" v-model="url">
        </div>
        <button class="btn btn-success" @click="pullInitialLogs">
          <span v-if="!fetching">Pull Logs</span>
          <span v-else>Loading...</span>
        </button>
      </div>
    </div>

  <b-button id="show-btn" @click="$bvModal.show('bv-modal-example')">Open Modal</b-button>
  <b-modal id="bv-modal-example" hide-footer title="Set Healer Assignments">
    <div v-if="players" class="d-block text-center">
      <div v-for="healer, index in players['healers']" :key="index">
        <div class="flex-container">
          <div class="name-container">
            <p :class="healer['type']">{{ healer['name'] }}</p>
          </div>
          <v-select
            v-model="deathAnalyzer['healerAssignments'][healer['id']]"
            :options="tankOptions" class="select-dropdown"></v-select>
        </div>
      </div>
      
    </div>
    <b-button class="mt-3" block @click="setHealerAssignments">Close Me</b-button>
  </b-modal>

  </div>
</template>

<script>
import axios from 'axios';
import {mapFields} from 'vuex-map-fields';
import {mapMutations} from 'vuex';

// https://stackoverflow.com/questions/38085352/how-to-use-two-y-axes-in-chart-js-v2

export default {
  name: 'WhoFuckedUp',
  components: {},
  props: {
  },
  data() {
    return {
      fetching: false,
      url: '',
      players: null,
    };
  },

  computed: {
    ...mapFields(['deathAnalyzer',]),
    tankOptions() {
      if (!this.players || typeof this.players['tanks'] === 'undefined') return;
      let results = [];
      for (let i = 0; i < this.players['tanks'].length; i++) {
        const tank = this.players['tanks'][i];
        results.push({
          label: tank.name,
          code: tank.id,
        });
      }
      // raid is -1, hots is -2
      results.push({label: 'Raid', code: -1});
      results.push({label: 'Tank HoTs', code: -2});
      return results;
    },
  },
  methods: {
    ...mapMutations(['setClassName', 'resetDeathAnalyzer']),
    convertPercentage(num) {    
      return +(Math.round(num * 100 + "e+1")  + "e-1");
    },
    roundToOne(num) {    
      return +(Math.round(num + "e+1")  + "e-1");
    },
    pullInitialLogs() {
      this.fetching = true;
      let app = this;
      axios
        .post('http://localhost:8000/main/death-analyzer/', {url: this.url})
        // .post('http://spire-druid-prio.herokuapp.com/main/blended-mana/', {url: url})
        .then((response) => {
          app.fetching = false;
          app.players = response.data['players'];

          // if it is the same log, we keep assignments, otherwise we clear
          if (response.data['wcl_code'] !== app.deathAnalyzer['wclCode']) {
            this.resetDeathAnalyzer();
          }

          app.deathAnalyzer['wclCode'] = response.data['wcl_code'];
          console.log(response.data);
          console.log(this.deathAnalyzer['healerAssignments']);
          this.showHealerAssignmentsModal();
          // const manaCost = response.data['avg_mana_cost'];
          // const cpm = response.data['cpm'];
          // const name = response.data['name'];
          // this.oomOptions['manaCost'] = manaCost;
          // this.oomOptions['cpm'] = cpm;

          // alert(`CPM: ${cpm} and average mana cost is ${manaCost} for ${name}`);
          // this.drawChart();
        })
        .catch(function (error) {
          app.fetching = false;
          console.log(error.toJSON());
          alert('Error fetching report from wcl');
        });
    },
    showHealerAssignmentsModal() {
      this.$bvModal.show('bv-modal-example');
    },
    setHealerAssignments() {
      console.log('closing');
      this.$bvModal.hide('bv-modal-example');
      console.log(this.deathAnalyzer['healerAssignments']);
    },
    // runSimulation() {
    //   if (this.player['cpm'] <= 0) {
    //     alert('Player CPM must be greater than 0');
    //     return;
    //   }

    //   this.fetching = true;
    //   this.showResults = false;
    //   let app = this;
    //   axios
    //     .post('http://spire-druid-prio.herokuapp.com/main/inspiration/', {
    //     // .post('http://localhost:8000/main/inspiration/', {
    //       tank: this.tank,
    //       player: this.player,
    //       otherHealer: this.otherHealer,
    //     })
    //     .then((response) => {
    //       app.fetching = false;
    //       this.showResults = true;
    //       this.baseUptime = response.data['base_uptime'];
    //       this.higherCritUptime = response.data['higher_crit_uptime'];
    //       this.difference = response.data['difference'];
    //       this.baseDR = this.calculateDR(this.tank['armor']);
    //       this.afDR = this.calculateDR(this.tank['armor'] * 1.25);
    //       this.differenceDR = this.afDR - this.baseDR;
    //       this.marginalDRGainFromOnePercentCrit = this.differenceDR * this.difference;
    //       this.dtpsMitigated = this.roundToOne(this.marginalDRGainFromOnePercentCrit 
    //         * this.convertToNumber(this.tank['rawDTPS']));
    //       this.hpsEquivalent = this.roundToOne(this.dtpsMitigated / (1 - this.player['overhealPercent'] / 100));
    //       this.statweightShaman = this.roundToOne(this.hpsEquivalent * 60 / (1.73 * this.player['cpm'] * 22.1));
    //     })
    //     .catch(function (error) {
    //       app.fetching = false;
    //       console.log(error.toJSON());
    //       alert('Error running simulation');
    //     });
    // },
  },
  mounted() {
    this.setClassName('who');
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

.blockquote {
  background: #cbcbcb;
}

.flex-container {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  justify-content: space-around;
  height: 5 0px;
  align-items: center;
}

.name-container {
  width: 20%;
}

.select-dropdown {
  width: 60%;
}

.Shaman {
  color: #2459ff!important;
}

.Druid {
  color: #ff7d0a!important;
}

.Paladin {
  color: #f58cba!important;
}

.Priest {
  color: #a4a5a8!important;
}
</style>
