import { query } from '$app/server';
import * as v from 'valibot';
import { searchPackages, getDistinctRepositories } from '$lib/server/db/queries';
import { abi as abiEnum, arch as archEnum } from '$lib/server/db/schema';

const PackageSearchSchema = v.object({
	query: v.optional(v.string()),
	repository: v.optional(v.string()),
	abi: v.optional(v.string()),
	architecture: v.optional(v.string()),
	page: v.optional(v.number())
});

export const getPackages = query(PackageSearchSchema, async (params) => {
	return await searchPackages({
		query: params.query || '',
		repository: params.repository || undefined,
		abi: (params.abi as (typeof abiEnum.enumValues)[number]) || undefined,
		architecture: (params.architecture as (typeof archEnum.enumValues)[number]) || undefined,
		page: params.page || 1,
		limit: 50
	});
});

export const getFilterOptions = query(async () => {
	const repositories = await getDistinctRepositories();

	return {
		repositories,
		abis: abiEnum.enumValues,
		architectures: archEnum.enumValues
	};
});
