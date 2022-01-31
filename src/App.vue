<template>
  <div id="app">
    <div class="container">
      <div class="row">
        <ul class="nav">
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
          <li class="nav-item">
            <router-link :to="{name:'chain-heal'}" class="nav-link">Chain Heal</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{name:'healing-wave'}" class="nav-link">Healing Wave</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{name:'lesser-healing-wave'}" class="nav-link">Lesser Healing Wave</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{name:'holy-light'}" class="nav-link">Holy Light</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{name:'flash-of-light'}" class="nav-link">Flash of Light</router-link>
          </li>
        </ul>
      
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {
  }
}
</script>

<style>
</style>
