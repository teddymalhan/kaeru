import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== CANCEL MY STUFF DATA MODELS =========================================
This section defines the data models for the Cancel My Stuff application:
- Transaction: Represents financial transactions from bank/credit card data
- DetectionItem: Represents subscription items detected in transactions
- Artifact: Represents files, documents, or data related to transactions and detections
=========================================================================*/
const schema = a.schema({
  Transaction: a
    .model({
      amount: a.float().required(),
      date: a.date().required(),
      description: a.string().required(),
      merchant: a.string(),
      category: a.string(),
      // Relationships
      detectionItems: a.hasMany("DetectionItem", "transactionId"),
      artifacts: a.hasMany("Artifact", "transactionId"),
    })
    .authorization((allow: any) => [
      allow.owner(),
      allow.publicApiKey().to(["create", "read"]),
    ]),

  DetectionItem: a
    .model({
      itemName: a.string().required(),
      subscriptionType: a.enum(["MONTHLY", "ANNUAL", "WEEKLY", "ONE_TIME"]),
      status: a.enum(["DETECTED", "CONFIRMED", "CANCELLED", "IGNORED"]),
      detectedAmount: a.float(),
      confidence: a.float(),
      cancellationDate: a.date(),
      cancellationUrl: a.url(),
      notes: a.string(),
      // Reference fields for relationships
      transactionId: a.id().required(),
      // Relationships
      transaction: a.belongsTo("Transaction", "transactionId"),
      artifacts: a.hasMany("Artifact", "detectionItemId"),
    })
    .authorization((allow: any) => [
      allow.owner().to(["create", "read", "update", "delete"]),
      allow.publicApiKey().to(["create", "read"]),
    ]),

  Artifact: a
    .model({
      filePath: a.string().required(),
      contentType: a.string().required(),
      fileSize: a.integer(),
      metadata: a.customType({
        originalFileName: a.string(),
        uploadedAt: a.datetime(),
        tags: a.string().array(),
      }),
      artifactType: a.enum(["SCREENSHOT", "DOCUMENT", "RECEIPT", "EMAIL", "OTHER"]),
      // Reference fields for relationships
      transactionId: a.id(),
      detectionItemId: a.id(),
      // Relationships
      transaction: a.belongsTo("Transaction", "transactionId"),
      detectionItem: a.belongsTo("DetectionItem", "detectionItemId"),
    })
    .authorization((allow: any) => [
      allow.owner().to(["create", "read", "update", "delete"]),
      allow.publicApiKey().to(["create", "read"]),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
