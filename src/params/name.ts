import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((_param: string): _param is string => {
	return true;
}) satisfies ParamMatcher;
