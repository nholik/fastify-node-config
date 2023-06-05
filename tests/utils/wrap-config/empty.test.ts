import { describe, expect, it } from 'vitest';
import { wrapConfig } from '../../../src/util.js';
import { join } from 'node:path';

describe('wrapConfig', async () => {
  describe('empty config', async () => {
    process.env['NODE_CONFIG_DIR'] = join(
      __dirname,
      '../../test-configs/empty'
    );
    const config = await import('config');
    describe('with throwOnMissing = false', () => {
      const wrappedConfig = wrapConfig(config, false);
      it('should be defined', () => {
        expect(wrappedConfig).toBeDefined();
      });
      it('gives null for any property', () => {
        expect(wrappedConfig.missing).toBeNull();
      });
    });
    describe('with throwOnMissing = true', () => {
      const wrappedConfig = wrapConfig(config, true);
      it('should be defined', () => {
        expect(wrappedConfig).toBeDefined();
      });
      it('throws error for any property', () => {
        expect(() => wrappedConfig.missing).toThrow();
      });
    });
  });
});
