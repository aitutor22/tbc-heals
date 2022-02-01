<template>
  <div class="container">
    <div class="row">
      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link" :class="{active: className === 'priest'}" href="#" @click="select('priest')">Priest</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{active: className === 'shaman'}" href="#" @click="select('shaman')">Shaman</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{active: className === 'paladin'}" href="#" @click="select('paladin')">Paladin</a>
        </li>
      </ul>
    </div>

    <div class="row">
      <ul class="nav" v-if="className === 'priest'">
<!--         <li class="nav-item">
          <router-link :to="{name:'coh'}" class="nav-link">Priest Mana</router-link>
        </li> -->
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

      <ul class="nav" v-if="className === 'shaman'">
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

      <ul class="nav" v-if="className === 'paladin'">
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
    };
  },
  methods: {
    ...mapMutations(['setClassName']),
    select(className) {
      this.setClassName(className);
    },
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
