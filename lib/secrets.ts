// lib/secrets.ts
import {
  SecretsManagerClient,
  GetSecretValueCommand,
  CreateSecretCommand,
  PutSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const sm = new SecretsManagerClient({});

export async function readSecret(name: string) {
  const out = await sm.send(new GetSecretValueCommand({ SecretId: name }));
  return out.SecretString ?? undefined;
}

export async function upsertSecret(name: string, value: string) {
  try {
    await sm.send(new CreateSecretCommand({ Name: name, SecretString: value }));
  } catch {
    // if it already exists, update the current version
    await sm.send(new PutSecretValueCommand({ SecretId: name, SecretString: value }));
  }
}
