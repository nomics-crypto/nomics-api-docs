const Swagger = require('swagger-client')
const jsYaml = require('@kyleshockey/js-yaml')
const fs = require('fs')

const spec = jsYaml.safeLoad(fs.readFileSync("./spec.yaml"))

// Rotated often! For demo use only! Get a free key here:
// https://p.nomics.com/cryptocurrency-bitcoin-api/
const key = "2018-08-demo-dont-deploy-6eb4ce24acd11f08"

const curlTemplate = (url) => `curl "${url}"`;

const nodeTemplate = (url) => `require('axios').get(
  "${url}"
).then((response) => {
  console.log(response)
})`

const pythonTemplate = (url) => `import urllib.request
url = "${url}"
print(urllib.request.urlopen(url).read())`

const rubyTemplate = (url) => `require 'net/http'
uri = URI("${url}")
puts Net::HTTP.get(uri)`

Swagger({spec}).then((jx) => {
  Object.keys(jx.spec.paths).forEach((k) => {
    const path = jx.spec.paths[k]
    let params = [`key=${key}`]
    if (path.get && path.get.parameters) {
      path.get.parameters.forEach((p) => {
        if (p.name && p.example) {
          params.push(`${p.name}=${p.example}`)
        }
      })
    }
    const url = `${jx.spec.servers[0].url}${k}?${params.join("&")}`
    fs.writeFileSync(`./samples/${path.get.operationId}.json`, JSON.stringify([
      {lang: "Shell", source: curlTemplate(url)},
      {lang: "JavaScript", source: nodeTemplate(url)},
      {lang: "Ruby", source: rubyTemplate(url)},
      {lang: "Python", source: pythonTemplate(url)},
    ]))
  })
})
