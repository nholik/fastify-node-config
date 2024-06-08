import { describe, expect, it } from 'vitest';
import { wrapConfig } from '../../../src/util.js';
import { join } from 'node:path';

describe('wrapConfig', async () => {
  describe('nested config', async () => {
    process.env['NODE_CONFIG_DIR'] = join(
      __dirname,
      '../../test-configs/basic-nested'
    );

    const config = await import('config');
    describe('with throwOnMissing = false', () => {
      const wrappedConfig = wrapConfig(config, {}, false);

      it('should be defined', () => {
        expect(wrappedConfig).toBeDefined();
      });

      it('should have a nested property', () => {
        expect(wrappedConfig.nested).toBeTypeOf('object');
      });

      it('should have a nested property with a nested property', () => {
        const nested = wrappedConfig.nested as any;
        expect(nested.misc).toBeTypeOf('object');
      });

      it('returns string if underlying property is string', () => {
        const db = wrappedConfig.db as any;
        expect(db.host).toBeTypeOf('string');
      });

      it('returns number if underlying property is number', () => {
        const db = wrappedConfig.db as any;
        expect(db.port).toBeTypeOf('number');
      });

      it('returns a deeply nested property', () => {
        const nested = wrappedConfig.nested as any;
        const misc = nested.misc as any;
        const secondNested = misc.nested as any;
        expect(secondNested.value).toBe('nested value');
      });

      it('returns null if property is missing', () => {
        const nested = wrappedConfig.nested as any;
        const misc = nested.misc as any;
        const secondNested = misc.nested as any;
        expect(secondNested.missing).toBeNull();
      });
    });

    describe('with throwOnMissing = true', () => {
      const wrappedConfig = wrapConfig(config, {}, true);
      it('should be defined', () => {
        expect(wrappedConfig).toBeDefined();
      });

      it('should have a nested property', () => {
        expect(wrappedConfig.nested).toBeTypeOf('object');
      });

      it('should have a nested property with a nested property', () => {
        const nested = wrappedConfig.nested as any;
        expect(nested.misc).toBeTypeOf('object');
      });

      it('returns string if underlying property is string', () => {
        const db = wrappedConfig.db as any;
        expect(db.host).toBeTypeOf('string');
      });

      it('returns number if underlying property is number', () => {
        const db = wrappedConfig.db as any;
        expect(db.port).toBeTypeOf('number');
      });

      it('returns a deeply nested property', () => {
        const nested = wrappedConfig.nested as any;
        const misc = nested.misc as any;
        const secondNested = misc.nested as any;
        expect(secondNested.value).toBe('nested value');
      });

      it('throws if property is missing', () => {
        const nested = wrappedConfig.nested as any;
        const misc = nested.misc as any;
        const secondNested = misc.nested as any;
        expect(() => {
          return secondNested.missing;
        }).toThrow();
      });
    });
  });
});
