<h1 align="center">Gossip Girl</h1>

> *« A mongo watcher - made to perfection »*

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


# Manage project

    gulp

**Default task, run the server.** Build `sass` files, inject all scripts and styles to the project, watch them and open your default browser (Socket.io doesn't work).

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

  - The module `mubsub` does the pub/sub tasks for the `chaanges` collection
  - First and foremost, you have to create a dedicated collection (called capped collection), here `changes`
  - server/server.js
    - Create it's model for working with mongoose
    - Connect `mubsub` to your database
    - Create a channel to the capped collection
    - Subscribe to this channel
    - Add a event listener for a new document
    - Whenever a document is inserted, trigger the event handler
  - user/user.socket.js
    - Whenever a user inserts an update command,
      - `watcher` collection is searched for that user
      - if user found, an entry in `changes` collection is made, with the old and updated fields
  - api/changes/changes.controller.js (event handler declared here)
    - For the document inserted, it is checked whether the respective watcher is online
    - If online, the changes are pushed to that user

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

  - **mubsub**
    - *mongo-watch* - Deprecated
    - *mongoose-watch* - Nothing more than polling
    - *native* - Too much work, and can't be completely automated
    - Perfect option, and really fast
