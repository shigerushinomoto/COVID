<template>
  <div id="app">
    <div class="container">
      <Head></Head>
      <MakeChart></MakeChart>
      <Tail></Tail>
    </div>
  </div>
</template>

<script>
import Head from './components/Head.vue'
import Tail from './components/Tail.vue'
import MakeChart from './components/MakeChart.vue'

export default {
  name: 'App',
  components: {
    Head,
    Tail,
    MakeChart
  }
}
</script>

<style>
  @import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
</style>