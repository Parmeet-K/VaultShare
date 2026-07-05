import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const storageRoot = path.resolve(dirname, '../../storage/encrypted');

export async function saveEncryptedObject(buffer) {
  await fs.mkdir(storageRoot, { recursive: true });
  const key = `${uuid()}.vault`;
  await fs.writeFile(path.join(storageRoot, key), buffer);
  return key;
}

export async function readEncryptedObject(key) {
  return fs.readFile(path.join(storageRoot, key));
}
