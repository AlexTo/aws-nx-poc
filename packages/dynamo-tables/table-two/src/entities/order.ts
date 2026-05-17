import { Entity } from 'electrodb';
import { getDynamoDBClient, resolveTableName } from '../client.js';

export const createOrderEntity = async () =>
  new Entity(
    {
      model: {
        entity: 'order',
        version: '1',
        service: 'Orders',
      },
      attributes: {
        id: {
          type: 'string',
          required: true,
        },
        userId: {
          type: 'string',
          required: true,
        },
        status: {
          type: [
            'pending',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
          ] as const,
          required: true,
          default: 'pending',
        },
        total: {
          type: 'number',
          required: true,
        },
        createdAt: {
          type: 'string',
          required: true,
          default: () => new Date().toISOString(),
          readOnly: true,
        },
        updatedAt: {
          type: 'string',
          required: true,
          default: () => new Date().toISOString(),
          watch: '*',
          set: () => new Date().toISOString(),
        },
      },
      indexes: {
        primary: {
          pk: {
            field: 'pk',
            composite: ['id'],
          },
          sk: {
            field: 'sk',
            composite: [],
          },
        },
        byUser: {
          index: 'gsi1',
          pk: {
            field: 'gsi1pk',
            composite: ['userId'],
          },
          sk: {
            field: 'gsi1sk',
            composite: ['createdAt'],
          },
        },
      },
    },
    { client: getDynamoDBClient(), table: await resolveTableName() },
  );
