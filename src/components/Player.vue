<template>
  <b :class="pclass">{{ pname }}</b>
</template>

<script>


export default {
  name: 'Player',
  props: {
    pname: String,
    pclass: String,
  },
  computed: {

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
.Shaman {
  color: #2459ff!important;
}

.Druid {
  color: #ff7d0a!important;
}

.Paladin {
  color: #f58cba!important;
}

.Priest {
  color: #a4a5a8!important;
}

.Warrior {
  color: #c79c6e!important;
}

.Rogue {
  color: #fff569!important;
}

.Hunter {
  color: #abd473!important;
}

.Mage {
  color: #69ccf0!important;
}

.Warlock {
  color: #9482c9!important;
}
</style>
