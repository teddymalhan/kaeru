import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

// Configure Amplify in server/runtime contexts (imported by server components)
Amplify.configure(outputs);

export {}; // module side-effect only


