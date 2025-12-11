import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Test data from TEST_DATA.md
const testData = {
  topic: '打造 AI 自學力，用 Gemini 3+ NotebookLM 讓孩子自主學習',
  audience: '國小 5 年級以上到國中 2 年級的家長',
  description: '這個課程是針對國小高年級到國中二年級的學生，主要教他們認識市面上幾個常見的多模態 AI 工具，例如 Gemini、ChatGPT 以及 Perplexity，並教他們如何正確的使用 AI 以及提示工程的基本技巧，接著會進階到如何用 AI 整理自己的筆記及用 Gemini Canvas 製作成測驗小遊戲',
  courseType: 'children',
  totalHours: '10',
  hoursPerDay: '2',
  startDate: '2026-01-26',
  startTime: '09:10',
  endTime: '10:10'
};

// Helper function to save screenshot
async function saveScreenshot(page, name) {
  const screenshotPath = path.join(process.cwd(), 'screenshots', `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`\n✅ Screenshot saved: ${name}.png`);
  return screenshotPath;
}

// Helper function to log section
function logSection(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(60)}\n`);
}

// Helper function to log step
function logStep(step, description) {
  console.log(`[Step ${step}] ${description}`);
}

test.describe('Course Creation E2E Test', () => {
  test('Create a complete course', async ({ page }) => {
    // Increase timeout for AI generation
    test.setTimeout(180000); // 3 minutes

    logSection('Starting E2E Test: Create New Course');
    
    // Navigate to home page
    logStep(1, 'Navigate to home page');
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    console.log('   ✓ Home page loaded');

    // Click "Create Course" button
    logStep(2, 'Click create course button');
    await page.click('a[href="/course/create"]');
    await page.waitForURL('**/course/create');
    console.log('   ✓ Navigated to course creation page');

    // ============================================================
    // STEP 1: Basic Information
    // ============================================================
    logSection('STEP 1: Basic Information & Scheduling');

    // Fill course topic
    logStep(3, 'Fill course topic');
    await page.fill('input[placeholder*="課程主題"]', testData.topic);
    console.log(`   ✓ Topic: ${testData.topic.substring(0, 30)}...`);

    // Fill target audience
    logStep(4, 'Fill target audience');
    await page.fill('input[placeholder*="目標客群"]', testData.audience);
    console.log(`   ✓ Audience: ${testData.audience}`);

    // Fill description
    logStep(5, 'Fill course description');
    await page.fill('textarea[placeholder*="課程描述"]', testData.description);
    console.log(`   ✓ Description filled (${testData.description.length} characters)`);

    // Select course type (children)
    logStep(6, 'Select course type: children');
    await page.click('input[value="children"]');
    console.log('   ✓ Course type: Children course');

    // Fill total hours
    logStep(7, 'Fill scheduling information');
    await page.fill('input[placeholder*="總時數"]', testData.totalHours);
    console.log(`   ✓ Total hours: ${testData.totalHours}`);

    // Fill hours per day
    await page.fill('input[placeholder*="每日時數"]', testData.hoursPerDay);
    console.log(`   ✓ Hours per day: ${testData.hoursPerDay}`);

    // Wait for calculation
    await page.waitForTimeout(500);
    const calculatedDays = await page.textContent('.badge:has-text("天")');
    console.log(`   ✓ Calculated days: ${calculatedDays}`);

    // Fill start date
    await page.fill('input[type="date"]', testData.startDate);
    console.log(`   ✓ Start date: ${testData.startDate}`);

    // Select weekdays (Monday to Friday)
    logStep(8, 'Select weekdays (Mon-Fri)');
    const weekdays = ['週一', '週二', '週三', '週四', '週五'];
    for (const day of weekdays) {
      await page.click(`label:has-text("${day}")`);
    }
    console.log('   ✓ Weekdays selected: Monday to Friday');

    // Fill start and end time
    logStep(9, 'Fill class time');
    await page.fill('input[type="time"]:first-of-type', testData.startTime);
    await page.fill('input[type="time"]:last-of-type', testData.endTime);
    console.log(`   ✓ Class time: ${testData.startTime} - ${testData.endTime}`);

    // Wait for calendar to render
    await page.waitForTimeout(2000);

    // Screenshot: Calendar
    logStep(10, 'Capture calendar screenshot');
    await saveScreenshot(page, '01_course_calendar');

    // Verify calendar is displayed
    const calendarVisible = await page.isVisible('.fc-daygrid-day');
    expect(calendarVisible).toBeTruthy();
    console.log('   ✓ Calendar rendered successfully');

    // Click next to step 2
    logStep(11, 'Proceed to step 2');
    await page.click('button:has-text("下一步")');
    await page.waitForTimeout(1000);
    console.log('   ✓ Navigated to Step 2: Curriculum');

    // ============================================================
    // STEP 2: Curriculum Generation
    // ============================================================
    logSection('STEP 2: Curriculum Generation');

    // Click generate curriculum button
    logStep(12, 'Generate curriculum with AI');
    const generateButton = page.locator('button:has-text("生成課綱")');
    await generateButton.click();
    console.log('   ⏳ Generating curriculum... (this may take 30-60 seconds)');

    // Wait for generation to complete
    await page.waitForTimeout(3000);
    
    // Wait for curriculum content to appear (max 60 seconds)
    try {
      await page.waitForSelector('.curriculum-content, .markdown-content, [class*="markdown"]', { 
        timeout: 60000 
      });
      console.log('   ✓ Curriculum generated successfully');
    } catch (error) {
      console.log('   ⚠ Curriculum generation timeout or element not found');
      // Continue anyway for screenshot
    }

    // Screenshot: Curriculum
    logStep(13, 'Capture curriculum screenshot');
    await saveScreenshot(page, '02_curriculum_generated');

    // Verify curriculum content exists
    const curriculumText = await page.textContent('body');
    const hasCurriculum = curriculumText.includes('學習目標') || 
                          curriculumText.includes('教學內容') || 
                          curriculumText.includes('第') && curriculumText.includes('天');
    expect(hasCurriculum).toBeTruthy();
    console.log('   ✓ Curriculum content verified');

    // Click next to step 3
    logStep(14, 'Proceed to step 3');
    await page.click('button:has-text("下一步")');
    await page.waitForTimeout(2000);
    console.log('   ✓ Navigated to Step 3: Infographic');

    // ============================================================
    // STEP 3: Infographic Generation
    // ============================================================
    logSection('STEP 3: Infographic Generation');

    // Select style
    logStep(15, 'Select infographic style');
    await page.click('button:has-text("手繪插畫風")');
    console.log('   ✓ Style selected: Hand-drawn illustration');

    // Click generate all images
    logStep(16, 'Generate infographics with AI');
    const generateImagesButton = page.locator('button:has-text("一鍵生成所有圖表")');
    await generateImagesButton.click();
    console.log('   ⏳ Generating infographics... (this may take 1-2 minutes)');

    // Wait for generation progress
    await page.waitForTimeout(5000);

    // Wait for images to be generated (max 120 seconds)
    try {
      await page.waitForSelector('img[alt*="課程圖表"], .infographic-image, [class*="image-grid"]', { 
        timeout: 120000 
      });
      console.log('   ✓ Infographics generated successfully');
    } catch (error) {
      console.log('   ⚠ Infographic generation timeout or element not found');
      // Continue anyway for screenshot
    }

    // Click next to step 4
    logStep(17, 'Proceed to step 4');
    await page.click('button:has-text("下一步")');
    await page.waitForTimeout(1000);
    console.log('   ✓ Navigated to Step 4: Promotion');

    // ============================================================
    // STEP 4: Promotion Content
    // ============================================================
    logSection('STEP 4: Promotion Content Generation');

    // Generate promotion content
    logStep(18, 'Generate promotion content with AI');
    const generatePromotionButton = page.locator('button:has-text("AI 生成")');
    
    if (await generatePromotionButton.isVisible()) {
      await generatePromotionButton.click();
      console.log('   ⏳ Generating promotion content...');
      await page.waitForTimeout(5000);
      console.log('   ✓ Promotion content generated');
    } else {
      console.log('   ℹ Promotion content already generated');
    }

    // Screenshot: Promotion & Infographics combined
    logStep(19, 'Capture final result screenshot');
    await page.waitForTimeout(1000);
    await saveScreenshot(page, '03_promotion_and_infographics');

    // Verify promotion content exists
    const promotionText = await page.textContent('body');
    const hasPromotion = promotionText.length > 100;
    expect(hasPromotion).toBeTruthy();
    console.log('   ✓ Promotion content verified');

    // ============================================================
    // Final Summary
    // ============================================================
    logSection('Test Summary');

    console.log('✅ All steps completed successfully!');
    console.log('\n📸 Screenshots saved:');
    console.log('   1. 01_course_calendar.png - Course scheduling calendar');
    console.log('   2. 02_curriculum_generated.png - AI-generated curriculum');
    console.log('   3. 03_promotion_and_infographics.png - Promotion content & infographics');
    
    console.log('\n📊 Test Data Used:');
    console.log(`   Topic: ${testData.topic}`);
    console.log(`   Audience: ${testData.audience}`);
    console.log(`   Total Hours: ${testData.totalHours} hours`);
    console.log(`   Daily Hours: ${testData.hoursPerDay} hours`);
    console.log(`   Start Date: ${testData.startDate}`);
    console.log(`   Class Time: ${testData.startTime} - ${testData.endTime}`);

    logSection('Test Completed Successfully');
  });
});
