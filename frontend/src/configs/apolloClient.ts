'use server';

import { getAllCookies } from '@/lib/getAllCookies';
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support';
import { cookies } from 'next/headers';

export const { getClient } = registerApolloClient(async () => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: getLink(),
  });
});

const getLink = () => {
  const httpLink = new HttpLink({
    uri: `${process.env.API_ENDPOINT_URI}/query`,
    credentials: 'include',
    fetchOptions: { cache: 'no-store' },
  });
  const authLink = setContext(async (_, { headers }) => {
    return {
      headers: {
        ...headers,
        cookie: await getAllCookies(),
      },
    };
  });
  const redirectLink = onError(({ graphQLErrors, networkError }) => {
    // NOTE: エラー監視など
    if (graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ),
      );
    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
    }
  });
  const afterwareLink = new ApolloLink((operation, forward) => {
    return forward(operation).map((response) => {
      const context = operation.getContext();
      const headers = context.response.headers;

      // NOTE: ログイン時のCookieセット
      if (headers && headers.get('set-cookie')) {
        const token = headers.get('set-cookie').split(';')[0].split('=')[1];
        cookies().then((c) => c.set('token', token, { secure: true, sameSite: 'none' }));
      }

      return response;
    });
  });
  return authLink.concat(redirectLink).concat(afterwareLink).concat(httpLink);
};
