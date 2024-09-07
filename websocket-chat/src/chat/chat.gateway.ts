import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  private logger = new Logger('ChatGateway');

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { username: string; room: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { username, room } = data;
    client.join(room);
    client.to(room).emit('message', {
      username: 'System',
      text: `${username} has joined the room.`,
    });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { username: string; room: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { username, room } = data;
    client.leave(room);
    client.to(room).emit('message', {
      username: 'System',
      text: `${username} has left the room.`,
    });
  }

  @SubscribeMessage('chatToServer')
  handleMessage(
    @MessageBody() data: { username: string; room: string; message: string },
  ): void {
    this.server.to(data.room).emit('chatToClient', data);
  }
}
