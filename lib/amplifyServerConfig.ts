import { Amplify } from 'aws-amplify';
// Configure Amplify once for server/runtime contexts at module load
import amplifyOutputs from '../amplify_outputs.json';
Amplify.configure((amplifyOutputs as any).default ?? (amplifyOutputs as any));

export {}; // module side-effect only


