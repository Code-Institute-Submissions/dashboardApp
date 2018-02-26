module.exports = {

  request: function (req, token, refreshToken, apiToken, refreshUrl, merchantData, merchantUrl) {
    if (req.url === refreshUrl) {
      req.data = { 'MerchantID': merchantData }
      this.options.http._setHeaders.call(this, req, {Authorization: 'Basic ' + btoa(apiToken + ':') + ' ,Bearer ' + refreshToken})
    }
    else if (req.url === merchantUrl) {
      this.options.http._setHeaders.call(this, req, {Authorization: 'Basic ' + btoa(apiToken + ':') + ' ,Bearer ' + token})
    }
    else {
      this.options.http._setHeaders.call(this, req, {Authorization: 'Bearer ' + token})
    }
    //
  },

  response: function (res) {
    if (res !== undefined) {
      var headers = this.options.http._getHeaders.call(this, res),
        token = headers.Authorization || headers.authorization
      if (headers.accesstoken !== '') {
        return headers.accesstoken
      }
      else {
        if (token) {
          token = token.split(/Bearer:?\s?/i)
          return token[token.length > 1 ? 1 : 0].trim()
        }
      }
    }
  }
}
