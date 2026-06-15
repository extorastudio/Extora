interface CliCommandOptions {
  name: string;
  description: string;
  args?: { name: string; description?: string; required?: boolean }[];
  options?: { flags: string; description: string; defaultValue?: unknown }[];
  action: (args: Record<string, string>, options: Record<string, unknown>) => Promise<void> | void;
}

const registeredCommands: CliCommandOptions[] = [];

export function registerCliCommand(command: CliCommandOptions): void {
  registeredCommands.push(command);
}

export function getRegisteredCommands(): CliCommandOptions[] {
  return [...registeredCommands];
}

export function createCliCommand(
  name: string,
  description: string,
  action: (args: Record<string, string>, options: Record<string, unknown>) => Promise<void> | void,
): CliCommandOptions {
  return { name, description, action };
}
