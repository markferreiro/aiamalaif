import * as http from 'http';
import * as express from 'express';
import * as assert from 'assert';
import * as path from 'path';
import * as compression from 'compression';
import * as routes from './routes';
import * as bodyParser from 'body-parser';

import { Init } from './db/redis';

/**
 * Client Dir
 * @note `dev` default.
 */
var _clientDir = '../../client/dev';
var app = express();
//import { SocketManager } from "./services/socket.service";

export function init(port: number, mode: string) {

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(bodyParser.text());
  app.use(compression());

  // DB Init
  Init();

  /**
   * Dev Mode.
   * @note Dev server will only give for you middleware.
   */
  if (mode == 'dev') {

    app.all('/*', function(req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'X-Requested-With');
      next();
    });

    routes.init(app);

    let root = path.resolve(process.cwd());
    let clientRoot = path.resolve(process.cwd(), './dist/client/dev');
    app.use(express.static(root));
    app.use(express.static(clientRoot));

    var renderIndex = (req: express.Request, res: express.Response) => {
      res.sendFile(path.resolve(__dirname, _clientDir + '/index.html'));
    };
    //app.use('/services', express.static(path.resolve(__dirname, '../client/app/services')));
    app.use(express.static(__dirname + '/client'));
    app.use(express.static(__dirname + '/server'));
    //app.get('/*', renderIndex);

    /**
     * Api Routes for `Development`.
     */
  }
  else {
    /**
     * Prod Mode.
     * @note Prod mod will give you static + middleware.
     */

    /**
     * Api Routes for `Production`.
     */
    routes.init(app);

    /**
     * Client Dir
     */
    _clientDir = '../../client/prod';

    /**
     * Static.
     */
    app.use('/js', express.static(path.resolve(__dirname, _clientDir + '/js')));
    app.use('/css', express.static(path.resolve(__dirname, _clientDir + '/css')));
    //app.use('/assets', express.static(path.resolve(__dirname, _clientDir + '/assets')));
    app.use(express.static(path.resolve(__dirname, '../../node_modules')));


    /**
     * Spa Res Sender.
     * @param req {any}
     * @param res {any}
     */
    var renderIndex = function (req: express.Request, res: express.Response) {
      res.sendFile(path.resolve(__dirname, _clientDir + '/index.html'));
    };

    /**
     * Prevent server routing and use @ng2-router.
     */
    app.get('/*', renderIndex);
  }

  var insertDocument = function(db: any, id: any, uuid: any, status: any, lat: any, long: any, callback: any) {
     db.collection(uuid).insertOne( {
       "id": id,
        "status" : status,
        "coord" : {
           "lat" : lat,
           "long" : long,
        },
     }, function(err: any, result: any) {
      assert.equal(err, null);
      //console.log("Coord inserted");
      callback();
    });
  };

  var insertSurvivor = function(db: any, id: any, name: any, health: any, contactInfo: any, obs: any, callback: any) {
     db.collection("survivors").insertOne( {
        "dni" : id,
        "name": name,
        "health": health,
        "contactInfo": contactInfo,
        "obs": obs,
     }, function(err: any, result: any) {
      assert.equal(err, null);
      console.log("Survivor inserted");
      callback();
    });
  };

  var insertdniuuid = function(db:any, dni: any, uuid: any, callback: any) {
     db.collection("dniuuid").insertOne( {
        "dni" : dni,
        "uuid": uuid,
     }, function(err: any, result: any) {
      assert.equal(err, null);
      console.log("insertdniuuid");
      callback();
    });
  };

  /**
   * Server with gzip compression.
   */
  return new Promise<http.Server>((resolve, reject) => {
    let server = app.listen(port, () => {
      var port = server.address().port;
      console.log('App is listening on port:' + port);
      resolve(server);
    });
    var io = require('socket.io')(server);

    //let socketManager = new SocketManager(io);

    var mongoClient = require('mongodb').MongoClient;
    var assert = require('assert')
    var url = 'mongodb://localhost:27017/imalaif';

    var userList: any = [];
    var typingUsers: any = {};

    var clientUuid: any = {};
    var idclientid: any = {};

    io.on('connection', function(client: any) {
        console.log('Client connected... ');


        client.on('disconnect', function(){
          console.log('user disconnected');
          console.log("uuid", clientUuid[client.id]);
          if (clientUuid[client.id] != undefined){
            mongoClient.connect(url, function(err: any, db: any) {
              assert.equal(null, err);
              var coll = db.collection(clientUuid[client.id]);
              var cursor = coll.find().sort({_id:-1});
              cursor.nextObject(function(err: any, item: any) {
                console.log("coord", item.coord);
                io.to('web').emit('user', false, clientUuid[client.id], item.status, item.coord.lat, item.coord.long);

              });
            db.close();
          });
        }

          var clientNickname: any;
          for (var i=0; i<userList.length; i++) {
            if (userList[i]["id"] == client.id) {
              userList[i]["isConnected"] = false;
              clientNickname = userList[i]["nickname"];
              break;
            }
          }

          delete typingUsers[clientNickname];
          io.emit("userList", userList);
          io.emit("userExitUpdate", clientNickname);
          io.emit("userTypingUpdate", typingUsers);
        });

        client.on("exitUser", function(clientNickname: any){
          for (var i=0; i<userList.length; i++) {
            if (userList[i]["id"] == client.id) {
              userList.splice(i, 1);
              break;
            }
          }
          io.emit("userExitUpdate", clientNickname);
        });

        client.on('chatMessage', function(clientNickname: any, message: any){
          var currentDateTime = new Date().toLocaleString();
          delete typingUsers[clientNickname];
          io.emit("userTypingUpdate", typingUsers);
          io.emit('newChatMessage', clientNickname, message, currentDateTime);
        });

        client.on("connectUser", function(clientNickname: any) {
            var message = "User " + clientNickname + " was connected.";
            console.log(message);

            var userInfo: any = {};
            var foundUser = false;
            for (var i=0; i<userList.length; i++) {
              if (userList[i]["nickname"] == clientNickname) {
                userList[i]["isConnected"] = true
                userList[i]["id"] = client.id;
                userInfo = userList[i];
                foundUser = true;
                break;
              }
            }

            if (!foundUser) {
              userInfo["id"] = client.id;
              userInfo["nickname"] = clientNickname;
              userInfo["isConnected"] = true
              userList.push(userInfo);
            }

            io.emit("userList", userList);
            io.emit("userConnectUpdate", userInfo)
        });

        client.on("startType", function(clientNickname: any){
          console.log("User " + clientNickname + " is writing a message...");
          typingUsers[clientNickname] = 1;
          io.emit("userTypingUpdate", typingUsers);
        });

        client.on("stopType", function(clientNickname: any){
          console.log("User " + clientNickname + " has stopped writing a message...");
          delete typingUsers[clientNickname];
          io.emit("userTypingUpdate", typingUsers);
        });

        client.on('room', function(room: string, uuid: any, dni: any) {
          if(room != 'web'){
            clientUuid[client.id] = uuid;
            idclientid[dni] = client.id;
            mongoClient.connect(url, function(err: any, db: any) {
              insertdniuuid(db, dni, uuid, function() {
                db.close();
              });
            });
          }

          client.join(room, function(){
            console.log(client.rooms);
            io.to(room).emit('toGroup', 'A new user has enter the room');
          });
        });

        client.on('updatelocation', function(uuid: any, id: any, status: any, lat: any, long: any) {
          console.log("updatelocation", lat);
          console.log("dni", id);
          io.to('web').emit('user', false, uuid, id, status, lat, long);

          mongoClient.connect(url, function(err: any, db: any) {
            assert.equal(null, err);
            insertDocument(db, id, uuid, status, lat, long, function() {
              db.close();
            });
          });
        });

        client.on('join', function(data: any) {
            console.log(data);
            client.emit('messages', 'Hello from server');
        });

        client.on('messages', function(data: any) {
            client.emit('broad', data);
            client.broadcast.emit('broad',data);
        });

        client.on('survivor', function(dni: any, name: any, health: any, contactInfo: any, obs: any) {
          mongoClient.connect(url, function(err: any, db: any) {
            assert.equal(null, err);
            insertSurvivor(db, dni, name, health, contactInfo, obs, function() {
              db.close();
            });
          });
        });

        client.on('searchperson', function(dni: string, name: any) {
          mongoClient.connect(url, function(err: any, db: any) {
            //assert.equal(null, err);
            var lat: any;
            var long: any;
            var uuid: any;
            var coll = db.collection("dniuuid");
            console.log("dni", dni);
            coll.find({dni:dni}).limit(1).next(function(err: any, item: any) {
              if (!err) {
                if(item) {
                  var coll = db.collection(item.uuid);
                  var cursor = coll.find().sort({_id:-1});
                  cursor.nextObject(function(err: any, item2: any) {
                      console.log("ITEM2", item2);
                    if (item2) {
                      console.log("coord", item2.coord);
                      lat = item2.coord.lat;
                      long = item2.coord.long;
                      var sur = db.collection("survivors");
                      sur.findOne({dni:dni}, function(err: any, data: any) {
                        if (data) {
                            console.log("found!");
                            client.emit('searchresult', data.dni, data.name, data.health, data.contactInfo, data.obs, lat, long);
                        } else {
                          client.emit('searchresult', undefined, undefined, undefined, undefined, undefined, undefined, undefined);
                          console.log("not found");
                        }
                      });
                    } else {
                      client.emit('searchresult', undefined, undefined, undefined, undefined, undefined, undefined, undefined);
                    }
                  });
                } else {
                  client.emit('searchresult', undefined, undefined, undefined, undefined, undefined, undefined, undefined);
                }
              }
            });
            db.close();
          });
        });


    });

  });
};
