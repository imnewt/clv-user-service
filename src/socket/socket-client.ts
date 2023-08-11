import { Injectable, OnModuleInit } from '@nestjs/common';
import { Socket, io } from 'socket.io-client';

@Injectable()
export class SocketClient implements OnModuleInit {
  public socketClient: Socket;

  constructor() {
    this.socketClient = io('http://localhost:3000');
  }

  onModuleInit() {
    this.resigterConsumerEvents();
  }

  private resigterConsumerEvents() {
    // this.socketClient.emit('newMessage', { msg: 'Hi from server' });
    this.socketClient.on('connect', () => {
      console.log('Connected to Gateway');
    });
    this.socketClient.on('onMessage', (payload: any) => {
      console.log('SocketClientClass');
      console.log(payload);
    });
  }
}
