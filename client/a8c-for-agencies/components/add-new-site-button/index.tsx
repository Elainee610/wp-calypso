import { Popover, Gridicon, Button, WordPressLogo, JetpackLogo } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import clsx from 'clsx';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import useFetchDevLicenses from 'calypso/a8c-for-agencies/data/purchases/use-fetch-dev-licenses';
import useFetchPendingSites from 'calypso/a8c-for-agencies/data/sites/use-fetch-pending-sites';
import usePressableOwnershipType from 'calypso/a8c-for-agencies/sections/marketplace/hosting-overview/hooks/use-pressable-ownership-type';
import pressableIcon from 'calypso/assets/images/pressable/pressable-icon.svg';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import A4ALogo from '../a4a-logo';
import {
	A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
	A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
	A4A_SITES_LINK_NEEDS_SETUP,
} from '../sidebar-menu/lib/constants';
import A4AConnectionModal from './a4a-connection-modal';
import ImportFromWPCOMModal from './import-from-wpcom-modal';
import JetpackConnectionModal from './jetpack-connection-modal';

import './style.scss';

const ICON_SIZE = 32;

type PendingSite = { features: { wpcom_atomic: { state: string; license_key: string } } };

type Props = {
	onWPCOMImport?: ( blogIds: number[] ) => void;
	showMainButtonLabel: boolean;
	devSite?: boolean;
	toggleSiteConfigurationsModal?: () => void;
};

export default function AddNewSiteButton( {
	showMainButtonLabel,
	onWPCOMImport,
	devSite,
	toggleSiteConfigurationsModal,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ isMenuVisible, setMenuVisible ] = useState( false );
	const [ showA4AConnectionModal, setShowA4AConnectionModal ] = useState( false );
	const [ showJetpackConnectionModal, setShowJetpackConnectionModal ] = useState( false );
	const [ showImportFromWPCOMModal, setShowImportFromWPCOMModal ] = useState( false );

	const toggleMenu = () => {
		setMenuVisible( ( isVisible ) => ! isVisible );
	};

	const handleImportFromWPCOM = () => {
		dispatch( recordTracksEvent( 'calypso_a8c_agency_sites_import_wpcom_click' ) );
		setShowImportFromWPCOMModal( true );
		setMenuVisible( false );
	};

	const popoverMenuContext = useRef( null );

	const menuItem = ( {
		icon,
		iconClassName,
		heading,
		description,
		buttonProps,
		extraContent,
	}: {
		icon: JSX.Element;
		iconClassName?: string;
		heading: string;
		description: string | TranslateResult;
		buttonProps?: React.ComponentProps< typeof Button >;
		extraContent?: JSX.Element;
	} ) => {
		return (
			<Button { ...buttonProps } className="site-selector-and-importer__popover-button" borderless>
				<div className={ clsx( 'site-selector-and-importer__popover-button-icon', iconClassName ) }>
					<Icon className="sidebar__menu-icon" icon={ icon } size={ ICON_SIZE } />
				</div>
				<div className="site-selector-and-importer__popover-button-content">
					<div className="site-selector-and-importer__popover-button-heading">{ heading }</div>
					<div className="site-selector-and-importer__popover-button-description">
						{ description }
					</div>
					{ extraContent }
				</div>
			</Button>
		);
	};

	const pressableOwnership = usePressableOwnershipType();

	const { data: pendingSites } = useFetchPendingSites();
	const { data: devLicenses } = useFetchDevLicenses();

	const allAvailableSites =
		pendingSites?.filter(
			( { features }: PendingSite ) =>
				features.wpcom_atomic.state === 'pending' && !! features.wpcom_atomic.license_key
		) ?? [];

	const hasPendingWPCOMSites = allAvailableSites.length > 0;

	const availableDevSites = devLicenses?.available;
	const hasAvailableDevSites = devLicenses?.available > 0;

	const mainButtonLabel = devSite
		? translate( 'Start developing for free' )
		: translate( 'Add sites' );

	const newSitePopoverContent = (
		<div className="site-selector-and-importer__popover-content">
			<div className="site-selector-and-importer__popover-column">
				<div className="site-selector-and-importer__popover-column-heading">
					{ translate( 'Add existing sites' ).toUpperCase() }
				</div>
				{ menuItem( {
					icon: <WordPressLogo />,
					heading: translate( 'Via WordPress.com' ),
					description: translate( 'Add sites bought on{{nbsp/}}WordPress.com', {
						components: { nbsp: <>&nbsp;</> },
						comment: 'nbsp is a non-breaking space character',
					} ),
					buttonProps: {
						onClick: handleImportFromWPCOM,
					},
				} ) }
				{ menuItem( {
					icon: <A4ALogo />,
					heading: translate( 'Via the Automattic plugin' ),
					description: translate( 'Connect with the Automattic for Agencies{{nbsp/}}plugin', {
						components: { nbsp: <>&nbsp;</> },
						comment: 'nbsp is a non-breaking space character',
					} ),
					buttonProps: {
						onClick: () => {
							setShowA4AConnectionModal( true );
							setMenuVisible( false );
						},
					},
				} ) }
				{ menuItem( {
					icon: <JetpackLogo />,
					heading: translate( 'Via Jetpack' ),
					description: translate( 'Import one or more Jetpack connected sites' ),
					buttonProps: {
						onClick: () => {
							setShowJetpackConnectionModal( true );
							setMenuVisible( false );
						},
					},
				} ) }
			</div>
			<div className="site-selector-and-importer__popover-column">
				<div className="site-selector-and-importer__popover-column-heading">
					{ translate( 'Add a new site' ).toUpperCase() }
				</div>
				{ menuItem( {
					icon: <WordPressLogo />,
					heading: translate( 'WordPress.com' ),
					description: translate( 'Optimized and hassle-free hosting for business websites' ),
					buttonProps: {
						href: hasPendingWPCOMSites
							? A4A_SITES_LINK_NEEDS_SETUP
							: A4A_MARKETPLACE_HOSTING_WPCOM_LINK,
					},
					extraContent: hasPendingWPCOMSites ? (
						<div className="site-selector-and-importer__popover-site-count">
							{ translate( '%(pendingSites)d site available', '%(pendingSites)d sites available', {
								args: {
									pendingSites: allAvailableSites.length,
								},
								count: allAvailableSites.length,
								comment: '%(pendingSites)s is the number of sites available.',
							} ) }
						</div>
					) : undefined,
				} ) }
				{ menuItem( {
					icon: <img src={ pressableIcon } alt="" />,
					heading: translate( 'Pressable' ),
					description: translate( 'Best for large-scale businesses and major eCommerce sites' ),
					buttonProps: {
						href:
							pressableOwnership === 'regular'
								? 'https://my.pressable.com/agency/auth'
								: A4A_MARKETPLACE_HOSTING_PRESSABLE_LINK,
						target: pressableOwnership === 'regular' ? '_blank' : '_self',
					},
				} ) }
			</div>
		</div>
	);

	const newDevSitePopoverContent = (
		<div className="site-selector-and-importer__popover-content">
			<div className="site-selector-and-importer__popover-column">
				<div className="site-selector-and-importer__popover-column-heading">
					{ translate( 'Add a new development site' ).toUpperCase() }
				</div>
				{ menuItem( {
					icon: <WordPressLogo />,
					heading: translate( 'WordPress.com' ),
					description: translate( 'Create a site and try our hosting features for free' ),
					buttonProps: {
						onClick: toggleSiteConfigurationsModal,
					},
					extraContent: hasAvailableDevSites ? (
						<div className="site-selector-and-importer__popover-site-count">
							{ translate( '%(pendingSites)d site available', '%(pendingSites)d sites available', {
								args: {
									pendingSites: availableDevSites,
								},
								count: availableDevSites,
								comment: '%(pendingSites)s is the number of sites available.',
							} ) }
						</div>
					) : undefined,
				} ) }
			</div>
		</div>
	);

	const popoverContent = devSite ? newDevSitePopoverContent : newSitePopoverContent;

	return (
		<>
			<Button
				className="site-selector-and-importer__button"
				ref={ popoverMenuContext }
				onClick={ toggleMenu }
			>
				{ showMainButtonLabel ? mainButtonLabel : null }
				<Gridicon
					className={ clsx(
						{ reverse: showMainButtonLabel && isMenuVisible },
						{ mobile: ! showMainButtonLabel }
					) }
					icon={ showMainButtonLabel ? 'chevron-down' : 'plus' }
				/>
			</Button>
			<Popover
				className={ clsx( 'site-selector-and-importer__popover', { 'dev-site': devSite } ) }
				context={ popoverMenuContext?.current }
				isVisible={ isMenuVisible }
				closeOnEsc
				onClose={ toggleMenu }
				autoPosition={ false }
				position="bottom left"
			>
				{ popoverContent }
			</Popover>

			{ showA4AConnectionModal && (
				<A4AConnectionModal onClose={ () => setShowA4AConnectionModal( false ) } />
			) }

			{ showJetpackConnectionModal && (
				<JetpackConnectionModal onClose={ () => setShowJetpackConnectionModal( false ) } />
			) }

			{ showImportFromWPCOMModal && (
				<ImportFromWPCOMModal
					onClose={ () => setShowImportFromWPCOMModal( false ) }
					onImport={ onWPCOMImport }
				/>
			) }
		</>
	);
}
