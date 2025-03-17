const fs = require('fs')
const path = require('path')
const ejs = require('ejs')

// Read and parse the JSON config file.
const configPath = process.argv[2] || path.join(__dirname, '..', 'static.json')
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

/**
 * Normalize a path by removing wildcard characters (*) and trailing slashes.
 */
function normalizePath(p) {
  // Remove all asterisks.
  let norm = p.replace(/\*/g, '')
  // If the original path ends with one or more asterisks (i.e. a wildcard), force a trailing slash.
  if (p.match(/\/\*+$/)) {
    norm = norm.replace(/\/+$/, '') + '/'
  } else {
    norm = norm.replace(/\/+$/, '')
  }
  return norm === '' ? '/' : norm
}

/**
 * Merge headers for a given route from headersConfig.
 * It will merge any header entry (except "common" and "/**")
 * whose normalized key overlaps with the normalized route key.
 */
function mergeHeaders(routeKey, headersConfig) {
  const normRoute = normalizePath(routeKey)
  let merged = {}
  Object.keys(headersConfig).forEach((headerKey) => {
    if (headerKey === 'common' || headerKey === '/**') return // skip these; common will be applied globally
    const normHeaderKey = normalizePath(headerKey)
    // Merge if one normalized key is a prefix of the other.
    if (
      normRoute.indexOf(normHeaderKey) === 0 ||
      normHeaderKey.indexOf(normRoute) === 0
    ) {
      Object.assign(merged, headersConfig[headerKey])
    }
  })
  return merged
}

// Build mergedRoutes from config.routes.
let mergedRoutes = []
Object.keys(config.routes).forEach((routeKey) => {
  let target = config.routes[routeKey]
  // Ensure target starts with a slash, if provided.
  if (target && target.trim() !== '' && target.charAt(0) !== '/') {
    target = '/' + target
  }
  // Create a regex pattern from the route.
  let pattern
  if (routeKey === '/') {
    pattern = '^/$'
  } else {
    pattern =
      '^' + routeKey.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*') + '$'
  }

  // Merge headers for this route.
  let mergedHeaders = mergeHeaders(routeKey, config.headers)
  // New behavior: if the route's target is "index.html", use headers from "/**" instead.
  if (target === '/index.html' && config.headers['/**']) {
    mergedHeaders = config.headers['/**']
  }

  mergedRoutes.push({
    route: routeKey,
    target: target || '', // may be empty if not defined
    pattern: pattern,
    headers: mergedHeaders,
  })
})
config.mergedRoutes = mergedRoutes

// Build headerOnlyLocations for header keys not merged in any route or handled by proxies.
let headerOnlyLocations = []
let proxyKeys = Object.keys(config.proxies || {})
Object.keys(config.headers).forEach((headerKey) => {
  if (headerKey === 'common' || headerKey === '/**') return
  // Skip if headerKey is handled by a proxy.
  let skip = proxyKeys.some(
    (proxyKey) =>
      normalizePath(headerKey).indexOf(normalizePath(proxyKey)) === 0
  )
  if (skip) return
  // Skip if this header key was merged with any route.
  let alreadyMerged = mergedRoutes.some((item) => {
    const normRoute = normalizePath(item.route)
    const normHeaderKey = normalizePath(headerKey)
    if (normRoute === '/') {
      return normHeaderKey === '/'
    } else {
      return normHeaderKey.indexOf(normRoute) === 0
    }
  })
  if (alreadyMerged) return

  let pattern
  if (headerKey.indexOf('*') !== -1) {
    pattern =
      '^' + headerKey.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*') + '$'
  } else {
    pattern = headerKey
  }
  // For header-only locations, fallback to 404.
  headerOnlyLocations.push({
    route: headerKey,
    pattern: pattern,
    fallback: '@404',
    headers: config.headers[headerKey],
  })
})
config.headerOnlyLocations = headerOnlyLocations

// Proxies remain unchanged.
config.proxies = config.proxies || {}

// Load the EJS template.
const templatePath = path.join(__dirname, 'nginx.conf.ejs')
const template = fs.readFileSync(templatePath, 'utf8')

// Render the configuration.
const output = ejs.render(template, { config })

process.stdout.write(output)
