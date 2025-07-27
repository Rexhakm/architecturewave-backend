type EnvFunction = {
  (key: string, defaultValue?: string): string | undefined;
  bool: (key: string, defaultValue?: boolean) => boolean;
};

export default ({ env }: { env: EnvFunction }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'WAdkTXMSmGOwXrZuDD3d9P0HdZzU1UTdBi9T1UNL3h4='),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT', 'H4XKZcuqZMxM7jlOScPjcfy3Z4O7DJN4'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT', 'H4XKZcuqZMxM7jlOScPjcfy3Z4O7DJN4'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
});
