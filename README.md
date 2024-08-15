# Jeff frontend

This is a boilerplate for a frontend application using Vue3, Typescript, Vue Router, Pinia, Vite-SSG, Lodash, PouchDB, Sass, normalize.css & SocketIO. It is has default support for using Payload as the back-end.

## Features

- [Axios](https://github.com/axios/axios)
- [GSAP](https://github.com/greensock/GSAP)
- [Lodash](https://github.com/lodash/lodash)
- [normalize.css](https://github.com/necolas/normalize.css)
- [Pinia](https://github.com/vuejs/pinia)
- [PouchDB](https://github.com/pouchdb/pouchdb)
- [Sass](https://github.com/sass/sass)
- [SocketIO](https://github.com/socketio/socket.io-client)
- [TypeScript](https://github.com/microsoft/TypeScript)
- [Vite-SSG](https://github.com/antfu/vite-ssg)
- [Vite](https://github.com/vitejs/vite)
- [Vue 3](https://github.com/vuejs/vue)
- [Vue-i18n](https://github.com/intlify/vue-i18n-next)
- [Vue Router](https://github.com/vuejs/vue-router)

## Getting started

To get the project up and running, execute the following commands;

```
$ npm install
$ npm run dev

or

$ yarn install
$ yarn dev
```

To build the project for production, run the following command:
```
$ npm run build 

or 

$ yarn build
```
This will build the project, and output the files to the dist directory.


### Payload

This project has authentication support intergrated for Payload v2. Modify the `.env` file to specify the desired endpoint for the Payload back-end (VITE_PAYLOAD_REST_ENDPOINT=http://localhost:3000/api). More details about the way Payload handles its authentication can be found in [https://payloadcms.com/docs/authentication/overview](their documentation)

## Deployment
By default this application has a build-in feature to deploy the static generated website to a remote server. For this to work, you'll have to configure a `.env.staging` or `.env.production` file. Which is basically a copy of the `.env` or `.env.local` file, with the addition of the following 4 lines:

```
DEPLOYMENT_USER=<user>
DEPLOYMENT_HOST=<host>
DEPLOYMENT_PATH=/var/www/vite/<project>
MAX_BACKUPS=8
```
*DEPLOYMENT_USER* = The user that you'll use to login to the server
*DEPLOYMENT_HOST* = The hostname or ip address of the server 
*DEPLOYMENT_PATH* = The path of where you want to deploy the app to
*MAX_BACKUPS* = The amount of back-ups you want to keep

At the location of DEPLOYMENT_PATH the deployment script will create a `current` directory where the project is actually located. Whenever you'll do a future deployment, the current directory will be renamed to bk_<timecode> and the new version will be placed again at the current directory. The number that you specify at MAX_BACKUPS will determine how many old versions will be kept. Versions older than the number specified here will be removed automatically.

With the configuration of these 4 lines, you can now deploy the project with one of the following commands:


```
$ npm run deploy # Using .env.staging
$ npm run production # Using .env.producttion

or 

$ yarn deploy # Using .env.staging
$ yarn production # Using .env.production
```

For more information about this deployment script, I'd like to refer you to [this page](https://github.com/JeffreyArts/server/wiki/Vite-website-setup). This page will go into more depth, and also provides you with a basis for how you could set-up the server environment on a remote (VPS) server.

## Adding routes

To ease the process of making new routes, this project has a script for adding routes. 
```
$ npm run add-route

or 

$ yarn add-route
```

This script will prompt you for the name of the new route and will make a copy `routes/_template.vue` into the routes directory and adding the route to the `routes/index.ts`  file.

## Multilingual
Via [Vue-i18n](https://github.com/intlify/vue-i18n-next) there is support for developing a multilingual webapplication. There is a custom layer on top of this that adds 2 additional features on top of this plugin.

1. Locale selection
Via the Pinia store `stores/locale.ts` the app can remember the state of the application. At default it will use english as the fallback language, which can be configured in `main.ts`. With the `locale.select` method you can set a new locale, which will be stored in the localstorage (and also loaded when the user re-opens the application)

2. Markdown
The default behaviour of $t remains intact, but there is an additional `$text` method that will parse the markdown in the translated text string. This will prevent you from splitting up a translation in multiple chunks like [vue-i18n](https://vue-i18n.intlify.dev/guide/advanced/component.html#basic-usage) requires you.


## [License](https://github.com/JeffreyArts/create-jeff-backend/blob/master/LICENSE)

Copyright © 2023 <Jeffrey Arts>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
