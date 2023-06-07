# fastify-node-config

Fastify plugin allow access to configuration values created via [node-config](https://github.com/node-config/node-config) on a fastify instance.  Provides optional validation via [https://ajv.js.org/](Ajv).  Useful if you prefer using `node-config` for organizing and setting up your application's configuration but would like the values to be accessible in your application similar to [@fastify/env](https://github.com/fastify/fastify-env).

## Install

If you are using this library it is assumed you already are or are intended to use `node-config`.  Regardless of the situation, however, make sure to install `node-config` as it is peer dependency of this plugin.

:exclamation: note that `node-config` uses the package name `config`

### Yarn

```shell
yarn add fastify-node-config config 
# Install fastify-node-config and node-config dependencies
```

### NPM

```shell
npm install fastify-node-config config
# Install fastify-node-config and node-config dependencies
```


## Usage

All examples assume that you have already setup configuration files that are compatible with `node-config`.  See the [node-config](https://github.com/node-config/node-config) documentation for details on how to do so.  If you are coming here directly, you may wish to consider a simpler setup with `@fastify/env` and an `.env` file if you do not need the the additional features or options provided.

For the next two examples, one can assume a json file exists in `config/default.json`, though any equivalent `node-config` format can be used so long as it is similar.

```json
{
  "PORT": 3000
}
```

### CommonJS
```js
const fastify = require('fastify')()
const fastifyNodeConfig = require('fastify-node-config')


const schema = {
  type: 'object',
  required: [ 'PORT' ],
  properties: {
    PORT: {
      type: 'string',
    }
  }
}

// both parameters are optional
const options = {
  schema: schema, 
  safe: true, 
}

fastify
  .register(fastifyNodeConfig, options)
  .ready((err) => {
    if (err) console.error(err)

    console.log(fastify.config) 
    //prints config loaded via node-config
  })
```

### ESM 
```js
import Fastify from 'fastify';
import fastifyNodeConfig from 'fastify-node-config';

const fastify = Fastify();

const schema = {
  type: 'object',
  required: [ 'PORT' ],
  properties: {
    PORT: {
      type: 'string',
    }
  }
}

// both parameters are optional
const options = {
  schema: schema, 
  safe: true, 
}

fastify
  .register(fastifyNodeConfig, options)
  .ready((err) => {
    if (err) console.error(err)

    console.log(fastify.config) 
    //prints config loaded via node-config
  })
```

### Typescript

```typescript
import type { JSONSchemaType } from 'ajv';
import Fastify from 'fastify';
import fastifyNodeConfig from 'fastify-node-config';

export interface AppConfig {
  db: {
    host: string;
    port: number;
    name: string;
  };
  server: {
    port: number;
  };
  log: {
    level: string;
    file: string;
  };
}

export const schema: JSONSchemaType<AppConfig> = {
  type: 'object',
  properties: {
    db: {
      type: 'object',
      properties: {
        host: { type: 'string' },
        port: { type: 'number' },
        name: { type: 'string' },
      },
      required: ['host', 'port', 'name'],
    },
    server: {
      type: 'object',
      properties: {
        port: { type: 'number' },
      },
      required: ['port'],
    },
    log: {
      type: 'object',
      properties: {
        level: { type: 'string' },
        file: { type: 'string' },
      },
      required: ['level', 'file'],
    },
  },
  required: ['db', 'server', 'log'],
};

const options = {
  schema: schema, 
  safe: true, 
}

fastify
  .register(fastifyNodeConfig, options)
  .ready((err) => {
    if (err) console.error(err)

    console.log(fastify.config) 
    //prints config loaded via node-config
  })

//In order to have typing for the fastify instance, add a declaration with the types for your configuration:

declare module 'fastify' {
  interface FastifyInstance {
    config: AppConfig 
  }
}
```

## Options

Two optional parameters can be set when registering `fastify-node-config`: schema and safe.


### Schema
Schema is a `JSONSchema` for validating your configuration values.  If validation fails an exception is thrown.  This is useful for ensuring that the values you are loading via `node-config` align with the schema and typings in your application. Generally you will want to allow this to be a fatal exception in your application and it is highly recommended. 


### Safe
A second parameter `safe` when true will cause an exception to occur when trying to access a non-existant property in your configuration.  Note that nested property chains that are not defined will follow normal semantics with accessing undefined properties.  For example
```js
type AppConfig = {
  db :{
    server: string;
    port: number;
}

//...

fastify.config.db.query // throws error on safe is true, will be null when safe is false
fastify.config.db.query.find // TypeError when safe is false
```


## Notes

This library wraps around the `config.get` functionality core to `node-config` and as such, if the underlying config, however it may occur, mutates the underlying config, a runtime error would occur as access to the `config` decorator on the fastify instance internally will call `config.has` to ensure that it is a valid configuration entry.  

Further as this is for the most part a pass through, you should be able utilize any of the conventions and formats present in `node-config` without any limitations.

The schema does not need to reflect the entire structure of your config, it need merely conform to it.  Properties defined in config will still be accessible even if they are not explicitly setup.  For example a configuration json such as:

```json
{
  "PORT": "3000",
  "DEBUG": "false"
}
```

will still allow reaching `fastify.config.DEBUG` even if your schema is similar to the examples.
