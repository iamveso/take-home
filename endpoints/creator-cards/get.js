const { createHandler } = require('@app-core/server');
const { appLogger } = require('@app-core/logger');
const cardService = require('@app/services/creator-cards/creator-cards');
const { throwAppError } = require('@app-core/errors');
const { CUSTOM_ERROR_CODE, CUSTOME_ERROR_CODE_MAPPING } = require('@app-core/errors/constants');

module.exports = createHandler({
  path: '/creator-cards/:slug',
  method: 'get',
  middlewares: [],
  async onResponseEnd(rc, rs) {
    appLogger.info({ requestContext: rc, response: rs }, 'creator-card-post-request-completed');
  },
  async handler(rc, helper) {
    const card = await cardService.getCardBySlug(rc.params.slug);
    if (!card) {
      throwAppError(CUSTOM_ERROR_CODE.NF01, 404, { code: CUSTOME_ERROR_CODE_MAPPING.NF01 });
    }
    if (card.status === 'draft') {
      throwAppError(CUSTOM_ERROR_CODE.NF02, 404, { code: CUSTOME_ERROR_CODE_MAPPING.NF02 });
    }
    if (card.access_type === 'private' && !rc.query.access_code) {
      throwAppError(CUSTOM_ERROR_CODE.AC03, 403, { code: CUSTOME_ERROR_CODE_MAPPING.AC03 });
    }
    if (card.access_type === 'private' && rc.query.access_code !== card.access_code) {
      throwAppError(CUSTOM_ERROR_CODE.AC04, 403, { code: CUSTOME_ERROR_CODE_MAPPING.AC04 });
    }
    delete card.access_code;
    return {
      status: helper.http_statuses.HTTP_200_OK,
      data: card,
      message: 'Creator Card Retrieved Successfully.',
    };
  },
});
