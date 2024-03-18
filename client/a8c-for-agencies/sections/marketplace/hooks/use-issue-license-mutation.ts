import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getCurrentAgencyUserId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { APIError, APILicense } from 'calypso/state/partner-portal/types';

export interface MutationIssueLicenseVariables {
	product: string;
	quantity: number;
}

function mutationIssueLicense( {
	product,
	quantity,
	agencyId,
}: MutationIssueLicenseVariables & { agencyId: number } ): Promise< APILicense > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/jetpack-licensing/license',
		body: { product, quantity, agency_id: agencyId },
	} );
}

export default function useIssueLicenseMutation< TContext = unknown >(
	options?: UseMutationOptions< APILicense, APIError, MutationIssueLicenseVariables, TContext >
): UseMutationResult< APILicense, APIError, MutationIssueLicenseVariables, TContext > {
	const agencyId = useSelector( getCurrentAgencyUserId );

	return useMutation< APILicense, APIError, MutationIssueLicenseVariables, TContext >( {
		...options,
		mutationFn: ( args ) => mutationIssueLicense( { ...args, agencyId } ),
	} );
}