<template>
  <div class="container" @mouseleave="removeHover">
    <div class="row">
      <ul class="nav nav-tabs">
        <li class="nav-item" v-for="(_class, index) in ['priest', 'shaman', 'paladin']" :key="index"
            @mouseover="onHover(_class)">
          <a class="nav-link" :class="{active: className === _class}" href="#" @click="select(_class)">
          {{ _class[0].toUpperCase() }}{{ _class.substring(1) }}</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="https://zak-lambert.github.io/tbc-sim/#/spell">Druid (by Xaddie)</a>
        </li>
      </ul>
    </div>

    <div class="row">
      <ul class="nav" v-if="className === 'priest' && showSecondaryRow">
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

      <ul class="nav" v-if="className === 'shaman' && showSecondaryRow">
        <li class="nav-item">
          <router-link :to="{name:'shaman-time-to-oom'}" class="nav-link">Time to OOM</router-link>
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

      <ul class="nav" v-if="className === 'paladin' && showSecondaryRow">
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

import {mapState, mapMutations} from 'vuex';

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
      activeClass: 'priest',
      showSecondaryRow: false,
      hover: false,
    };
  },
  methods: {
    ...mapMutations(['setClassName']),
    select(className) {
      if (this.className === className && this.showSecondaryRow) {
        this.showSecondaryRow = false;
        return;
      }

      this.setClassName(className);
      this.showSecondaryRow = true;
    },
    onHover(className) {
      this.hover = true;
      this.setClassName(className);
      this.showSecondaryRow = true;
    },
    removeHover() {
      console.log('remove hover');
      // this.hover = false;
      this.showSecondaryRow = false;
      // setTimeout(() => {
      //   // this.hover = false;
      // }, 100);
    },
  },
  watch:{
    $route() {
      this.showSecondaryRow = false;
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
