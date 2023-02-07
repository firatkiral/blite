# BLITE

Lightweight batteries-included backend library.

## Overview

Blite is a backend server app that comes with built in server services like user authentication, database, mail confirmation, etc. It is designed to be lightweight and fast prototyping. Blite is ideal for small to medium sized projects that need a backend server and database.

## Features

-   Fast javascript document oriented database.
-   User registration and authentication.
-   Email confirmation and password reset.
-   File upload.
-   Demo app with user registration, login, profile, and file upload.


## Installation

```bash
npm install blite
```


## Usage

```javascript
const blite = require('blite');

blite.start()
// server is now running on port 3000
```

## Configuration

Blite can be configured by creating a `blite.config.json` file in the root directory of your project or by passing a configuration object to the `init` function. Following is the default configuration. This can be customized to suit your needs.

```javascript
const config = {
    server:{
        port: 3000,
        jwt_private_key: "replace this something long and random"
    },
    auth: {
        cookie_name: "blite",
        access_token_life: "10800000",
        refresh_token_life: "7776000000"
    },
    email: {
        from: "",
        host: "",
        port: 0,
        username: "",
        password: ""
    },
    upload: {
        "max_file_size": 209715200,
        "dir": ""
    },
    db: {
        "name": "db",
        "collections": []
    }
}

blite.init(config).start()
```

## Documentation

### Demo app

![Demo App](https://raw.githubusercontent.com/firatkiral/blite/main/demo/data/demo-app.jpg)

You can run demo app following way:

```javascript
const blite = require('blite');

blite.demo()
```

Once you run the demo app, you can access it at `http://localhost:3000`. You can check out the demo app files in the `demo` folder. The demo app is a simple user registration, login, profile, and file upload app.

### Server

Blite uses express as its server. You can check out the express documentation for more information [here](https://expressjs.com/en/4x/api.html). Here are some of the most commonly used server functions.

#### Serving static files

Assume you have a folder named `www` in the root directory of your project and index.html file in it. You can serve it by following way:

```
// file structure
project
├── www
│   └── index.html
└── main.js
```


```javascript
// main.js
const blite = require('blite');

blite.init()
blite.server.use("/", blite.server.static(`www`) )
blite.start()

```

#### Basic routing

The following examples illustrate defining simple routes.

```javascript
// main.js
const blite = require('blite');

blite.init()

// Respond with Hello World! on the homepage:
blite.server.get('/', (req, res) => {
  res.send('Hello World!')
})

// Respond to POST request on the root route (/), the application’s home page:
blite.server.post('/', (req, res) => {
  res.send('Got a POST request')
})

//Respond to a PUT request to the /user route:
blite.server.put('/user', (req, res) => {
  res.send('Got a PUT request at /user')
})

//Respond to a DELETE request to the /user route:
blite.server.delete('/user', (req, res) => {
  res.send('Got a DELETE request at /user')
})

blite.start()

```

For more details about routing, see the routing [guide](https://expressjs.com/en/guide/routing.html).




