import which from 'which';
import whichPm from 'which-pm-runs';
import { $, exec, processOptions } from './process';

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

  async $(args: string | string[], opts = processOptions) {
    args = Array.isArray(args) ? args : [args];
    if (['exec', 'dlx'].includes(args[0])) {
      switch (this.name) {
        case 'pnpm':
        case 'yarn':
          break;
        case 'bun':
        case 'npm': {
          args = ['x', ...args.slice(1)];
          break;
        }
        default: {
          args = ['run', ...args.slice(1)];
          break;
        }
      }
    }

    return $(this.realname, args, opts);
  }

  async install(options = processOptions) {
    return this.$('install', options);
  }

  async run(script: string, options = processOptions) {
    return this.$(['run', ...script.split(/\s+/)], options);
  }

  async exec(command: string, options = processOptions) {
    return this.$(['exec', ...command.split(/\s+/)], options);
  }

  async dlx(binary: string, options = processOptions) {
    return this.$(['dlx', ...binary.split(/\s+/)], options);
  }

  async x(executable: string, options = processOptions) {
    if (this.in(['pnpm', 'yarn'])) {
      try {
        await this.exec(executable, options);
      } catch (e: any) {
        await this.dlx(executable, options);
      }
    } else {
      await this.dlx(executable, options);
    }
  }
}

export function pm(name: string): PackageManager {
  return new PackageManager(name);
}

const _pm: PackageManager = pm(whichPm()?.name || 'npm');

export default _pm;
