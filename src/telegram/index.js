const session = require('telegraf/session');
const Router = require('telegraf/router');
const bot = require('./bot');
const {
  EVENT_NAMES: { REGISTRATION_MENU, REQUEST_MENU },
  WELCOME_MESSAGE,
  REGISTRATION_MENU_MESSAGE,
  REQUEST_MENU_MESSAGE,
  PLATFORM_TYPE_TELEGRAM,
} = require('../config');
const log = require('../logger')(__filename);

const { stage, stagesArray } = require('./stages');
const { startRegistrationButton, registrationMenu, requestMenu } = require('./menu');
const { deleteRequest, getUserActivity, processModerationRequest } = require('../services');

const mediaAlbumCheckMiddleware = (ctx, next) => {
  if (ctx.message && ctx.message.media_group_id) {
    if (ctx.session.mediaFlag) {
      return false;
    }
    ctx.session.mediaFlag = true;
    delete ctx.message.photo;
    return next();
  }
  delete ctx.session.mediaFlag;
  return next();
};

bot.use(session());
bot.use(mediaAlbumCheckMiddleware);
bot.use(stage.middleware());

stagesArray.forEach(scene => bot.action(scene.name, ctx => ctx.scene.enter(scene.name)));

bot.start(ctx => ctx.reply(WELCOME_MESSAGE, startRegistrationButton));

bot.action(REGISTRATION_MENU, async ctx => {
  try {
    ctx.reply(
      REGISTRATION_MENU_MESSAGE,
      registrationMenu(
        await getUserActivity({
          platformId: ctx.update.callback_query.from.id,
          platformType: PLATFORM_TYPE_TELEGRAM,
        }),
      ),
    );
  } catch (error) {
    log.error({ err: error, reqId: ctx.state.reqId }, 'callbackHandler registration menu');
  }
});

bot.action(REQUEST_MENU, ctx => ctx.reply(REQUEST_MENU_MESSAGE, requestMenu));

const callbackHandler = new Router(({ callbackQuery }) => {
  if (!callbackQuery.data) {
    return false;
  }
  const value = callbackQuery.data.split(':');
  return {
    route: value[0],
    state: {
      reqId: value[1],
      status: value[2],
    },
  };
});

callbackHandler.on('deleteRequest', async ctx => {
  try {
    await deleteRequest(ctx.state.reqId);
    ctx.deleteMessage();
  } catch (error) {
    log.error({ err: error, reqId: ctx.state.reqId }, 'callbackHandler deleteRequest');
  }
});

// callbackHandler.on('comment', async ctx => {
//   try {
//     const a = await ctx.telegram.sendPhoto(
//       433445035,
//       'http://static1.banki.ru/ugc/62/b3/09/df/7255314.jpg',
//     );
//     console.log(a);
//   } catch (error) {
//     console.error(`comment ${error}`);
//   }
// });

callbackHandler.on('moderate', async ctx => {
  processModerationRequest({
    reqId: ctx.state.reqId,
    statusString: ctx.state.status,
    moderatorId: ctx.update.callback_query.from.id,
  });
  ctx.deleteMessage();
});

bot.on('callback_query', callbackHandler);

module.exports = {
  launch: () => bot.launch(),
};
