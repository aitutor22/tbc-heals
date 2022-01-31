import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'

import GreaterHeal from
  './components/GreaterHeal.vue';

import FlashHeal from
  './components/FlashHeal.vue';

import Renew from
  './components/Renew.vue';

import CircleOfHealing from
  './components/CircleOfHealing.vue';

import ChainHeal from
  './components/ChainHeal.vue';

import HealingWave from
  './components/HealingWave.vue';

import LesserHealingWave from
  './components/LesserHealingWave.vue';

import HolyLight from
  './components/HolyLight.vue';

import FlashOfLight from
  './components/FlashOfLight.vue';

import {store} from './store';

Vue.use(VueRouter)
Vue.config.productionTip = false

const routes = [
  {path: '/greaterheal', component: GreaterHeal, name: 'greater-heal'},
  {path: '/flashheal', component: FlashHeal, name: 'flash-heal'},
  {path: '/renew', component: Renew, name: 'renew'},
  {path: '/circleofhealing', component: CircleOfHealing, name: 'coh'},
  {path: '/chainheal', component: ChainHeal, name: 'chain-heal'},
  {path: '/lesserhealingwave', component: LesserHealingWave, name: 'lesser-healing-wave'},
  {path: '/healingwave', component: HealingWave, name: 'healing-wave'},
  {path: '/holylight', component: HolyLight, name: 'holy-light'},
  {path: '/flashoflight', component: FlashOfLight, name: 'flash-of-light'},
  {path: '*', component: GreaterHeal},
];

const router = new VueRouter({
  routes,
  mode: 'history',
  base: '/',
});

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')