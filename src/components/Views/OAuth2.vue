<template>
  <div>
  </div>
</template>

<script>
  import {Loading} from 'quasar'

  export default {
    components: {
      Loading
    },
    data () {
      return {
        context: 'oauth2 context',
        access_token: null,
        response: null,
        test: 1
      }
    },
    mounted () {
      Loading.show()
      this.$ready(() => {
        if (this.$route.query['access-token'] === undefined && this.$route.path === '/') {
          this.auth('oauth1')
        }
      })
    },
    beforeCreate () {
      let PostOAuth = document.createElement('script')
      PostOAuth.setAttribute('src', this.$config.get('auth.sdkUrl'))
      document.head.appendChild(PostOAuth)
    },
    methods: {
      auth: function (provider) {
        var conf = {
          authURL: this.$config.get('auth.authURL'),
          accessTokenTypeID: this.$config.get('auth.accessTokenTypeID'),
          apiKey: this.$config.get('auth.apiKey'),
          userTypeID: this.$config.get('auth.userTypeID'),
          // Optional
          returnURL: this.$config.get('auth.returnURL')
          // merchantID: '',
          // loginType: '',
          // displayLogin: 1,
          // countryPrefix: '',
          // language: ''
        }
        console.log('------')
        new PostOAuth(conf).connect()
      }
    }
  }
</script>
<style>

</style>
