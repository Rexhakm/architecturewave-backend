export default ({ env }) => ({
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET', 'iE220HUgV6mfQFomynB1ZXGnBmu6H0SJe4t5JtW5lE4='),
    },
  },
});
