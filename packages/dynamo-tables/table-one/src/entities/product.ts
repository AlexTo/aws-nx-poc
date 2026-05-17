import { Entity } from 'electrodb';
import { getDynamoDBClient, resolveTableName } from '../client.js';

export const createProductEntity = async () =>
  new Entity(
    {
      model: {
        entity: 'product',
        version: '1',
        service: 'Catalog',
      },
      attributes: {
        id: {
          type: 'string',
          required: true,
        },
        categoryId: {
          type: 'string',
          required: true,
        },
        name: {
          type: 'string',
          required: true,
        },
        description: {
          type: 'string',
        },
        price: {
          type: 'number',
          required: true,
        },
        stock: {
          type: 'number',
          required: true,
          default: 0,
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
        byCategory: {
          index: 'gsi1',
          pk: {
            field: 'gsi1pk',
            composite: ['categoryId'],
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
