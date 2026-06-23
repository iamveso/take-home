const { createHandler } = require('@app-core/server');
const { creatorCard } = require('@app/middlewares');
const { appLogger } = require('@app-core/logger');
const { throwAppError } = require('@app-core/errors');
const cardService = require('@app/services/creator-cards/creator-cards');
const {
  CUSTOM_ERROR_CODE,
  CUSTOME_ERROR_CODE_MAPPING,
  ERROR_CODE,
  ERROR_STATUS_CODE_MAPPING,
} = require('@app-core/errors/constants');

module.exports = createHandler({
  path: '/creator-cards',
  method: 'post',
  middlewares: [creatorCard],
  async onResponseEnd(rc, rs) {
    appLogger.info({ requestContext: rc, response: rs }, 'creator-card-post-request-completed');
  },
  async handler(rc, helper) {
    const payload = rc.meta.validated;
    let slugProvided = true;
    try {
      slugProvided = !!payload.slug;
      if (!slugProvided) {
        payload.slug = cardService.generateSlug(payload.title);
      }
      const card = await cardService.getCardBySlug(payload.slug);
      if (card && slugProvided) {
        throwAppError(CUSTOM_ERROR_CODE.SL02, 400, { code: CUSTOME_ERROR_CODE_MAPPING.SL02 });
      }
      if (card && !slugProvided) {
        // regenerate slug and add randomization
        payload.slug = cardService.generateSlug(payload.title, { randomize: true });
      }
      if (card && card.slug === payload.slug) {
        throwAppError(ERROR_CODE.APPERR, ERROR_STATUS_CODE_MAPPING.APPLICATION_ERROR);
      }
      if (payload.links && payload.links.length > 0) {
        const allUrlsValid = cardService.validateUrl(payload.links);
        if (!allUrlsValid) {
          throwAppError('invalid url in links', 400);
        }
      }
      // there must be access code if the access_type is private
      if (payload.access_type === 'private' && !payload.access_code) {
        throwAppError(CUSTOM_ERROR_CODE.AC01, 400, { code: CUSTOME_ERROR_CODE_MAPPING.AC01 });
      }

      // there must be no access_code when access_type is public
      if (payload.access_type === 'public' && payload.access_code) {
        throwAppError(CUSTOM_ERROR_CODE.AC05, 400, { code: CUSTOME_ERROR_CODE_MAPPING.AC05 });
      }
      // save card
      const newCard = await cardService.create(payload);
      return {
        status: helper.http_statuses.HTTP_200_OK,
        data: newCard,
        message: 'Creator Card Created Successfully.',
      };
    } catch (err) {
      throwAppError(err.message, err.errorCode || 500, { code: err.code });
    }
    // get record by slug
  },
});
