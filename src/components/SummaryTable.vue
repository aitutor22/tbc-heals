<template>
  <div class="row table-container">
    <b-table striped hover :items="tableData"></b-table>
<!--     <table class="table table-striped">
    <b-table-simple hover small caption-top responsive>
      <tr>
        <th>Rank</th>
        <th>Mana</th>
        <th>Cast Time</th>
        <th>Base Heal</th>
        <th>Bonus Heal</th>
        <th v-if="spells['direct']">Crit Heal</th>
        <th v-if="spells['hot']">Tick</th>
        <th>Total Heal</th>
        <th>HPS</th>
        <th>Efficiency</th>
        <th v-if="showInspiration">Inspiration %</th>
      </tr>
      <b-tr v-for="spell in spells['ranks']" :key="spell['rank']">
        <b-td>{{ spell['rank'] }}</b-td>
        <b-td>{{ spell['mana'] }}</b-td>
        <b-td>{{ spell['castTime'] }}</b-td>
        <b-td>{{ spell['baseHeal'] }}</b-td>
        <b-td>{{ spell['bonusHeal'] }}</b-td>
        <b-td v-if="spells['direct']">{{ spell['critHeal'] }}</b-td>
        <b-td v-if="spells['hot']">{{ spell['tick'] }}</b-td>
        <b-td>{{ spell['totalHeal'] }}</b-td>
        <b-td>{{ spell['hps'] }}</b-td>
        <b-td>{{ spell['efficiency'] }}</b-td>
        <b-td  v-if="showInspiration">{{ spell['inspiration_uptime'] }}%</b-td>
      </tr>
    </table>
    </b-table-simple> -->
    <p>
      This project is greatly inspired by <a href="https://github.com/Tegas/legacy-sim">Tegas' Legacy WoW Sim.</a>
      <span v-if="spells['class'] == 'priest'">
        Spell values are taken from Knade (Pagle)'s <a href="https://docs.google.com/spreadsheets/d/1p_7OSqFV-wXPFtFAfFlePsmTJNmX2BnQ9fwzB8da4-c/edit#gid=1556108463">TBC Priest Gear Scores</a>. 
      </span>
      <span v-if="spells['class'] == 'shaman'">
        Spell values are taken from Egregious's <a href="http://bit.ly/3bJ1ef0">calculator</a>. 
      </span>
      <span v-if="spells['class'] == 'paladin'">
        Formula and spell values are taken from Currelius's <a href="https://docs.google.com/spreadsheets/d/1qyhnntH3Mb8skxqZj2Bco3Z6Czt_na1jcn-gfxC5S9Y/edit#gid=227971422">calculator</a>. 
      </span>
      <span>If you see any bugs, please message Trollhealer (Arugal).</span></p>
  </div>
</template>

<script>


export default {
  name: 'SummaryTable',
  props: {
    spells: Object
  },
  computed: {
    showInspiration() {
      if (!this.spells) return;
      return this.spells['direct'] && (this.spells['class'] === 'priest' || this.spells['class'] === 'shaman');
    },
    tableData() {
      if (!this.spells) return;
      let results = [];
      for (let i = 0; i < this.spells['ranks'].length; i++) {
        let entry = {};
        let spell = this.spells['ranks'][i];
        entry['rank'] = spell['rank'];
        entry['mana'] = spell['mana'];
        entry['castTime'] = spell['castTime'];
        entry['baseHeal'] = spell['baseHeal'];
        entry['bonusHeal'] = spell['bonusHeal'];
        if (this.spells['direct']) {
          entry['critHeal'] = spell['critHeal'];
        }
        if (this.spells['hot']) {
          entry['tick'] = spell['tick'];
        }
        entry['totalHeal'] = spell['totalHeal'];
        entry['hps'] = spell['hps'];
        entry['efficiency'] = spell['efficiency'];
        if (this.showInspiration) {
          entry['inspiration_uptime'] = spell['inspiration_uptime'];
        }
        results.push(entry);
      }
      return results;
    }
  },
  data() {
    return {
      items: [
        { age: 40, first_name: 'Dickerson', last_name: 'Macdonald' },
        { age: 21, first_name: 'Larsen', last_name: 'Shaw' },
        { age: 89, first_name: 'Geneva', last_name: 'Wilson' },
        { age: 38, first_name: 'Jami', last_name: 'Carney' }
      ],
    };
  },
  methods: {
  },
  mounted() {
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.table-container {
  margin-top: 50px;
}
</style>
