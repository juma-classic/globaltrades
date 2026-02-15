import { standalone_routes } from '@/components/shared';
import { useDevice } from '@deriv-com/ui';
import './app-logo.scss';

export const AppLogo = () => {
    const { isDesktop } = useDevice();

    if (!isDesktop) {
        return (
            <a href={standalone_routes.traders_hub} className='app-header__logo globaltrades-logo mobile-logo'>
                <span className='globaltrades-text'>GT</span>
            </a>
        );
    }

    return (
        <a
            href='https://www.globaltrades.site/'
            target='_blank'
            rel='noopener noreferrer'
            className='app-header__logo globaltrades-logo'
        >
            <span className='globaltrades-text'>GLOBALTRADES</span>
        </a>
    );
};
