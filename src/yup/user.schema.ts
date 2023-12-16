import * as yup from 'yup';
import yp from 'yup-password';

import { E_UserRole, E_UserStatus } from '@/models/User.types';

export const USER_STATUS = Object.keys(E_UserStatus);
export const USER_ROLES = Object.keys(E_UserRole);

interface UserSchemaConstraints {
	firstName: {
		required: string;
		minLength: number;
		maxLength: number;
	};
	lastName: {
		required: string;
		minLength: number;
		maxLength: number;
	};
	email: {
		required: string;
		minLength: number;
		maxLength: number;
	};
	phone: {
		required: string;
		minLength: number;
		maxLength: number;
		match: RegExp;
	};
	status: {
		required: string;
		isIn: string[];
	};
	role: {
		required: string;
		isIn: string[];
	};
}

export const userSchemaConstraints: UserSchemaConstraints = {
	firstName: {
		required: 'First Name is required',
		minLength: 1,
		maxLength: 20,
	},
	lastName: {
		required: 'Last Name is required',
		minLength: 1,
		maxLength: 20,
	},
	email: {
		required: 'Email is required',
		minLength: 1,
		maxLength: 255,
	},
	phone: {
		required: 'Phone is required',
		minLength: 16,
		maxLength: 16,
		match: /^\(\d{3}\)\s\d{3}-\d{4}$/,
	},
	status: {
		required: 'Status is required',
		isIn: USER_STATUS,
	},
	role: {
		required: 'Role is required',
		isIn: USER_ROLES,
	},
};

export const userSchema = yup.object().shape({
	firstName: yup
		.string()
		.label('First Name')
		.required(userSchemaConstraints.firstName.required)
		.min(userSchemaConstraints.firstName.minLength)
		.max(userSchemaConstraints.firstName.maxLength),
	lastName: yup
		.string()
		.label('Last Name')
		.required(userSchemaConstraints.lastName.required)
		.min(userSchemaConstraints.lastName.minLength)
		.max(userSchemaConstraints.lastName.maxLength),
	email: yup.string().label('Email').required(userSchemaConstraints.email.required).email(),
	phone: yup
		.string()
		.label('Phone')
		.required(userSchemaConstraints.phone.required)
		.matches(userSchemaConstraints.phone.match, 'Phone number is not valid'),
});
