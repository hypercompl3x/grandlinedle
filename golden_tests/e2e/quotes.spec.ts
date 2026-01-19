import { test, expect } from '@playwright/test';
import { getCurrentQuote } from './testing';

test('homepage has link to quote link', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('navigation').getByRole('link').nth(2)).toHaveText('Quote');
});

test('quote link to take user to quote page', async ({ page }) => {
	await page.goto('/');
	const quoteLink = page.getByRole('navigation').getByRole('link').nth(2);
	await quoteLink.click();
	await expect(page).toHaveURL('/quote');
});

test('title to be correct', async ({ page }) => {
	await page.goto('/quote');
	await expect(page.getByTestId('quote-title')).toHaveText(
		"Guess who said today's One Piece quote!",
	);
});

test('quote to be visible', async ({ page }) => {
	await page.goto('/quote');
	await expect(page.getByTestId('current-quote')).toBeVisible();
});

test('search input to be visible', async ({ page }) => {
	await page.goto('/quote');
	await expect(page.getByTestId('search-input')).toBeVisible();
});

test('search input allows user to search and select a character', async ({ page }) => {
	await page.goto('/quote');
	const searchInput = page.getByTestId('search-input');
	await searchInput.fill('luffy');
	await page.getByTestId('dropdown-item-Monkey D. Luffy').click();
	await expect(page.getByTestId('quote-guess-Monkey D. Luffy')).toBeVisible();
});

test('guessing the correct character hides the search and shows success box', async ({ page }) => {
	const currentQuote = await getCurrentQuote();

	await page.goto('/quote');
	const searchInput = page.getByTestId('search-input');
	await searchInput.fill(currentQuote.character.name);
	await page.getByTestId(`dropdown-item-${currentQuote.character.name}`).click();
	await expect(page.getByTestId(`quote-guess-${currentQuote.character.name}`)).toBeVisible();
	await expect(page.getByTestId('success-box')).toBeVisible();
	await expect(searchInput).not.toBeVisible();
});
