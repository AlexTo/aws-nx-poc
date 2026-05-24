import { Entity } from 'electrodb';
import { getDynamoDBClient, resolveTableName } from '../client.js';

export const createGameEntity = async () =>
  new Entity(
    {
      model: {
        entity: 'Game',
        version: '1',
        service: 'game',
      },
      attributes: {
        playerName: { type: 'string', required: true, readOnly: true },
        genre: { type: 'string', required: true, readOnly: true },
        lastUpdated: {
          type: 'string',
          required: true,
          default: () => new Date().toISOString(),
        },
      },
      indexes: {
        primary: {
          pk: { field: 'pk', composite: ['playerName'] },
          sk: {
            field: 'sk',
            composite: [],
          },
        },
      },
    },
    { client: getDynamoDBClient(), table: await resolveTableName() },
  );
