import fs from 'fs'
import rl from 'readline'

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
  run(fileContent);
}

async function runPrompt() {
  const io = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  io.setPrompt('€');
  async function getLine(): Promise<string> {
    io.prompt();
    return new Promise(r => io.once('line',r))
  }

  while(true) {
    const line = await getLine();
    if (line.length === 0) {
      io.close();
      break;
    }
    run(line);
  }
}

function run(input: string) {
  console.log(input)
}

await main();