import { z } from 'zod';

export interface EnvConfig<Schema extends z.ZodRawShape> {
    schema: Schema;
    env?: Record<string, any>;
}

export class Env<Schema extends z.ZodRawShape> {
    private static _instance: Env<any>;

    static use<Schema extends z.ZodRawShape>(config: EnvConfig<Schema>): Env<Schema> {
        return (this._instance ??= new Env(config)) as Env<Schema>;
    }

    public _type!: z.infer<z.ZodObject<Schema>>;
    private _env: Record<string, any>;
    private _parsed: Record<string, any>;

    private constructor(public readonly config: EnvConfig<Schema>) {
        this._env = config.env ?? (typeof process === 'undefined' ? {} : process.env) ?? {};
        this._parsed = {};
    }

    get<K extends keyof this['_type']>(key: K): this['_type'][K] {
        let value = this._parsed[key as string];

        if (value === undefined) {
            value = this._parsed[key as string];

            if (value === undefined) {
                const schema = this.config.schema[key as string];

                if (schema) {
                    value = schema.parse(this._env[key as string]);
                    this._parsed[key as string] = value;
                }
            }
        }

        if (value === undefined) {
            throw Error(`environment variable "${key as string}" not found`);
        }

        return value;
    }
}
