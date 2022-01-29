<template>
  <div class="row table-container">
    <table class="table table-striped">
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
      <tr v-for="spell in spells['ranks']" :key="spell['rank']">
        <td>{{ spell['rank'] }}</td>
        <td>{{ spell['mana'] }}</td>
        <td>{{ spell['castTime'] }}</td>
        <td>{{ spell['baseHeal'] }}</td>
        <td>{{ spell['bonusHeal'] }}</td>
        <td v-if="spells['direct']">{{ spell['critHeal'] }}</td>
        <td v-if="spells['hot']">{{ spell['tick'] }}</td>
        <td>{{ spell['totalHeal'] }}</td>
        <td>{{ spell['hps'] }}</td>
        <td>{{ spell['efficiency'] }}</td>
        <td  v-if="showInspiration">{{ spell['inspiration_uptime'] }}%</td>
      </tr>
    </table>
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
    }
  },
  data() {
    return {
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
