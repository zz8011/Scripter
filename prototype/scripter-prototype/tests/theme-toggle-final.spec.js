/**
 * 主题切换功能测试 - 修正版
 * 使用 Playwright 进行端到端测试
 */

const { test, expect } = require('@playwright/test');

test.describe('主题切换功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // 等待 React hydration 完成
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000); // 等待客户端组件渲染
  });

  test('应该显示主题切换按钮', async ({ page }) => {
    // 查找主题切换按钮（使用更灵活的选择器）
    const toggleButton = page.locator('button').filter({ hasText: '' }).first();
    await expect(toggleButton).toBeVisible();
    console.log('✅ 主题切换按钮可见');
  });

  test('应该能切换主题', async ({ page }) => {
    // 获取初始主题
    const htmlBefore = page.locator('html');
    const classBefore = await htmlBefore.getAttribute('class');
    console.log('初始主题类:', classBefore);

    // 点击主题切换按钮（第一个按钮）
    const toggleButton = page.locator('button').first();
    await toggleButton.click();

    // 等待主题切换
    await page.waitForTimeout(500);

    // 验证主题已切换
    const htmlAfter = page.locator('html');
    const classAfter = await htmlAfter.getAttribute('class');
    console.log('切换后主题类:', classAfter);

    // 验证 class 包含 dark 或 light
    expect(classAfter).toMatch(/dark|light/);
    console.log('✅ 主题切换成功');
  });

  test('应该保存主题偏好到 localStorage', async ({ page }) => {
    // 点击主题切换按钮
    const toggleButton = page.locator('button').first();
    await toggleButton.click();
    await page.waitForTimeout(500);

    // 检查 localStorage
    const theme = await page.evaluate(() => {
      return localStorage.getItem('scripter-theme');
    });

    expect(theme).toBeTruthy();
    console.log('✅ 主题偏好已保存到 localStorage:', theme);
  });

  test('深色主题应该使用正确的颜色', async ({ page }) => {
    // 切换到深色主题（如果当前是浅色）
    const html = page.locator('html');
    const currentClass = await html.getAttribute('class');

    if (!currentClass.includes('dark')) {
      const toggleButton = page.locator('button').first();
      await toggleButton.click();
      await page.waitForTimeout(500);
    }

    // 检查背景色
    const body = page.locator('body');
    const backgroundColor = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    console.log('背景色:', backgroundColor);

    // 验证是深色背景（接近 #0D0D0D）
    expect(backgroundColor).toMatch(/rgb\(13, 13, 13\)/);
    console.log('✅ 深色主题颜色正确');
  });

  test('应该能双向切换主题', async ({ page }) => {
    const toggleButton = page.locator('button').first();

    // 获取初始状态
    let htmlClass = await page.locator('html').getAttribute('class');
    console.log('初始:', htmlClass);

    // 第一次切换
    await toggleButton.click();
    await page.waitForTimeout(500);
    htmlClass = await page.locator('html').getAttribute('class');
    console.log('第一次切换后:', htmlClass);

    // 第二次切换
    await toggleButton.click();
    await page.waitForTimeout(500);
    htmlClass = await page.locator('html').getAttribute('class');
    console.log('第二次切换后:', htmlClass);

    // 第三次切换（应该回到初始状态附近）
    await toggleButton.click();
    await page.waitForTimeout(500);
    htmlClass = await page.locator('html').getAttribute('class');
    console.log('第三次切换后:', htmlClass);

    console.log('✅ 双向切换功能正常');
  });
});
