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


### Middleware

Blite has built in middleware for authentication, registration, login, logout, password reset and file upload.

#### Registering middleware

You can register user by sending post request to your server from client side by providing username, email and password following way:

```javascript
// client side
const data = {
    username: "username",
    email: "email",
    password: "password"
}
fetch("/api/register", {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
}).then((response) => {
    //...
}).catch(err => {
    //...
});
```

Then you need to define register route on server side and pass middleware to it following way:

```javascript
// server side
blite.server.post("/api/register",
    blite.mid.register, // passing register middleware here
    async (req, res) => {
        if (res.error) {
            return res.status(400).json(res.error);
        }
        res.json({
            message: "You successfully registered."
        });
    });
```

#### Login middleware

You can login user by sending post request to your server from client side by providing username, password and rememberMe flag following way:

```javascript
// client side
const data = {
    username: "username",
    password: "password",
    rememberMe: true
}
fetch("api/login", {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
}).then((response) => {
    //...
}).catch(err => {
    //...
});
```

Then you need to define login route on server side and pass middleware to it following way:

```javascript
// server side
blite.server.post("/api/login",
    blite.mid.login, // passing login middleware here
    async (req, res) => {
        if (res.error) {
            return res.status(400).json(res.error);
        }
        res.json({
            message: "You successfully logged in."
        });
    });
```

#### Logout middleware

You can logout user by sending post request to your server from client side. No data is required. Once you send request, the access token and refresh token will be deleted from the database.

```javascript
// client side
fetch("api/logout", {method: 'POST'})
```

Then you need to define logout route on server side and pass middleware to it following way:

```javascript
// server side
blite.server.post("/api/logout",
    blite.mid.logout, // passing logout middleware here
    async (req, res) => {
        // ...
    });
```

#### Authentication middleware

You don't want your user to login every time they visit your app. You can use authentication middleware to check if the user is already logged in or not. If the user is logged in blite will store access and refresh token. When you send use authentication middleware, blite will check if the access token is valid or not. You can give access to the user if the access token is valid by sending post request to your server from client side following way:

```javascript
fetch("/api/authenticateSession", { 
    method: 'POST' 
}).then((response) => {
    // Give access to the user
}).catch(err => {
    // Redirect to login page
});
```

Then you need to define authenticateSession route on server side and pass middleware to it following way:

```javascript
blite.server.post("/api/authenticateSession",
    blite.mid.authenticateSession, // passing authenticateSession middleware here
    async (req, res) => {
        // Now you can start making authenticated requests from client side
    });
```

Once session is authenticated, you can allow user to access protected routes by using authenticeUser middleware following way:

```javascript
router.post("/api/userInfo",
    mid.authenticateUser, // passing authenticateUser middleware here
    async (req, res) => {
        if (res.error) {
            return res.status(400).json(res.error);
        }
        res.json({
            user: req.user,
            message: "success"
        });
    });
```

#### Upload middleware

You can upload files by using form data and sending post request to your server from client side following way:

```javascript
fetch("/api/upload", {
    method: 'POST',
    body: formData
})
```

Then you need to define upload route on server side and pass middleware to it following way:

```javascript
// server side
router.post("/api/upload",
    mid.decodeUpload, // passing decodeUpload middleware here
    async (req, res) => {
        if (res.error) {
            return res.status(400).json(res.error);
        }

        const uploadedFile = req.files.upload.filepath;
        // Do something with the file

        res.json({
            message: "File successfully uploaded."
        });
    });
```


### Database

Blite uses ControlDB as its database. Its a simple and fast document based database that stores data in JSON files. You can check out ControlDB [here](https://github.com/firatkiral/controldb) for more details. Here are some examples of how you can use ControlDB with Blite.

#### Creating a database

You can create a database by passing config object with database parameters. As default, Blite will create an empty database named "blite". Its also possible to create a database with some collections by passing options such as collection name, indices and unique fields etc.


```javascript
const config = {
    ...,
    db: {
        name: "myDatabase",
        collections: [{ // You can either create collections here or you can create them later on
            name: "users",
            options: {
                indices: [
                    "username"
                ],
                unique: [
                    "username",
                    "email"
                ]
            }
        },
        {
            name: "posts",
            options: {...}
        }]
    }
};

blite.init(config).start()

```

Add a collection :

```javascript
var users = blite.db.addCollection('users');
```

Insert documents :

```javascript
users.insert({
	name: 'Odin',
	age: 50,
	address: 'Asgard'
});

// alternatively, insert array of documents
users.insert([{ name: 'Thor', age: 35}, { name: 'Control', age: 30}]);
```

Simple find query :

```javascript
var results = users.find({ age: {'$gte': 35} });

var odin = users.findOne({ name:'Odin' });
```

Simple where query :

```javascript
var results = users.where(function(obj) {
	return (obj.age >= 35);
});
```

Simple Chaining :

```javascript
var results = users.find({ age: {'$gte': 35} }).simplesort('name').docs();
```

Simple named transform :

```javascript
users.addTransform('progeny', [
  {
    type: 'find',
    value: {
      'age': {'$lte': 40}
    }
  }
]);

var results = users.chain('progeny').docs();
```

Simple Dynamic View :

```javascript
var pview = users.addDynamicView('progeny');

pview.applyFind({
	'age': {'$lte': 40}
});

pview.applySimpleSort('name');

var results = pview.docs();
```

For more details, check out ControlDB documentation [here](https://firatkiral.github.io/controldb/)