import * as SchemaTypes from './graphql-schema-types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type CheckSignedInQueryVariables = SchemaTypes.Exact<{ [key: string]: never }>;

export type CheckSignedInQuery = {
  __typename?: 'Query';
  checkSignedIn: { __typename?: 'CheckSignedInResponse'; isSignedIn: boolean };
};

export const CheckSignedInDocument = gql`
  query checkSignedIn {
    checkSignedIn {
      isSignedIn
    }
  }
`;

/**
 * __useCheckSignedInQuery__
 *
 * To run a query within a React component, call `useCheckSignedInQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckSignedInQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckSignedInQuery({
 *   variables: {
 *   },
 * });
 */
export function useCheckSignedInQuery(
  baseOptions?: Apollo.QueryHookOptions<CheckSignedInQuery, CheckSignedInQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<CheckSignedInQuery, CheckSignedInQueryVariables>(
    CheckSignedInDocument,
    options,
  );
}
export function useCheckSignedInLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<CheckSignedInQuery, CheckSignedInQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<CheckSignedInQuery, CheckSignedInQueryVariables>(
    CheckSignedInDocument,
    options,
  );
}
export function useCheckSignedInSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<CheckSignedInQuery, CheckSignedInQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<CheckSignedInQuery, CheckSignedInQueryVariables>(
    CheckSignedInDocument,
    options,
  );
}
export type CheckSignedInQueryHookResult = ReturnType<typeof useCheckSignedInQuery>;
export type CheckSignedInLazyQueryHookResult = ReturnType<typeof useCheckSignedInLazyQuery>;
export type CheckSignedInSuspenseQueryHookResult = ReturnType<typeof useCheckSignedInSuspenseQuery>;
export type CheckSignedInQueryResult = Apollo.QueryResult<
  CheckSignedInQuery,
  CheckSignedInQueryVariables
>;
