const { createHandler } = require('@app-core/server');
const { appLogger } = require('@app-core/logger');
const { throwAppError } = require('@app-core/errors');
const cardService = require('@app/services/creator-cards/creator-cards');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'delete',
  middlewares: [],
  async onResponseEnd(rc, rs) {
    appLogger.info({ requestContext: rc, response: rs }, 'creator-card-post-request-completed');
  },
  async handler(rc, helper) {
    const payload = rc.body;
    if (!payload.creator_reference || payload.creator_reference.length !== 20) {
      throwAppError('creator_reference is required and must be of length 20', 400);
    }
    try {
      const card = await cardService.deleteCard(rc.params.slug, payload.creator_reference);
      return {
        status: helper.http_statuses.HTTP_200_OK,
        data: card,
      };
    } catch (err) {
      throwAppError(err.message, err.errorCode || 500, { code: err.code });
    }
  },
});
