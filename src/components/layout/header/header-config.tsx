import { ReactNode } from 'react';
import { standalone_routes } from '@/components/shared';
import {
    LegacyCashierIcon as CashierLogo,
    LegacyHomeNewIcon as TradershubLogo,
    LegacyReportsIcon as ReportsLogo,
} from '@deriv/quill-icons/Legacy';
import {
    DerivProductBrandLightDerivBotLogoWordmarkIcon as DerivBotLogo,
    DerivProductBrandLightDerivTraderLogoWordmarkIcon as DerivTraderLogo,
    PartnersProductBrandLightSmarttraderLogoWordmarkIcon as SmarttraderLogo,
} from '@deriv/quill-icons/Logo';
import { localize } from '@deriv-com/translations';

const CopyTradingIcon = () => (
    <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <circle cx='12' cy='8' r='3' stroke='currentColor' strokeWidth='2' fill='none' />
        <circle cx='12' cy='8' r='3' fill='#3b82f6' opacity='0.2' />
        <circle cx='6' cy='16' r='2' stroke='currentColor' strokeWidth='1.5' fill='none' />
        <circle cx='12' cy='18' r='2' stroke='currentColor' strokeWidth='1.5' fill='none' />
        <circle cx='18' cy='16' r='2' stroke='currentColor' strokeWidth='1.5' fill='none' />
        <path d='M12 11L6 14' stroke='#3b82f6' strokeWidth='2' strokeLinecap='round' opacity='0.6' />
        <path d='M12 11L12 16' stroke='#3b82f6' strokeWidth='2' strokeLinecap='round' opacity='0.6' />
        <path d='M12 11L18 14' stroke='#3b82f6' strokeWidth='2' strokeLinecap='round' opacity='0.6' />
        <circle cx='12' cy='8' r='1.5' fill='#ffd700' />
        <circle cx='6' cy='16' r='0.8' fill='#10b981' />
        <circle cx='12' cy='18' r='0.8' fill='#10b981' />
        <circle cx='18' cy='16' r='0.8' fill='#10b981' />
        <path d='M15 6C16 5 17 5 18 6' stroke='#3b82f6' strokeWidth='1' strokeLinecap='round' opacity='0.5' />
        <path d='M16 4C17.5 3 19 3 20 4' stroke='#3b82f6' strokeWidth='1' strokeLinecap='round' opacity='0.3' />
    </svg>
);

export type PlatformsConfig = {
    active: boolean;
    buttonIcon: ReactNode;
    description: string;
    href: string;
    icon: ReactNode;
    showInEU: boolean;
};

export type MenuItemsConfig = {
    as: 'a' | 'button';
    href: string;
    icon: ReactNode;
    label: string;
};

export type TAccount = {
    balance: string;
    currency: string;
    icon: React.ReactNode;
    isActive: boolean;
    isEu: boolean;
    isVirtual: boolean;
    loginid: string;
    token: string;
    type: string;
};

export const platformsConfig: PlatformsConfig[] = [
    {
        active: false,
        buttonIcon: <DerivTraderLogo height={25} width={114.97} />,
        description: localize('A whole new trading experience on a powerful yet easy to use platform.'),
        href: standalone_routes.trade,
        icon: <DerivTraderLogo height={32} width={148} />,
        showInEU: true,
    },
    {
        active: true,
        buttonIcon: <DerivBotLogo height={25} width={94} />,
        description: localize('Automated trading at your fingertips. No coding needed.'),
        href: standalone_routes.bot,
        icon: <DerivBotLogo height={32} width={121} />,
        showInEU: false,
    },
    {
        active: false,
        buttonIcon: <SmarttraderLogo height={24} width={115} />,
        description: localize('Trade the world’s markets with our popular user-friendly platform.'),
        href: standalone_routes.smarttrader,
        icon: <SmarttraderLogo height={32} width={153} />,
        showInEU: false,
    },
];

export const TRADERS_HUB_LINK_CONFIG = {
    as: 'a',
    href: standalone_routes.traders_hub,
    icon: <TradershubLogo iconSize='xs' />,
    label: "Trader's Hub",
};

export const MenuItems: MenuItemsConfig[] = [
    {
        as: 'a',
        href: '/accumulator',
        icon: <TradershubLogo iconSize='xs' />,
        label: localize('Accumulator'),
    },
    {
        as: 'a',
        href: '/new-copy-trading',
        icon: <CopyTradingIcon />,
        label: localize('New Copytrading'),
    },
    {
        as: 'a',
        href: standalone_routes.reports,
        icon: <ReportsLogo iconSize='xs' />,
        label: localize('Reports'),
    },
    {
        as: 'a',
        href: standalone_routes.cashier,
        icon: <CashierLogo iconSize='xs' />,
        label: localize('Cashier'),
    },
];
