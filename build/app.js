"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _express = require('express'); var _express2 = _interopRequireDefault(_express);
var _http = require('http'); var _http2 = _interopRequireDefault(_http);
var _socketio = require('socket.io'); var _socketio2 = _interopRequireDefault(_socketio);
var _routes = require('./app/routes'); var _routes2 = _interopRequireDefault(_routes);

class App {
  constructor() {
    this.app = _express2.default.call(void 0, );
    this.server = _http2.default.Server(this.app);
    this.socket();
    this.middlewares();
    this.routes();

    this.connectedUsers = {};
  }

  socket() {
    this.io = _socketio2.default.call(void 0, this.server);

    this.io.on('connection', socket => {
      const { user_id } = socket.handshake.query;
      this.connectedUsers[user_id] = socket.id;

      socket.on('disconnect', () => {
        delete this.connectedUsers[user_id];
      });
    });
  }

  middlewares() {
    this.app.use(_express2.default.json());

    this.app.use((req, res, next) => {
      req.io = this.io;
      req.connectedUsers = this.connectedUsers;

      next();
    });
  }

  routes() {
    Object.values(_routes2.default).forEach(route => {
      this.app.use(route);
    });
  }
}
exports. default = new App().server;
