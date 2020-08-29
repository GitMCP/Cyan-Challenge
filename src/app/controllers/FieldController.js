import Farm from '../models/Farm';
import * as Yup from 'yup';
import User from '../models/User';
import Field from '../models/Field';
import sequelize from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

class FieldController {
  async index(req, res) {
    const results = await Field.findAll({
      where: { deleted_at: null },
      attributes: ['id', 'code', 'location'],
      order: [['id', 'ASC']],
      include: [
        {
          model: Farm,
          as: 'ownerFarm',
          attributes: ['id', 'code', 'name']
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
    const { farm_id } = req.params;
    const farm = await Farm.findByPk(farm_id);
    if (!farm) {
      return res.status(400).json({ error: 'Farm not found!' });
    }
    const schema = Yup.object().shape({
      code: Yup.string().required('Please inform the field code!'),
      coordinates: Yup.array()
        .of(Yup.number().typeError('Invalid coordinates'))
        .min(2, 'Invalid coordinates')
        .max(2, 'Invalid coordinates')
        .required()
    });
    const validationErrors = [];
    await schema.validate(req.body, { abortEarly: false }).catch(err => {
      validationErrors.push(...err.errors);
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: validationErrors });
    }

    const codeExists = await Field.findOne({
      where: { code: req.body.code }
    });
    if (codeExists) {
      return res
        .status(400)
        .json({ error: "There's already a field with that code!" });
    }

    const { code, coordinates } = req.body;
    const location = {
      type: 'Point',
      coordinates
    };
    const author_id = req.userId;

    const { id } = await Field.create({ code, location, farm_id, author_id });

    return res.json(
      await Field.findByPk(id, {
        attributes: ['id', 'code', 'location'],
        include: {
          model: Farm,
          as: 'ownerFarm',
          attributes: ['id', 'name', 'code']
        }
      })
    );
  }

  async update(req, res) {
    const { field_id } = req.params;
    const field = await Field.findByPk(field_id);
    if (!field) {
      return res.status(400).json({ error: 'Field not found!' });
    }

    const schema = Yup.object().shape({
      code: Yup.string(),
      coordinates: Yup.array()
        .of(Yup.number().typeError('Invalid coordinates'))
        .min(2, 'Invalid coordinates')
        .max(2, 'Invalid coordinates'),
      farm_id: Yup.number().typeError('Invalid farm id')
    });
    const validationErrors = [];
    await schema.validate(req.body, { abortEarly: false }).catch(err => {
      validationErrors.push(...err.errors);
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: validationErrors });
    }

    if (req.body.code) {
      const codeExists = await Field.findOne({
        where: { code: req.body.code }
      });
      if (codeExists && codeExists.id != field_id) {
        return res
          .status(400)
          .json({ error: "There's already a field with that code!" });
      }
    }
    const { coordinates } = req.body;

    const location = coordinates
      ? {
          type: 'Point',
          coordinates
        }
      : null;

    const newValues = {
      code: req.body.code,
      location,
      harvest_id: req.body.harvest_id
    };
    for (var propName in newValues) {
      if (newValues[propName] === null || newValues[propName] === undefined) {
        delete newValues[propName];
      }
    }
    const { id } = await field.update(newValues);

    return res.json(
      await Field.findByPk(id, {
        attributes: ['id', 'code', 'location'],
        include: {
          model: Farm,
          as: 'ownerFarm',
          attributes: ['id', 'code', 'name']
        }
      })
    );
  }

  async delete(req, res) {
    const { field_id } = req.params;
    const field = await Field.findByPk(field_id);

    if (!field) {
      return res.status(400).json({ error: 'Field not found!' });
    }
    if (req.userId != field.author_id) {
      return res
        .status(400)
        .json({ error: "Sorry, you are not this Field's author" });
    }

    await field.update({
      code: `deleted:${field.code}#${uuidv4()}`,
      deleted_at: sequelize.fn('NOW')
    });

    return res.json({ message: 'Field deleted!' });
  }
}

export default new FieldController();
