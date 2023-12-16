// sequelize.ts
import { Sequelize, Options, Op } from 'sequelize';
import pg from 'pg';
import safe from 'colors';

const logQuery = (query: string, options: any) => {
	console.log(safe.bgGreen(new Date().toLocaleString()));
	console.log(safe.bgYellow(options.bind));
	console.log(safe.bgBlue(query));
	return options;
};

const makeConfig = () => {
	const isDev = process.env.NODE_ENV !== 'production';

	const config: Options = {
		host: process.env.POSTGRES_HOST!,
		port: parseInt(process.env.POSTGRES_PORT!),
		dialect: 'postgres',
		dialectModule: pg,
		logging: isDev ? logQuery : false,
	};

	if (!isDev) {
		config.dialectOptions = {
			ssl: {
				require: true,
				rejectUnauthorized: false,
			},
		};
	}

	return config;
};

const sequelize = new Sequelize(
	process.env.POSTGRES_DATABASE!,
	process.env.POSTGRES_USER!,
	process.env.POSTGRES_PASSWORD!,
	makeConfig(),
);

export default sequelize;
