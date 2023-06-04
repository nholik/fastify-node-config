import { type IConfig } from 'config';
import Ajv, { type JSONSchemaType } from 'ajv';

type Config = {
  [key: string]: Config | string | number | boolean | null;
};

export const wrapConfig = (sourceConfig: IConfig, throwOnMissing: boolean) => {
  const applyConfigCheck = (obj: Config, path: string) => {
    const chkdConfig: Config = {};

    for (const [prop, value] of Object.entries(obj)) {
      const configPath = path === '' ? prop : `${path}.${prop}`;
      Object.defineProperty(chkdConfig, prop, {
        get() {
          if (sourceConfig.has(configPath)) {
            return sourceConfig.get(configPath);
          }
          if (!throwOnMissing) {
            throw new Error(`Config property ${configPath} not found`);
          }
          return null;
        },
      });
      if (typeof value === 'object' && value !== null) {
        chkdConfig[prop] = applyConfigCheck(value, configPath);
      }
    }

    return chkdConfig;
  };

  return applyConfigCheck(sourceConfig.util.toObject(), '');
};

export const validateSchema = <T>(config: unknown, schema: JSONSchemaType<T>) => {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(config);
  if (!valid) {
    const validationErrors = validate.errors?.map((e) => e.message).join(', ');
    throw new Error(`Invalid config: ${validationErrors}`);
  }
};
