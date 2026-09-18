import {test,expect} from '@playwright/test';
const methods=['flow-matching','mean-flow','improved-mean-flow'];
test('paper sequence, primers, stage controls and code experiments work on a phone',async({page})=>{
 await page.setViewportSize({width:390,height:844});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const method of methods){
  await page.goto(`./#concept/${method}`);
  await expect(page.locator('.study-nav a')).toHaveCount(3);
  await page.locator('.math-help>summary').click();
  await page.locator('.math-help details').filter({hasText:'Product rule and chain rule'}).locator('summary').click();
  await expect(page.locator('.math-help')).toContainText('the total derivative is 11');
  await page.locator('[data-section="algorithm"]').click();
  for(let i=0;i<6;i++){await page.locator(`[data-stage="${i}"]`).click();await expect(page.locator('#algorithm-panel h4')).toContainText(`${i+1}.`);}
  await page.locator('#algorithm-time').fill('0');await page.locator('#algorithm-time').dispatchEvent('input');
  await expect(page.locator('#algorithm-start-value')).toHaveText('0.00');
  await page.locator('#flow-time').fill('0');await page.locator('#flow-time').dispatchEvent('input');
  await expect(page.locator('#visual-stats')).not.toContainText('NaN');
  await expect(page.locator('#visual-stats')).toContainText('0.735759');
  await page.locator('[data-section="lab"]').click();
  await expect(page.locator('#python-status')).toContainText(method==='flow-matching'?'0.687218':'0.735759');
  await page.locator('#python-code').fill('z = 3\nprint(0, z)\nprint(1, z * 2)');await page.locator('#run-python').click();
  await expect(page.locator('#python-status')).toContainText('Final output: 1, 6');
  await expect(page.locator('#python-chart svg')).toBeVisible();
  await page.locator('#python-code').fill('print(0, 1/0)');await page.locator('#run-python').click();
  await expect(page.locator('#python-status')).toContainText('Division by zero');await expect(page.locator('#python-chart svg')).toHaveCount(0);
  await page.locator('#reset-python').click();await expect(page.locator('#python-chart svg')).toBeVisible();
  await page.locator('[data-experiment="train"]').click();await expect(page.locator('#python-status')).toContainText('40 points rendered');
  await page.locator('.lab-output summary').click();await expect(page.locator('#python-output')).toContainText('39');
  const downloadPromise=page.waitForEvent('download');await page.locator('#download-python').click();const download=await downloadPromise;expect(download.suggestedFilename()).toBe(`${method}-train.py`);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 expect(errors).toEqual([]);
});
test('keyboard navigation, reduced motion and unavailable storage preserve the study',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}});});
 await page.goto('./#concept/improved-mean-flow');
 await page.locator('.math-help>summary').focus();await page.keyboard.press('Enter');await expect(page.locator('.math-help')).toHaveAttribute('open','');
 await page.locator('[data-section="lab"]').focus();await page.keyboard.press('Enter');await expect(page.locator('#study-lab')).toBeFocused();
 await page.locator('#understood').click();await expect(page.locator('#save-status')).toContainText('storage unavailable');
});
test('capture actual paper layouts and interactive views',async({page})=>{
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});
  for(const method of methods){await page.goto(`./#concept/${method}`);await expect(page.locator('#python-chart svg')).toBeAttached();await page.screenshot({path:`test-results/${method}-${width}.png`,fullPage:true});if(method==='improved-mean-flow'){await page.screenshot({path:`test-results/flow-overview-${width}.png`});await page.locator('[data-section="architecture"]').click();await page.screenshot({path:`test-results/flow-architecture-${width}.png`});}}
  await page.locator('[data-section="algorithm"]').click();await page.locator('[data-stage="3"]').click();await page.screenshot({path:`test-results/flow-algorithm-${width}.png`});
  await page.locator('[data-section="lab"]').click();await page.screenshot({path:`test-results/flow-code-${width}.png`});
 }
});
