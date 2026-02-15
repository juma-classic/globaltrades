import { standalone_routes } from '@/components/shared';
import { useDevice } from '@deriv-com/ui';
import './app-logo.scss';

export const AppLogo = () => {
    const { isDesktop } = useDevice();

    if (!isDesktop) {
        return (
            <a href={standalone_routes.traders_hub} className='app-header__logo tradermaster-logo mobile-logo'>
                <span className='tradermaster-text'>TM</span>
            </a>
        );
    }

    return (
        <a
            href='https://www.tradermaster.site/'
            target='_blank'
            rel='noopener noreferrer'
            className='app-header__logo tradermaster-logo'
        >
            <span className='tradermaster-text'>TRADER MASTER</span>
        </a>
    );
};
