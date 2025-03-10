---
mapped_pages:
  - https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/suggest_examples.html
---

# Suggest [suggest_examples]

The suggest feature suggests similar looking terms based on a provided text by using a suggester. *Parts of the suggest feature are still under development.*

The suggest request part is defined alongside the query part in a `search` request. If the query part is left out, only suggestions are returned.

```js
'use strict'

const { Client } = require('@elastic/elasticsearch')
const client = new Client({
  cloud: { id: '<cloud-id>' },
  auth: { apiKey: 'base64EncodedKey' }
})

async function run () {
  const bulkResponse = await client.bulk({
    refresh: true,
    operations: [
      { index: { _index: 'game-of-thrones' } },
      {
        character: 'Ned Stark',
        quote: 'Winter is coming.'
      },

      { index: { _index: 'game-of-thrones' } },
      {
        character: 'Daenerys Targaryen',
        quote: 'I am the blood of the dragon.'
      },

      { index: { _index: 'game-of-thrones' } },
      {
        character: 'Tyrion Lannister',
        quote: 'A mind needs books like a sword needs a whetstone.'
      }
    ]
  })

  if (bulkResponse.errors) {
    console.log(bulkResponse)
    process.exit(1)
  }

  const result = await client.search({
    index: 'game-of-thrones',
    query: {
      match: { quote: 'winter' }
    },
    suggest: {
      gotsuggest: {
        text: 'winter',
        term: { field: 'quote' }
      }
    }
  })

  console.log(result)
}

run().catch(console.log)
```

