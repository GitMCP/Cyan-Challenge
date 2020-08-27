import Harvest from '../models/Harvest';
import * as Yup from 'yup';
import User from '../models/User';
import Mill from '../models/Mill';
import sequelize from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

class HarvestController {
	async index(req, res) {
		const results = await Harvest.findAll({attributes: ['id', 'code', 'created_at'], include:  [{model: Mill, as: 'ownerMill', attributes: ['id', 'name']}, {model: User, as: 'author', attributes: ['id', 'name', 'email']}]});
		return res.json(results);
	}

	async create(req, res) {
		const schema = Yup.object().shape({
			code: Yup.string().required('Please inform the harvest code!'),
			start_date:Yup.date().typeError('Invalid start date!')
				.required('Please inform the harvest start date!')
				.max(Yup.ref('end_date'), 'The start date must be prior to end date!'),
			end_date:Yup.date().typeError('Invalid end date!')
				.required('Please inform the harvest end date!')
				.min(Yup.ref('start_date'), 'The end date must be after start date!'),
		});
		const validationErrors = [];
		await schema.validate(req.body, { abortEarly: false }).catch(err => {
			validationErrors.push(...err.errors);
		});
		if (!(await schema.isValid(req.body))) {
			return res.status(400).json({ message: validationErrors });
		}

		const codeExists = await Harvest.findOne({ where: { code: req.body.code }});
		if (codeExists) {
			return res.status(400).json({ error: 'There\'s already a Harvest with that code!' });
		}
		const { code, start_date, end_date } = req.body;
		const { mill_id } = req.params;
		const author_id = req.userId;
        
		const { id } = await Harvest.create({code, start_date, end_date, mill_id, author_id});

		return res.json(await Harvest.findByPk(id, {attributes: ['id', 'code', 'start_date', 'end_date'], include:{model: Mill, as: 'ownerMill', attributes: ['id', 'name']}}));
	}

	async update(req, res) {
		const { harvest_id } = req.params;
		const harvest = await Harvest.findByPk(harvest_id);
    
		const schema = Yup.object().shape({
			code: Yup.string(),
			mill_id: Yup.number().typeError('Invalid mill id'),
			start_date: Yup.date()
				.when('end_date', {
					is: (''||null||undefined),
					then: Yup.date().typeError('Invalid start date!').max(harvest.end_date, 'The start date must be prior to end date!'),
					otherwise: Yup.date().typeError('Invalid start date!').max(Yup.ref('end_date'), 'The start date must be prior to end date!')
				}),
			end_date:Yup.date()
				.when('start_date', {
					is: (''||null||undefined),
					then: Yup.date().typeError('Invalid end date!').min(harvest.start_date, 'The end date must be after start date!'),
					otherwise: Yup.date().typeError('Invalid end date!').min(Yup.ref('start_date'), 'The end date must be after start date!')
				}), 
		}, ['start_date', 'end_date']);
		const validationErrors = [];
		await schema.validate(req.body, { abortEarly: false }).catch(err => {
			validationErrors.push(...err.errors);
		});
		if (!(await schema.isValid(req.body))) {
			return res.status(400).json({ message: validationErrors });
		}

		if(!harvest){
			return res.status(400).json({ error: 'Harvest not found!' });
		}
		if(req.userId != harvest.author_id){
			return res.status(400).json({ error: 'Sorry, you are not this Harvest\'s author' });
		}
    
		const codeExists = await Harvest.findOne({ where: { code: req.body.code }});
		if (codeExists && codeExists.id != harvest_id) {
			return res.status(400).json({ error: 'There\'s already a Harvest with that code!' });
		}
		const newValues = {
			code:  req.body.code,
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

		return res.json(await Harvest.findByPk(id, {attributes: ['id', 'code', 'start_date', 'end_date'], include:{model: Mill, as: 'ownerMill', attributes: ['id', 'name']}}));
	}

	async delete(req, res) {
		const { harvest_id } = req.params;
		const harvest = await Harvest.findByPk(harvest_id);

		if(!harvest){
			return res.status(400).json({ error: 'Harvest not found!' });
		}
		if(req.userId != harvest.author_id){
			return res.status(400).json({ error: 'Sorry, you are not this Harvest\'s author' });
		}
		
		await harvest.update({
			code: `deleted:${harvest.code}#${uuidv4()}`,
			deleted_at: sequelize.fn('NOW'),
		});

		return res.json({ message: 'Harvest deleted!' });
	} 
}

export default new HarvestController();
