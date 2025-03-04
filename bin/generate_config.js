const fs = require('fs')
const path = require('path')
const ejs = require('ejs')

// Read and parse the JSON config file.
const configPath = process.argv[2] || path.join(__dirname, '..', 'static.json')
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

if (config.proxies) {
  Object.keys(config.proxies).forEach((proxyPath) => {
    let origin = config.proxies[proxyPath].origin
    // Use regex to substitute placeholders with values from process.env.
    origin = origin.replace(/\$\{([^}]+)\}/g, (match, varName) => {
      return process.env[varName] || match
    })
    config.proxies[proxyPath].origin = origin
  })
}

// Load the EJS template.
const templatePath = path.join(__dirname, 'nginx.conf.ejs')
const template = fs.readFileSync(templatePath, 'utf8')

// Render the configuration.
const output = ejs.render(template, { config })

// Write the generated config to a file named nginx.conf.erb.
const outputPath = path.join(__dirname, 'nginx.conf.erb')
fs.writeFileSync(outputPath, output, 'utf8')

console.log('nginx.conf.erb generated successfully at:', outputPath)
