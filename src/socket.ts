import { Server, Socket } from 'socket.io';
import { getUserDataFromSource } from './module/players/player-event';
import { eventRouter } from './router/event-router';
import { messageRouter } from './router/message-router';
import { getCache, setCache } from './utilities/redis-connection';
import { getLobbiesMult, matchCountStats } from './module/lobbies/lobby-event';
import { currentRoundBets } from './module/bets/bets-session';

export const initSocket = (io: Server): void => {
  eventRouter(io);

  io.on('connection', async (socket: Socket) => {

    const { token, game_id } = socket.handshake.query as { token?: string; game_id?: string };

    if (!token || !game_id) {
      socket.disconnect(true);
      console.log('Mandatory params missing', token);
      return;
    };


    const userData = await getUserDataFromSource(token, game_id);

    if (!userData) {
      console.log('Invalid token', token);
      socket.disconnect(true);
      return;
    };

    const exSid = await getCache(userData.id);
    if (exSid) {
      const socket = io.sockets.sockets.get(exSid);
      if (socket) {
        socket.emit('betError', 'User connected from another source, disconnected from here!');
        socket.disconnect(true);
      }
    };


    socket.emit('info',
      {
        id: userData.userId,
        operator_id: userData.operatorId,
        balance: userData.balance,
        image: userData.image
      },
    );

    await setCache(`PL:${socket.id}`, JSON.stringify({ ...userData, socketId: socket.id }), 3600);
    await setCache(userData.id, socket.id);

    messageRouter(io, socket);
    io.emit("betStats", matchCountStats);
    socket.emit('maxOdds', getLobbiesMult());
    currentRoundBets(socket);

    socket.on('error', (error: Error) => {
      console.error(`Socket error: ${socket.id}. Error: ${error.message}`);
    });
  });
};