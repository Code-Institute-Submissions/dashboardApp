<template>
  <!-- if you want automatic padding use "layout-padding" class -->
  <div class="layout-padding">
    <!-- your content -->
    <div class="layout-padding logo-container non-selectable no-pointer-events">
        <img src="~assets/logo.png" class="logo">
    </div>
    
  </div>
</template>

<script>
import {Loading} from 'quasar'
export default {
  components: {
    Loading
  },
  mounted () {
    Loading.hide()
  },
  data () {
    return {}
  }
}
</script>

<style>
.logo-container {
  position: absolute;
  top: 20vh;
}
.logo {
  max-width: 40vw;
  height: auto;
}
</style>
