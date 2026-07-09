import { form } from '$app/server';
import * as v from 'valibot';
import { Resend } from 'resend';
import { DEVELOPER_EMAIL } from '$lib/utils/constants';

import { RESEND_API_KEY } from '$env/static/private';

const resend = new Resend(RESEND_API_KEY);

export const submitFeedback = form(
	v.object({
		feedback: v.pipe(
			v.string(),
			v.nonEmpty('Please enter some feedback'),
			v.maxLength(999, 'Feedback must be under 1000 characters'),
		),
		displayName: v.optional(v.string()),
	}),
	async ({ feedback, displayName }) => {
		try {
			await resend.emails.send({
				from: 'Grandlinedle Feedback <feedback@grandlinedle.com>',
				to: DEVELOPER_EMAIL,
				replyTo: undefined,
				subject: 'New Grandlinedle feedback',
				text: [`Name: ${displayName || 'Not provided'}`, '', `Feedback: ${feedback}`].join('\n'),
			});

			return { success: true };
		} catch (error) {
			console.error('Feedback email failed:', error);

			return { success: false };
		}
	},
);
