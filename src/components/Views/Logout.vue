<template>
  <div>

  </div>
</template>

<script>
  export default {
    data () {
      return {
        context: 'oauth2 context',
        access_token: null,
        response: null
      }
    },
    mounted () {
      this.logout()
    },
    methods: {
      logout: function () {
        localStorage.removeItem('merchant-data')
        localStorage.removeItem('menu-data')
        localStorage.removeItem('refresh-url')
        localStorage.removeItem('basic-auth-token')
        localStorage.removeItem('merchant-url')
        document.cookie = 'default_auth_token='
        document.cookie = 'impersonate_auth_token='
        localStorage.removeItem('merchant-data-select')
        localStorage.removeItem('default_auth_token')
        localStorage.removeItem('refresh-token')
        this.$auth.watch.authenticated = false
        this.$router.push({path: '/'})
      }
    }
  }
</script>
<style>

</style>
