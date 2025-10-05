import { defineFunction } from '@aws-amplify/backend';

export const cancelEmail = defineFunction({
  name: 'cancelEmail',
  entry: './index.ts'
});
