const { ModelSchema, SchemaTypes, DatabaseModel } = require('@app-core/mongoose');
const { Schema } = require('mongoose');

const modelName = 'creator-cards';

/**
 * @typedef {Object} ModelSchema
 * @property {String} _id
 * @property {String} title
 * @property {String} description
 * @property {String} slug
 * @property {String} creator_reference
 * @property {Array} links
 * @property {Object} service_rates
 * @property {String} status
 * @property {String} access_type
 * @property {String} access_code
 * @property {Number} created
 * @property {Number} updated
 * @property {Number} deleted
 */

const schemaConfig = {
  _id: { type: SchemaTypes.ULID, required: true },
  title: { type: SchemaTypes.String, required: true, minLength: 3, maxLength: 100 },
  description: { type: SchemaTypes.String, maxLength: 500 },
  slug: {
    type: SchemaTypes.String,
    required: true,
    unique: true,
    index: true,
    minLength: 5,
    maxLength: 50,
  },
  creator_reference: { type: SchemaTypes.String, required: true, length: 20 },
  links: [
    new Schema(
      {
        title: { type: SchemaTypes.String, required: true, minLength: 1, maxLength: 100 },
        url: { type: SchemaTypes.String, required: true, maxLength: 200 },
      },
      { _id: false }
    ),
  ],
  service_rates: new Schema(
    {
      currency: { type: SchemaTypes.String, required: true, enum: ['NGN', 'USD', 'GBP', 'GHS'] },
      rates: [
        new Schema(
          {
            name: { type: SchemaTypes.String, required: true, minLength: 3, maxLength: 100 },
            description: { type: SchemaTypes.String, required: true, maxLength: 250 },
            amount: { type: SchemaTypes.Number, required: true, min: 1 },
          },
          { _id: false }
        ),
      ],
    },
    { _id: false }
  ),
  status: { type: SchemaTypes.String, required: true, enum: ['draft', 'published'] },
  access_type: { type: SchemaTypes.String, enum: ['public', 'private'], default: 'public' },
  access_code: { type: SchemaTypes.String, length: 6 },
  created: { type: SchemaTypes.Number, required: true, immutable: true },
  updated: { type: SchemaTypes.Number, required: true },
  deleted: { type: SchemaTypes.Number },
};

const modelSchema = new ModelSchema(schemaConfig, { collection: modelName });

/** @type {ModelSchema} */
module.exports = DatabaseModel.model(modelName, modelSchema);
