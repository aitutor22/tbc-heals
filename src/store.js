import Vue from 'vue';
import Vuex from 'vuex';
// import hash from 'object-hash'

// Import the `getField` getter and the `updateField`
// mutation function from the `vuex-map-fields` module.
import {getField, updateField} from 'vuex-map-fields';

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    className: 'priest',
    healingPower: 2200,
    // note we use 15 rather than 0.15
    critChance: 15,
    hastePercent: 0,
    overhealPercent: 0,
    crystalSpire: false,
    spireProcPercent: 10,
    oomOptions: {
      cpm: 30,
      manaCost: 405,
      // gear-based mp5 + other sources like shadowpirest
      otherMP5: 75,
      int: 500,
      spirit: 400,
      manaPool: 12000,
      shadowfiendMana: 7000,
      kreegs: false,
      isHuman: false,
      idsScroll: 'none',
      ied: true,
      // mana spring totem
      mst: false,
      // blessing of wisdom
      bow: false,
      hasSnowball: false,
      // snowball mp5 is more complicated since you can cast more than 1 snowball per gcd
      // typically in the 100-200mp5 range
      snowballMP5: 100,
    },
    shamanOptions: {
      // used for all healing spells
      'purification': true,
      'tidalFocus': true,
      'totem': 'others',

      // used only for healing wave
      'improvedHealingWave': true,
      'healingWay': false,

      // use for chain heal
      'improvedChainHeal': true,
      '2pT6': false,
      '4pT6': false,
      '5pT2.5': false,
    },
    priestOptions: {
      // used for all healing spells
      'spirtualHealing': true,

      // shared between flash heal and greater heal
      'empoweredHealing': true,
      'holyConcentration': false,

      // for greater heal
      '2pT5': false,
      '4pT6': false,
      'improvedHealing': true,
      'divineFury': true,

      // for renew
      'improvedRenew': true,
      'mentalAgility': true,
      '4pT5': false,
      '2pT3': false,
    },
    paladinOptions: {
      'holyLight': true,
      'sanctifiedLight': false,
      'illumination': true,
      'lightGrace': true,
      'libram': 'others',
      'blessingLight': false,
      '2pT6': false,
      '4pT6': false,
    }
  },
  getters: {
    // Add the `getField` getter to the
    // `getters` of your Vuex store instance.
    getField,
    paramsState: (state) => {
      return new URLSearchParams(state).toString();
    },
  },
  mutations: {
    // Add the `updateField` mutation to the
    // `mutations` of your Vuex store instance.
    updateField,
    setClassName(state, value) {
      Vue.set(this.state, 'className', value);
    },
  },
});