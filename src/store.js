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
    // FOR EVERY FIELD WE PUT IN OOMOPTIONS, PLEASE ENSURE THEY FOLLOW THE ORDER BELOW
    // THIS IS FOR SHARING PURPOSES
    keys: [
      'cpm', 'manaCost', 'otherMP5', 'int', 'spirit', 'shadowfiendMana', 'mentalStrength', 'enlightenment', 'sor', 'kreegs', 'isHuman', 'idsScroll', 'ied', 'mst', 'bow', 'hasSnowball', 'snowballMP5', 'mtt', 'hasShadowPriest', 'shadowPriestDPS', 'alchemistStone', 'blueDragon', 'memento', 'hasEoG', 'cohPercent', 'ancestralKnowledge', 'hasWaterShield', 'waterShieldPPM', 'chPercent', 'shamanElixir', 'useRunes', 'useRunesPotTogether',
    ],
    oomOptions: {
      cpm: 30,
      // based off 90% R12/CoH + 10% PoM
      manaCost: 393,
      // gear-based mp5 + other sources like shadowpirest
      otherMP5: 75,
      int: 500,
      spirit: 400,
      shadowfiendMana: 7000,
      mentalStrength: false,
      enlightenment: false,
      // spirit of redemption (+5% spirit)
      sor: true,
      kreegs: false,
      isHuman: false,
      idsScroll: 'none',
      ied: true,
      // mana spring totem
      mst: false,
      // blessing of wisdom
      bow: true,
      hasSnowball: false,
      // snowball mp5 is more complicated since you can cast more than 1 snowball per gcd
      // typically in the 100-200mp5 range
      snowballMP5: 100,
      // mana tide totem
      mtt: false,
      hasShadowPriest: false,
      shadowPriestDPS: 1000,
      alchemistStone: false,
      blueDragon: false,
      memento: false,
      hasEoG: false,
      // for eog, will always assume 10% PoM/PWS
      cohPercent: 60,

      // FOR SHAMANS
      ancestralKnowledge: true,
      hasWaterShield: true,
      waterShieldPPM: 2.5,
      // for eog
      chPercent: 100,
      shamanElixir: 'wisdom',

      // consumes options
      useRunes: true,
      useRunesPotTogether: false,

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
    },

    deathAnalyzer: {
      wclCode: '',
      healerAssignments: {},
    },
  },
  getters: {
    // Add the `getField` getter to the
    // `getters` of your Vuex store instance.
    getField,
    shareURLParams: (state) => {
      let paramsString = '';
      for (let key of state.keys) {
        paramsString += `${state.oomOptions[key]};`
      }
      return paramsString.substring(0, paramsString.length - 1);
    },
  },
  mutations: {
    // Add the `updateField` mutation to the
    // `mutations` of your Vuex store instance.
    updateField,
    resetDeathAnalyzer(state) {
      console.log('resetting');
      Vue.set(state['deathAnalyzer'], 'wclCode', '');
      Vue.set(state['deathAnalyzer'], 'healerAssignments', {});
    },
    setClassName(state, value) {
      Vue.set(this.state, 'className', value);
    },
    setOomOptionsUsingParams(state, paramsString) {
      if (!paramsString) return;
      let rawData = paramsString.split(';');
      for (let index in rawData) {
        let value = rawData[index];
        let modifiedValue;
        if (!isNaN(value)) {
          modifiedValue = Number(value);
        } else if (String(value).toLowerCase() == 'true') {
          modifiedValue = true;
        } else if (String(value).toLowerCase() == 'false') {
          modifiedValue = false;
        } else {
          modifiedValue = value;
        }
        state.oomOptions[state.keys[index]] = modifiedValue;
      }

      // if (String(a).toLowerCase() == "true")
      // console.log(values);
    },
    // setState(state, string)
  },
});