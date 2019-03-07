# bedrock-stats-storage-redis

# API Reference
<a name="module_bedrock-stats-storage-redis"></a>

## bedrock-stats-storage-redis

* [bedrock-stats-storage-redis](#module_bedrock-stats-storage-redis)
    * [.find(options)](#module_bedrock-stats-storage-redis.find) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.getMonitorIds()](#module_bedrock-stats-storage-redis.getMonitorIds) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [.insert(options)](#module_bedrock-stats-storage-redis.insert) ⇒ <code>Promise</code>
    * [.trimHistory(options)](#module_bedrock-stats-storage-redis.trimHistory) ⇒ <code>Promise</code>

<a name="module_bedrock-stats-storage-redis.find"></a>

### bedrock-stats-storage-redis.find(options) ⇒ <code>Promise.&lt;Object&gt;</code>
Query stats history.

**Kind**: static method of [<code>bedrock-stats-storage-redis</code>](#module_bedrock-stats-storage-redis)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - A collated history for the specified monitorIds.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| options | <code>Object</code> |  | The options to use. |
| options.monitorIds | <code>Array.&lt;string&gt;</code> |  | The monitorIds to query. |
| [options.endDate] | <code>number</code> \| <code>string</code> | <code>&#x27;+inf&#x27;</code> | The end date for the query   in ms since epoch. |
| [options.startDate] | <code>number</code> \| <code>string</code> | <code>&#x27;-inf&#x27;</code> | The start date for the   query in ms since epoch. |

<a name="module_bedrock-stats-storage-redis.getMonitorIds"></a>

### bedrock-stats-storage-redis.getMonitorIds() ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Get all known monitor IDs.

**Kind**: static method of [<code>bedrock-stats-storage-redis</code>](#module_bedrock-stats-storage-redis)  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - The monitor IDs.  
<a name="module_bedrock-stats-storage-redis.insert"></a>

### bedrock-stats-storage-redis.insert(options) ⇒ <code>Promise</code>
Insert stats into history.

**Kind**: static method of [<code>bedrock-stats-storage-redis</code>](#module_bedrock-stats-storage-redis)  
**Returns**: <code>Promise</code> - The Redis transaction summary.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | The options to use. |
| options.report | <code>Object</code> | The report to insert. |

<a name="module_bedrock-stats-storage-redis.trimHistory"></a>

### bedrock-stats-storage-redis.trimHistory(options) ⇒ <code>Promise</code>
Trim stats history.

**Kind**: static method of [<code>bedrock-stats-storage-redis</code>](#module_bedrock-stats-storage-redis)  
**Returns**: <code>Promise</code> - The Redis transaction summary.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | The options to use. |
| options.beforeDate | <code>number</code> | All history before this   date(ms since epoch) will be removed from history. |

