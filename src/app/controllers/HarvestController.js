import Harvest from '../models/Harvest';
import * as Yup from 'yup';
import User from '../models/User';
import Mill from '../models/Mill';
import sequelize from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import notify from '../jobs/Notify';
import { Op } from 'sequelize';

class HarvestController {
  async index(req, res) {
    const filters = req.body;

    var startDate = {};
    if (filters.startDateFrom) {
      startDate[Op.gte] = filters.startDateFrom;
    }
    if (filters.startDateTo) {
      startDate[Op.lte] = filters.startDateTo;
    }
    var endDate = {};
    if (filters.endDateFrom) {
      endDate[Op.gte] = filters.endDateFrom;
    }
    if (filters.endDateTo) {
      endDate[Op.lte] = filters.endDateTo;
    }

    const where = {
      id: filters.id ? filters.id : undefined,
      code: filters.code ? filters.code : undefined,
      start_date:
        filters.startDateFrom || filters.startDateTo ? startDate : undefined,
      end_date: filters.endDateFrom || filters.endDateTo ? endDate : undefined
    };

    for (let propName in where) {
      if (where[propName] === null || where[propName] === undefined) {
        delete where[propName];
      }
    }

    delete filters.startDateFrom;
    delete filters.startDateTo;
    delete filters.endDateFrom;
    delete filters.endDateTo;

    const results = await Harvest.findAll({
      where,
      order: [['id', 'ASC']],
      attributes: ['id', 'code', 'start_date', 'end_date'],
      include: [
        { model: Mill, as: 'ownerMill', attributes: ['id', 'name'] },
        { model: User, as: 'author', attributes: ['id', 'name', 'email'] }
      ]
    });
    if (!filters.author && !filters.ownerMill) {
      return res.json(results);
    }
    var filtered = {};

    if (filters.author) {
      filtered = results.filter(index => index.author.name == filters.author);
    }

    if (filters.ownerMill) {
      filtered = results.filter(
        index => index.ownerMill.name == filters.ownerMill
      );
    }
    return res.json(filtered);
  }

  async create(req, res) {
    const schema = Yup.object().shape({
      code: Yup.string().required('Please inform the harvest code!'),
      start_date: Yup.date()
        .typeError('Invalid start date!')
        .required('Please inform the harvest start date!')
        .max(Yup.ref('end_date'), 'The start date must be prior to end date!'),
      end_date: Yup.date()
        .typeError('Invalid end date!')
        .required('Please inform the harvest end date!')
        .min(Yup.ref('start_date'), 'The end date must be after start date!')
    });
    const validationErrors = [];
    await schema.validate(req.body, { abortEarly: false }).catch(err => {
      validationErrors.push(...err.errors);
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: validationErrors });
    }

    const codeExists = await Harvest.findOne({
      where: { code: req.body.code }
    });
    if (codeExists) {
      return res
        .status(400)
        .json({ error: "There's already a Harvest with that code!" });
    }
    const { code, start_date, end_date } = req.body;
    const { mill_id } = req.params;
    const mill = await Mill.findByPk(mill_id);
    if (!mill) {
      return res.status(400).json({ error: 'Mill not found!' });
    }

    const author_id = req.userId;

    const { id } = await Harvest.create({
      code,
      start_date,
      end_date,
      mill_id,
      author_id
    });

    const register = {
      user: (await User.findByPk(author_id)).name,
      entity: 'harvest: ' + code
    };
    notify(req.io, register);

    return res.json(
      await Harvest.findByPk(id, {
        attributes: ['id', 'code', 'start_date', 'end_date'],
        include: { model: Mill, as: 'ownerMill', attributes: ['id', 'name'] }
      })
    );
  }

  async update(req, res) {
    const { harvest_id } = req.params;
    const harvest = await Harvest.findByPk(harvest_id);

    const schema = Yup.object().shape(
      {
        code: Yup.string(),
        mill_id: Yup.number().typeError('Invalid mill id'),
        start_date: Yup.date().when('end_date', {
          is: '' || null || undefined,
          then: Yup.date()
            .typeError('Invalid start date!')
            .max(harvest.end_date, 'The start date must be prior to end date!'),
          otherwise: Yup.date()
            .typeError('Invalid start date!')
            .max(
              Yup.ref('end_date'),
              'The start date must be prior to end date!'
            )
        }),
        end_date: Yup.date().when('start_date', {
          is: '' || null || undefined,
          then: Yup.date()
            .typeError('Invalid end date!')
            .min(harvest.start_date, 'The end date must be after start date!'),
          otherwise: Yup.date()
            .typeError('Invalid end date!')
            .min(
              Yup.ref('start_date'),
              'The end date must be after start date!'
            )
        })
      },
      ['start_date', 'end_date']
    );
    const validationErrors = [];
    await schema.validate(req.body, { abortEarly: false }).catch(err => {
      validationErrors.push(...err.errors);
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: validationErrors });
    }

    if (!harvest) {
      return res.status(400).json({ error: 'Harvest not found!' });
    }
    if (req.userId != harvest.author_id) {
      return res
        .status(400)
        .json({ error: "Sorry, you are not this Harvest's author" });
    }
    if (req.body.code) {
      const codeExists = await Harvest.findOne({
        where: { code: req.body.code }
      });
      if (codeExists && codeExists.id != harvest_id) {
        return res
          .status(400)
          .json({ error: "There's already a Harvest with that code!" });
      }
    }

    const newValues = {
      code: req.body.code,
      mill_id: req.body.mill_id,
      start_date: req.body.start_date,
      end_date: req.body.end_date
    };
    for (var propName in newValues) {
      if (newValues[propName] === null || newValues[propName] === undefined) {
        delete newValues[propName];
      }
    }
    const { id } = await harvest.update(newValues);

    return res.json(
      await Harvest.findByPk(id, {
        attributes: ['id', 'code', 'start_date', 'end_date'],
        include: { model: Mill, as: 'ownerMill', attributes: ['id', 'name'] }
      })
    );
  }

  async delete(req, res) {
    const { harvest_id } = req.params;
    const harvest = await Harvest.findByPk(harvest_id);

    if (!harvest) {
      return res.status(400).json({ error: 'Harvest not found!' });
    }
    if (req.userId != harvest.author_id) {
      return res
        .status(400)
        .json({ error: "Sorry, you are not this Harvest's author" });
    }

    await harvest.update({
      code: `deleted:${harvest.code}#${uuidv4()}`,
      deleted_at: sequelize.fn('NOW')
    });

    return res.json({ message: 'Harvest deleted!' });
  }
}

export default new HarvestController();
