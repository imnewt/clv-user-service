import { Injectable, OnModuleInit } from '@nestjs/common';
import { Socket, io } from 'socket.io-client';

import { GATEWAY_HOST_URL } from 'src/shared/utilities/constants';

@Injectable()
export class SocketClient implements OnModuleInit {
  public socketClient: Socket;

  constructor() {
    this.socketClient = io(GATEWAY_HOST_URL);
  }

  onModuleInit() {
    this.resigterConsumerEvents();
  }

  private resigterConsumerEvents() {
    // this.socketClient.emit('newMessage', { msg: 'Hi from server' });
    this.socketClient.on('connect', () => {
      console.log('User Service - Connected to Gateway');
    });
    this.socketClient.on('onMessage', (payload: any) => {
      console.log('SocketClientClass');
      console.log(payload);
    });
  }
}
