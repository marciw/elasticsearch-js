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
  acceptedParams: Record<string, { path: string[], body: string[], query: string[] }>
}

export default class Tasks {
  transport: Transport
  acceptedParams: Record<string, { path: string[], body: string[], query: string[] }>
  constructor (transport: Transport) {
    this.transport = transport
    this.acceptedParams = {
      'tasks.cancel': {
        path: [
          'task_id'
        ],
        body: [],
        query: [
          'actions',
          'nodes',
          'parent_task_id',
          'wait_for_completion'
        ]
      },
      'tasks.get': {
        path: [
          'task_id'
        ],
        body: [],
        query: [
          'timeout',
          'wait_for_completion'
        ]
      },
      'tasks.list': {
        path: [],
        body: [],
        query: [
          'actions',
          'detailed',
          'group_by',
          'nodes',
          'parent_task_id',
          'timeout',
          'wait_for_completion'
        ]
      }
    }
  }

  /**
    * Cancel a task. WARNING: The task management API is new and should still be considered a beta feature. The API may change in ways that are not backwards compatible. A task may continue to run for some time after it has been cancelled because it may not be able to safely stop its current activity straight away. It is also possible that Elasticsearch must complete its work on other tasks before it can process the cancellation. The get task information API will continue to list these cancelled tasks until they complete. The cancelled flag in the response indicates that the cancellation command has been processed and the task will stop as soon as possible. To troubleshoot why a cancelled task does not complete promptly, use the get task information API with the `?detailed` parameter to identify the other tasks the system is running. You can also use the node hot threads API to obtain detailed information about the work the system is doing instead of completing the cancelled task.
    * @see {@link https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-tasks | Elasticsearch API documentation}
    */
  async cancel (this: That, params?: T.TasksCancelRequest, options?: TransportRequestOptionsWithOutMeta): Promise<T.TasksCancelResponse>
  async cancel (this: That, params?: T.TasksCancelRequest, options?: TransportRequestOptionsWithMeta): Promise<TransportResult<T.TasksCancelResponse, unknown>>
  async cancel (this: That, params?: T.TasksCancelRequest, options?: TransportRequestOptions): Promise<T.TasksCancelResponse>
  async cancel (this: That, params?: T.TasksCancelRequest, options?: TransportRequestOptions): Promise<any> {
    const {
      path: acceptedPath
    } = this.acceptedParams['tasks.cancel']

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

    params = params ?? {}
    for (const key in params) {
      if (acceptedPath.includes(key)) {
        continue
      } else if (key !== 'body' && key !== 'querystring') {
        // @ts-expect-error
        querystring[key] = params[key]
      }
    }

    let method = ''
    let path = ''
    if (params.task_id != null) {
      method = 'POST'
      path = `/_tasks/${encodeURIComponent(params.task_id.toString())}/_cancel`
    } else {
      method = 'POST'
      path = '/_tasks/_cancel'
    }
    const meta: TransportRequestMetadata = {
      name: 'tasks.cancel',
      pathParts: {
        task_id: params.task_id
      }
    }
    return await this.transport.request({ path, method, querystring, body, meta }, options)
  }

  /**
    * Get task information. Get information about a task currently running in the cluster. WARNING: The task management API is new and should still be considered a beta feature. The API may change in ways that are not backwards compatible. If the task identifier is not found, a 404 response code indicates that there are no resources that match the request.
    * @see {@link https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-tasks | Elasticsearch API documentation}
    */
  async get (this: That, params: T.TasksGetRequest, options?: TransportRequestOptionsWithOutMeta): Promise<T.TasksGetResponse>
  async get (this: That, params: T.TasksGetRequest, options?: TransportRequestOptionsWithMeta): Promise<TransportResult<T.TasksGetResponse, unknown>>
  async get (this: That, params: T.TasksGetRequest, options?: TransportRequestOptions): Promise<T.TasksGetResponse>
  async get (this: That, params: T.TasksGetRequest, options?: TransportRequestOptions): Promise<any> {
    const {
      path: acceptedPath
    } = this.acceptedParams['tasks.get']

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
      if (acceptedPath.includes(key)) {
        continue
      } else if (key !== 'body' && key !== 'querystring') {
        // @ts-expect-error
        querystring[key] = params[key]
      }
    }

    const method = 'GET'
    const path = `/_tasks/${encodeURIComponent(params.task_id.toString())}`
    const meta: TransportRequestMetadata = {
      name: 'tasks.get',
      pathParts: {
        task_id: params.task_id
      }
    }
    return await this.transport.request({ path, method, querystring, body, meta }, options)
  }

  /**
    * Get all tasks. Get information about the tasks currently running on one or more nodes in the cluster. WARNING: The task management API is new and should still be considered a beta feature. The API may change in ways that are not backwards compatible. **Identifying running tasks** The `X-Opaque-Id header`, when provided on the HTTP request header, is going to be returned as a header in the response as well as in the headers field for in the task information. This enables you to track certain calls or associate certain tasks with the client that started them. For example: ``` curl -i -H "X-Opaque-Id: 123456" "http://localhost:9200/_tasks?group_by=parents" ``` The API returns the following result: ``` HTTP/1.1 200 OK X-Opaque-Id: 123456 content-type: application/json; charset=UTF-8 content-length: 831 { "tasks" : { "u5lcZHqcQhu-rUoFaqDphA:45" : { "node" : "u5lcZHqcQhu-rUoFaqDphA", "id" : 45, "type" : "transport", "action" : "cluster:monitor/tasks/lists", "start_time_in_millis" : 1513823752749, "running_time_in_nanos" : 293139, "cancellable" : false, "headers" : { "X-Opaque-Id" : "123456" }, "children" : [ { "node" : "u5lcZHqcQhu-rUoFaqDphA", "id" : 46, "type" : "direct", "action" : "cluster:monitor/tasks/lists[n]", "start_time_in_millis" : 1513823752750, "running_time_in_nanos" : 92133, "cancellable" : false, "parent_task_id" : "u5lcZHqcQhu-rUoFaqDphA:45", "headers" : { "X-Opaque-Id" : "123456" } } ] } } } ``` In this example, `X-Opaque-Id: 123456` is the ID as a part of the response header. The `X-Opaque-Id` in the task `headers` is the ID for the task that was initiated by the REST request. The `X-Opaque-Id` in the children `headers` is the child task of the task that was initiated by the REST request.
    * @see {@link https://www.elastic.co/docs/api/doc/elasticsearch/group/endpoint-tasks | Elasticsearch API documentation}
    */
  async list (this: That, params?: T.TasksListRequest, options?: TransportRequestOptionsWithOutMeta): Promise<T.TasksListResponse>
  async list (this: That, params?: T.TasksListRequest, options?: TransportRequestOptionsWithMeta): Promise<TransportResult<T.TasksListResponse, unknown>>
  async list (this: That, params?: T.TasksListRequest, options?: TransportRequestOptions): Promise<T.TasksListResponse>
  async list (this: That, params?: T.TasksListRequest, options?: TransportRequestOptions): Promise<any> {
    const {
      path: acceptedPath
    } = this.acceptedParams['tasks.list']

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

    params = params ?? {}
    for (const key in params) {
      if (acceptedPath.includes(key)) {
        continue
      } else if (key !== 'body' && key !== 'querystring') {
        // @ts-expect-error
        querystring[key] = params[key]
      }
    }

    const method = 'GET'
    const path = '/_tasks'
    const meta: TransportRequestMetadata = {
      name: 'tasks.list'
    }
    return await this.transport.request({ path, method, querystring, body, meta }, options)
  }
}
