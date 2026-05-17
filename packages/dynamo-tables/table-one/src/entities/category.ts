import { Entity } from 'electrodb';
import { getDynamoDBClient, resolveTableName } from '../client.js';

export const createCategoryEntity = async () =>
  new Entity(
    {
      model: {
        entity: 'category',
        version: '1',
        service: 'Catalog',
      },
      attributes: {
        id: {
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
      },
    },
    { client: getDynamoDBClient(), table: await resolveTableName() },
  );
