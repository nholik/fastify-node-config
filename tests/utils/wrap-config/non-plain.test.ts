import { describe, expect, it } from 'vitest';
import { wrapConfig } from '../../../src/util.js';

class CustomValue {
  value: string;
  constructor(value: string) {
    this.value = value;
  }
}

describe('wrapConfig', () => {
  it('returns non-plain objects without wrapping', () => {
    const data = {
      custom: new CustomValue('root'),
      nested: {
        custom: new CustomValue('nested'),
      },
    };

    const getValue = (path: string) => {
      const parts = path.split('.');
      let current: any = data;
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return undefined;
        }
      }
      return current;
    };

    const stubConfig = {
      has: (path: string) => getValue(path) !== undefined,
      get: (path: string) => getValue(path),
      util: { toObject: () => data },
    };

    const wrappedConfig = wrapConfig(stubConfig as any, true);

    expect(wrappedConfig.custom).toBeInstanceOf(CustomValue);
    const nested = wrappedConfig.nested as any;
    expect(nested.custom).toBeInstanceOf(CustomValue);
  });
});
