import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { actHandler } from './functions/actHandler/resource';
import { cancelApi } from './functions/cancelApi/resource';
import { cancelEmail } from './functions/cancelEmail/resource';
import { ingestTransactions } from './functions/ingestTransactions/resource';

const backend = defineBackend({
  auth,
  data,
  actHandler,
  cancelApi,
  cancelEmail,
  ingestTransactions,
});
