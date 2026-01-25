const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  console.log("导航到 Dashboard...");
  await page.goto("http://localhost:3000/dashboard");
  await page.waitForTimeout(1000);

  console.log("截图: 正常状态");
  await page.screenshot({ path: "docs/reports/analysis/10-dashboard-normal.png", fullPage: true });

  // 测试左侧边栏折叠
  console.log("折叠左侧边栏...");
  const leftCollapseBtn = await page.locator("button[aria-label='折叠导航']").first();
  if (await leftCollapseBtn.isVisible()) {
    await leftCollapseBtn.click();
    await page.waitForTimeout(500); // 等待过渡动画
    await page.screenshot({ path: "docs/reports/analysis/11-dashboard-left-collapsed.png", fullPage: true });
    console.log("✓ 左侧边栏已折叠");

    // 检查左侧边栏宽度
    const leftSidebar = page.locator("aside").first();
    const leftBox = await leftSidebar.boundingBox();
    console.log(`左侧边栏宽度: ${leftBox?.width || 0}px`);

    // 检查主内容区域宽度
    const mainContent = page.locator("main");
    const mainBox = await mainContent.boundingBox();
    console.log(`主内容区域宽度: ${mainBox?.width || 0}px`);
  } else {
    console.log("✗ 左侧折叠按钮未找到");
  }

  // 测试右侧边栏折叠
  console.log("折叠右侧边栏...");
  const rightCollapseBtn = await page.locator("button[aria-label='折叠 AI 助手']").first();
  if (await rightCollapseBtn.isVisible()) {
    await rightCollapseBtn.click();
    await page.waitForTimeout(500); // 等待过渡动画
    await page.screenshot({ path: "docs/reports/analysis/12-dashboard-both-collapsed.png", fullPage: true });
    console.log("✓ 右侧边栏已折叠");

    // 检查右侧边栏宽度
    const rightSidebar = page.locator("aside").last();
    const rightBox = await rightSidebar.boundingBox();
    console.log(`右侧边栏宽度: ${rightBox?.width || 0}px`);

    // 检查主内容区域宽度
    const mainBox2 = await page.locator("main").boundingBox();
    console.log(`主内容区域宽度: ${mainBox2?.width || 0}px`);
  } else {
    console.log("✗ 右侧折叠按钮未找到");
  }

  // 测试展开按钮
  console.log("测试展开按钮...");
  await page.waitForTimeout(300);

  const leftExpandBtn = page.locator("button").filter({ hasText: "展开导航" }).first();
  if (await leftExpandBtn.isVisible()) {
    const buttonBox = await leftExpandBtn.boundingBox();
    console.log(`✓ 左侧展开按钮可见，位置 X: ${buttonBox?.x || 0}`);
  } else {
    console.log("✗ 左侧展开按钮未找到");
  }

  const rightExpandBtn = page.locator("button").filter({ hasText: "展开 AI 助手" }).first();
  if (await rightExpandBtn.isVisible()) {
    const buttonBox = await rightExpandBtn.boundingBox();
    const viewportWidth = page.viewportSize()?.width || 0;
    console.log(`✓ 右侧展开按钮可见，位置 X: ${buttonBox?.x || 0}, 视口宽度: ${viewportWidth}`);
  } else {
    console.log("✗ 右侧展开按钮未找到");
  }

  await browser.close();
  console.log("测试完成！");
})();
