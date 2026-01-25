const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  // 监听控制台消息
  page.on("console", msg => console.log("Browser:", msg.text()));

  console.log("导航到 Dashboard...");
  await page.goto("http://localhost:3000/dashboard");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1000);

  // 检查初始状态
  const leftSidebar = page.locator("aside").first();
  const leftBox1 = await leftSidebar.boundingBox();
  console.log(`初始左侧边栏: ${JSON.stringify(leftBox1)}`);

  const collapseBtn = page.locator("button[aria-label='折叠导航']").first();
  const isVisible = await collapseBtn.isVisible();
  console.log(`折叠按钮可见: ${isVisible}`);

  if (isVisible) {
    const btnBox = await collapseBtn.boundingBox();
    console.log(`折叠按钮位置: ${JSON.stringify(btnBox)}`);

    // 点击折叠按钮
    console.log("点击折叠按钮...");
    await collapseBtn.click();
    await page.waitForTimeout(800); // 等待过渡完成

    const leftBox2 = await leftSidebar.boundingBox();
    console.log(`点击后左侧边栏: ${JSON.stringify(leftBox2)}`);

    // 检查是否有展开按钮
    const expandBtn = page.locator("button[aria-label='展开导航']").first();
    const expandVisible = await expandBtn.isVisible();
    console.log(`展开按钮可见: ${expandVisible}`);

    if (expandVisible) {
      const expandBox = await expandBtn.boundingBox();
      console.log(`展开按钮位置: ${JSON.stringify(expandBox)}`);
    }

    // 截图
    await page.screenshot({ path: "docs/reports/analysis/13-debug-collapse.png", fullPage: true });
    console.log("截图已保存");
  }

  await page.waitForTimeout(3000);
  await browser.close();
})();
