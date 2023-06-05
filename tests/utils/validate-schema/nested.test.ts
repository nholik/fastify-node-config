import { describe, expect, it } from 'vitest';
import { validateSchema } from '../../../src/util.js';
import { join } from 'node:path';
import { JSONSchemaType } from 'ajv';

describe('validateSchema', async () => {
  describe('nested config', async () => {
    process.env['NODE_CONFIG_DIR'] = join(
      __dirname,
      '../../test-configs/basic-nested'
    );

    const config = await import('config');
    it('throws error on invalid config', () => {
      interface AppConfig {
        db: {
          host: string;
          port: number;
          name: string;
          ssl: boolean;
        };
      }

      const schema: JSONSchemaType<AppConfig> = {
        type: 'object',
        required: ['db'],
        properties: {
          db: {
            type: 'object',
            properties: {
              host: { type: 'string' },
              port: { type: 'number' },
              name: { type: 'string' },
              ssl: { type: 'boolean' },
            },
            required: ['host', 'port', 'name', 'ssl'],
          },
        },
      };

      expect(() => {
        validateSchema(config.util.toObject(), schema);
      }).toThrow();
    });

    it('gives no errors for a valid config', () => {
      interface AppConfig {
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
        nested: {
          misc: {
            nested: {
              value: string;
            };
          };
          value: string;
        };
      }

      const schema: JSONSchemaType<AppConfig> = {
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
          nested: {
            type: 'object',
            properties: {
              misc: {
                type: 'object',
                properties: {
                  nested: {
                    type: 'object',
                    properties: {
                      value: { type: 'string' },
                    },
                    required: ['value'],
                  },
                },
                required: ['nested'],
              },
              value: { type: 'string' },
            },
            required: ['value', 'misc'],
          },
        },
        required: ['db', 'server', 'log', 'nested'],
      };

      expect(() =>
        validateSchema(config.util.toObject(), schema)
      ).not.toThrow();
    });
  });
});
