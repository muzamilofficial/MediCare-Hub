import { runPagesTests } from './pages.spec';
import { runBookingTests } from './booking.spec';
import { runChatbotTests } from './chatbot.spec';
import { runSecurityTests } from './security.spec';

async function main() {
  const start = Date.now();
  console.log('==============================================================');
  console.log('🏥 MEDICARE HUB — AUTOMATED QA & SECURITY TEST SUITE');
  console.log('==============================================================');

  try {
    await runPagesTests();
    await runBookingTests();
    await runChatbotTests();
    await runSecurityTests();

    const elapsedSec = ((Date.now() - start) / 1000).toFixed(2);
    console.log('\n==============================================================');
    console.log(`🎉 ALL AUTOMATED TEST SUITES PASSED (${elapsedSec}s)`);
    console.log('==============================================================');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILURE:', error);
    process.exit(1);
  }
}

main();
