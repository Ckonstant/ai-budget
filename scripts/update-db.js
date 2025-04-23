const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to run a command and handle errors
function runCommand(command) {
  try {
    console.log(`Running: ${command}`);
    const output = execSync(command, { encoding: 'utf8' });
    console.log(output);
    return { success: true, output };
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error.message);
    return { success: false, error: error.message };
  }
}

// Check and update Prisma schema
console.log('Checking User model for settings relation...');

// Regenerate Prisma client
console.log('Regenerating Prisma client...');
runCommand('npx prisma generate');

// Push schema changes to database
console.log('Pushing schema to database...');
const pushResult = runCommand('npx prisma db push --force-reset');

if (pushResult.success) {
  console.log('Database schema updated successfully.');
} else {
  console.log('Database push failed. Try direct migration...');
  runCommand('npx prisma migrate dev --name add_user_settings');
}

console.log('Database update process completed.');