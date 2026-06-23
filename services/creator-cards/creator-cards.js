const { throwAppError } = require('@app-core/errors');
const { CUSTOM_ERROR_CODE, CUSTOME_ERROR_CODE_MAPPING } = require('@app-core/errors/constants');
const CreatorCards = require('@app/repository/creator-cards');

/**
 * Generate a URL-safe slug from a title.
 *
 * 1. Lowercase the title
 * 2. Replace whitespace with hyphens
 * 3. Remove any characters that are not letters, numbers, hyphens, or underscores
 * 4. If the result is shorter than 5 characters OR randomize is true,
 *    append a hyphen followed by a random 6-character alphanumeric suffix
 *
 * @param {string} title
 * @param {{ randomize?: boolean }} [options]
 * @returns {string}
 */
function generateSlug(title, { randomize = false } = {}) {
  let slug = title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .replace(/[-_]{2,}/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '');

  if (slug.length < 5 || randomize) {
    const suffix = Math.random().toString(36).substring(2, 8);
    slug = `${slug}-${suffix}`;
  }

  return slug;
}

/**
 * Validate that all URLs in an array of link objects start with http:// or https://
 *
 * @param {{ title: string, url: string }[]} links
 * @returns {boolean}
 */
function validateUrl(links) {
  return links.every((link) => /^https?:\/\//.test(link.url));
}

async function getCardBySlug(slug) {
  const card = await CreatorCards.findOne({ query: { slug, deleted: null } });
  if (card) {
    const { _id, __v, ...rest } = card;
    return { id: _id, ...rest };
  }
  return null;
}

async function create(object) {
  const card = await CreatorCards.create(object);
  const { _id, __v, ...rest } = card;
  return { id: _id, ...rest };
}

async function deleteCard(slug, creatorReference) {
  const card = await CreatorCards.findOne({ query: { slug, deleted: null } });
  if (!card) {
    throwAppError(CUSTOM_ERROR_CODE.NF01, 404, { code: CUSTOME_ERROR_CODE_MAPPING.NF01 });
  }
  if (card.creator_reference !== creatorReference) {
    throwAppError('Invalid creator Reference', 404);
  }
  const deletedDate = Date.now();
  const result = await CreatorCards.updateOne({
    query: { slug, creator_reference: creatorReference, deleted: null },
    updateValues: { deleted: deletedDate },
  });
  if (!result.acknowledged || result.modifiedCount < 1) {
    throwAppError('something went wrong', 'ERR');
  }
  const { _id, __v, ...rest } = card;
  rest.deleted = deletedDate;
  return { id: _id, ...rest };
}

module.exports = { generateSlug, validateUrl, getCardBySlug, create, deleteCard };
