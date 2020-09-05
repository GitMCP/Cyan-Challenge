"use strict";module.exports = {
  dialect: 'postgres',
  host: 'ec2-34-238-26-109.compute-1.amazonaws.com',
  username: 'lsssanlwrdweem',
  password: '28e410a0dcbb067e10968459a38690fa3f064197869230a6bf50155d7ee7cf8f',
  database: 'db92momrmchjov',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  define: {
    timestamps: true,
    underscored: true,
    underscoreAll: true
  }
};
