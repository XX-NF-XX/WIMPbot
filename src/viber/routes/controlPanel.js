const TextMessage = require('viber-bot').Message.Text;
const bot = require('../bot');
const keyboard = require('../menu');
const {
  platformType: { VIBER },
  localesUA: { REGISTRATION_MENU_MESSAGE },
} = require('../../config');
const { getUserActivity, getUserStep, setUserStep } = require('../../services');
const badRequest = require('../badRequest');
const log = require('../../logger')(__filename);

bot.onTextMessage(/controlPanel/, async (message, response) => {
  try {
    if (
      (await getUserStep({
        platformId: response.userProfile.id,
        platformType: VIBER,
      })) !== 1
    ) {
      badRequest(response.userProfile);
      return;
    }
    await setUserStep({
      platformId: response.userProfile.id,
      platformType: VIBER,
      value: 2,
    });
    const controlKeyboard = keyboard.controlPanel(
      await getUserActivity({
        platformId: response.userProfile.id,
        platformType: VIBER,
      }),
    );
    bot.sendMessage(
      response.userProfile,
      new TextMessage(REGISTRATION_MENU_MESSAGE, controlKeyboard),
    );
  } catch (error) {
    log.error({ err: error }, 'controlPanel viber');
    badRequest(response.userProfile);
  }
});
