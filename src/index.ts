import config from 'config';
import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { wrapConfig, validateSchema } from './util.js';
import type { PluginOptions } from './types.js';


function fastifyNodeConfigPlugin<T>(
  fastify: FastifyInstance,
  opts: PluginOptions<T> = {},
  done: (err?: Error) => void
) {
  const throwOnMissing = opts?.safe ?? true;
  const checkedConfig = wrapConfig(config, opts, throwOnMissing);

  if (opts?.schema) {
    validateSchema(checkedConfig, opts.schema);
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
