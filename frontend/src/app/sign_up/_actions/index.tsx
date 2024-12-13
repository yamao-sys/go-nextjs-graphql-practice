'use server';

import { getClient } from '@/configs/apolloClient';
// import { revalidatePath } from 'next/cache';
import { SignUpMutation, SignUpDocument, SignUpMutationVariables } from '../__generated__/page';

export const postSignUp = async (params: SignUpMutationVariables) => {
  const client = await getClient();

  const { data } = await client.mutate<SignUpMutation>({
    mutation: SignUpDocument,
    variables: {
      input: params.input,
    },
  });

  return data?.signUp;
};
