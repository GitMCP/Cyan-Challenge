import Sequelize from 'sequelize';
import User from '../app/models/User';
import databaseConfig from '../config/database';
import Mill from '../app/models/Mill';
import Harvest from '../app/models/Harvest';
import Farm from '../app/models/Farm';

const models = [User, Mill, Harvest, Farm];

const connection = new Sequelize(databaseConfig);

models.map(model => model.init(connection));

Mill.associate(connection.models);
Harvest.associate(connection.models);
Farm.associate(connection.models);

module.exports = connection;
