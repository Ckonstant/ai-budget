const { execSync } = require('child_process');

// Run commands to update the database
try {
  console.log('Regenerating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('Pushing schema changes to database...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('✅ Database schema updated successfully');
} catch (error) {
  console.error('❌ Error updating database schema:', error.message);
  process.exit(1);
}