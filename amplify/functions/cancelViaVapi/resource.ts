import { defineFunction } from '@aws-amplify/backend';

export const cancelViaVapi = defineFunction({
  name: 'cancelViaVapi',
  entry: './index.ts',
  environment: {
    VAPI_API_KEY: '0d0966bc-3a58-4838-aa2a-5a0789a9d9ce',
    VAPI_CANCELLATION_ASSISTANT_ID: '8e23c7bf-fd11-4f81-b009-27a7e0567a32'
  }
});
