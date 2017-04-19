(function () {
  // 序列化参数
  function serialize (params) {
    if (!params) return ''
    var query = Object.keys(params).map(function (key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
    }).join('&')
    return query ? ('?' + query) : ''
  }

  function isType (obj, type) {
    return Object.prototype.toString.call(obj)
    .replace(/\[object\s(\w+)\]/, '$1') === type
  }

  function merge () {
    var args = Array.prototype.slice.call(arguments)
    return Object.assign.apply(Object, [{}].concat(args))
  }

  // 对一些参数进行预处理
  function beforHandler (options) {
    var method = options.method.toUpperCase()
    var baseUrl = options.baseUrl
    var url = options.url
    var params = options.params
    url = baseUrl ? (baseUrl + '/' + url) : url
    options.url = url
    options.method = method
    if (method === 'GET') {
      options.url = url + serialize(params)
      options.params = null
      return
    }
    if (isType(params, 'Object')) {
      options.params = JSON.stringify(params)
    }
  }

  // 对 xhr 的一些封装
  function fetcher (options) {
    beforHandler(options)
    var method = options.method
    var params = options.params
    var url = options.url
    var timeout = options.timeout
    var onsuccess = options.onsuccess
    var onerror = options.onerror
    var ontimeout = options.ontimeout
    var xhr = new XMLHttpRequest()

    xhr.withCredentials = true
    xhr.timeout = timeout
    xhr.open(method, url)
    xhr.onload = function () {
      if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
        onsuccess(xhr.responseText)
      } else {
        onerror(xhr)
      }
    }
    if (timeout && ontimeout) {
      xhr.ontimeout = function () {
        ontimeout(xhr)
      }
    }
    xhr.onerror = onerror
    xhr.send(params)
  }

  function buildErrInfo (msg, xhr) {
    xhr = xhr || {}
    return {
      msg: msg,
      status: xhr.status,
      statusText: xhr.statusText,
      responseURL: xhr.responseURL,
      timeout: xhr.timeout
    }
  }

  // 默认的一些请求处理函数
  var DEFAULT_HANDLERS = {
    successHandler: function (resText, resolve, reject) {
      var res = null
      try {
        res = JSON.parse(resText)
      } catch (e) {
        reject(buildErrInfo('PARSE ERROR'))
        return
      }
      resolve(res)
    },
    errorHandler: function (xhr, reject) {
      reject(buildErrInfo('REQUEST ERROR', xhr))
    },
    timeoutHandler: function (xhr, reject) {
      reject(buildErrInfo('TIMEOUT', xhr))
    }
  }

  // 默认的配置项
  var DEFAULT_OPTIONS = {
    baseUrl: '',
    timeout: 0,
    method: 'get'
  }

  function Ereq (globOpts, handlers) {
    var baseOptions = merge(DEFAULT_OPTIONS, globOpts)
    var baseHanders = merge(DEFAULT_HANDLERS, handlers)
    var errorHandler = baseHanders.errorHandler
    var successHandler = baseHanders.successHandler
    var timeoutHandler = baseHanders.timeoutHandler
    return function requester (options) {
      var mixOpts = merge(baseOptions, options)
      return new Promise(function (resolve, reject) {
        var fullOptions = merge(mixOpts, {
          onsuccess: function (resText) {
            successHandler(resText, resolve, reject)
          },
          onerror: function (xhr) {
            errorHandler(xhr, reject)
          },
          ontimeout: function (xhr) {
            timeoutHandler(xhr, reject)
          }
        })
        fetcher(fullOptions)
      })
    }
  }

  Ereq.util = {
    serialize: serialize,
    isType: isType,
    merge: merge,
    fetcher: fetcher
  }

  if (typeof exports === 'object') {
    module.exports = Ereq
  } else {
    window.Ereq = Ereq
  }
})()
