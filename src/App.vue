<template>
  <!-- Don't drop "q-app" class -->
  <div v-if="$auth.ready()">
    <div id="q-app">
      <div>
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        context: 'app context',
        loaded: false
      }
    },

    mounted () {
    },

    created () {
    },

    methods: {
    }
  }
</script>

<style></style>
