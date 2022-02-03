import Heap from 'heap-js';

const CONSUMES = {
  'SUPER_MANA_POTION': {
    value: 2400,
    cooldown: 120,
    waitForInitialUses: [],
  },
  'DARK_RUNE': {
    value: 1200,
    cooldown: 120,
    // requires super mana potion to be used once first
    waitForInitialUses: ['SUPER_MANA_POTION'],
  },
  'SHADOWFIEND': {
    value: 0,
    cooldown: 60 * 5,
    waitForInitialUses: ['SUPER_MANA_POTION', 'DARK_RUNE'],
  },
  'MANA_TIDE_TOTEM': {
    value: 0,
    cooldown: 60 * 5,
    waitForInitialUses: ['SUPER_MANA_POTION', 'DARK_RUNE', 'SHADOWFIEND'],
  },
};

import {mixin} from './calculator'
import {mapState} from 'vuex';

export const oomMixin = {
  mixins: [mixin],
  computed: {
    ...mapState(['oomOptions']),
  },
  data() {
    return {
      oomMixinData: {
        'intervalBetweenShadowfiendTick': 1.5, // heals over 10x 1.5s intervals
        'shadowFiendActive': false,
        'shadowfiendTicks': 0,
        // mana tide isn't always present, depends on what player selects
        // 'playerSelectedManaTide': args['mtt'],
        'intervalBetweenManaTideTotemTicks': 3,
        'manaTideTotemActive': false,
        'manaTideTotemTicks': 0,
        'maxTime': 10 * 60, // in seconds,
        // 'alchemistStone': args['alchemistStone'],
        'GCD': 1.5,
        'timeLastAction': 0,
        'consumesOffCD': {
          'SUPER_MANA_POTION': 0,
          'DARK_RUNE': 0,
          'SHADOWFIEND': 0,
          'MANA_TIDE_TOTEM': 0,
        },
        // this is to avoid situations where a player's mana pool is 12k, and inputted shadowfiend is 12k
        // and shadowfiend will never be used since mana_deficit will always be lesser than 12k
        'THRESHOLD_TO_USE_CONSUMES_REGARDLESS_OF_DEFICIT': 1000,
        // can either be on-going or ended
        'status': 'ongoing',
        'logs': [],
        // to include consume use and shadowfiend only
        'highlightedLogs': [],
        'manaSummary': {},
        'scatterData': [],
      }
    };
  },
  methods: {
    calculateTimeOOM() {
      this.init();

      let nextEvent;
      do {
        nextEvent = this.oomMixinData['priorityQueue'].pop();
        if (nextEvent.type === 'HEALING_SPELL_CAST') {
          this.healingSpellCastHelper(nextEvent);
        }
        else if (nextEvent.type === 'MANA_TICK') {
          this.changeMana(this.oomMixinData['inCombatManaTick'], 'MANA_TICK');
          this.logHelper('MANA_TICK', nextEvent.time);
          // adding next mana tick (based on 2s tick timer)
          this.addItemToQueue(nextEvent.time + 2, 'MANA_TICK');
        } 
        // // adds next shadowfiend tick even
        // else if (nextEvent.type === 'SHADOWFIEND_MANA_TICK') {
        //   options['shadowfiendTicks']++;
        //   this.changeMana(options, options['shadowfiendHealingPerTick'], 'SHADOWFIEND');
        //   this.logHelper('SHADOWFIEND_MANA_TICK', nextEvent.time, options);
        //   // once we readch 10 ticks, means shadowfiend has finished
        //   if (options['shadowfiendTicks'] < 10) {
        //     this.addItemToQueue(options, nextEvent.time + options['intervalBetweenShadowfiendTick'], 'SHADOWFIEND_MANA_TICK');
        //   } else {
        //     this.shadowFiendActive = false;
        //   }
        // } 
        // // adds next mana tide totem tick even
        // else if (nextEvent.type === 'MANA_TIDE_TOTEM_TICK') {
        //   options['manaTideTotemTicks']++;
        //   this.changeMana(options, options['manaTideTotemManaPerTick'], 'MANA_TIDE_TOTEM');
        //   this.logHelper('MANA_TIDE_TOTEM_TICK', nextEvent.time, options);
        //   // once we readch 4 ticks, means mana tide totem has finished
        //   if (options['manaTideTotemTicks'] < 4) {
        //     this.addItemToQueue(options, nextEvent.time + options['intervalBetweenManaTideTotemTicks'], 'MANA_TIDE_TOTEM_TICK');
        //   } else {
        //     this.manaTideTotemActive = false;
        //   }
        } while (nextEvent.time < this.oomMixinData['maxTime'] && this.oomMixinData['status'] === 'ongoing');

      console.log(this.oomMixinData);
    },
    init() {
      this.oomMixinData['castTime'] = 60 / this.oomOptions['cpm'];
      this.calculateTotalInt();
      this.calculateTotalSpirit();
      this.calculateTotalOtherMp5();
      this.calculateTotalManaPool();
      this.calculateManaRegenPerTick();

      this.oomMixinData['currentMana'] = this.oomMixinData['manaPool'];
      // shadowfiend returns mana over 10 ticks, each tick is 1.5s
      this.oomMixinData['shadowfiendHealingPerTick'] = this.oomOptions['shadowfiendMana'] / 10;
      // mana tide returns 24% of mana pool over 4 ticks, each tick is 3s
      this.oomMixinData['manaTideTotemManaPerTick'] = Math.floor(this.oomMixinData['currentMana'] * 0.24 / 4);

      const customPriorityComparator = (a, b) => a.time - b.time;
      this.oomMixinData['priorityQueue'] = new Heap(customPriorityComparator);
      this.addItemToQueue(0, 'HEALING_SPELL_CAST');
      // trying to space out the healing cast and mana_tick events
      this.addItemToQueue(0.1, 'MANA_TICK');
    },
    calculateTotalManaPool() {
      this.oomMixinData['manaPool'] = Math.floor((2340 + this.oomMixinData['buffedInt'] * 15) * (this.oomOptions['mentalStrength'] ? 1.1 : 1));
    },
    // we assume everyone has AI, MOTW, draenic wisdom and kings
    // user selected stuff are kreegs
    calculateTotalInt() {
      // Arcane Intellect - 40
      // Draenic Wisdom - 30
      // MoTW - 19
      // Kreegs - -5
      // Kings - +10%
      // Enlightenment - +5%

      this.oomMixinData['buffedInt'] = Math.floor(
        (this.oomOptions['int'] + 40 + 30 + 19 + (this.oomOptions['kreegs'] ? -5 : 0))
        * 1.1 * (this.oomOptions['enlightenment'] ? 1.05 : 1)
      );
      return this.oomMixinData['buffedInt'];
    },
    // we assume everyone has MOTW, food buff, draenic wisdom and kings
    // user selected stuff are kreegs
    calculateTotalSpirit() {
      // MoTW - 19
      // Draenic Wisdom - 30
      // Food Buff - 20
      // Scroll - 30
      // IDS - 50
      // Kreegs - 25
      // Spirit of Redemption - +5%
      // Kings - +10%
      // Human Racial - +10%
      // Enlightenment - +5%
      let idsSpirit = 0,
        otherSpirit = 0;
      if (this.oomOptions['idsScroll'] === 'ids') {
        idsSpirit = 50;
      } else if (this.oomOptions['idsScroll'] === 'scroll') {
        idsSpirit = 30;
      }

      otherSpirit = (this.oomOptions['kreegs'] ? 25 : 0) + idsSpirit;
      this.oomMixinData['buffedSpirit'] = Math.floor((this.oomOptions['spirit'] + 19 + 30 + 20 + otherSpirit)
        * 1.05 * 1.1 * (this.oomOptions['enlightenment'] ? 1.05 : 1)
        * (this.oomOptions['isHuman'] ? 1.1 : 1));

      return this.oomMixinData['buffedSpirit'];
    },
    calculateTotalOtherMp5() {
      // Brilliant Mana Oil - 12
      // Imp BoW - 49.2
      // Mana Spring - 50 * 1.25 (after talents)
      // IED - 5% proc rate to return 300, 15s icd
      // formula for IED is 15 + 20 * castTime
      // shadowpriest dps - 5% is converted to mana, multiply by 5 since conversion to mp5

      let snowballMP5 = !this.oomOptions['hasSnowball'] ? 0 : this.convertToNumber(this.oomOptions['snowballMP5']);
      let shadowPriestDPS = !this.oomOptions['hasShadowPriest'] ? 0 : this.convertToNumber(this.oomOptions['shadowPriestDPS']) * 0.05 * 5;

      this.oomMixinData['otherMP5'] = Math.floor(this.oomOptions['otherMP5'] + (this.oomOptions['mst'] ? 50 * 1.25: 0) + (this.oomOptions['bow'] ? 49.2: 0)
        + (this.oomOptions['ied'] ? 300 / (15 + 20 * this.oomMixinData['castTime']) * 5 : 0)
        + snowballMP5 + shadowPriestDPS + 12);

      return this.oomMixinData['otherMP5'];
    },
    // for priest, int/spirit are buffed numbers. other_mp5 refers to gear based mp5, BoW, food (but exclude mana pots and dark runes)
    // returns mp2
    calculateManaRegenPerTick() {
      let combat_spirit_based_mp2 = 0.0093271 * 2 * (this.oomMixinData['buffedInt'] ** 0.5) * this.oomMixinData['buffedSpirit'] * 0.3;
      this.oomMixinData['inCombatManaTick'] = Math.floor(combat_spirit_based_mp2 + this.oomMixinData['otherMP5'] / 5 * 2);
      return this.oomMixinData['inCombatManaTick'];
    },
    addItemToQueue(time, type) {
      this.oomMixinData['priorityQueue'].push({
        time: time,
        type: type,
      });
    },
    // use this to track mana changes
    changeMana(value, type) {
      if (typeof this.oomMixinData['manaSummary'][type] === 'undefined') this.oomMixinData['manaSummary'][type] = 0;
      this.oomMixinData['currentMana'] += value;
      // cannot exceed max mana
      if (this.oomMixinData['currentMana'] > this.oomMixinData['manaPool']) this.oomMixinData['currentMana'] = this.oomMixinData['manaPool'];
      this.oomMixinData['manaSummary'][type] += Math.floor(value);
    },
    // status - HEALING_SPELL_CAST, OOM
    logHelper(status, time) {
      let currentMana = this.oomMixinData['currentMana'],
        manaPool = this.oomMixinData['manaPool'],
        msg = '';

      if (status === 'OOM') {
        msg = `Ran out of mana after ${this.roundToTwo(time)}s`;
      } else if (status === 'HEALING_SPELL_CAST') {
       msg = `Casted healing spell at ${this.roundToTwo(time)}s. (${currentMana} / ${manaPool})`;
      } else if (status === 'MANA_TICK') {
        msg = `Mana tick at ${this.roundToTwo(time)}s. (${currentMana} / ${manaPool})`;
      } else if (status === 'SHADOWFIEND_MANA_TICK') {
        msg = `Shadowfiend attacked at ${this.roundToTwo(time)}s. (${currentMana} / ${manaPool})`;
      } else if (status === 'MANA_TIDE_TOTEM_TICK') {
        msg = `Mana Tide Totem ticked at ${this.roundToTwo(time)}s. (${currentMana} / ${manaPool})`;
      } else if (status === 'SUPER_MANA_POTION' || status === 'DARK_RUNE' || status === 'SHADOWFIEND' || status === 'MANA_TIDE_TOTEM') {
        msg = `Used ${status} at ${this.roundToTwo(time)}s. (${currentMana} / ${manaPool})`;
      }
      if (msg !== '') this.oomMixinData['logs'].push(msg);
      if(status != 'HEALING_SPELL_CAST' && status !== 'MANA_TICK') {
        this.oomMixinData['highlightedLogs'].push(msg);
      }
    },
    healingSpellCastHelper(nextEvent) {
      // assume that mana potion can only be used before a spell cast
      // we first check for consume usage
      let consumeResults = this.consumeHelper(nextEvent.time);
      // shadowfiend is handled differently as it doesnt add back mana immediately
      if (consumeResults === 'SHADOWFIEND') {
        // if we use shadowfiend, then we don't cast a healing spell during this gcd and instead cast it 1 gcd later
        this.addItemToQueue(nextEvent.time + this.oomMixinData['GCD'], 'HEALING_SPELL_CAST');
        return;
      }

      if (this.oomMixinData['currentMana'] < this.oomMixinData['manaCost']) {
        // timeLastAction refers to our previously casted spell as we ran oom then
        this.logHelper('OOM', this.oomMixinData['timeLastAction']);
        this.oomMixinData['timeToOOM'] = this.oomMixinData['timeLastAction'];
        this.oomMixinData['status'] = 'ended'
        return;
      }
      // can cast
      this.changeMana(-this.oomMixinData['manaCost'], 'HEALING_SPELL_CAST');
      this.oomMixinData['timeLastAction'] = nextEvent.time;
      // timeLastAction refers to the time we cast the current spell
      this.logHelper('HEALING_SPELL_CAST', this.oomMixinData['timeLastAction']);
      // adding next spellcast (based on cast time)
      this.addItemToQueue(nextEvent.time + this.oomMixinData['castTime'], 'HEALING_SPELL_CAST');
    },
  },
    // bunch of magic numbers here, refactor in future
    // returns [boolean_indiciating_if_consume_used, mana_regen, message]
    consumeHelper(time) {
      let manaDeficit = this.oomMixinData['manaPool'] - this.oomMixinData['currentMana'];

      // do not use consumes when shadowfiend or mana tide is active
      if (this.oomMixinData['shadowFiendActive'] || this.oomMixinData['manaTideTotemActive']) return;

      for (let key in CONSUMES) {
        // checks to see if player has selected mana tide totem in the arguments
        if (key === 'MANA_TIDE_TOTEM' && !this.oomOptions['mtt']) return;

        let deficitToUse;
        // alchemist stone increases mana regen from super mana potions by 40%
        let alchemistStoneScalingFactor = (key === 'SUPER_MANA_POTION' && this.oomOptions['alchemistStone']) ?
            1.4 : 1;

        if (key === 'SUPER_MANA_POTION' || key === 'DARK_RUNE') {
          // note: dark runes aren't affected by alchemist stone
          deficitToUse = CONSUMES[key]['value'] * alchemistStoneScalingFactor;
        } else if (key === 'SHADOWFIEND') {
          deficitToUse = this.oomOptions['shadowfiendMana'];
        } else if (key === 'MANA_TIDE_TOTEM') {
          deficitToUse = this.oomMixinData['manaPool'] * 0.24;
        }

        if (time >= this.oomMixinData['consumesOffCD'][key] &&
              (manaDeficit > deficitToUse || this.oomMixinData['currentMana'] <= this.oomMixinData['THRESHOLD_TO_USE_CONSUMES_REGARDLESS_OF_DEFICIT'])) {
          // for dark rune and innervates, we need to check if previous consumes (e.g. super mana potion have been used)
          let haveUsedPreviousConsumes = CONSUMES[key]['waitForInitialUses'].map(i => this.oomMixinData['consumesOffCD'][i] > 0);
          if (haveUsedPreviousConsumes.length > 0 && haveUsedPreviousConsumes.indexOf(false) > -1) {
            continue;
          }

          // if we do use a consume, we return as we should only use one consume at a time
          this.oomMixinData['consumesOffCD'][key] = time + CONSUMES[key]['cooldown'];
          if (key === 'SUPER_MANA_POTION' || key === 'DARK_RUNE') {
            this.changeMana(CONSUMES[key]['value'] * alchemistStoneScalingFactor, key);
          } else if (key === 'SHADOWFIEND') {
            this.addItemToQueue(time + this.oomMixinData['intervalBetweenShadowfiendTick'], 'SHADOWFIEND_MANA_TICK');
            this.shadowFiendActive = true;
            this.oomMixinData['shadowfiendTicks'] = 0;
          } else if (key === 'MANA_TIDE_TOTEM') {
            this.addItemToQueue(time + this.oomMixinData['intervalBetweenManaTideTotemTicks'], 'MANA_TIDE_TOTEM_TICK');
            this.manaTideTotemActive = true;
            this.oomMixinData['manaTideTotemTicks'] = 0;
          }
          this.logHelper(key, time);
          return key;
        }
      }
      return null;
    },
  mounted() {

  }
}