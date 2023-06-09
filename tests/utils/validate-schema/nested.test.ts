import { describe, expect, it } from 'vitest';
import { validateSchema } from '../../../src/util.js';
import { join } from 'node:path';
import { JSONSchemaType } from 'ajv';
import { schema } from '../../test-configs/basic-nested/schema.js';

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
      expect(() =>
        validateSchema(config.util.toObject(), schema)
      ).not.toThrow();
    });
  });
});
