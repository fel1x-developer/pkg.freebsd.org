import type { ParamMatcher } from '@sveltejs/kit';
import { repositories, type Repository } from '$lib/registry';

export const match = ((param: string): param is Repository => {
	return repositories.includes(param as Repository);
}) satisfies ParamMatcher;
