module.exports = {
  buildOptions: {
    out: 'dist',
  },
  plugins: [
    '@snowpack/plugin-postcss',
    '@snowpack/plugin-dotenv',
    '@snowpack/plugin-sass',
  ],
  devOptions: {
    port: 3000,
  },
  optimize: {
    bundle: true,
    minify: true,
    target: 'es2018',
    treeshake: true,
  },
  exclude: [
    '**/.git/**/*',
    '**/node_modules/**/*',
    '**/*.config.js',
    'yarn.lock',
    '**/.env',
    '**/.env.*',
    '**/package.json',
    '**/.gitignore',
  ],
};
