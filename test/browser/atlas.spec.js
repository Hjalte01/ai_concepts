import {test,expect} from '@playwright/test';
import fs from 'node:fs';
const concepts=JSON.parse(fs.readFileSync('public/concepts.json'));
test('every lesson renders without errors or horizontal overflow on phone',async({page})=>{
 await page.setViewportSize({width:390,height:844});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('./');
 await expect(page.locator('.concept-card')).toHaveCount(concepts.length);
 for(const c of concepts){await page.goto(`./#concept/${c.id}`);await expect(page.locator('h1')).toHaveText(c.title);await expect(page.locator('#figure svg')).toBeVisible();await expect(page.locator('.formula')).toHaveText(c.formula);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),c.id).toBe(true);await page.locator('summary').click();await expect(page.locator('details p')).toHaveText(c.answer);}
 expect(errors).toEqual([]);
});
test('search, filters, information calculation, recall and persistence',async({page})=>{
 await page.goto('./');await page.getByRole('searchbox',{name:'Search concepts'}).fill('Kullback');await expect(page.locator('.concept-card')).toHaveCount(1);await page.getByRole('searchbox',{name:'Search concepts'}).fill('KL divergence');await expect(page.locator('.concept-card')).toHaveCount(1);await page.locator('.concept-card').click();await expect(page.locator('h1')).toHaveText('KL divergence');
 await expect(page.locator('#visual-stats')).toContainText('0.737');await page.locator('#q').fill('0.5');await page.locator('#q').dispatchEvent('input');await expect(page.locator('#visual-stats')).toContainText('0.000');
 await page.locator('#q').fill('0');await page.locator('#q').dispatchEvent('input');await expect(page.locator('#visual-stats')).toContainText('∞');
 await page.locator('#understood').click();await page.reload();await expect(page.locator('#understood')).toHaveAttribute('aria-pressed','true');
 await page.goto('./');await page.locator('[data-filter="Generation"]').click();await expect(page.locator('.concept-card')).toHaveCount(concepts.filter(c=>c.group==='Generation').length);
});
test('paths, source coverage, map, unknown routes and back navigation',async({page})=>{
 await page.goto('./#map');await expect(page.locator('.dependency-grid>div')).toHaveCount(concepts.length);await page.locator('.map-chain a').first().click();await expect(page.locator('h1')).toHaveText('Probability & expectation');await page.goBack();await expect(page.locator('h1')).toHaveText('Everything starts somewhere.');await page.goto('./#sources');await expect(page.locator('tbody tr')).toHaveCount(26);await page.goto('./#path/0');await expect(page.locator('.path-lessons li')).toHaveCount(8);await page.goto('./#concept/missing');await expect(page.locator('h1')).toContainText('isn’t here yet');
});
test('desktop and phone visual captures',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('./');await expect(page.locator('.concept-card')).toHaveCount(concepts.length);await page.screenshot({path:'test-results/atlas-desktop.png',fullPage:true});await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/atlas-phone.png',fullPage:true});await page.goto('./#concept/kl-divergence');await page.screenshot({path:'test-results/lesson-phone.png',fullPage:true});
});
