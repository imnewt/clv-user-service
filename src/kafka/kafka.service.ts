import { Injectable } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';

import {
  KAFKA_CLIENT_ID,
  KAFKA_GROUP_ID,
  KAFKA_BROKER_ADDRESS,
} from 'src/utils/constants';

@Injectable()
export class KafkaService {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor() {
    this.kafka = new Kafka({
      clientId: KAFKA_CLIENT_ID,
      brokers: [KAFKA_BROKER_ADDRESS],
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: KAFKA_GROUP_ID });
  }

  async send(topic: string, message: any) {
    await this.producer.connect();
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    await this.producer.disconnect();
  }

  async subscribe(topic: string, callback: (message: any) => void) {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic, fromBeginning: true });
    await this.consumer.run({
      // eslint-disable-next-line
      eachMessage: async ({ topic, partition, message }) => {
        const value = JSON.parse(message.value.toString());
        callback(value);
      },
    });
  }
}
