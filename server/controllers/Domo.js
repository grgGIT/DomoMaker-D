const mongoose = require('mongoose');
const _ = require('underscore');
const models = require('../models');

const { Domo } = models;

const setName = (name) => _.escape(name).trim();

const DomoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    set: setName,
    trim: true,
  },
  age: {
    type: Number,
    min: 0,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },

  createdDate: {
    type: Date,
    default: Date.now,
  },
});

DomoSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  age: doc.age,
});

const makerPage = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Domo.find(query).select('name age').lean().exec();

    return res.render('app', { domos: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occurred fetching domos' });
  }
};
const makeDomo = async (req, res) => {
  if (!req.body.name || !req.body.age) {
    return res.status(400).json({ error: 'Both name and age fields are required' });
  }

  const domoData = {
    name: req.body.name,
    age: req.body.age,
    owner: req.session.account._id,
  };
  try {
    const newDomo = new Domo(domoData);
    await newDomo.save();
    return res.json({ redirect: '/maker' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Domo already exists' });
    }
    return res.status(500).json({ error: 'An error occurred making domo' });
  }
};
const DomoModel = mongoose.model('Domo', DomoSchema);

module.exports = {
  makerPage,
  makeDomo,
  DomoModel,
};
