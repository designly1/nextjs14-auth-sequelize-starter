import React, { createContext, useContext, useState, useEffect, FunctionComponent } from 'react';
import { getUserData, isLoggedIn } from '@/lib/client/auth';
import { usePathname } from 'next/navigation';
import { I_UserPublic } from '@/models/User.types';
import { I_ApiAuthResponse } from '@/app/api/auth/route';

interface AppContextProps {
	isLoading: boolean;
	setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
	logoutCleanup: () => Promise<void>;
	userData: I_UserPublic | null;
	userDataLoaded: boolean;
	loadUserData: () => void;
}

export interface I_ModalProps {
	className: string;
}

const defaultModalProps: I_ModalProps = {
	className: 'bg-white',
};

const AppContext = createContext<AppContextProps | undefined>(undefined);
interface AppProviderProps {
	children: React.ReactNode;
}

const USERDATA_TTL = 60 * 5; // 5 minutes

export const AppProvider: FunctionComponent<AppProviderProps> = ({ children }) => {
	const pathname = usePathname();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [userData, setUserData] = useState<I_UserPublic | null>(null);
	const [userDataLoaded, setUserDataLoaded] = useState<boolean>(false);
	const [userDataLastLoad, setUserDataLastLoad] = useState<Date>(new Date());
	const fetcher = async (url: string) => {
		const response = await fetch(url);
		const data = await response.json();
		return data.data;
	};
	const logoutCleanup = async () => {
		setUserData(null);
		setUserDataLoaded(false);
	};
	const loadUserData = () => {
		setUserDataLoaded(false);
		const userData = getUserData();
		setUserData(userData);
		setUserDataLoaded(true);
	};
	const loadUserDataFromServer = async () => {
		if (!isLoggedIn()) return;
		
		try {
			const response = await fetch('/api/auth');
			const data = (await response.json()) as I_ApiAuthResponse;
			const { success } = data;
			if (!success) {
				let message = 'Failed to load user data from server';
				if (data.message) message = data.message;
				console.error(message);
				return;
			}
			setUserDataLastLoad(new Date());
		} catch (_) {
			console.error('Failed to load user data from server');
		} finally {
			loadUserData();
		}
	};
	// Fires on first load
	useEffect(() => {
		loadUserDataFromServer();
	}, []);
	// Fires on page load
	useEffect(() => {
		const userData = getUserData();
		setUserData(userData);
		setUserDataLoaded(true);
		// Reload user data from server if USERDATA_TTL has expired
		if (userDataLastLoad) {
			const now = new Date();
			const diff = now.getTime() - userDataLastLoad.getTime();
			if (diff > USERDATA_TTL * 1000) {
				loadUserDataFromServer();
			}
		}
	}, [pathname]);
	return (
		<AppContext.Provider
			value={{
				isLoading,
				setIsLoading,
				logoutCleanup,
				userData,
				userDataLoaded,
				loadUserData,
			}}
		>
			{children}
		</AppContext.Provider>
	);
};
export const useApp = (): AppContextProps => {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error('useApp must be used within AppProvider');
	}
	return context;
};
