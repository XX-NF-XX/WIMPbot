const dbinit = require('./dbinit');

function start() {
  const telegram = require('./telegram'); // eslint-disable-line global-require
  const webApiServer = require('./web-api'); // eslint-disable-line global-require
  const viber = require('./viber'); // eslint-disable-line global-require

  telegram.launch();
  viber.launch();
  webApiServer.listen();
}

async function init() {
  await dbinit.init();
  start();
}

init();
