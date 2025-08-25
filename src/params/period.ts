import type { ParamMatcher } from '@sveltejs/kit';
import { periods, type Period } from '$lib/registry';

export const match = ((param: string): param is Period => {
	return periods.includes(param as Period);
}) satisfies ParamMatcher;
