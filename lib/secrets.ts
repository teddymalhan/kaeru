// lib/secrets.ts
import {
  SecretsManagerClient,
  GetSecretValueCommand,
  CreateSecretCommand,
  PutSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { fromIni } from "@aws-sdk/credential-providers"; // <--- make sure you install this

// Use your local profile when AWS env vars aren't set
const region = process.env.AWS_REGION || "us-east-2";
const profile = process.env.AWS_PROFILE || "dummy_aws_profile";

const sm = new SecretsManagerClient({
  region,
  credentials: fromIni({ profile }),
});

export async function readSecret(name: string) {
  const out = await sm.send(new GetSecretValueCommand({ SecretId: name }));
  return out.SecretString ?? undefined;
}

export async function upsertSecret(name: string, value: string) {
  try {
    await sm.send(new CreateSecretCommand({ Name: name, SecretString: value }));
  } catch {
    await sm.send(new PutSecretValueCommand({ SecretId: name, SecretString: value }));
  }
}
