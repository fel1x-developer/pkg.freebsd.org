import type { ParamMatcher } from '@sveltejs/kit';
import { abiArchs, type AbiArch } from '$lib/registry';

export const match = ((param: string): param is AbiArch => {
	return abiArchs.includes(param as AbiArch);
}) satisfies ParamMatcher;
