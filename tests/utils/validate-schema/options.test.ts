import Ajv, { type JSONSchemaType } from 'ajv';
import { describe, expect, it } from 'vitest';
import { validateSchema } from '../../../src/util.js';

describe('validateSchema options', () => {
  interface PortConfig {
    port: number;
  }

  const schema: JSONSchemaType<PortConfig> = {
    type: 'object',
    properties: {
      port: { type: 'number' },
    },
    required: ['port'],
  };

  it('uses default ajv options', () => {
    const data = { port: '3000' } as unknown as PortConfig;
    expect(() => validateSchema({ ...data }, schema)).not.toThrow();
  });

  it('respects ajvOptions overrides', () => {
    const data = { port: '3000' } as unknown as PortConfig;
    expect(() =>
      validateSchema({ ...data }, schema, {
        ajvOptions: { coerceTypes: false },
      })
    ).toThrow();
  });

  it('uses provided Ajv instance', () => {
    const ajv = new Ajv({ coerceTypes: false });
    const data = { port: '3000' } as unknown as PortConfig;
    expect(() =>
      validateSchema({ ...data }, schema, {
        ajv,
      })
    ).toThrow();
  });
});
