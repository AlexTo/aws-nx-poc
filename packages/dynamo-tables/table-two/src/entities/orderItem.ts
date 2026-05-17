import { Entity } from 'electrodb';
import { getDynamoDBClient, resolveTableName } from '../client.js';

export const createOrderItemEntity = async () =>
  new Entity(
    {
      model: {
        entity: 'orderItem',
        version: '1',
        service: 'Orders',
      },
      attributes: {
        orderId: {
          type: 'string',
          required: true,
        },
        productId: {
          type: 'string',
          required: true,
        },
        quantity: {
          type: 'number',
          required: true,
        },
        unitPrice: {
          type: 'number',
          required: true,
        },
        createdAt: {
          type: 'string',
          required: true,
          default: () => new Date().toISOString(),
          readOnly: true,
        },
      },
      indexes: {
        primary: {
          pk: {
            field: 'pk',
            composite: ['orderId'],
          },
          sk: {
            field: 'sk',
            composite: ['productId'],
          },
        },
      },
    },
    { client: getDynamoDBClient(), table: await resolveTableName() },
  );
