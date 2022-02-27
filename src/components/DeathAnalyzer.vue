<template>
  <div class="container">
    <div class="row" v-if="state !== 2">
      <h1>This tool is currently in Alpha and please bear with bugs.</h1>
      <p>
        The purpose of this tool is to quickly identify reasons for a tank death so the raid can improve on the next attempt. Ideal times to use are in between attempts if there are live-logs, or post raid reviews.
      </p>
      <p>
        Most tanks deaths are due to 1) lack of direct heals, 2) no 3x stacks lifeblooms, and 3) lack of debuffs. The tool aims to resolves these three problems, so tank deaths only result from unavoidable RNG like taking a blue beam from Illidan or facing Vaelastrasz in Diamond Flask gear.
      </p>

      <p>
        To use, go to WCL and select a specific death for a specific fight (e.g. https://classic.warcraftlogs.com/reports/yGHQT6hCzWPjZNaK/#fight=31&type=deaths&source=25&death=1). Note: do not clip timings when passing in the link.
      </p>
      <p>
        The tool will also display what each healer was doing while the tank was dying, and will highlight when an assigned healer isn't healing the tank if he or she has less than 95% health.
      </p>

      <b>Notes:</b>
      <ul>
        <li>
          If you use the <b>RESET</b> button to clear results, the tool will remember your healer assignments if you pass different deaths from the same log. To clear healer assignments, reload the page.
        </li>
        <li>
          The following are not considered direct heals: HOTS (e.g. Renew, Rejuvenation, Lifebloom), Earth Shield, Judgement of Light, and Chain heal bounces.
        </li>
        <li>
          Lifeblooms are considered to be on tank if there are 3x stacks of Lifeblooms for at least 80% of the death window.
        </li>
        <li>
          Similarly, debuffs/buffs are considered to be applied if they are on their target for at least 80% of the death window.
        </li>
        <li>
          <b>HEALER CAST ACTIVITY</b> tab will ignore consumes and cooldowns (e.g. mana pots, Water Shield, Berserking), as well as spells casted on anyone that is not in the raid (e.g. damage spells, snowballs).
        </li>
      </ul>
    </div>
    <div class="row" v-if="state !== 2">
      <div class="col-12">
        <div class="input-group mb-2" style="width: 70%">
          <input type="text" class="form-control" v-model="url"
            v-on:keyup.enter="pullInitialLogs"
            placeholder="Enter WCL URL...">
          <button class="btn btn-success" @click="pullInitialLogs">
            <span v-if="!fetching">Pull Logs</span>
            <span v-else>Loading...</span>
          </button>
        </div>
      </div>
    </div>

    <!-- <b-button id="show-btn" @click="$bvModal.show('bv-modal-example')">Open Modal</b-button> -->
    <b-modal id="bv-modal-example" hide-footer title="Set Healer Assignments">
      <div v-if="players" class="d-block text-center">
        <div v-for="healer, index in players['healers']" :key="index">
          <div class="flex-container">
            <div class="name-container">
              <p :class="healer['type']">{{ healer['name'] }}</p>
            </div>
            <v-select
              v-model="deathAnalyzer['healerAssignments'][healer['id']]"
              :options="tankOptions" class="select-dropdown"
              :reduce="label => label.id" label="name"></v-select>
          </div>
        </div>
      </div>
      <b-button class="mt-3" block @click="setHealerAssignments">Set Assignments</b-button>
    </b-modal>

    <div class="results" v-if="state === 2">
    <!-- <div class="results"> -->
      <b-button class="mt-3" variant="success" block @click="resetAndClearUrl">Reset</b-button>
      <div class="row">
        <ul>
          <li>
            <b>{{ deathDetails['name'] }}</b> died over {{ deathWindow }}s
          </li>
          <li>
            <b>Total Damage Taken:</b> {{ formatBigNumbers(deathDetails['damage']['total']) }} (O: {{ formatBigNumbers(deathDetails['overkill']) }})
          </li>
          <li>
            <b>Direct Healing Received:</b> {{ formatBigNumbers(results['direct_healing']['total']) }}
              <span v-if="results['direct_healing']['sources'].length > 0">
                (from {{ results['direct_healing']['sources'].join(' and ') }})
              </span>
          </li>
          <li v-if="results['has_max_lifebloom_stacks']">
            <b>Had 3x Lifebloom?</b> Yes
          </li>
          <li v-else>
            <b>Had 3x Lifebloom?</b> <b class="red">
              <span class="skull">💀💀</span>NO LB<span class="skull">💀💀</span>
            </b>
          </li>
          <li v-if="results['has_ironshield']">
            <b>Used Ironshield Potion?</b> Yes
          </li>
          <li v-else>
            <b>Used Ironshield Potion?</b> <b class="red">No</b>
          </li>
        </ul>
      </div>
      <div class="row">
        <hr>
        <h4 class="title">Healer Cast Activity</h4>
        <b-tabs content-class="mt-3">
          <b-tab title="Assigned Healers" active>
            <div class="row">
              <div class="col-6" v-for="(healerCast, index) in assignedHealerCasts" :key="index">
                <b-table :items="healerCast"></b-table>
              </div>
              <span v-if="Object.keys(assignedHealerCasts).length === 0">
                No assigned healer. Check <b>"OTHER HEALERS"</b> tab to see what unassigned healers were doing.
              </span>
            </div>
          </b-tab>
          <b-tab title="Other Healers">
            <div class="row">
              <div class="col-6" v-for="(healerCast, index) in otherHealerCasts" :key="index">
                <b-table :items="healerCast"></b-table>
              </div>
            </div>
          </b-tab>
        </b-tabs>
      </div>

    </div>
  </div>
</template>

<script>
import axios from 'axios';
import {mapFields} from 'vuex-map-fields';
import {mapMutations} from 'vuex';

// https://stackoverflow.com/questions/38085352/how-to-use-two-y-axes-in-chart-js-v2

export default {
  name: 'DeathAnalyzer',
  components: {},
  props: {
  },
  data() {
    return {
      // 0 for no log pulled
      // 1 for pulled logs and waiting for player to set assignments
      // 2 showing results
      state: 0,
      fetching: false,
      url: '',
      players: null,
      results: {},
      assignedHealerCasts: {},
      otherHealerCasts: {},
      deathDetails: {},
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
          name: tank.name,
          id: tank.id,
        });
      }
      // raid is -1, hots is -2
      results.push({name: 'Raid', id: -1});
      results.push({name: 'Tank HoTs', id: -2});
      return results;
    },
    deathWindow() {
      if (this.deathDetails === {}) return;
      return this.roundToOne(this.deathDetails['deathWindow'] / 1000);
    }
  },
  methods: {
    ...mapMutations(['setClassName', 'resetDeathAnalyzer']),
    convertPercentage(num) {    
      return +(Math.round(num * 100 + "e+1")  + "e-1");
    },
    formatBigNumbers(x) {
      return Number(x).toLocaleString();
    },
    roundToOne(num) {    
      return +(Math.round(num + "e+1")  + "e-1");
    },
    resetAndClearUrl() {
      this.reset();
      this.url = '';
    },
    reset() {
      this.state = 0;
      this.fetching = false;
      this.results = {};
      this.assignedHealerCasts = {};
      this.otherHealerCasts = {};
      this.deathDetails = {};
    },
    pullInitialLogs() {
      if (this.url.indexOf('death=') === -1 && this.url.indexOf('source=') === -1) {
        alert('Invalid url - missing "death=xx"');
        return;
      } else if (this.url.indexOf('start=') > -1 || this.url.indexOf('end=') > -1){
        alert('Invalid url - do not clip timings');
        return;
      }

      this.reset();

      this.fetching = true;
      let app = this;
      axios
        .post('http://localhost:8000/main/death-analyzer/player-details/', {url: this.url})
        // .post('http://spire-druid-prio.herokuapp.com/main/blended-mana/', {url: url})
        .then((response) => {
          app.fetching = false;
          app.players = response.data['players'];

          // if it is the same log, we keep assignments, otherwise we clear
          if (response.data['wcl_code'] !== app.deathAnalyzer['wclCode']) {
            this.resetDeathAnalyzer();
          }

          app.deathAnalyzer['wclCode'] = response.data['wcl_code'];
          app.state = 1;
          this.showHealerAssignmentsModal();
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
      this.$bvModal.hide('bv-modal-example');
      this.pullMainLogs();
    },
    // once we have set healer assignments, send information to backend who will now do the real processing
    pullMainLogs() {
      this.fetching = true;
      let app = this;
      axios
        .post('http://localhost:8000/main/death-analyzer/analyze/', {
          url: this.url,
          healerAssignments: this.deathAnalyzer['healerAssignments'],
        })
        // .post('http://spire-druid-prio.herokuapp.com/main/blended-mana/', {url: url})
        .then((response) => {
          app.fetching = false;
          app.results = response.data;
          app.deathDetails = response.data['death_details'];
          app.assignedHealerCasts = response.data['assigned_healers'];
          app.otherHealerCasts = response.data['other_healers'];

          app.state = 2;
        })
        .catch(function (error) {
          app.fetching = false;
          console.log(error.toJSON());
          alert('Error fetching report from wcl');
        });
    },
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

.red {
  color: red;
}

.skull {
  font-size: 2em;
}

.title {
  color: blue;
}
</style>
