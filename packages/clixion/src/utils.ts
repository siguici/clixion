import fs from 'node:fs';
import os from 'node:os';
import path, { join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const __filename = getModuleFilename();
export const __dirname = path.dirname(__filename);

export function getModuleFilename(): string {
  const error = new Error();
  const stack = error.stack;
  const matches = stack?.match(
    /^Error\s+at[^\r\n]+\s+at *(?:[^\r\n(]+\((.+?)(?::\d+:\d+)?\)|(.+?)(?::\d+:\d+)?) *([\r\n]|$)/
  );
  const filename = matches?.[1] || matches?.[2];
  if (filename?.startsWith('file://')) {
    return fileURLToPath(filename);
  }
  return filename || fileURLToPath(import.meta.url);
}

export function isCI(): boolean {
  return Boolean(process.env.CI || process.env.GITHUB_ACTIONS);
}

export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

export function isHome(dir: string): boolean {
  return dir.startsWith(process.env.HOME ?? '~/');
}

export function resolveAbsoluteDir(dir: string) {
  return isHome(dir) ? resolve(os.homedir(), dir) : resolve(process.cwd(), dir);
}

export function resolveRelativeDir(dir: string) {
  return isHome(dir)
    ? relative(os.homedir(), dir)
    : relative(process.cwd(), dir);
}

export function notEmptyDir(dir: string): boolean {
  return fs.existsSync(dir) && fs.readdirSync(dir).length > 0;
}

// Used from https://github.com/QwikDev/qwik/blob/main/packages/create-qwik/src/helpers/clearDir.ts
export const clearDir = async (dir: string) => {
  const files = await fs.promises.readdir(dir);

  return await Promise.all(
    files.map((pathToFile) =>
      fs.promises.rm(join(dir, pathToFile), { recursive: true })
    )
  );
};

export function sanitizePackageName(name: string): string {
  name = name
    .trim()
    .replace(/\\/g, '/')
    .split('/')
    .filter(Boolean)
    .map((segment) =>
      segment
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-')
        .replace(/^-+|-+$/g, '')
    )
    .join('-');
  name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  name = name.replace(/[^a-zA-Z0-9\-._~/@]/g, '-');
  name = name.replace(/^[-.]+|[-.]+$/g, '');
  name = name.replace(/[-.]{2,}/g, '-');
  name = name.toLowerCase();

  return name;
}
