import Ajv, { type JSONSchemaType } from 'ajv';
import config, { type IConfig } from 'config';
import fp from 'fastify-plugin';
import type { FastifyPluginOptions, FastifyInstance } from 'fastify';

interface FastifyNodeConfigPluginOptions<T> extends FastifyPluginOptions {
  schema?: JSONSchemaType<T>;
  safe?: boolean;
}

const wrapConfig = (sourceConfig: IConfig, throwOnMissing: boolean) => {
  const applyConfigCheck = (obj: any, path: string) => {
    const chkdConfig: any = {};

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

const fastifyNodeConfigPlugin = async <T>(
  fastify: FastifyInstance,
  opts?: FastifyNodeConfigPluginOptions<T>
) => {
  const throwOnMissing = opts?.safe ?? true;
  const checkedConfig = wrapConfig(config, throwOnMissing);

  if (opts?.schema) {
    const ajv = new Ajv();
    const validate = ajv.compile(opts.schema);
    const valid = validate(checkedConfig);
    if (!valid) {
      const validationErrors = validate.errors
        ?.map((e) => e.message)
        .join(', ');
      throw new Error(`Invalid config: ${validationErrors}`);
    }
  }

  fastify.decorate('config', { config: checkedConfig as T });
};

const plugin = fp(fastifyNodeConfigPlugin, {
  fastify: '>=3.0.0',
  name: 'fastify-node-config',
});

export default plugin;
export const fastifyNodeConfig = plugin;
