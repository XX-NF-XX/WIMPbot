const Telegraf = require('telegraf');
const session = require('telegraf/session');

const { EVENT_REGISTRATION_MENU, EVENT_REQUEST_MENU } = require('./config');

const {
    TOKEN, WELCOME_MESSAGE,
    REGISTRATION_MENU_MESSAGE,
    REQUEST_MENU_MESSAGE,
} = require('./config');

const bot = new Telegraf(TOKEN);
const { stage, stagesArray } = require('./stages');
const {
    startRegistrationButton, registrationMenu, applyMenu,
} = require('./menu');

bot.use(session());
bot.use(stage.middleware());

stagesArray.forEach(scene => bot.action(scene.name, ctx => ctx.scene.enter(scene.name)));

bot.start(ctx => ctx.reply(WELCOME_MESSAGE, startRegistrationButton));

bot.action(EVENT_REGISTRATION_MENU, (ctx) => {
    ctx.reply(REGISTRATION_MENU_MESSAGE, registrationMenu);
});

/* async function qwe() {
    const link = await bot.telegram.getFileLink('');
    console.log(link);
    const extra = {};
    extra.caption = '';
    const response = await bot.telegram.sendPhoto(, '', extra);
    console.log(response);

    return link;
}
qwe();
*/

bot.action(EVENT_REQUEST_MENU, ctx => ctx.reply(REQUEST_MENU_MESSAGE, applyMenu));

bot.startPolling();
