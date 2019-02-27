# bedrock-stats-storage-redis

# API Reference
<a name="module_bedrock-stats-storage-redis"></a>

## bedrock-stats-storage-redis

* [bedrock-stats-storage-redis](#module_bedrock-stats-storage-redis)
    * [.find(options)](#module_bedrock-stats-storage-redis.find) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.insert(options)](#module_bedrock-stats-storage-redis.insert) ⇒ <code>Promise</code>
    * [.purgeHistory(options)](#module_bedrock-stats-storage-redis.purgeHistory) ⇒ <code>Promise</code>

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

<a name="module_bedrock-stats-storage-redis.insert"></a>

### bedrock-stats-storage-redis.insert(options) ⇒ <code>Promise</code>
Insert stats into history.

**Kind**: static method of [<code>bedrock-stats-storage-redis</code>](#module_bedrock-stats-storage-redis)  
**Returns**: <code>Promise</code> - The Redis transaction summary.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | The options to use. |
| options.report | <code>Object</code> | The report to insert. |

<a name="module_bedrock-stats-storage-redis.purgeHistory"></a>

### bedrock-stats-storage-redis.purgeHistory(options) ⇒ <code>Promise</code>
Purge stats history.

**Kind**: static method of [<code>bedrock-stats-storage-redis</code>](#module_bedrock-stats-storage-redis)  
**Returns**: <code>Promise</code> - The Redis transaction summary.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | The options to use. |
| options.beforeDate | <code>number</code> | All history before this   date(ms since epoch) will be purged from history. |

