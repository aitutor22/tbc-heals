import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import {BootstrapVue, IconsPlugin} from 'bootstrap-vue';
import vSelect from 'vue-select';

import GreaterHeal from
  './components/priest/GreaterHeal.vue';

import FlashHeal from
  './components/priest/FlashHeal.vue';

import Renew from
  './components/priest/Renew.vue';

import CircleOfHealing from
  './components/priest/CircleOfHealing.vue';

import PriestTimeToOOM from
  './components/priest/TimeToOOM.vue';

import ShamanTimeToOOM from
  './components/shaman/TimeToOOM.vue';

import ChainHeal from
  './components/shaman/ChainHeal.vue';

import HealingWave from
  './components/shaman/HealingWave.vue';

import LesserHealingWave from
  './components/shaman/LesserHealingWave.vue';

import HolyLight from
  './components/paladin/HolyLight.vue';

import FlashOfLight from
  './components/paladin/FlashOfLight.vue';

import AncestralFortitudeSimulation from
  './components/shaman/AncestralFortitudeSimulation.vue';

import DeathAnalyzer from
  './components/DeathAnalyzer.vue';

import {store} from './store';

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'vue-select/dist/vue-select.css';

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);
Vue.use(IconsPlugin)
Vue.component('v-select', vSelect);
Vue.use(VueRouter);
Vue.config.productionTip = false;

const routes = [
  {path: '/priestoom', component: PriestTimeToOOM, name: 'priest-time-to-oom'},
  {path: '/greaterheal', component: GreaterHeal, name: 'greater-heal'},
  {path: '/flashheal', component: FlashHeal, name: 'flash-heal'},
  {path: '/renew', component: Renew, name: 'renew'},
  {path: '/circleofhealing', component: CircleOfHealing, name: 'coh'},
  {path: '/shamanoom', component: ShamanTimeToOOM, name: 'shaman-time-to-oom'},
  {path: '/chainheal', component: ChainHeal, name: 'chain-heal'},
  {path: '/lesserhealingwave', component: LesserHealingWave, name: 'lesser-healing-wave'},
  {path: '/healingwave', component: HealingWave, name: 'healing-wave'},
  {path: '/holylight', component: HolyLight, name: 'holy-light'},
  {path: '/flashoflight', component: FlashOfLight, name: 'flash-of-light'},
  {path: '/ancestral-fortitude', component: AncestralFortitudeSimulation, name: 'af-simulation'},
  {path: '/death-analyzer', component: DeathAnalyzer, name: 'death-analyzer'},
  {path: '*', component: DeathAnalyzer, name: 'death-analyzer'},
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