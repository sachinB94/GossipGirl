<h1 align="center">Gossip Girl</h1>

> *« A demo mongo watcher »*

Features:

* **[Express](https://github.com/strongloop/express) server** with nested routing architecture.
* **[Nodemon](https://github.com/remy/nodemon)** with **[LiveReload](https://github.com/vohof/gulp-livereload)** or **[BrowserSync](https://github.com/BrowserSync/browser-sync)** for the development process.
* **Automatic bower dependencies injection** on package install.
* **Test suite** — Unit tests with [Mocha](http://mochajs.org).
* **sockets**, with [socket.io](https://github.com/Automattic/socket.io) and [angular-socket-io](https://github.com/btford/angular-socket-io)
* **MongoDB**, with [Mongoose ODM](https://github.com/learnboost/mongoose)

# Install

    Clone the repo
    npm install && bower install

# Mongo Configuration (Important)

    - Start MongoDB with command
      ```bash
      $ mongod --replSet test
      ```
      
      - If an error occurs saying **directory /data/db does not exist**, then create the directory:
      ```bash
      $ sudo mkdir -p /data/db
      ```

      - If an error occurs saying **Unable to create/open lock file: /data/db/mongod.lock errno:13 Permission denied**, then give the appropriate permissions to the directory:
      ```bash
      $ sudo chown -R group:user /data/db 
      ```

    - Start a mongo shell, and configure mongo as follows:
      ```bash
      > var config = {_id: "test", members: [{_id: 0, host: "127.0.0.1:27017"}]}
      > rs.initiate(config)
      ```

# Manage project

    gulp

**Default task, run the server.** Build `sass` files, inject all scripts and styles to the project, watch them and open your default browser (Socket.io doesn't work, Also browser sync causes weird behaviour if more than one instance is running on the same machine).

    npm run start:dev

**Run the server.** watch files, and restart the server.

    gulp build

Wipe old generated `dist` directory while keeping the `.git` to preserve your remotes configuration. Concat all the scripts and vendors in one minified `.js` file, same thing for your styles. Rev all resources for caching purposes; copy the server part.

    gulp preview

Run the `gulp build` process and serve the `dist` directory.

    npm test

Launch server tests, using Mocha.

    npm start

**Run the server in production.** Runs the server from `dist` directory. 


# Integration guide

  This integrarion guide is tested on Ubuntu 14.04. We don't know whether it will work on other OSs as well.

  - Install the module [mongo-oplog-watch](https://www.npmjs.com/package/mongo-oplog-watch). This module watcher for changes (insert, delete and update) in all the collections of the database, and triggers events for the operations.

  - Create a dedicated collection for storing the various watchers, as seen in `server/api/watcher.model.js`. Data is stored through following rules

    - `Collection` is the name of collection being watched,
    - `operation` is the type of operation (`insert`, `update` or `delete`),
    - `watching` stores the ObjectId of the document in the `Collection`, if the operation is `update`, and
    - `fields` stores the array of fields being watched, if the operation is `update`

  - Open a watcher for syncing changes using `mongo-oplog-watch` (here in `server/server.js`)
    - Subscribe to various events as described in documentation of [mongo-oplog-watch](https://www.npmjs.com/package/mongo-oplog-watch)
    - Whenever an event occurs, find the subscriber for the event in the `watchers` collection (here in `server/mongoEventHandler.js`)
    - Notify the subscribers using the architecture being used (here `socket.io` in `server/api/user/user.controller.js`)


# Why these frameworks?

  - **Express.js**
    - Most popular Node.js framework
    - Biggest community
    - Like the middleware based architecture

  - **Angular.js**
    - Backed by Google, thus, long term support guaranteed
    - Most familiar to it

  - **bangular**
    - Yeoman generator
    - Everything in there as needed by the project

  - **socket.io**
    - What better way to build a notifier system than socket.io..!!

  - **async**
    - A way to escape callback hell

  - **mongoose**
    - Definitely the best mongoDB ODM

  - **nedb**
    - In-memory database needed for storing sockets
    - Mongo like structuring

  - **mongo-oplog-watch**
    - *mongo-oplog* - Result is weirdly formatted
    - Better outputs, wrote specifically for this
