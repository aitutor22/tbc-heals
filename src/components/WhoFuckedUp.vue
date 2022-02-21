<template>
  <div class="container">
    <div class="row">
      This page is under construction
    </div>
  </div>
</template>

<script>
// import axios from 'axios';
// import {mapFields} from 'vuex-map-fields';
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
    };
  },

  computed: {
  },
  methods: {
    ...mapMutations(['setClassName']),
    convertPercentage(num) {    
      return +(Math.round(num * 100 + "e+1")  + "e-1");
    },
    roundToOne(num) {    
      return +(Math.round(num + "e+1")  + "e-1");
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
</style>
