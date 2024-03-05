import { useSendInvites } from '@automattic/data-stores';
import { localizeUrl } from '@automattic/i18n-utils';
import { NextButton, Title, SubTitle } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import ExternalLink from 'calypso/components/external-link';
import InfiniteList from 'calypso/components/infinite-list';
import useExternalContributorsQuery from 'calypso/data/external-contributors/use-external-contributors';
import useP2GuestsQuery from 'calypso/data/p2/use-p2-guests-query';
import useUsersQuery from 'calypso/data/users/use-users-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import ImportedUserItem from './imported-user-item';
import { getRole } from './utils';
import type { UsersQuery, Member, SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface Props {
	site: SiteDetails;
	onSubmit: () => void;
}

const ImportUsers = ( { site, onSubmit }: Props ) => {
	const defaultTeamFetchOptions = { include_viewers: true };
	const userId = useSelector( getCurrentUserId );
	const translate = useTranslate();
	const usersQuery = useUsersQuery( site?.ID, defaultTeamFetchOptions ) as unknown as UsersQuery;
	const { data: externalContributors } = useExternalContributorsQuery( site?.ID );
	const { data: p2Guests } = useP2GuestsQuery( site?.ID );
	const { data: usersData, fetchNextPage, isFetchingNextPage, hasNextPage } = usersQuery;
	const { isPending: isSubmittingInvites, mutateAsync: sendInvites } = useSendInvites( site?.ID );

	const users = usersData?.users?.map( ( user ) => ( { user, checked: true } ) ) || [];
	const [ usersList, setUsersList ] = useState( users );
	const [ checkedUsersNumber, setCheckedUsersNumber ] = useState( usersList?.length || 0 );

	const handleSubmit = async () => {
		const selectedUsers = usersList
			.filter( ( user ) => user.checked )
			.map( ( userItem ) => ( {
				email_or_username:
					typeof userItem.user?.email === 'string' ? userItem.user?.email : userItem.user?.login,
				role: getRole( userItem.user ),
			} ) );

		if ( selectedUsers.length === 0 ) {
			return;
		}

		recordTracksEvent( 'calypso_site_importer_import_users_submit_invite', {
			number_of_invites: selectedUsers.length,
		} );

		try {
			await sendInvites( selectedUsers ).then( ( response ) => {
				return response;
			} );
		} catch ( e ) {}

		onSubmit?.();
	};

	const getUserRef = ( user: Member ) => {
		return 'user-' + user?.ID;
	};

	const onChangeChecked = ( index: number ) => ( checked: boolean ) => {
		usersList[ index ].checked = checked;
		setUsersList( usersList );
		setCheckedUsersNumber( usersList.filter( ( x ) => x.checked )?.length );
	};

	const renderUser = (
		listUser: {
			user: Member;
			checked: boolean;
		},
		index: number
	) => {
		const { user, checked } = listUser;
		const isExternalContributor =
			externalContributors && externalContributors.includes( user?.linked_user_ID ?? user?.ID );

		const isP2Guest =
			p2Guests?.guests && p2Guests.guests.includes( user?.linked_user_ID ?? user?.ID );

		return (
			<ImportedUserItem
				key={ user?.ID }
				user={ user }
				isChecked={ checked }
				onChangeChecked={ onChangeChecked( index ) }
				isExternalContributor={ isExternalContributor }
				isP2Guest={ isP2Guest }
			/>
		);
	};

	useEffect( () => {
		let users = usersData?.users?.map( ( user ) => ( { user, checked: true } ) ) || [];
		if ( userId && users ) {
			// Remove the current user from users array
			users = users.filter( ( userItem ) => {
				return userItem?.user?.linked_user_ID !== userId;
			} );
		}
		if ( JSON.stringify( users ) !== JSON.stringify( usersList ) ) {
			setUsersList( users );
			setCheckedUsersNumber( users?.length || 0 );
		}
	}, [ userId, usersData, usersList ] );

	return (
		<div className="import__user-migration">
			<div className="import__heading import__heading-center">
				<Title>
					{ translate( 'Transfer your users{{br/}}to WordPress.com', {
						components: {
							br: <br />,
						},
					} ) }
				</Title>
				<SubTitle>
					{ translate(
						'Invite the users below to unlock WordPress.com’s power. With {{secureSignOnLink}}Secure Sign On{{/secureSignOnLink}}, 2FA, Google & Apple logins, robust support, and seamless account recovery' +
							', they’ll improve their experience with ease.',
						{
							components: {
								secureSignOnLink: (
									<ExternalLink
										target="_blank"
										href={ localizeUrl( 'https://jetpack.com/support/sso/' ) }
									/>
								),
							},
						}
					) }
				</SubTitle>
			</div>
			<InfiniteList
				items={ usersList }
				fetchNextPage={ fetchNextPage }
				fetchingNextPage={ isFetchingNextPage }
				lastPage={ ! hasNextPage }
				renderItem={ renderUser }
				getItemRef={ getUserRef }
				guessedItemHeight={ 126 }
				renderLoadingPlaceholders={ () => <div>{ translate( 'Loading' ) }...</div> }
				className="import__user-migration-list"
			/>
			<div className="import__user-migration-footer">
				{ translate(
					'After clicking the button to invite, the selected users {{strong}}will receive invitation emails{{/strong}} to join your site, ensuring a smooth transition.',
					{
						components: {
							strong: <strong />,
						},
					}
				) }
			</div>
			<div className="import__user-migration-button-container">
				<NextButton
					type="button"
					onClick={ handleSubmit }
					isBusy={ isSubmittingInvites }
					disabled={ checkedUsersNumber < 1 }
				>
					{
						/* translators: The number of selected users to send WP.com invite */
						translate( 'Invite %(value)d user', 'Invite %(value)d users', {
							count: checkedUsersNumber,
							args: { value: checkedUsersNumber },
						} )
					}
				</NextButton>
			</div>
			<div className="import__user-migration-button-container">
				<Button
					variant="link"
					onClick={ () => {
						recordTracksEvent( 'calypso_site_importer_import_users_skip', {} );
						onSubmit?.();
					} }
					disabled={ isSubmittingInvites }
				>
					{ translate( 'Skip for now' ) }
				</Button>
			</div>
		</div>
	);
};

export default ImportUsers;