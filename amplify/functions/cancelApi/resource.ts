import { defineFunction } from '@aws-amplify/backend';

export const cancelApi = defineFunction({
  name: 'cancelApi',
  entry: './index.ts'
});
