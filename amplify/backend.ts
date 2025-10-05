import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { actHandler } from './functions/actHandler/resource';
import { cancelApi } from './functions/cancelApi/resource';
import { cancelEmail } from './functions/cancelEmail/resource';
import { cancelViaVapi } from './functions/cancelViaVapi/resource';
import { disputeViaVapi } from './functions/disputeViaVapi/resource';

const backend = defineBackend({
  auth,
  data,
  actHandler,
  cancelApi,
  cancelEmail,
  cancelViaVapi,
  disputeViaVapi,
});
