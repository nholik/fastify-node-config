import { JSONSchemaType } from 'ajv';

export interface AppConfig {
  db: {
    host: string;
    port: number;
    name: string;
  };
  server: {
    port: number;
  };
  log: {
    level: string;
    file: string;
  };
}

export const schema: JSONSchemaType<AppConfig> = {
  type: 'object',
  properties: {
    db: {
      type: 'object',
      properties: {
        host: { type: 'string' },
        port: { type: 'number' },
        name: { type: 'string' },
      },
      required: ['host', 'port', 'name'],
    },
    server: {
      type: 'object',
      properties: {
        port: { type: 'number' },
      },
      required: ['port'],
    },
    log: {
      type: 'object',
      properties: {
        level: { type: 'string' },
        file: { type: 'string' },
      },
      required: ['level', 'file'],
    },
  },
  required: ['db', 'server', 'log'],
};
