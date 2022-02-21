<template>
  <div class="container" @mouseleave="removeHover">
    <div class="row">
      <ul class="nav nav-tabs">
        <li class="nav-item">
          <router-link :to="{name:'who-fucked-up'}"
            :class="{active: activeClass === 'who'}"
            class="nav-link">Who Fucked Up?</router-link>
        </li>
        <li class="nav-item" v-for="(_class, index) in ['priest', 'shaman', 'paladin']" :key="index"
            @mouseover="onHover(_class)">
          <a class="nav-link" :class="{active: activeClass === _class}" href="#" @click="select(_class)">
          {{ _class[0].toUpperCase() }}{{ _class.substring(1) }}</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="https://zak-lambert.github.io/tbc-sim/#/spell">Druid (by Xaddie)</a>
        </li>
      </ul>
    </div>

    <div class="row">
      <ul class="nav" v-if="activeClass === 'priest' && showSecondaryRow">
        <li class="nav-item">
          <router-link :to="{name:'priest-time-to-oom'}" class="nav-link">Time to OOM</router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{name:'coh'}" class="nav-link">Circle of Healing</router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{name:'greater-heal'}" class="nav-link">Greater Heal</router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{name:'flash-heal'}" class="nav-link">Flash Heal</router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{name:'renew'}" class="nav-link">Renew</router-link>
        </li>
      </ul>

      <ul class="nav" v-if="activeClass === 'shaman' && showSecondaryRow">
        <li class="nav-item">
          <router-link :to="{name:'shaman-time-to-oom'}" class="nav-link">Time to OOM</router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{name:'af-simulation'}" class="nav-link">Ancestral Fortitude</router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{name:'chain-heal'}" class="nav-link">Chain Heal</router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{name:'healing-wave'}" class="nav-link">Healing Wave</router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{name:'lesser-healing-wave'}" class="nav-link">Lesser Healing Wave</router-link>
        </li>
      </ul>

      <ul class="nav" v-if="activeClass === 'paladin' && showSecondaryRow">
        <li class="nav-item">
          <router-link :to="{name:'holy-light'}" class="nav-link">Holy Light</router-link>
        </li>
        <li class="nav-item">
          <router-link :to="{name:'flash-of-light'}" class="nav-link">Flash of Light</router-link>
        </li>
      </ul>
    </div>


  </div>
</template>

<script>

import {mapState} from 'vuex';

export default {
  name: 'NavigationHeader',
  props: {
    spells: Object
  },
  computed: {
    ...mapState(['className']),
  },
  data() {
    return {
      activeClass: '',
      showSecondaryRow: false,
    };
  },
  methods: {
    select(className) {
      // if have time, should make onhover effects desktop only to avoid bugs when using on mobiel
      if (this.activeClass === className && this.showSecondaryRow) {
        this.showSecondaryRow = false;
        return;
      }
      this.activeClass = className
      this.showSecondaryRow = true;
    },
    onHover(className) {
      this.activeClass = className
      this.showSecondaryRow = true;
    },
    removeHover() {
      this.showSecondaryRow = false;
      // if we hover over and didnt select any links
      if (this.className !== this.activeClass) {
        this.activeClass = this.className;
      }
    },
  },
  watch:{
    $route() {
      this.showSecondaryRow = false;
    },
    '$store.state.className': {
      immediate: true,
      handler() {
        this.activeClass = this.className;
        console.log(this.activeClass);
      },
    },
  },
  mounted() {
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container {
  margin-top: 10px;
}

.table-container {
  margin-top: 50px;
}

a.active {
  background: #e4e4e4 !important;
}
</style>
