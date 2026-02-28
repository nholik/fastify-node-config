import config from 'config';
import fp from 'fastify-plugin';
import type Ajv, { JSONSchemaType, Options as AjvOptions } from 'ajv';
import type { FastifyInstance } from 'fastify';
import { wrapConfig, validateSchema } from './util.js';

interface PluginOptions<T> {
  schema?: JSONSchemaType<T>;
  safe?: boolean;
  ajv?: Ajv;
  ajvOptions?: AjvOptions;
}

function fastifyNodeConfigPlugin<T>(
  fastify: FastifyInstance,
  opts: PluginOptions<T> = {},
  done: (err?: Error) => void
) {
  const throwOnMissing = opts?.safe ?? false;
  const checkedConfig = wrapConfig(config, throwOnMissing);

  if (opts?.schema) {
    validateSchema(config.util.toObject(), opts.schema, {
      ajv: opts.ajv,
      ajvOptions: opts.ajvOptions,
    });
  }

  fastify.decorate('config', {
    getter() {
      return checkedConfig;
    },
  });
  done();
}

const plugin = fp(fastifyNodeConfigPlugin, {
  fastify: '>=3.0.0',
  name: 'fastify-node-config',
});

export default plugin;
export const fastifyNodeConfig = plugin;
