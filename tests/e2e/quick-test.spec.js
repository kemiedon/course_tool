import { test, expect } from '@playwright/test';
import path from 'path';

// Test data from TEST_DATA.md
const testData = {
  topic: '打造 AI 自學力，用 Gemini 3+ NotebookLM 讓孩子自主學習',
  audience: '國小 5 年級以上到國中 2 年級的家長',
  description: '這個課程是針對國小高年級到國中二年級的學生，主要教他們認識市面上幾個常見的多模態 AI 工具，例如 Gemini、ChatGPT 以及 Perplexity',
  totalHours: '10',
  hoursPerDay: '2',
  startDate: '2026-01-26',
  startTime: '09:10',
  endTime: '10:10'
};

function logSection(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(60)}\n`);
}

function logStep(step, description) {
  console.log(`[Step ${step}] ${description}`);
}

test.describe('Course Creation E2E Test - Quick Version', () => {
  test('Create course and capture screenshots', async ({ page }) => {
    test.setTimeout(180000);

    logSection('Starting E2E Test: Create New Course');
    
    // Navigate
    logStep(1, 'Navigate to course creation page');
    await page.goto('http://localhost:5173/course/create');
    await page.waitForTimeout(2000);
    console.log('   ✓ Page loaded');

    // Fill basic info
    logStep(2, 'Fill basic information');
    await page.fill('input[placeholder*="主題"]', testData.topic);
    await page.fill('input[placeholder*="客群"]', testData.audience);
    await page.fill('textarea', testData.description);
    console.log('   ✓ Basic info filled');

    // Fill schedule
    logStep(3, 'Fill scheduling information');
    await page.fill('input[type="number"]>>nth=0', testData.totalHours);
    await page.fill('input[type="number"]>>nth=1', testData.hoursPerDay);
    await page.fill('input[type="date"]', testData.startDate);
    
    // Select weekdays
    const weekdays = ['週一', '週二', '週三', '週四', '週五'];
    for (const day of weekdays) {
      await page.click(`text=${day}`);
      await page.waitForTimeout(200);
    }
    
    await page.fill('input[type="time"]>>nth=0', testData.startTime);
    await page.fill('input[type="time"]>>nth=1', testData.endTime);
    console.log('   ✓ Schedule filled');

    // Wait for calendar
    await page.waitForTimeout(3000);

    // Screenshot 1: Calendar
    logStep(4, 'Capture calendar screenshot');
    const screenshotPath1 = path.join(process.cwd(), 'screenshots', '01_course_calendar.png');
    await page.screenshot({ path: screenshotPath1, fullPage: true });
    console.log(`   ✓ Screenshot saved: 01_course_calendar.png`);

    // Next to curriculum
    logStep(5, 'Proceed to curriculum generation');
    await page.click('button:has-text("下一步")');
    await page.waitForTimeout(2000);
    console.log('   ✓ Navigated to curriculum step');

    // Generate curriculum (if button exists)
    const generateBtn = await page.$('button:has-text("生成")');
    if (generateBtn) {
      logStep(6, 'Generate curriculum');
      await generateBtn.click();
      console.log('   ⏳ Generating curriculum...');
      await page.waitForTimeout(10000); // Wait for AI generation
    }

    // Screenshot 2: Curriculum
    logStep(7, 'Capture curriculum screenshot');
    const screenshotPath2 = path.join(process.cwd(), 'screenshots', '02_curriculum_generated.png');
    await page.screenshot({ path: screenshotPath2, fullPage: true });
    console.log(`   ✓ Screenshot saved: 02_curriculum_generated.png`);

    // Next to infographic
    logStep(8, 'Proceed to infographic generation');
    await page.click('button:has-text("下一步")');
    await page.waitForTimeout(3000);
    console.log('   ✓ Navigated to infographic step');

    // Next to promotion
    logStep(9, 'Proceed to promotion');
    await page.click('button:has-text("下一步")');
    await page.waitForTimeout(2000);
    console.log('   ✓ Navigated to promotion step');

    // Screenshot 3: Promotion
    logStep(10, 'Capture final screenshot');
    const screenshotPath3 = path.join(process.cwd(), 'screenshots', '03_promotion_result.png');
    await page.screenshot({ path: screenshotPath3, fullPage: true });
    console.log(`   ✓ Screenshot saved: 03_promotion_result.png`);

    logSection('Test Completed Successfully');
    console.log('✅ All screenshots captured!');
    console.log('\n📸 Screenshots:');
    console.log('   1. 01_course_calendar.png');
    console.log('   2. 02_curriculum_generated.png');
    console.log('   3. 03_promotion_result.png');
  });
});
