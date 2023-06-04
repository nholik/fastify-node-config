import config from 'config';
import fp from 'fastify-plugin';
import type { JSONSchemaType } from 'ajv';
import type { FastifyPluginOptions, FastifyInstance } from 'fastify';
import { wrapConfig, validateSchema } from './util.js';

interface FastifyNodeConfigPluginOptions<T> extends FastifyPluginOptions {
  schema?: JSONSchemaType<T>;
  safe?: boolean;
}

const fastifyNodeConfigPlugin = async <T>(
  fastify: FastifyInstance,
  opts?: FastifyNodeConfigPluginOptions<T>
) => {
  const throwOnMissing = opts?.safe ?? true;
  const checkedConfig = wrapConfig(config, throwOnMissing);

  if (opts?.schema) {
    validateSchema(checkedConfig, opts.schema);
  }

  fastify.decorate('config', { config: checkedConfig as T });
};

const plugin = fp(fastifyNodeConfigPlugin, {
  fastify: '>=3.0.0',
  name: 'fastify-node-config',
});

export default plugin;
export const fastifyNodeConfig = plugin;
