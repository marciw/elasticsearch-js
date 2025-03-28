/*
 * Copyright Elasticsearch B.V. and contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable import/export */
/* eslint-disable @typescript-eslint/no-misused-new */
/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable @typescript-eslint/no-unused-vars */

// This file was automatically generated by elastic/elastic-client-generator-js
// DO NOT MODIFY IT BY HAND. Instead, modify the source open api file,
// and elastic/elastic-client-generator-js to regenerate this file again.

import {
  Transport,
  TransportRequestMetadata,
  TransportRequestOptions,
  TransportRequestOptionsWithMeta,
  TransportRequestOptionsWithOutMeta,
  TransportResult
} from '@elastic/transport'
import * as T from '../types'

interface That {
  transport: Transport
}

const commonQueryParams = ['error_trace', 'filter_path', 'human', 'pretty']

const acceptedParams: Record<string, { path: string[], body: string[], query: string[] }> = {
  knn_search: {
    path: [
      'index'
    ],
    body: [
      '_source',
      'docvalue_fields',
      'stored_fields',
      'fields',
      'filter',
      'knn'
    ],
    query: [
      'routing'
    ]
  }
}

/**
  * Run a knn search. NOTE: The kNN search API has been replaced by the `knn` option in the search API. Perform a k-nearest neighbor (kNN) search on a dense_vector field and return the matching documents. Given a query vector, the API finds the k closest vectors and returns those documents as search hits. Elasticsearch uses the HNSW algorithm to support efficient kNN search. Like most kNN algorithms, HNSW is an approximate method that sacrifices result accuracy for improved search speed. This means the results returned are not always the true k closest neighbors. The kNN search API supports restricting the search using a filter. The search will return the top k documents that also match the filter query. A kNN search response has the exact same structure as a search API response. However, certain sections have a meaning specific to kNN search: * The document `_score` is determined by the similarity between the query and document vector. * The `hits.total` object contains the total number of nearest neighbor candidates considered, which is `num_candidates * num_shards`. The `hits.total.relation` will always be `eq`, indicating an exact value.
  * @see {@link https://www.elastic.co/guide/en/elasticsearch/reference/master/knn-search-api.html | Elasticsearch API documentation}
  */
export default async function KnnSearchApi<TDocument = unknown> (this: That, params: T.KnnSearchRequest, options?: TransportRequestOptionsWithOutMeta): Promise<T.KnnSearchResponse<TDocument>>
export default async function KnnSearchApi<TDocument = unknown> (this: That, params: T.KnnSearchRequest, options?: TransportRequestOptionsWithMeta): Promise<TransportResult<T.KnnSearchResponse<TDocument>, unknown>>
export default async function KnnSearchApi<TDocument = unknown> (this: That, params: T.KnnSearchRequest, options?: TransportRequestOptions): Promise<T.KnnSearchResponse<TDocument>>
export default async function KnnSearchApi<TDocument = unknown> (this: That, params: T.KnnSearchRequest, options?: TransportRequestOptions): Promise<any> {
  const {
    path: acceptedPath,
    body: acceptedBody,
    query: acceptedQuery
  } = acceptedParams.knn_search

  const userQuery = params?.querystring
  const querystring: Record<string, any> = userQuery != null ? { ...userQuery } : {}

  let body: Record<string, any> | string | undefined
  const userBody = params?.body
  if (userBody != null) {
    if (typeof userBody === 'string') {
      body = userBody
    } else {
      body = { ...userBody }
    }
  }

  for (const key in params) {
    if (acceptedBody.includes(key)) {
      body = body ?? {}
      // @ts-expect-error
      body[key] = params[key]
    } else if (acceptedPath.includes(key)) {
      continue
    } else if (key !== 'body' && key !== 'querystring') {
      if (acceptedQuery.includes(key) || commonQueryParams.includes(key)) {
        // @ts-expect-error
        querystring[key] = params[key]
      } else {
        body = body ?? {}
        // @ts-expect-error
        body[key] = params[key]
      }
    }
  }

  const method = body != null ? 'POST' : 'GET'
  const path = `/${encodeURIComponent(params.index.toString())}/_knn_search`
  const meta: TransportRequestMetadata = {
    name: 'knn_search',
    pathParts: {
      index: params.index
    }
  }
  return await this.transport.request({ path, method, querystring, body, meta }, options)
}
