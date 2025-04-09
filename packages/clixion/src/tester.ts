import type { Definition, Program } from '.';
import { isBoolean, isNumber, isString } from './console';

export class ProgramTester<
  T extends Definition,
  U extends Required<Omit<T, 'it' | 'yes' | 'no'>>
> {
  constructor(readonly program: Program<T, U>) {}

  intercept(question: string, answer: unknown): this {
    this.program.intercept(question, answer);

    return this;
  }

  async scanString(
    message: string,
    initialValue?: string
  ): Promise<ValueTester> {
    const value =
      initialValue === undefined
        ? await this.program.scanString(message)
        : await this.program.scanString(message, initialValue);

    return new ValueTester(value);
  }

  async scanBoolean(
    definition: T,
    message: string,
    initialValue?: boolean
  ): Promise<ValueTester> {
    const value =
      initialValue === undefined
        ? await this.program.scanBoolean(definition, message)
        : await this.program.scanBoolean(definition, message, initialValue);

    return new ValueTester(value);
  }

  async scanChoice(
    message: string,
    options: { value: string; label: string }[],
    initialValue?: string
  ): Promise<ValueTester> {
    const value =
      initialValue === undefined
        ? await this.program.scanChoice(message, options)
        : await this.program.scanChoice(message, options, initialValue);

    return new ValueTester(value);
  }

  parse(args: string[]): DefinitionTester<T> {
    return new DefinitionTester<T>(this.program.parse(args));
  }

  async interact(definition: T): Promise<DefinitionTester<U>> {
    return new DefinitionTester<U>(await this.program.interact(definition));
  }

  async execute(input: U): Promise<ResultTester> {
    const result = await this.program.execute(input);

    return new ResultTester(result);
  }

  async run(args: string[]): Promise<ResultTester> {
    const result = await this.program.run(args);

    return new ResultTester(result);
  }
}

export class DefinitionTester<T extends Definition> {
  constructor(readonly definition: T) {}

  has(key: string, ...keys: string[]): boolean {
    if (keys.length) {
      for (const k of [key, ...keys]) {
        if (!this.has(k)) {
          return false;
        }
      }

      return true;
    }

    return key in this.definition;
  }

  get(key: string): ValueTester {
    const input = Object.entries(this.definition).find(
      ([name, _]) => name === key
    );

    return new ValueTester(input ? input[1] : undefined);
  }
}

export class ValueTester {
  constructor(readonly value: unknown) {}

  isUndefined(): boolean {
    return typeof this.value === 'undefined';
  }

  isNull(): boolean {
    return this.value === null;
  }

  isBoolean(): boolean {
    return isBoolean(this.value);
  }

  isTrue(): boolean {
    return this.value === true;
  }

  isFalse(): boolean {
    return this.value === false;
  }

  isNumber(validate?: (value: number) => boolean): boolean {
    return isNumber(this.value) && validate ? validate(this.value) : true;
  }

  isString(validate?: (value: string) => boolean): boolean {
    return isString(this.value) && validate ? validate(this.value) : true;
  }

  equals(value: unknown): boolean {
    return this.value === value;
  }
}

export class ResultTester {
  constructor(readonly result: number) {}

  isSuccess(): boolean {
    return this.result === 0;
  }

  isFailure(): boolean {
    return this.result === 1;
  }

  isInvalid(): boolean {
    return this.result === 2;
  }

  isUnknown(): boolean {
    return ![0, 1, 2].includes(this.result);
  }
}
