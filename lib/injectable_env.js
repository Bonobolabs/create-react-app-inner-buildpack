const fs = require("fs")

const placeholderExpression = /(\{\{REACT_APP_VARS_AS_JSON_*\}\})/
const filename = process.argv[2]
const content = fs.readFileSync(filename).toString()
const placeholders = content.match(placeholderExpression)

if (placeholders != null) {
    const placeholder = placeholders[1]
    const reactEnv = {}

    for (const [name, value] of Object.entries(process.env)) {
        if (name.startsWith('REACT_APP_')) {
            reactEnv[name] = `bl\\a"${value}`
        }
    }

    const reactEnvString = JSON.stringify(reactEnv)
        .replaceAll(/\\(?!\")/g, '\\\\')
        .replaceAll(/\\\"/g, '\\\\\\"')
        .replaceAll(/(?<!\\)\"/g, '\\"')

    const padding = " ".repeat(Math.max(placeholder.length - reactEnvString.length, 0))

    console.log(`Writing ${filename}`)

    fs.writeFileSync(filename, content.replace(placeholderExpression, reactEnvString + padding))
}
