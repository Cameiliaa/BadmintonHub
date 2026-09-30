import { randomBytes, scryptSync } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';

let muted = false;
const output = new Writable({ write(chunk, encoding, callback) { if (!muted) process.stdout.write(chunk); callback(); } });
const rl = createInterface({ input: process.stdin, output, terminal: !!process.stdin.isTTY });
try {
  const username = (await rl.question('Username admin: ')).trim();
  process.stdout.write('Password admin (minimal 12 karakter, input disembunyikan): ');
  muted = true;
  const password = await rl.question('');
  muted = false;
  process.stdout.write('\n');
  if (!/^[a-zA-Z0-9_.-]{3,64}$/.test(username)) throw new Error('Username harus 3–64 huruf, angka, titik, garis bawah, atau tanda minus.');
  if (password.length < 12 || password.length > 256) throw new Error('Password harus 12–256 karakter.');
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  let existing = '';
  try { existing = readFileSync('.env.local', 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  existing = existing.split(/\r?\n/).filter(line => !/^\s*ADMIN_(USERNAME|PASSWORD_HASH)\s*=/.test(line)).join('\n').trimEnd();
  writeFileSync('.env.local', `${existing}\nADMIN_USERNAME=${username}\nADMIN_PASSWORD_HASH=${salt}:${hash}\n`, { mode: 0o600 });
  console.log('Akun admin tersimpan. Restart server, lalu klik logo 5 kali untuk login.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally { muted = false; rl.close(); }
