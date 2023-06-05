import { type IConfig } from 'config';
import Ajv, { type JSONSchemaType } from 'ajv';

type Config = {
  [key: string]: Config | string | number | boolean | null;
};

const createErrorHandler = (throwOnMissing: boolean) => {
  return {
    get: function (target: Config, prop: string) {
      if (!(prop in target)) {
        if (throwOnMissing) {
          throw new Error(`Config property '${prop}' not found.`);
        }
        return null;
      }
      return target[prop];
    },
  };
};

const bindMakeGetter = (sourceConfig: IConfig, throwOnMissing: boolean) => {
  return (chkdConfig: Config, prop: string, configPath: string) => {
    Object.defineProperty(chkdConfig, prop, {
      get() {
        if (sourceConfig.has(configPath)) {
          return sourceConfig.get(configPath);
        }
        if (throwOnMissing) {
          throw new Error(`Config property ${configPath} not found`);
        }
        return null;
      },
    });
  };
};

export const wrapConfig = (sourceConfig: IConfig, throwOnMissing: boolean) => {
  const setupGetter = bindMakeGetter(sourceConfig, throwOnMissing);
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
