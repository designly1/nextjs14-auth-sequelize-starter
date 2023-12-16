'use server';
import { DataTypes, Model, Op } from 'sequelize';
import sequelize from '@/config/sequelize';

import { hashSync, compareSync } from 'bcryptjs';
import * as log from '@/lib/common/logger';
import { getJwt, logout } from '@/lib/server/auth';
import authConfig from '@/config/authConfig';
import { userSchemaConstraints, USER_ROLES, USER_STATUS } from '@/yup/user.schema';

import { I_User, I_UserCreate, I_UserPublic } from './User.types';

class User extends Model<I_User, I_UserCreate> implements I_User {
	public id!: I_User['id'];
	public email!: I_User['email'];
	public phone!: I_User['phone'];
	public password!: I_User['password'];
	public firstName!: I_User['firstName'];
	public lastName!: I_User['lastName'];
	public avatar!: I_User['avatar'];
	public role!: I_User['role'];
	public status!: I_User['status'];
	public createdAt!: I_User['createdAt'];
	public updatedAt!: I_User['updatedAt'];
	public deletedAt!: I_User['deletedAt'];
	public lastLogin!: I_User['lastLogin'];
	public lastSeen!: I_User['lastSeen'];

	public static readonly jwtExpires = authConfig.jwtExpires;

	public static async getByLoginId(loginId: string) {
		const user = await User.findOne({
			where: {
				[Op.or]: [{ phone: loginId }, { email: loginId.toLowerCase() }],
			},
		});

		return user;
	}

	public verifyPassword(password: I_User['password']) {
		return compareSync(password, this.password);
	}

	public static async login(login: string, password: I_User['password']) {
		try {
			const user = await User.getByLoginId(login);

			if (!user) {
				throw new Error('User not found');
			}

			// Check user status
			if (user.status === 'inactive' || user.status === 'banned') {
				throw new Error('User is inactive or banned');
			}

			user.lastLogin = new Date();
			user.lastSeen = new Date();
			await user.save();

			const isPasswordValid = user.verifyPassword(password);

			if (!isPasswordValid) {
				throw new Error('Invalid password');
			}

			return user;
		} catch (error: any) {
			log.error(error);
			throw new Error('Invalid login or password');
		}
	}

	public static async getAuthUserFromDb() {
		const jwt = await getJwt();

		if (!jwt) {
			return null;
		}

		const user = await User.findByPk(jwt.id);

		if (!user) {
			await logout();
			return null;
		}

		// Check if user is banned or inactive
		if (user && (user.status === 'banned' || user.status === 'inactive')) {
			await logout();
			return null;
		}

		return user;
	}

	public static filterPublic(user: I_User): I_UserPublic {
		const { password, ...userPublic } = user;
		return userPublic;
	}

	public exportPublic(): I_UserPublic {
		const { password, ...user } = this.toJSON() as I_User;

		return user;
	}
}

User.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true,
				min: userSchemaConstraints.email.minLength,
				max: userSchemaConstraints.email.maxLength,
			},
		},
		phone: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: true,
			validate: {
				is: userSchemaConstraints.phone.match,
				min: userSchemaConstraints.phone.minLength,
				max: userSchemaConstraints.phone.maxLength,
			},
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		firstName: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				min: userSchemaConstraints.firstName.minLength,
				max: userSchemaConstraints.firstName.maxLength,
			},
		},
		lastName: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				min: userSchemaConstraints.lastName.minLength,
				max: userSchemaConstraints.lastName.maxLength,
			},
		},
		avatar: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		role: {
			type: DataTypes.ENUM(...USER_ROLES),
			defaultValue: 'customer',
			allowNull: false,
			validate: {
				isIn: [USER_ROLES],
			},
		},
		status: {
			type: DataTypes.ENUM(...USER_STATUS),
			defaultValue: 'pending',
			allowNull: false,
			validate: {
				isIn: [USER_STATUS],
			},
		},
		createdAt: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
			allowNull: false,
		},
		updatedAt: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
			allowNull: false,
		},
		deletedAt: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		lastLogin: {
			type: DataTypes.DATE,
			allowNull: true,
		},
		lastSeen: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	},
	{
		sequelize,
		modelName: 'User',
		tableName: 'users',
		timestamps: true,
		underscored: true,
		paranoid: true,
		hooks: {
			beforeSave: async (user: User) => {
				if (user.changed('password')) {
					user.password = hashSync(user.password, authConfig.saltRounds);
				}
			},
		},
		indexes: [
			{
				fields: ['email'],
				unique: true,
			},
			{
				fields: ['phone'],
				unique: true,
			},
		],
	},
);

export default User;
