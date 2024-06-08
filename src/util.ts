import { type IConfig } from 'config';
import Ajv, { type JSONSchemaType } from 'ajv';
import { PluginOptions } from './types';

type Config = {
  [key: string]: Config | string | number | boolean | null;
};

const getSchemaEntry = <T>(schema: JSONSchemaType<T>, path: string) => {
  const parts = path.split('.');
  let current = schema;
  for (const part of parts) {
    if (current.properties && current.properties.hasOwnProperty(part)) {
      current = current.properties[part];
    } else {
      return undefined;
    }
  }
  return current;
}

const createErrorHandler = (throwOnMissing: boolean) => {
  return {
    get: function(target: Config, prop: string) {
      if (prop !== 'toJSON' && !(prop in target)) {
        if (throwOnMissing) {
          throw new Error(`Config property '${prop}' not found.`);
        }
        return null;
      }
      return target[prop];
    },
  };
};

const bindMakeGetter = <T>(sourceConfig: IConfig, throwOnMissing: boolean, schema?: JSONSchemaType<T>) => {
  return (chkdConfig: Config, prop: string, configPath: string) => {
    Object.defineProperty(chkdConfig, prop, {
      get() {
        if (sourceConfig.has(configPath)) {
          return sourceConfig.get(configPath);
        }
        // if (schema) {
        // const schemaEntry = getSchemaEntry(schema, configPath);
        // if (schemaEntry && schemaEntry['default'] !== undefined) {
        //   return schemaEntry['default'];
        // }
        // }
        if (throwOnMissing) {
          throw new Error(`Config property ${configPath} not found`);
        }
        return null;
      },
    })
  };
};

export const wrapConfig = <T>(sourceConfig: IConfig, opts: PluginOptions<T>, throwOnMissing: boolean) => {
  const setupGetter = bindMakeGetter(sourceConfig, throwOnMissing, opts.schema);
  const errorHandler = createErrorHandler(throwOnMissing);

  const applyConfigCheck = (obj: Config, path: string) => {
    const chkdConfig: Config = {};

    for (const [prop, value] of Object.entries(obj)) {
      const configPath = path === '' ? prop : `${path}.${prop}`;

      if (typeof value === 'object' && value !== null) {
        chkdConfig[prop] = applyConfigCheck(value, configPath);
      } else {
        setupGetter(chkdConfig, prop, configPath);
      }
    }

    return new Proxy(chkdConfig, errorHandler);
  };

  const checkedConfig = applyConfigCheck(sourceConfig.util.toObject(), '');

  return new Proxy(checkedConfig, errorHandler);
};

export const validateSchema = <T>(
  config: unknown,
  schema: JSONSchemaType<T>
) => {
  const ajv = new Ajv({
    allErrors: true,
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true,
    allowUnionTypes: true,
  });
  const validate = ajv.compile(schema);
  const valid = validate(config);
  if (!valid) {
    const validationErrors = validate.errors?.map((e) => e.message).join(', ');
    throw new Error(`Invalid config: ${validationErrors}`);
  }
};
