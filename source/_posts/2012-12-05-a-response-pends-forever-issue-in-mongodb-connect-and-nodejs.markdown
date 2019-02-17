---
layout: post
title: "A response pends forever issue in MongoDB, Connect and Node.js"
date: 2012-12-05 21:08
comments: true
categories: 
- Sword
tags:
- Javascript
- Node.js
- MongoDB
---

[connect-mongodb]: https://github.com/masylum/connect-mongodb
[Connect]: https://github.com/senchalabs/connect
[MongoDB]: http://www.mongodb.org/
[Node]: http://nodejs.org

**My ignorance**  
When I first switched to use [connect-mongodb][] to replace the MemoryStore in [Connect][], I found that the homepage of my pet project cannot be even loaded and it seems the response is kept waiting there.  If I switched back to use MemoryStore, it's all fine.  There must be something wrong when I am using [MongoDB][] for session management.  

First, I dig into the _session.js_ in Connect.  Around line 267:
```javascript connect/lib/middleware/session.js
    // proxy end() to commit the session
    var end = res.end;
    res.end = function(data, encoding){
      res.end = end;
      if (!req.session) return res.end(data, encoding);
      debug('saving');
      req.session.resetMaxAge();
      req.session.save(function(){
        debug('saved');
        res.end(data, encoding);
      });
    };
```

After opening the debug feature in [Node][], I found that it's never going into the callback of _session.save()_.  Hence, the 'saved' message is never printed in the console after 'saving' and the response is never ending.  

Why would this happened?  I kept tracing the code and found that _session.save()_ in Connect is calling the _sessionStore.set()_ method.  The _MongoStore.set()_ method in _connect-mongodb.js_ is just purely calling _collection.update()_ and no much magic there.  However, it seems the _update()_ method call has either no err and data coming back.  Is there something wrong with the MongoDB or the Collection?  

MongoDB log doesn't seems to have any query or update action recorded and I just found that there are 10 connections started every time I started my app, but I remembered there were 5 connections (default pool size) before (Actually, I haven't noticed that this is the phenomenon of the problem I have at that time yet).  

Without any clue, I checked the initialization of the MongoStore and find below code:
```javascript
    if (server_config.isConnected()) {
      authenticateAndGetCollection(callback);
    } else {
      server_config.connect(db, function (err) {
        if (err) callback(Error("Error connecting (" + (err instanceof Error ? err.message : err) + ")"));
          authenticateAndGetCollection(callback);
        });
    }
```

It turns out that the flow goes into _server\_config.connect()_ again.  But why?  DB should be initialized in below code which is intended to encapsulate all DB operation.
```javascript DbManager.js
    DbManager = (function() {
      var db = new Db('tyt', new Server('127.0.0.1', 27017, {auto_reconnect: true}, {}), {safe: true});
      db.open(function(){});

      return {
        getDb: function() {
            return db;
        }
      }
    })();

    exports.DbManager = DbManager;
```

```javascript In my node app.js
    var express = require('express')
      , DbManager = require('./db.js').DbManager
      , mongoStore = require('connect-mongodb');

    var app = module.exports = express();

    // Configuration
    app.configure(function(){
      app.use(express.session({
          secret: 'kenspirit',
          key: 'tt.sid',
          cookie: {secure: false, maxAge: 300000},
          store: new mongoStore({db: DbManager.getDb()})
      }));
    });
```

If you are familiar with Node, you may have already noticed what I haven't done right here.  I am assuming the DB should be connected and ready for use already as I have called _db.open()_ during DbManager's construction.  However, Async is the most importance concept in Node, _db.open()_ takes my callback will immediately return and it doesn't guarantee it's opened already.  If I change to below code, problem solved.  

```javascript
    var db = DbManager.getDb();
    db.open(function(err, db) {
      if (db) {
        app.use(express.session({
          secret: 'kenspirit',
          key: 'tt.sid',
          cookie: {secure: false, maxAge: 300000},
          store: new mongoStore({db: db})
        }));
       }
    });
```

**The root of not responding**  
I wonder where is the actual source to make the response kept waiting?  I have configured the _auto\_reconnect_ already.  Later I found that in mongodb:
```javascript mongodb/lib/mongodb/db.js
  Db.prototype.open = function(callback) {
    ...
    self._state = 'connecting';
    ...
    self.serverConfig.connect(self, {firstCall: true}, function(err, result) {
      if(err != null) {
        // Set that db has been closed
        self.openCalled = false;
        // Return error from connection
        return callback(err, null);
      }
      // Set the status of the server
      self._state = 'connected';
      // Callback
      return callback(null, self);
    });
    ...
  };

  Db.prototype._executeInsertCommand = function(db_command, options, callback) {
    ...
    // If the pool is not connected, attemp to reconnect to send the message
    if(self._state == 'connecting' && this.serverConfig.autoReconnect) {
      process.nextTick(function() {
        self.commands.push({type:'insert', 'db_command':db_command, 'options':options, 'callback':callback});
      })
    }
    ...
  ;}
```

```javascript mongodb/lib/connection/server.js
  Server.prototype.connect = function(dbInstance, options, callback) {
    ...
    // Force connection pool if there is one
    if(server.connectionPool) server.connectionPool.stop();
    ...
    // Create connection Pool instance with the current BSON serializer
    var connectionPool = new ConnectionPool(this.host, this.port, this.poolSize, dbInstance.bson,  this.socketOptions);
    ...
    // Set up on connect method
    connectionPool.on("poolReady", function() {
      // Create db command and Add the callback to the list of callbacks by the request id (mapping outgoing messages to correct callbacks)
      var db_command = DbCommand.NcreateIsMasterCommand(dbInstance, dbInstance.databaseName);
      // Check out a reader from the pool
      var connection = connectionPool.checkoutConnection();
      // Set server state to connEcted
      server._serverState = 'connected';
      // dbInstance._state = 'connected';  If I add this line here, even if my code doesn't do any change, it works.
      ...
    });
  };
```

Finally, the root cause is found.  Normally, when _db.open()_ is called, it sets its _\_state = 'connecting'_, and it then will call _server.connect()_ to create connection pool and in the callback, it sets its _\_state = 'connected'_ again.  However, my case is that the second call _server.connect()_ in MongoStore.js first make the first connection pool stops and then creates a new connection pool again(This should be where makes the mongo db log has 10 connections opened).  Somehow, the callback in normal flow cannot be executed so that _db.\_state_ has not been set to 'connected'.  What is more, the callback set in _MongoStore.js_ doesn't set the _db.\_state_ to 'connected'.  The _db.\_state_ is remained in 'connecting' forever which makes my update command keep pushing to its commands stack.

[new]: http://stackoverflow.com/questions/10656574/how-to-manage-mongodb-connections-in-a-nodejs-webapp
[shared]: http://stackoverflow.com/questions/10307994/where-can-i-find-complete-documentation-concerning-node-mongodb-native/10349450#10349450

**Most appropriate way to initialize MongoDB and its connections in Node.js**  
I began to wonder what is the "most appropriate way" to initialize MongoDB and manage its connections and googled around.  

At first, I found a similar question asked in [StackOverFlow][new].  
However, the reply doesn't seem to be reasonable.  It recommands opening a new connection (actually, a DB and Connection Pool there) per request.  And it said it's due to MongoDB is asynchronous.  It's pretty confusing and the asynchronous mechanism in Node should be achieved by callback instead of creating new connection per request.  If so, what is the point of using pool then?  This approach should be more slow.

Later I found out a reply from the author of node-mongodb-native in [StackOverFlow][shared] too.  It clearly stated "DO NOT call open on each request.".  

I believe only opening MongoDB once with appropriate pool size and initialize node application in the _db.open()_ callback should be the right way to go.
