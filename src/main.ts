import fs from 'fs'
import rl from 'readline'
import { Run } from './run'

const runtime = new Run();

export async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1) {
    console.log("Usage: mlox [script]")
    process.exit(64)
  } else if (args.length === 1) {
    runFile(args[0]);
  } else {
    await runPrompt();
  }
}

function runFile(path: string) {
  const fileContent = fs.readFileSync(path).toString();
  const returnCode = runtime.runProgram(fileContent)
  if (returnCode !== 0) {
    process.exit(returnCode);
  }
}

async function runPrompt() {
  const io = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  io.setPrompt('> ');
  async function getLine(): Promise<string> {
    io.prompt();
    return new Promise(r => io.once('line', r))
  }

  while (true) {
    const line = await getLine();
    if (line.length === 0) {
      io.close();
      break;
    }
    runtime.runLine(line);
  }
}

await main();