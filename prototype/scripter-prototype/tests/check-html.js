const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  await page.goto("http://localhost:3000/dashboard");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  // 点击折叠
  await page.click("button[aria-label='折叠导航']");
  await page.waitForTimeout(1000);

  // 获取所有按钮
  const buttons = await page.locator("button").all();
  console.log(`\n总按钮数: ${buttons.length}`);

  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];
    const visible = await btn.isVisible();
    const ariaLabel = await btn.getAttribute("aria-label");
    const className = await btn.getAttribute("class");

    console.log(`\n按钮 ${i + 1}:`);
    console.log(`  aria-label: ${ariaLabel || '(none)'}`);
    console.log(`  visible: ${visible}`);
    console.log(`  class: ${className?.substring(0, 100)} || '...'}`);
  }

  // 检查页面上是否有 fixed 定位的元素
  const fixedElements = await page.locator("*").filter(async el => {
    const position = await el.evaluate(e => window.getComputedStyle(e).position);
    return position === "fixed";
  }).all();

  console.log(`\n\nFixed 定位元素数: ${fixedElements.length}`);

  for (let i = 0; i < Math.min(10, fixedElements.length); i++) {
    const el = fixedElements[i];
    const tagName = await el.evaluate(e => e.tagName);
    const ariaLabel = await el.getAttribute("aria-label");
    console.log(`  ${tagName}: ${ariaLabel || '(no aria-label)'}`);
  }

  await browser.close();
})();
