export enum E_UserRole {
	admin = 'Administrator',
	customer = 'Customer',
}
export type T_UserRole = keyof typeof E_UserRole;

export enum E_UserStatus {
	pending = 'Pending',
	active = 'Active',
	inactive = 'Inactive',
	banned = 'Banned',
}
export type T_UserStatus = keyof typeof E_UserStatus;

export interface I_User {
	id: string;
	email: string;
	phone: string;
	password: string;
	firstName: string;
	lastName: string;
	avatar: string;
	role: T_UserRole;
	status: T_UserStatus;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date;
	lastLogin: Date;
	lastSeen: Date;
}

export interface I_UserCreate
	extends Optional<
		I_User,
		'id' | 'avatar' | 'role' | 'status' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'lastLogin' | 'lastSeen'
	> {}

export interface I_UserPublic extends Omit<I_User, 'password'> {}
