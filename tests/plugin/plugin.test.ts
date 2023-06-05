import config from 'config';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import fastify from 'fastify';
import fastifyNodeConfig from '../../src/index.js';
import { AppConfig, schema } from '../../config/schema.js';

describe('fastify-node-config', async () => {
  let app;

  beforeAll(() => {
    app = fastify();
  });

  afterAll(() => {
    app.close();
  });

  beforeEach(() => {
    app = fastify();
  });

  const configObject = config.util.toObject();

  it('should decorate fastify with config', async () => {
    const app = fastify();
    app.register(fastifyNodeConfig, { schema });
    await app.ready();

    expect(app.config).toBeTypeOf('object');
  });
});

declare module 'fastify' {
  export interface FastifyInstance {
    config: AppConfig;
  }
}
