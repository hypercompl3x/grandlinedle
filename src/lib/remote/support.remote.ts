import { form, getRequestEvent } from '$app/server';
import { fail, redirect } from '@sveltejs/kit';
import Stripe from 'stripe';
import * as v from 'valibot';

import { STRIPE_SECRET_KEY } from '$env/static/private';

const stripe = new Stripe(STRIPE_SECRET_KEY);

export const supportGrandlinedle = form(
	v.object({
		amount: v.pipe(
			v.number(),
			v.minValue(1, 'The minimum amount is £1'),
			v.maxValue(1000, 'The maximum amount is £1000'),
		),
		displayName: v.optional(v.string()),
		yourMessage: v.optional(v.string()),
	}),
	async ({ amount, displayName = '', yourMessage = '' }) => {
		const { url } = getRequestEvent();
		const baseUrl = `${url.origin}${url.pathname}`;

		let result: { success: boolean; sessionId: string; url: string; error: string };

		try {
			const amountInPence = amount * 100;

			const metadata = {
				displayName,
				yourMessage,
				totalAmount: amountInPence.toString(),
			};

			const sessionParams: Stripe.Checkout.SessionCreateParams = {
				line_items: [
					{
						quantity: 1,
						price_data: {
							currency: 'gbp',
							unit_amount: amountInPence,
							product_data: {
								name: 'Support Grandlinedle',
								description: 'Contribution to support development and future updates',
							},
						},
					},
				],
				mode: 'payment',
				cancel_url: `${baseUrl}?checkout=cancelled`,
				success_url: `${baseUrl}?checkout=success`,
				billing_address_collection: 'auto',
				payment_intent_data: {
					metadata,
				},
				metadata,
			};

			const session = await stripe.checkout.sessions.create(sessionParams);

			if (!session.url) {
				throw new Error('Stripe session URL was not created');
			}

			result = {
				success: true,
				sessionId: session.id,
				url: session.url,
				error: '',
			};
		} catch (error) {
			console.error('Stripe checkout session creation failed:', error);

			result = {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to create checkout session',
				sessionId: '',
				url: '',
			};
		}

		if (!result.success) {
			return fail(500, {
				error: result.error,
			});
		}

		redirect(303, result.url!);
	},
);
