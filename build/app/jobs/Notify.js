"use strict";"use strict";Object.defineProperty(exports, "__esModule", {value: true});exports. default = (io, register) => {
  io.emit('notification', {
    message: `${register.user} just created the ${register.entity}`
  });
};
