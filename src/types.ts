import type { JSONSchemaType } from 'ajv';

export interface PluginOptions<T> {
  schema?: JSONSchemaType<T>;
  safe?: boolean;
}
