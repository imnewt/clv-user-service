import { KafkaOptions, Transport } from '@nestjs/microservices';

import { KAFKA_BROKER_ADDRESS, KAFKA_GROUP_ID } from 'src/utils/constants';

export const microserviceConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: [KAFKA_BROKER_ADDRESS],
    },
    consumer: {
      groupId: KAFKA_GROUP_ID,
      allowAutoTopicCreation: true,
    },
  },
};
