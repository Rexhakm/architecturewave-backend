type EnvFunction = {
  (key: string, defaultValue?: string): string | undefined;
  bool: (key: string, defaultValue?: boolean) => boolean;
  int: (key: string, defaultValue?: number) => number;
  array: (key: string) => string[];
};

export default ({ env }: { env: EnvFunction }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS') || ['n2dYlmvj8tNfppO8xTJuWxKDPWcbBeEsjkEcPipLUR8=', '3uvRAGJe7bUwMi7JbKxTDhK8oCB+9Vp2x9B0o6GvB3Q='],
  },
});
