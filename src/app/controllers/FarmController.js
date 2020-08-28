import Farm from '../models/Farm';
import * as Yup from 'yup';
import User from '../models/User';
import Harvest from '../models/Harvest';
import sequelize from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

class FarmController {
  async index(req, res) {
    const results = await Farm.findAll({
      where: { deleted_at: null },
      attributes: ['id', 'code', 'name', 'created_at'],
      order: [['id', 'ASC']],
      include: [
        {
          model: Harvest,
          as: 'ownerHarvest',
          attributes: ['id', 'code', 'start_date', 'end_date']
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    return res.json(results);
  }

  async create(req, res) {
    const { harvest_id } = req.params;
    const harvest = await Harvest.findByPk(harvest_id);
    if (!harvest) {
      return res.status(400).json({ error: 'Harvest not found!' });
    }
    const schema = Yup.object().shape({
      code: Yup.string().required('Please inform the farm code!'),
      name: Yup.string().required('Please inform the farm name!')
    });
    const validationErrors = [];
    await schema.validate(req.body, { abortEarly: false }).catch(err => {
      validationErrors.push(...err.errors);
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: validationErrors });
    }

    const codeExists = await Farm.findOne({
      where: { code: req.body.code }
    });
    if (codeExists) {
      return res
        .status(400)
        .json({ error: "There's already a farm with that code!" });
    }

    const { code, name } = req.body;
    console.log(name);
    const author_id = req.userId;

    const { id } = await Farm.create({ code, name, harvest_id, author_id });

    return res.json(
      await Farm.findByPk(id, {
        attributes: ['id', 'code', 'name'],
        include: {
          model: Harvest,
          as: 'ownerHarvest',
          attributes: ['id', 'code', 'start_date', 'end_date']
        }
      })
    );
  }

  async update(req, res) {
    const { farm_id } = req.params;
    const farm = await Farm.findByPk(farm_id);
    if (!farm) {
      return res.status(400).json({ error: 'Farm not found!' });
    }

    const schema = Yup.object().shape({
      code: Yup.string(),
      name: Yup.string(),
      harvest_id: Yup.number().typeError('Invalid harvest id')
    });
    const validationErrors = [];
    await schema.validate(req.body, { abortEarly: false }).catch(err => {
      validationErrors.push(...err.errors);
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: validationErrors });
    }

    if (req.body.code) {
      const codeExists = await Farm.findOne({
        where: { code: req.body.code }
      });
      if (codeExists && codeExists.id != farm_id) {
        return res
          .status(400)
          .json({ error: "There's already a farm with that code!" });
      }
    }

    const newValues = {
      code: req.body.code,
      name: req.body.name,
      harvest_id: req.body.harvest_id
    };
    for (var propName in newValues) {
      if (newValues[propName] === null || newValues[propName] === undefined) {
        delete newValues[propName];
      }
    }
    const { id } = await farm.update(newValues);

    return res.json(
      await Farm.findByPk(id, {
        attributes: ['id', 'code', 'name'],
        include: {
          model: Harvest,
          as: 'ownerHarvest',
          attributes: ['id', 'code', 'start_date', 'end_date']
        }
      })
    );
  }

  async delete(req, res) {
    const { farm_id } = req.params;
    const farm = await Farm.findByPk(farm_id);

    if (!farm) {
      return res.status(400).json({ error: 'Farm not found!' });
    }
    if (req.userId != farm.author_id) {
      return res
        .status(400)
        .json({ error: "Sorry, you are not this Farm's author" });
    }

    await farm.update({
      code: `deleted:${farm.code}#${uuidv4()}`,
      deleted_at: sequelize.fn('NOW')
    });

    return res.json({ message: 'Farm deleted!' });
  }
}

export default new FarmController();
