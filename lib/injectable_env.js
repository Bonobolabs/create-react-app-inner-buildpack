const fs = require("fs")

const placeholderExpression = /(\{\{REACT_APP_VARS_AS_JSON_*\}\})/
const filename = process.argv[2]
const content = fs.readFileSync(filename).toString()
const placeholders = content.match(placeholderExpression)

if (placeholders != null) {
    const placeholder = placeholders[1]

    const reactEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => key.startsWith('REACT_APP_')))
    let reactEnvString = JSON.stringify(JSON.stringify(reactEnv)).slice(1, -1)
    if (placeholder.length < reactEnvString.length) {
        console.log(`REACT_APP_* env variables string too long (${reactEnvString.length}): \"${reactEnvString}\"`)
        reactEnvString = "ERROR: REACT_APP_* env variables string too long!"
    }
    reactEnvString += " ".repeat(placeholder.length - reactEnvString.length)

    console.log(`Writing ${filename}`)
    fs.writeFileSync(filename, content.replace(placeholderExpression, reactEnvString))
}
