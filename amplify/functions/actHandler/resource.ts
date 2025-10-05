import { defineFunction } from '@aws-amplify/backend';

export const actHandler = defineFunction({
  name: 'actHandler',
  entry: './index.ts'
});
