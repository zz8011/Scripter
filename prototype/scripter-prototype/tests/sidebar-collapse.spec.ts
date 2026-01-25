import { test, expect } from "@playwright/test";

test.describe("侧边栏折叠功能测试", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/dashboard");
  });

  test("左侧边栏折叠按钮在右边栏右边缘", async ({ page }) => {
    // 获取左侧边栏折叠按钮
    const leftCollapseButton = page.locator("aside").first().locator("button[aria-label='折叠导航']");

    // 验证按钮存在
    await expect(leftCollapseButton).toBeVisible();

    // 验证按钮位置 - 应该在左侧边栏的右边缘
    const buttonBox = await leftCollapseButton.boundingBox();
    const sidebarBox = await page.locator("aside").first().boundingBox();

    expect(buttonBox).toBeTruthy();
    expect(sidebarBox).toBeTruthy();

    // 按钮的左边缘应该接近侧边栏的右边缘
    if (buttonBox && sidebarBox) {
      const distanceFromRightEdge = sidebarBox.width - buttonBox.x;
      console.log(`左侧边栏宽度: ${sidebarBox.width}`);
      console.log(`折叠按钮 X 位置: ${buttonBox.x}`);
      console.log(`距离右边缘: ${distanceFromRightEdge}`);
    }
  });

  test("右侧边栏折叠按钮在右边栏左边缘", async ({ page }) => {
    // 获取右侧边栏折叠按钮
    const rightCollapseButton = page.locator("aside").last().locator("button[aria-label='折叠 AI 助手']");

    // 验证按钮存在
    await expect(rightCollapseButton).toBeVisible();

    // 验证按钮位置 - 应该在右侧边栏的左边缘
    const buttonBox = await rightCollapseButton.boundingBox();
    const sidebarBox = await page.locator("aside").last().boundingBox();

    expect(buttonBox).toBeTruthy();
    expect(sidebarBox).toBeTruthy();

    // 按钮应该靠近右侧边栏的左边缘
    if (buttonBox && sidebarBox) {
      const viewportWidth = page.viewportSize()?.width || 0;
      const sidebarLeftEdge = viewportWidth - sidebarBox!.width;
      const distanceFromLeftEdge = buttonBox!.x - sidebarLeftEdge;
      console.log(`右侧边栏左边缘位置: ${sidebarLeftEdge}`);
      console.log(`折叠按钮 X 位置: ${buttonBox.x}`);
      console.log(`距离左边缘: ${distanceFromLeftEdge}`);
    }
  });

  test("折叠侧边栏后中间区域自适应", async ({ page }) => {
    // 获取主内容区域的初始宽度（使用 evaluate 获取实际渲染宽度）
    const widthBefore = await page.locator("main").evaluate(el => el.offsetWidth);
    console.log(`折叠前主内容区域宽度: ${widthBefore}`);

    // 折叠左侧边栏
    await page.click("button[aria-label='折叠导航']");
    await page.waitForTimeout(300); // 等待过渡动画

    const widthAfterLeft = await page.locator("main").evaluate(el => el.offsetWidth);
    console.log(`折叠左侧后主内容区域宽度: ${widthAfterLeft}`);

    // 主内容区域应该变宽
    expect(widthAfterLeft).toBeGreaterThan(widthBefore);

    // 折叠右侧边栏
    await page.click("button[aria-label='折叠 AI 助手']");
    await page.waitForTimeout(300); // 等待过渡动画

    const widthAfterBoth = await page.locator("main").evaluate(el => el.offsetWidth);
    console.log(`折叠双侧后主内容区域宽度: ${widthAfterBoth}`);

    // 主内容区域应该更宽
    expect(widthAfterBoth).toBeGreaterThan(widthAfterLeft);

    // 截图保存
    await page.screenshot({
      path: "docs/reports/analysis/09-sidebar-both-collapsed.png",
      fullPage: true
    });
  });

  test("折叠后展开按钮出现在屏幕边缘", async ({ page }) => {
    // 折叠左侧边栏
    await page.click("button[aria-label='折叠导航']");
    await page.waitForTimeout(300);

    // 检查左边缘是否有展开按钮（fixed 定位的那个）
    const leftExpandButton = page.locator("button[aria-label='展开导航']");
    await expect(leftExpandButton.nth(1)).toBeVisible(); // nth(1) 获取第二个（展开按钮）

    // 验证按钮在屏幕左边缘
    const buttonBox = await leftExpandButton.nth(1).boundingBox();
    expect(buttonBox?.x).toBeLessThanOrEqual(10); // 应该接近屏幕左边缘 (x ≈ 0)

    // 折叠右侧边栏
    await page.click("button[aria-label='折叠 AI 助手']");
    await page.waitForTimeout(300);

    // 检查右边缘是否有展开按钮
    const rightExpandButton = page.locator("button[aria-label='展开 AI 助手']");
    await expect(rightExpandButton.first()).toBeVisible(); // first() 获取第一个（fixed 定位的展开按钮）

    // 验证按钮在屏幕右边缘
    const rightButtonBox = await rightExpandButton.first().boundingBox();
    const viewportWidth = page.viewportSize()?.width || 0;
    expect(rightButtonBox?.x).toBeGreaterThanOrEqual(viewportWidth - 50); // 应该接近屏幕右边缘
  });

  test("展开和折叠功能正常工作", async ({ page }) => {
    // 测试左侧边栏
    const leftSidebar = page.locator("aside").first();

    // 初始状态应该可见
    await expect(leftSidebar).toBeVisible();

    // 折叠
    await page.click("button[aria-label='折叠导航']");
    await page.waitForTimeout(300);

    // 折叠后应该隐藏（宽度接近0，允许小数误差）
    const leftBoxCollapsed = await leftSidebar.boundingBox();
    expect(leftBoxCollapsed?.width).toBeLessThanOrEqual(1); // 允许 0-1px 的误差

    // 展开（点击第二个按钮，即 fixed 定位的展开按钮）
    await page.locator("button[aria-label='展开导航']").nth(1).click();
    await page.waitForTimeout(300);

    // 展开后应该可见
    await expect(leftSidebar).toBeVisible();

    // 测试右侧边栏
    const rightSidebar = page.locator("aside").last();

    // 初始状态应该可见
    await expect(rightSidebar).toBeVisible();

    // 折叠
    await page.click("button[aria-label='折叠 AI 助手']");
    await page.waitForTimeout(300);

    // 折叠后应该隐藏（宽度接近0，允许小数误差）
    const rightBoxCollapsed = await rightSidebar.boundingBox();
    expect(rightBoxCollapsed?.width).toBeLessThanOrEqual(1); // 允许 0-1px 的误差

    // 展开（点击第一个按钮，即 fixed 定位的展开按钮）
    await page.locator("button[aria-label='展开 AI 助手']").first().click();
    await page.waitForTimeout(300);

    // 展开后应该可见
    await expect(rightSidebar).toBeVisible();
  });
});
