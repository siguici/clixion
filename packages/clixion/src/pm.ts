import which from 'which';
import whichPm from 'which-pm-runs';
import { exec } from './process';

export class PackageManager {
  constructor(readonly name: string) {}

  get realname(): string {
    return which.sync(this.name);
  }

  runCommand(): string {
    const name = this.name;

    if (this.in(['npm', 'bun'])) {
      return `${name} run`;
    }

    return name;
  }

  in(names: string[]): boolean {
    return names.includes(this.name);
  }

  is(name: string): boolean {
    return this.name === name;
  }

  isNpm(): boolean {
    return this.is('npm');
  }

  isYarn(): boolean {
    return this.is('yarn');
  }

  isPnpm(): boolean {
    return this.is('pnpm');
  }

  isBun(): boolean {
    return this.is('bun');
  }

  async isInstalled(): Promise<boolean> {
    try {
      await this.version();
      return true;
    } catch (_) {
      return false;
    }
  }

  async version(): Promise<string> {
    return await exec(`${this.realname} --version`);
  }
}

export function pm(name: string): PackageManager {
  return new PackageManager(name);
}

const _pm: PackageManager = pm(whichPm()?.name || 'npm');

export default _pm;
