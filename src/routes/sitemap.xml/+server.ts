import type { RequestHandler } from './$types';

export const prerender = true;

const pages = ['', '/classic', '/location', '/quote', '/crew', '/rankings', '/online'];

export const GET: RequestHandler = () => {
	const urls = pages
		.map(
			path => `
				<url>
					<loc>https://www.grandlinedle.com${path}</loc>
				</url>`,
		)
		.join('');

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>
		<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
			${urls}
		</urlset>`.trim(),
		{
			headers: {
				'Content-Type': 'application/xml; charset=utf-8',
			},
		},
	);
};
