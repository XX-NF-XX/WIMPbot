const Router = require('koa-router');

const token = require('../../middleware/token');
const validator = require('../../utils/validator');
const { registerUser } = require('../../../services');

const {
  webApi: { WEB_API_PATH_SIGNUP },
  platformType: { TELEGRAM },
} = require('../../../config');

const router = new Router({
  prefix: WEB_API_PATH_SIGNUP,
});

function validateQuery(ctx) {
  const errors = validator.signupQuery(ctx.request.query);
  ctx.assert(!errors.length, 400, errors.join(' '));
}

function getPayload(ctx) {
  validateQuery(ctx);
  const { lat, lon } = ctx.request.query;

  return {
    latitude: Number.parseFloat(lat),
    longitude: Number.parseFloat(lon),
  };
}

async function signup(ctx) {
  const { longitude, latitude } = getPayload(ctx);

  let isRegistered = false;
  try {
    isRegistered = await registerUser({
      platformId: ctx.chest.id,
      platformType: TELEGRAM,
      longitude,
      latitude,
    });
  } catch (err) {
    ctx.throw(500, 'Cannot register user!', { error: err });
  }

  ctx.body = { registered: isRegistered };
}

router.get('/', token.get(), signup);

module.exports = router;
