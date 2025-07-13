type EnvFunction = {
  (key: string, defaultValue?: string): string | undefined;
  bool: (key: string, defaultValue?: boolean) => boolean;
  int: (key: string, defaultValue?: number) => number;
};

export default ({ env }: { env: EnvFunction }) => ({
  connection: {
    client: 'postgres', 
  connection: {
        host: env('DATABASE_HOST'),
        port: env.int('DATABASE_PORT'),
        database: env('DATABASE_NAME'),
        user: env('DATABASE_USERNAME'),
        password: env('DATABASE_PASSWORD'),
        ssl: env.bool("DATABASE_SSL", true) && {
          rejectUnauthorized:env.bool('DATABASE_SSL_SELF', false),
      },
      },
      debug: false,
  },
});
