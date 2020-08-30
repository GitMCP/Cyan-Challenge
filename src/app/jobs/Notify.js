export default (io, register) => {
  io.emit('notification', {
    message: `${register.user} just created the ${register.entity}`
  });
};
