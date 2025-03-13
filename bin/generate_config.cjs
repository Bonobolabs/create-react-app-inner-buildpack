const fs = require('fs')
const path = require('path')
const ejs = require('ejs')

// Read and parse the JSON config file.
const configPath = process.argv[2] || path.join(__dirname, '..', 'static.json')
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

// Load the EJS template.
const templatePath = path.join(__dirname, 'nginx.conf.ejs')
const template = fs.readFileSync(templatePath, 'utf8')

// Render the configuration.
const output = ejs.render(template, { config })

process.stdout.write(output)
