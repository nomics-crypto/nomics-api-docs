const Swagger = require('swagger-client')
const jsYaml = require('js-yaml')
const fs = require('fs')

const spec = jsYaml.safeLoad(fs.readFileSync("./spec.yaml"))

// Rotated often! For demo use only! Get a free key here:
// https://p.nomics.com/cryptocurrency-bitcoin-api/
const key = "demo-26240835858194712a4f8cc0dc635c7a"

const curlTemplate = (url) => `curl "${url}"`;

const javascriptTemplate = (url) => `fetch("${url}")
  .then(response => response.json())
  .then(data => console.log(data))`

const nodeTemplate = (url) => `require('axios')
  .get("${url}")
  .then(response => console.log(response))`

const pythonTemplate = (url) => `import urllib.request
url = "${url}"
print(urllib.request.urlopen(url).read())`

const rubyTemplate = (url) => `require 'net/http'
uri = URI("${url}")
puts Net::HTTP.get(uri)`

Swagger({ spec }).then((jx) => {
  Object.keys(jx.spec.paths).forEach((k) => {
    const path = jx.spec.paths[k]
    let params = [`key=${key}`]
    if (path.get && path.get.parameters) {
      path.get.parameters.forEach((p) => {
        if (p.name && p.example && !p.deprecated) {
          params.push(`${p.name}=${p.example}`)
        }
      })
    }
    const url = `${jx.spec.servers[0].url}${k}?${params.join("&")}`
    fs.writeFileSync(`./samples/${path.get.operationId}.json`, JSON.stringify([
      { lang: "Shell", source: curlTemplate(url) },
      { lang: "JavaScript", source: javascriptTemplate(url) },
      { lang: "NodeJS", source: nodeTemplate(url) },
      { lang: "Ruby", source: rubyTemplate(url) },
      { lang: "Python", source: pythonTemplate(url) },
    ]))
  })
})
