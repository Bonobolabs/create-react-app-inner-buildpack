# Buildpack for create-react-app

Uses node.js to maintain compatibility with recent Heroku stacks

A node script converts the static.json file into a nginx.conf.erb file. This handles all the routes, headers and proxy redirects defined in the static.json file. It also maintains support for runtime config changes (so we can can change an ENV var and reboot the dyno, rather than having to redeploy + rebuild the whole app).

To be used as part of a multi-buildpack:

1. heroku-buildpack-nodejs for npm, compiling the react app

2. this buildpack.

3. https://github.com/heroku/heroku-buildpack-nginx/blob/main/static.md uses nginx to serve the nginx.conf.erb file

Example Procfile: `web: bin/start-nginx-static`

Example static.json:

```json
{
  "root": "build/",
  "routes": {
    "/": "index.html",
    "/login": "index.html",
  },
  "headers": {
    "common": {
      "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
    },
    "/**": {
      "Cache-Control": "no-store, no-cache"
    },
    "/static/**": {
      "Cache-Control": "public, max-age=604800"
    },
  },
  "proxies": {
    "/api/": {
      "origin": "<%= ENV[\"API_DOMAIN\"] %>"
    },
  }
}
```
