<template>
  <div class="container">
    <div class="row mt-3 explanation" v-if="state !== 2">
      <p>
        Reviewing tank death logs is a time-consuming activity. This tool checks the three common causes of tank deaths
        (<a class="dotted" v-b-tooltip.hover title="Direct Heals exclude HOTS, Earth Shield, Chain Heal bounces, etc"><b>lack of direct heals</b></a>, 
        <a class="dotted" v-b-tooltip.hover title="Tracks if there are 80% uptime of 3x lifebloom stacks"><b>3x lifeblooms</b></a>, or
        <a class="dotted" v-b-tooltip.hover title="Demo shout, Thunderclap, Scorpid Sting"><b>debuffs</b></a>), helping a raid improve on the next attempt.
      </p>
      <p>
        Special thanks to Frakensteak for teaching me how to evaluate lifeblooms. For more detailed lifeblooms analysis, <a href="http://lbthree-calc.herokuapp.com/">check out his tool</a>. If you see any bugs, please message Trollhealer (Arugal) on Discord.
      </p>
    </div>

    <div class="input-wcl-container">
      <div class="row help-container" v-if="isUrlError">
        <div class="col-12">
          <p class="red"><i>{{ urlErrorMessage }}</i></p>
          <img :src="require('../assets/help.png')" class="help-pic" />
        </div>
      </div>
      <div class="row">
        <div class="col-12 input-wcl-subcontainer">
          <div class="input-group mb-2" style="width: 70%">
            <input type="text" class="form-control input-url" v-model="url"
              v-on:keyup.enter="pullInitialLogs"
              placeholder="Enter WCL link for a specfic death on a specific fight...">
            <button class="btn btn-success" @click="pullInitialLogs">
              <span v-if="!fetching">Pull Logs</span>
              <span v-else>Loading...</span>
            </button>
          </div>
        </div>
        <div class="col-12">
          <a class="faq-link" @click="showFaq = !showFaq">Frequently Asked Questions + Notes</a>
          <ul class="faq-text" v-if="showFaq">
            <li>
              Example: https://classic.warcraftlogs.com/reports/yGHQT6hCzWPjZNaK/#fight=31&type=deaths&source=25&death=1. Note, do not clip timings when passing in the link.
            </li>
            <li>
              If you pass in a second death from the same log, the tool will remember your healer assignments. To clear healer assignments, reload the page.
            </li>
            <li>
              Buffs/debuffs are considered to be on tank if they are on their target for at least 80% of the death window.
            </li>
            <li>
              <b>CAST ACTIVITY</b> tab will ignore consumes and cooldowns (e.g. Mana Pots) as well as spells casted on anyone that is not in the raid (e.g. damage spells).
            </li>
          </ul>
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
      <div>
        <b-button class="mt-3" block variant="success" @click="setHealerAssignments" style="width: 100%">
          Set Assignments
        </b-button>
      </div>
    </b-modal>

    <div class="results" v-if="state === 2">
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
          <li v-if="results['missing_debuffs'].length > 0">
            <b>Missing Debuffs: <span class="red">{{ results['missing_debuffs'].join(' and ') }}</span></b>
          </li>
          <li v-else>
            <b>Missing Debuffs: </b> All buffs present.
          </li>
        </ul>
      </div>
      <div class="row">
        <hr>
        <h5 class="title">Cast Activity</h5>
        <b-tabs content-class="mt-3">
          <b-tab title="Assigned Healers" active>
            <div class="row">
              <span v-if="Object.keys(assignedHealerCasts).length === 0">
                No assigned healer. Check <b>"OTHER HEALERS"</b> tab to see what unassigned healers were doing.
              </span>
              <div class="col-6" v-for="(healerCast, index) in assignedHealerCasts" :key="index">
                <b-table :items="healerCast"></b-table>
              </div>
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
      isUrlError: false,
      urlErrorMessage: '',
      showFaq: false,
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
    reset() {
      this.state = 0;
      this.fetching = false;
      this.results = {};
      this.assignedHealerCasts = {};
      this.otherHealerCasts = {};
      this.deathDetails = {};
    },
    pullInitialLogs() {
      this.reset();
      this.isUrlError = false;
      if (this.url.indexOf('death=') === -1 && this.url.indexOf('source=') === -1) {
        this.urlErrorMessage = 'Invalid url - missing "death=xx". Please see the image below for help.';
        this.isUrlError = true;
        return;
      } else if (this.url.indexOf('start=') > -1 || this.url.indexOf('end=') > -1){
        this.urlErrorMessage = 'Invalid url - do not clip timings. Please see the image below for help.';
        this.isUrlError = true;
        return;
      }

      this.fetching = true;
      let app = this;
      axios
        .post('http://localhost:8000/main/death-analyzer/player-details/', {url: this.url})
        // .post('http://spire-druid-prio.herokuapp.com/main/death-analyzer/player-details/', {url: this.url})
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
      this.state = 1;
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
        // .post('http://spire-druid-prio.herokuapp.com/main/death-analyzer/analyze/', {
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
    // sets events
    window.addEventListener('keydown', (e) => {
      if (this.state !== 1) return;
      if (e.key === 'Enter') {
        this.setHealerAssignments();
      }
    });
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.dotted {
  border-bottom: 2px dotted #403a3a;
  cursor: pointer;
  text-decoration: none;
  color: black;
   white-space: nowrap;
}

.explanation {
  font-size: 1.2em;
}

.input-wcl-container {
  margin-top: 30px;
  margin-bottom: 30px;
  text-align: center;
}

.input-wcl-subcontainer {
  display: flex;
  justify-content: center;
}

.input-url {
  border-color: #403a3a;
}

.faq-link {
  cursor: pointer
}

.faq-text {
  text-align: left;
  margin-top: 10px;
}

.help-container {
  margin-top: -20px;
  margin-bottom: 20px;
}

.help-container p {
  margin-bottom: 0px;
}

.help-pic {
  max-width: 600px;
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

.Warrior {
  color: #c79c6e!important;
}

.Rogue {
  color: #fff569!important;
}

.Hunter {
  color: #abd473!important;
}

.Mage {
  color: #69ccf0!important;
}

.Warlock {
  color: #9482c9!important;
}

.red {
  color: red;
}

.skull {
  font-size: 2em;
}

</style>
