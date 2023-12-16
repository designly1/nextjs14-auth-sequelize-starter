'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from 'nextjs13-progress';

import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';

import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'nextjs13-progress';

import logo from '@/assets/svg/designly-logo-trans.svg';

const originalWidth = 300;
const originalHeight = 105;
const displayWidth = 150;
const displayHeight = originalHeight / (originalWidth / displayWidth);

export default function Header() {
	const { userData } = useApp();
	const router = useRouter();
	const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

	const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElUser(event.currentTarget);
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};

	const handleAuthButton = () => {
		if (userData) {
			router.push('/logout');
		} else {
			router.push('/login');
		}
		setAnchorElUser(null);
	};

	const handleRoute = (route: string) => {
		router.push(route);
		setAnchorElUser(null);
	};

	const displayName = userData ? `${userData.firstName} ${userData.lastName}` : undefined;

	const menuItems = [
		{ name: 'Dashboard', route: '/app', role: '*' },
		{ name: 'My Account', route: '/account', role: '*' },
		{ name: 'Admin Dashboard', route: '/admin', role: 'admin' },
	];

	return (
		<>
			<div className="fixed top-0 right-0 left-0 h-20 bg-base-300 flex items-center justify-between px-6">
				<Link href="/" className="my-auto">
					<Image src={logo} alt="Designly" width={displayWidth} height={displayHeight} />
				</Link>
				<div>
					<Tooltip title="Open settings">
						<IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
							<Avatar alt={displayName} src={userData?.avatar} />
						</IconButton>
					</Tooltip>
					<Menu
						sx={{ mt: '45px' }}
						id="menu-appbar"
						anchorEl={anchorElUser}
						anchorOrigin={{
							vertical: 'top',
							horizontal: 'right',
						}}
						keepMounted
						transformOrigin={{
							vertical: 'top',
							horizontal: 'right',
						}}
						open={Boolean(anchorElUser)}
						onClose={handleCloseUserMenu}
					>
						{userData
							? menuItems.map((item, index) => {
									if (item.role === '*' || (userData.role && userData.role === item.role)) {
										return (
											<MenuItem key={index} onClick={() => handleRoute(item.route)}>
												<Typography textAlign="center">{item.name}</Typography>
											</MenuItem>
										);
									}
							  })
							: null}
						<MenuItem onClick={handleAuthButton}>
							<Typography textAlign="center">{userData ? 'Logout' : 'Login'}</Typography>
						</MenuItem>
					</Menu>
				</div>
			</div>
			<div className="h-20"></div>
		</>
	);
}
