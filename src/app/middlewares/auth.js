import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../models//User';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
	const authHeader = req.headers.authorization;

	// eslint-disable-next-line eqeqeq
	if (!authHeader || authHeader == 'Bearer ') {
		return res.status(401).json({ error: 'Token not provided' });
	}

	const token = authHeader.split(' ')[1];

	try {
		const decoded = await promisify(jwt.verify)(token, authConfig.secret);
		req.userId = decoded.id;
		if ((await User.findOne({ where: { id: decoded.id } })).deleted_at) {
			return res.status(401).json({ error: 'User  doesn\'t  exists!' });
		}
		return next();
	} catch (err) {
		return res.status(401).json({ error: 'Invalid Token' });
	}
};
