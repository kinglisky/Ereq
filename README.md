# Ereq
一个简单的 Ajax 客服端



用法：

`npm install ereq --save`

`import Ereq from 'ereq'`


```javascript
var globOpts = { baseUrl: 'http://xxx.xx.com' }
var handlers = {
  successHandler: function (resText, resolve, reject) {
    var res = null
    try {
      res = JSON.parse(resText)
    } catch (e) {
      reject(buildErrInfo('PARSE ERROR'))
      return
    }
    if (res.cood === 200) {
      resolve(res.data)
    } else {
      reject(buildErrInfo(res.msg))
    }
  }
}
var req = Ereq(globOpts, handlers)
var options = {
  method: 'post',
  url: 'api/xxxx/xxx',
  params: { name: 'xxx', arg: 'xxxx' }
}

req(options)
.then(res => { console.log('ok', res)})
.catch(err => {console.log('err', err)})
```

默认的一些请求处理函数
```
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
```

可以在 Ereq(opionts, handlers) 通过 handlers 进行覆盖


默认的配置项

```
var DEFAULT_OPTIONS = {
  baseUrl: '',
  timeout: 0,
  method: 'get'
}

```



额，代码没几行，看源码来得明白～
