'use server';

import { getClient } from '@/configs/apolloClient';
import { SignInMutation, SignInDocument, SignInMutationVariables } from '../__generated__/page';

export const postSignIn = async (params: SignInMutationVariables) => {
  const client = await getClient();

  const { data } = await client.mutate<SignInMutation>({
    mutation: SignInDocument,
    variables: {
      input: params.input,
    },
  });

  return data?.signIn;
};
