'use server';

import { getClient } from '@/configs/apolloClient';
import { CheckSignedInDocument, CheckSignedInQuery } from '@/graphql/__generated__/checkAuth';

export const checkSignedIn = async (): Promise<
  CheckSignedInQuery['checkSignedIn']['isSignedIn'] | undefined
> => {
  const client = await getClient();
  const { data } = await client.query<CheckSignedInQuery>({
    query: CheckSignedInDocument,
  });

  return data?.checkSignedIn.isSignedIn;
};
