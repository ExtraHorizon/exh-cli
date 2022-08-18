import * as readline from 'readline';
import { asyncExec, epilogue } from '../helpers/util.mjs';

export const command = 'completion';
export const desc = 'Install shell completion for bash & zsh';
export const builder = (yargs: any) => epilogue(yargs).options({ });

export const handler = async () => {
  const isZsh = (process.env.SHELL?.includes('zsh') || process.env.ZSH_NAME?.includes('zsh')) ?? false;

  /* Check if already installed */
  try {
    const result = await asyncExec(`grep yargs_completions ${isZsh ? '~/.zshrc' : '~/.bashrc'}`);
    if (result.length > 0) {
      console.log('Completion already present ✅');
      return;
    }
  } catch (err) { /* */ }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Do you want to add completion to your shell (Y/n)? ', async yesno => {
    if (!yesno || yesno.toLowerCase() === 'y') {
      console.log(await asyncExec(`exh generate_completion >> ${isZsh ? '~/.zshrc' : '~/.bashrc'}`));
      console.log('Completion added ✅');
    } else {
      console.log('Completion not added ❌');
    }
    rl.close();
  });

  rl.on('close', () => {
    process.exit(0);
  });
};
