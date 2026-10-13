import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();

function getAllKeys(obj: Record<string, any>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...getAllKeys(v, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

function main() {
  console.log('🔍 Running MediCare Hub static lint & code health checks...');

  // 1. Run TypeScript compiler check
  execSync('npx tsc --noEmit', { stdio: 'inherit', cwd: rootDir });

  // 2. Verify .env.example and .gitignore
  const envExamplePath = path.join(rootDir, '.env.example');
  const gitignorePath = path.join(rootDir, '.gitignore');
  if (!fs.existsSync(envExamplePath)) {
    throw new Error('Missing .env.example file');
  }
  if (!fs.existsSync(gitignorePath)) {
    throw new Error('Missing .gitignore file');
  }
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (!gitignoreContent.includes('.env')) {
    throw new Error('.env is not listed in .gitignore');
  }

  // 3. Verify i18n key parity across en.json, ur.json, sd.json
  const en = JSON.parse(fs.readFileSync(path.join(rootDir, 'messages/en.json'), 'utf8'));
  const ur = JSON.parse(fs.readFileSync(path.join(rootDir, 'messages/ur.json'), 'utf8'));
  const sd = JSON.parse(fs.readFileSync(path.join(rootDir, 'messages/sd.json'), 'utf8'));

  const enKeys = getAllKeys(en).sort();
  const urKeys = getAllKeys(ur).sort();
  const sdKeys = getAllKeys(sd).sort();

  const missingInUr = enKeys.filter((k) => !urKeys.includes(k));
  const missingInSd = enKeys.filter((k) => !sdKeys.includes(k));

  if (missingInUr.length > 0) {
    throw new Error(`Missing keys in messages/ur.json: ${missingInUr.join(', ')}`);
  }
  if (missingInSd.length > 0) {
    throw new Error(`Missing keys in messages/sd.json: ${missingInSd.join(', ')}`);
  }

  // 4. Verify no hardcoded admin credentials remain in src/lib/adminAuth.ts
  const adminAuthContent = fs.readFileSync(
    path.join(rootDir, 'src/lib/adminAuth.ts'),
    'utf8'
  );
  if (adminAuthContent.includes('MediCare@2026')) {
    throw new Error('Hardcoded fallback admin password detected in src/lib/adminAuth.ts');
  }

  console.log('✅ Lint & code health checks passed with 0 errors.');
}

main();
