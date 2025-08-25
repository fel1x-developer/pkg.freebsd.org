import type { ParamMatcher } from '@sveltejs/kit';
import { abiVersions, type AbiVersion } from '$lib/registry';

export const match = ((param: string): param is AbiVersion => {
	return abiVersions.includes(param as AbiVersion);
}) satisfies ParamMatcher;
