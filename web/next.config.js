module.exports = {
  reactStrictMode: true,
  webpackDevMiddleware: config => {
    config.watchOptions.poll = 300;
    return config;
  }
}
