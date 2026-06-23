const { throwAppError } = require('@app-core/errors');
const { createHandler } = require('@app-core/server');
const validator = require('@app-core/validator');

const creatorCardSpec = `root {
  title string <minLength:3|maxLength:100>
  description? string <maxLength:500>
  slug? string <minLength:5|maxLength:50>
  creator_reference string <length:20>
  status string(draft|published)
  access_type? string(public|private)
  access_code? string<length:6>
  links[]? {
    title string <minLength:1|maxLength:100>
    url string <maxLength:200>
  }
  service_rates? {
    currency string(NGN|USD|GBP|GHS)
    rates[] {
      name string <minLength:3|maxLength:100>
      description string <maxLength:250>
      amount number <min:1>
    }
  }
}`;

const parsedcreatorCardSpec = validator.parse(creatorCardSpec);

module.exports = createHandler({
  path: '/creator-card',
  method: '',
  async handler(rc) {
    try {
      const bd = validator.validate(rc.body, parsedcreatorCardSpec);
      return {
        augments: { meta: { validated: bd } },
      };
    } catch (err) {
      throwAppError(err.message, 400, { code: 'VL01' });
    }
  },
});
