# IngestTransactions Architecture

## System Architecture Overview

```mermaid
graph TB
    %% External Systems
    Plaid[Plaid API]
    Bank[Bank/Financial Institution]

    %% Webhook Entry Point
    Webhook[Plaid Webhook<br/>API Gateway Endpoint]

    %% Lambda Function
    Lambda[IngestTransactions<br/>Lambda Function]

    %% AWS Services
    DDB[(DynamoDB<br/>Items & Cursors)]
    SQS[SQS Queue<br/>Transaction Events]

    %% Downstream Processing
    Processor[Transaction Processor<br/>Lambda/Service]
    AppDB[(Application<br/>Database)]

    %% Data Flow
    Bank -->|Transaction Data| Plaid
    Plaid -->|Webhook Event| Webhook
    Webhook -->|HTTP POST| Lambda

    Lambda -->|Get Item Data| DDB
    DDB -->|Access Token & Cursor| Lambda

    Lambda -->|Sync Request| Plaid
    Plaid -->|Transaction Data| Lambda

    Lambda -->|Update Cursor| DDB
    Lambda -->|Send Messages| SQS

    SQS -->|Process Events| Processor
    Processor -->|Store Transactions| AppDB

    %% Styling
    classDef external fill:#e1f5fe
    classDef aws fill:#ff9800
    classDef lambda fill:#4caf50
    classDef storage fill:#9c27b0

    class Plaid,Bank external
    class Webhook,SQS,DDB aws
    class Lambda,Processor lambda
    class AppDB storage
```

## Detailed Data Flow Diagram

```mermaid
sequenceDiagram
    participant Bank as Bank/Institution
    participant Plaid as Plaid API
    participant Webhook as API Gateway
    participant Lambda as IngestTransactions
    participant DDB as DynamoDB
    participant SQS as SQS Queue
    participant Processor as Downstream Processor

    %% Transaction occurs
    Bank->>Plaid: New transaction occurs

    %% Webhook notification
    Plaid->>Webhook: POST /webhook<br/>{webhook_code: SYNC_UPDATES_AVAILABLE}
    Webhook->>Lambda: Invoke function

    %% Webhook validation
    Lambda->>Lambda: Validate webhook signature<br/>(HMAC-SHA256)

    %% Get stored data
    Lambda->>DDB: GetItem(userId, itemId)
    DDB->>Lambda: {access_token, cursor, ...}

    %% Sync transactions
    Lambda->>Plaid: POST /transactions/sync<br/>{access_token, cursor}
    Plaid->>Lambda: {added, modified, removed, next_cursor}

    %% Process results
    Lambda->>Lambda: Build SQS messages<br/>for each transaction

    %% Store results
    Lambda->>DDB: UpdateItem(cursor = next_cursor)
    Lambda->>SQS: SendMessageBatch([messages])

    %% Response
    Lambda->>Webhook: HTTP 200 OK
    Webhook->>Plaid: HTTP 200 OK

    %% Downstream processing
    SQS->>Processor: Poll messages
    Processor->>Processor: Process transaction events<br/>(INSERT/MODIFY/REMOVE)
```

## Function Internal Architecture

```mermaid
graph TD
    %% Entry Point
    Handler[Lambda Handler]

    %% Validation
    Validate[validateWebhook]

    %% Core Functions
    GetUser[getUserIdByItem]
    GetItem[getItemFromDB]
    Sync[syncTransactions]
    Store[storeCursor]

    %% Message Processing
    Build[buildTransactionMessage]
    Send[sendMessages]

    %% External Clients
    PlaidClient[Plaid API Client]
    DDBClient[DynamoDB Client]
    SQSClient[SQS Client]

    %% Flow
    Handler --> Validate
    Validate --> GetUser
    GetUser --> GetItem
    GetItem --> Sync

    Sync --> PlaidClient
    Sync --> Build
    Build --> Send
    Send --> SQSClient

    Sync --> Store
    Store --> DDBClient
    GetItem --> DDBClient

    %% Styling
    classDef entry fill:#2196f3
    classDef core fill:#4caf50
    classDef client fill:#ff9800
    classDef validation fill:#e91e63

    class Handler entry
    class Validate validation
    class GetUser,GetItem,Sync,Store,Build,Send core
    class PlaidClient,DDBClient,SQSClient client
```

## Data Models

```mermaid
erDiagram
    %% DynamoDB Item Structure
    ITEM {
        string pk "USER#userId#ITEM#itemId"
        string sk "v0"
        string access_token "Plaid access token"
        string cursor "Sync cursor position"
        string updated_at "ISO 8601 timestamp"
        string item_id "Plaid item ID"
        string user_id "Application user ID"
    }

    %% SQS Message Structure
    SQS_MESSAGE {
        string Id "Message ID"
        int DelaySeconds "0"
        object MessageAttributes "Metadata"
        string MessageBody "Transaction JSON"
    }

    MESSAGE_ATTRIBUTES {
        string ItemId "Plaid item ID"
        string UserId "Application user ID"
        string TransactionId "Plaid transaction ID"
        string EventName "INSERT|MODIFY|REMOVE"
    }

    %% Transaction Body Structure
    TRANSACTION_BODY {
        string pk "USER#userId#ITEM#itemId"
        string sk "TRANSACTION#transactionId"
        string gsi1pk "USER#userId#ITEM#itemId#TRANSACTIONS"
        string gsi1sk "TRANSACTION#date#transactionId"
        object transaction_data "Full Plaid transaction"
    }

    SQS_MESSAGE ||--|| MESSAGE_ATTRIBUTES : contains
    SQS_MESSAGE ||--|| TRANSACTION_BODY : contains
```

## Error Handling Flow

```mermaid
graph TD
    Start[Webhook Received]

    %% Validation Checks
    ValidSig{Valid Signature?}
    ValidJSON{Valid JSON?}
    ValidFields{Required Fields?}

    %% Database Operations
    GetUser{User Found?}
    GetItem{Item Found?}

    %% Plaid API Call
    PlaidSync{Sync Success?}
    ErrorType{Error Type?}

    %% Error Responses
    BadSig[400 - Invalid Signature]
    BadJSON[400 - Invalid JSON]
    BadFields[400 - Missing Fields]
    UserNotFound[404 - User Not Found]
    ItemNotFound[404 - Item Not Found]
    ItemError[Handle Item Error]
    RateLimit[Handle Rate Limit]
    APIError[Handle API Error]
    Success[200 - Success]

    %% Flow
    Start --> ValidSig
    ValidSig -->|No| BadSig
    ValidSig -->|Yes| ValidJSON
    ValidJSON -->|No| BadJSON
    ValidJSON -->|Yes| ValidFields
    ValidFields -->|No| BadFields
    ValidFields -->|Yes| GetUser
    GetUser -->|No| UserNotFound
    GetUser -->|Yes| GetItem
    GetItem -->|No| ItemNotFound
    GetItem -->|Yes| PlaidSync
    PlaidSync -->|No| ErrorType
    PlaidSync -->|Yes| Success

    ErrorType -->|ITEM_ERROR| ItemError
    ErrorType -->|RATE_LIMIT_EXCEEDED| RateLimit
    ErrorType -->|API_ERROR| APIError

    %% Styling
    classDef error fill:#f44336
    classDef success fill:#4caf50
    classDef decision fill:#2196f3

    class BadSig,BadJSON,BadFields,UserNotFound,ItemNotFound,ItemError,RateLimit,APIError error
    class Success success
    class ValidSig,ValidJSON,ValidFields,GetUser,GetItem,PlaidSync,ErrorType decision
```

## Deployment Architecture

```mermaid
graph TB
    %% API Gateway
    APIGW[API Gateway<br/>Webhook Endpoint]

    %% Lambda
    subgraph "Lambda Function"
        Runtime[Node.js Runtime]
        Code[IngestTransactions Code]
        Layers[AWS SDK Layers]
    end

    %% AWS Services
    subgraph "Storage & Messaging"
        DDB[(DynamoDB Table<br/>Items & Cursors)]
        SQS[SQS Queue<br/>Transaction Events]
        CW[CloudWatch Logs]
    end

    %% IAM & Security
    subgraph "Security"
        Role[Lambda Execution Role]
        Secrets[Environment Variables]
        KMS[KMS Key<br/>Encryption]
    end

    %% External
    PlaidAPI[Plaid API<br/>External Service]

    %% Connections
    APIGW --> Runtime
    Runtime --> Code
    Code --> Layers

    Code --> DDB
    Code --> SQS
    Code --> CW
    Code --> PlaidAPI

    Role --> DDB
    Role --> SQS
    Role --> CW

    Secrets --> Code
    KMS --> DDB

    %% Styling
    classDef lambda fill:#ff9800
    classDef aws fill:#232f3e
    classDef security fill:#d32f2f
    classDef external fill:#1976d2

    class Runtime,Code,Layers lambda
    class APIGW,DDB,SQS,CW aws
    class Role,Secrets,KMS security
    class PlaidAPI external
```

## Key Improvements Summary

### 🔄 **Before vs After**

```mermaid
graph LR
    subgraph "Before (Original)"
        B1[Basic webhook handler]
        B2[TODO comments]
        B3[No database integration]
        B4[No error categorization]
        B5[No message queuing]
    end

    subgraph "After (Improved)"
        A1[Full webhook validation]
        A2[Database operations]
        A3[Cursor management]
        A4[Error categorization]
        A5[SQS message queuing]
        A6[Batch processing]
        A7[Security validation]
    end

    B1 -.->|Enhanced| A1
    B2 -.->|Implemented| A2
    B3 -.->|Added| A3
    B4 -.->|Improved| A4
    B5 -.->|Added| A5

    A6[Batch Processing]
    A7[Security Validation]

    %% Styling
    classDef before fill:#ffcdd2
    classDef after fill:#c8e6c9

    class B1,B2,B3,B4,B5 before
    class A1,A2,A3,A4,A5,A6,A7 after
```

This architecture provides a robust, scalable solution for processing Plaid transaction webhooks with proper error handling, security, and downstream message processing capabilities.
