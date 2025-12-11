# E2E Test - Course Creation

## Purpose

This test simulates a real user creating a course through the browser.

## Test Flow

1. Navigate to course creation page
2. Fill basic information (topic, audience, description)
3. Setup scheduling (hours, dates, times)
4. **Capture Screenshot**: Course Calendar
5. Generate curriculum with AI
6. **Capture Screenshot**: Generated Curriculum
7. Generate infographics with AI
8. Generate promotion content
9. **Capture Screenshot**: Promotion & Infographics

## Run Test

```bash
npm run test:e2e
```

## Screenshots Location

All screenshots will be saved to: `screenshots/`

- 01_course_calendar.png
- 02_curriculum_generated.png
- 03_promotion_and_infographics.png

## Console Output

Test progress will be displayed in shell with English messages:

- Step-by-step progress
- Screenshot confirmations
- Test data summary
- Final results

No external HTML reports will be generated.
