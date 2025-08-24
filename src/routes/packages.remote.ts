import { query } from '$app/server';
import * as v from 'valibot';
import { searchPackages } from '$lib/server/db/queries';
import {
	abiVersion as abiVersionEnum,
	abiArch as abiArchEnum,
	repository as repositoryEnum,
	period as periodEnum
} from '$lib/server/db/schema';

const PackageSearchSchema = v.object({
	query: v.optional(v.string()),
	repository: v.optional(v.string()),
	abiVersion: v.optional(v.string()),
	abiArch: v.optional(v.string()),
	period: v.optional(v.string()),
	page: v.optional(v.number())
});

export const getPackages = query(PackageSearchSchema, async (params) => {
	return await searchPackages({
		query: params.query || '',
		repository: (params.repository as (typeof repositoryEnum.enumValues)[number]) || undefined,
		abiVersion: (params.abiVersion as (typeof abiVersionEnum.enumValues)[number]) || undefined,
		abiArch: (params.abiArch as (typeof abiArchEnum.enumValues)[number]) || undefined,
		period: (params.period as (typeof periodEnum.enumValues)[number]) || undefined,
		page: params.page || 1,
		limit: 50
	});
});

export const getFilterOptions = query(async () => {
	return {
		abiVersions: abiVersionEnum.enumValues,
		abiArchs: abiArchEnum.enumValues,
		repositories: repositoryEnum.enumValues,
		periods: periodEnum.enumValues
	};
});
