import express from 'express';
import http from 'http';
import io from 'socket.io';
import routes from './app/routes';
import cors from 'cors';

class App {
  constructor() {
    this.app = express();
    this.app.use(cors());
    this.server = http.Server(this.app);
    this.socket();
    this.middlewares();
    this.routes();

    this.connectedUsers = {};
  }

  socket() {
    this.io = io(this.server);

    this.io.on('connection', socket => {
      const { user_id } = socket.handshake.query;
      this.connectedUsers[user_id] = socket.id;

      socket.on('disconnect', () => {
        delete this.connectedUsers[user_id];
      });
    });
  }

  middlewares() {
    this.app.use(express.json());

    this.app.use((req, res, next) => {
      req.io = this.io;
      req.connectedUsers = this.connectedUsers;

      next();
    });
  }

  routes() {
    Object.values(routes).forEach(route => {
      this.app.use(route);
    });
  }
}
export default new App().server;
