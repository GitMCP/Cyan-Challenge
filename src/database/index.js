import Sequelize from 'sequelize';
import User from '../app/models/User';
import databaseConfig from '../config/database';
import Mill from '../app/models/Mill';

const models = [User, Mill];

const connection = new Sequelize(databaseConfig);

models.map(model => model.init(connection));

Mill.associate(connection.models);


module.exports = connection;
