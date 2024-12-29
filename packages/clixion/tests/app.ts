import { Program } from '../src/core';

export class Application extends Program<{
  name?: string;
  yes?: boolean;
  no?: boolean;
}> {
  configure() {
    this.strict()
      .interactive()
      .command('hello', 'Say hello')
      .argument('name', {})
      .usage('npm hello <name>')
      .example('npm hello siguici');
  }

  validate(definition: { name?: string; yes?: boolean; no?: boolean }) {
    const name = definition.name ?? 'World';

    return { name };
  }

  async interact(definition: { name?: string; yes?: boolean; no?: boolean }) {
    const name =
      definition.name === undefined
        ? await this.scanString('What is your name?', 'World')
        : definition.name;

    return { name };
  }

  execute(input: Required<{ name: string }>): number {
    this.info(`Hello ${input.name}`);

    return 0;
  }
}

const app = new Application('hello', '0.0.0');

app.run();
