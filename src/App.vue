<template>
  <div id="app">
    <navigation-header></navigation-header>
    <router-view></router-view>
  </div>
</template>

<script>

import NavigationHeader from './components/NavigationHeader.vue';

export default {
  name: 'App',
  components: {
    NavigationHeader,
  }
}
</script>

<style>
</style>
