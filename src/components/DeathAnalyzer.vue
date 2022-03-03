<template>
  <div class="container">
    <div class="row mt-3 explanation" v-if="state !== 2">
      <p>
        Reviewing tank death logs is a time-consuming activity. This tool checks the three common causes of tank deaths
        (<a class="dotted" v-b-tooltip.hover title="Direct Heals exclude HOTS, Earth Shield, Chain Heal bounces, etc"><b>lack of direct heals</b></a>, 
        <a class="dotted" v-b-tooltip.hover title="Tracks if there are 80% uptime of 3x lifebloom stacks"><b>3x lifeblooms</b></a>, or
        <a class="dotted" v-b-tooltip.hover title="Demo Shout, Thunderclap, Scorpid Sting"><b>debuffs</b></a>), helping a raid improve on the next attempt.
      </p>
      <p>
        Special thanks to Frankensteak for teaching me how to evaluate lifeblooms (for more detailed lifeblooms analysis, <a href="http://lbthree-calc.herokuapp.com/">check out his tool</a>). If you see any bugs, please message Trollhealer (Arugal) on Discord.
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
            <input type="text" class="form-control input-url" v-model="deathAnalyzer['url']"
              v-on:keyup.enter="pullInitialLogs"
              placeholder="Enter WCL link for a specfic death on a specific fight...">
            <button class="btn btn-success" @click="pullInitialLogs">
              <span v-if="!fetching">Pull Logs</span>
              <span v-else>Loading...</span>
            </button>
            <button class="btn btn-info" @click="reload">
              Reset
            </button>
          </div>
        </div>
        <div class="col-12">
          <a class="faq-link" v-if="state !== 2" @click="showFaq = !showFaq">Frequently Asked Questions + Notes</a>
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
            <li>
              There are potential bugs tracking lifeblooms with double rdruid comps, and I'm ignoring this temporarily as this isn't a meta comp.
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

    <div class="row align-center slight-offset-bottom" v-if="state === 2">
      <div class="col-10">
        <b-list-group>
          <b-list-group-item href="#" class="flex-column align-items-start" :variant="tankDamageSummaryWarning">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">DAMAGE SPIKES</h5>
            </div>
            <p class="mb-2">
              <player :pclass="deathDetails['type']" :pname="deathDetails['name']"></player>
              took {{ formatBigNumbers(deathDetails['damage']['total']) }} damage (O: {{ formatBigNumbers(deathDetails['overkill']) }}) and died over {{ deathWindow }}s
              <span :class="{red: results['tank_damage_summary']['dtps'] >= THRESHOLD['dtps']}">
                ({{ roundToOne(results['tank_damage_summary']['dtps']) }}k DTPS).</span>
              <span v-if="results['tank_damage_summary']['num_crit'] > THRESHOLD['numCrit']" class="red">
                NOT CRIT CAPPED!!!!!
              </span>
            </p>
            <p class="mb-2">
              Over the entire fight, <a class="dotted" :class="{red: results['tank_damage_summary']['tmi'] >= THRESHOLD['tmi']}" v-b-tooltip.hover title="Theck-Meloree Index is a tanking metric quantifying the “smoothness” of a tank’s damage intake based on spike magnitude and frequency.">
                TMI was {{ results['tank_damage_summary']['tmi'] }}% (i.e. tank was taking damage spikes of up to {{ results['tank_damage_summary']['tmi'] }}% of max health over 5s)</a>
            </p>
          </b-list-group-item>
          <b-list-group-item href="#" class="flex-column align-items-start"
            :variant="lifebloomsWarning">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1 dotted" v-b-tooltip.hover title="Tracks if there are 80% uptime of 3x lifebloom stacks">3x LIFEBLOOM?</h5>
            </div>

            <p class="mb-1" v-if="results['hots_summary']['has_max_lifebloom_stacks']">
                <span>Yes</span>
            </p>
            <p class="mb-1 red" v-else>
                <span class="skull">💀💀</span>NO LB<span class="skull">💀💀</span>
            </p>
            <small class="text-muted">Potentially bugged if there are double rdruids</small>
          </b-list-group-item>

          <b-list-group-item href="#" class="flex-column align-items-start"
            :variant="directHealingWarning"
            @click="goto('castActivity')">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1">DIRECT HEALS</h5>
              <small class="text-muted"><b>Click to see each healer's casts</b></small>
            </div>

            <p class="mb-2">
              <span>
                <player :pclass="deathDetails['type']" :pname="deathDetails['name']"></player> received {{ formatBigNumbers(results['direct_healing']['total']) }}
                <a class="dotted" v-b-tooltip.hover title="Direct Heals exclude HOTS, Earth Shield, Chain Heal bounces, etc"><b>direct healing</b></a>
                over {{ deathWindow }}s
              </span>
              <span :class="{'red': directHealingLine}">
                ({{ results['direct_healing']['percentage_from_assigned_healers'] }}% from assigned healers)
              </span>
            </p>

            <p class="mb-2">
              <span>
                <b>Assigned Healers: </b>
                <span v-for="healer, index in results['direct_healing']['sources']['assigned_healers']" :key="index">
                  <player :pclass="healer['type']" :pname="healer['name']"></player> ({{ formatBigNumbers(healer['amount']) }})
                  <span v-if="index < results['direct_healing']['sources']['assigned_healers'].length - 1"> and </span>
                </span>
              </span>
            </p>

            <p class="mb-2">
              <span>
                <b>Other Healers: </b>
                <span v-for="healer, index in results['direct_healing']['sources']['other_healers']" :key="index">
                  <player :pclass="healer['type']" :pname="healer['name']"></player> ({{ formatBigNumbers(healer['amount']) }})
                  <span v-if="index < results['direct_healing']['sources']['other_healers'].length - 1"> and </span>
                </span>
              </span>
            </p>
          </b-list-group-item>

          <b-list-group-item href="#" class="flex-column align-items-start"
            :variant="potionsWarning">
            <div class="d-flex w-100 justify-content-between">
              <h5 class="mb-1 dotted" v-b-tooltip.hover title="Tracks Demo Shout, Thunderclap, Scorpid Sting debuffs. As well as Ironshield potion usage.">DEBUFFS & OTHERS</h5>
            </div>
            <p class="mb-2" v-if="results['missing_debuffs'].length > 0">
              <b>Missing Debuffs: <span class="red">{{ results['missing_debuffs'].join(' and ') }}</span></b>
            </p>
            <p class="mb-2" v-else>
              <b>Missing Debuffs: </b> All buffs present.
            </p>
            <p class="mb-2" v-if="results['has_ironshield']">
              <b>Used Ironshield Potion?</b> Yes
            </p>
            <p class="mb-2" v-else>
              <b>Used Ironshield Potion?</b> <b class="red">No</b>
            </p>
          </b-list-group-item>
        </b-list-group>
      </div>
    </div>

    <div class="results" v-if="state === 2" ref="castActivity">
      <div class="row">
        <hr>
        <h5 class="title">Healer Cast Activity</h5>
        <b-tabs pills content-class="mt-3">
          <b-tab title="Assigned Healers" active>
            <div class="row">
              <span v-if="Object.keys(assignedHealerCasts).length === 0">
                No assigned healer. Check <b>"OTHER HEALERS"</b> tab to see what unassigned healers were doing.
              </span>
              <div class="col-6" v-for="(healerCast, index) in assignedHealerCasts" :key="index">
                <b-table :items="healerCast">
                  <template #cell(event)="data">
                    <span v-html="data.value"></span>
                  </template>
                </b-table>
              </div>
            </div>
          </b-tab>
          <b-tab title="Other Healers">
            <div class="row">
              <div class="col-6" v-for="(healerCast, index) in otherHealerCasts" :key="index">
                <b-table :items="healerCast">
                  <template #cell(event)="data">
                    <span v-html="data.value"></span>
                  </template>
                </b-table>
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
import {mapMutations, mapGetters} from 'vuex';
import Player from './Player.vue';

// https://stackoverflow.com/questions/38085352/how-to-use-two-y-axes-in-chart-js-v2

export default {
  name: 'DeathAnalyzer',
  components: {
    Player: Player
  },
  props: {
  },
  data() {
    return {
      // 0 for no log pulled
      // 1 for pulled logs and waiting for player to set assignments
      // 2 showing results
      state: 0,
      fetching: false,
      // url: '',
      players: null,
      results: {},
      assignedHealerCasts: {},
      otherHealerCasts: {},
      deathDetails: {},
      isUrlError: false,
      urlErrorMessage: '',
      showFaq: false,
      // various thresholds to make a text show up as red
      THRESHOLD: {
        // how much dtps tank takes (thousands)
        dtps: 10,
        // moment there is > 0 crit, implies not crit cap
        numCrit: 0,
        // if less than 30% of directHealing comes from assigned healers, turns red
        directHealing: 30,
        tmi: 150,
      },
    };
  },

  computed: {
    ...mapGetters(['shareDeathAnalyzerURLParams']),
    ...mapFields(['deathAnalyzer',]),
    tankOptions() {
      if (!this.players || typeof this.players['tanks'] === 'undefined') return;
      // when we swap between deaths from different fights in the same log
      // sometimes tanks will change. so for instance, bigchadbear is a bear tank on najentus
      // but doens't appear as a tank on illidan
      // so if that's the case, we remove him from this.deathAnalyzer['healerAssignments'])

      // the tankIds for this specific fight
      let tankIds = this.players['tanks'].map((player) => {return player['id']});

      // tankIds from previous healing assignments saved
      // if there are missing tankIds, delete
      for (let key in this.deathAnalyzer['healerAssignments']) {
        let _tank_id = this.deathAnalyzer['healerAssignments'][key];
        if (_tank_id >= 0 && tankIds.indexOf(_tank_id) === -1) {
          delete this.deathAnalyzer['healerAssignments'][key];
        }
      }

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
    },
    tankDamageSummaryWarning() {
      if (this.state !== 2) return;
      return this.results['tank_damage_summary']['issue_warning'] ? 'danger' : '';
    },
    lifebloomsWarning() {
      if (this.state !== 2) return;
      return !this.results['hots_summary']['has_max_lifebloom_stacks'] ? 'danger' : 'success';
    },
    directHealingWarning() {
      if (this.state !== 2) return;
      return this.results['direct_healing']['issue_warning'] ? 'danger' : '';
    },
    directHealingLine() {
      if (this.state !== 2) return;
      return this.results['direct_healing']['percentage_from_assigned_healers'] <= this.THRESHOLD['directHealing'];
    },
    potionsWarning() {
      if (this.state !== 2) return;
      return this.results['missing_debuffs'].length === 0 && this.results['has_ironshield'] ? 'success' : 'danger';
    },
  },
  methods: {
    ...mapMutations(['setClassName', 'resetDeathAnalyzer', 'setDeathAnalyzerUsingParams']),
    convertPercentage(num) {    
      return +(Math.round(num * 100 + "e+1")  + "e-1");
    },
    formatBigNumbers(x) {
      return Number(x).toLocaleString();
    },
    roundToOne(num) {    
      return +(Math.round(num + "e+1")  + "e-1");
    },
    reload() {
      this.$router.push({name: 'death-analyzer'});
      this.$router.go();
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
      if (this.deathAnalyzer['url'].indexOf('death=') === -1 && this.deathAnalyzer['url'].indexOf('source=') === -1) {
        this.urlErrorMessage = 'Invalid url - missing "death=xx". Please see the image below for help.';
        this.isUrlError = true;
        return;
      } else if (this.deathAnalyzer['url'].indexOf('start=') > -1 || this.deathAnalyzer['url'].indexOf('end=') > -1){
        this.urlErrorMessage = 'Invalid url - do not clip timings. Please see the image below for help.';
        this.isUrlError = true;
        return;
      }

      this.fetching = true;
      let app = this;
      axios
        .post('http://localhost:8000/main/death-analyzer/player-details/', {url: this.deathAnalyzer['url']})
        // .post('http://spire-druid-prio.herokuapp.com/main/death-analyzer/player-details/', {url: this.deathAnalyzer['url']})
        .then((response) => {
          app.fetching = false;
          app.players = response.data['players'];
          console.log(app.players);

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
          console.log(error);
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
          url: this.deathAnalyzer['url'],
          healerAssignments: this.deathAnalyzer['healerAssignments'],
        })
        // .post('http://spire-druid-prio.herokuapp.com/main/blended-mana/', {url: url})
        .then((response) => {
          app.fetching = false;
          app.results = response.data;
          console.log(app.results);
          app.deathDetails = response.data['death_details'];
          app.assignedHealerCasts = response.data['assigned_healers'];
          app.otherHealerCasts = response.data['other_healers'];

          app.state = 2;
          // update the url
          this.$router.push({name: 'death-analyzer', query: {data: this.shareDeathAnalyzerURLParams}});

        })
        .catch(function (error) {
          app.fetching = false;
          console.log(error.response.data);
          alert('Error fetching report from wcl - ' + error.response.data['detail']);
        });
    },
    goto(refName) {
      // https://shouts.dev/articles/vuejs-scroll-to-elements-on-the-page
      var element = this.$refs[refName];
      var top = element.offsetTop;
      console.log(element);
      console.log(top);
      window.scrollTo(0, top);
    },
  },
  mounted() {
    this.setClassName('who');
    let url = new URL(location.href);
    let params = url.searchParams.get('data');
    if (params !== null) {
      this.setDeathAnalyzerUsingParams(params);
      this.pullMainLogs();
    }

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
  white-space: nowrap;
}

a.dotted {
  color: black;
}

.dotted.red {
  color: red;
}

.explanation {
  font-size: 1.2em;
}

.input-wcl-container {
  margin-top: 30px;
  margin-bottom: 30px;
  text-align: center;
}

.align-center {
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

.input-wcl-subcontainer {
  display: flex;
  justify-content: center;
}

.slight-offset-top {
  margin-top: 20px;
}

.slight-offset-left {
  margin-left: 10px;
}

.slight-offset-bottom {
  margin-bottom: 30px;
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
  font-weight: 700;
}

.skull {
  font-size: 2em;
}

</style>
