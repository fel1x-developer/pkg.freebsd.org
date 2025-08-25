import { query } from '$app/server';
import * as v from 'valibot';
import { searchPackage } from '$lib/server/db/queries';
import {
	abiVersion as abiVersionEnum,
	abiArch as abiArchEnum,
	repository as repositoryEnum,
	period as periodEnum
} from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';

const PackageSearchSchema = v.object({
	repository: v.string(),
	abiVersion: v.string(),
	abiArch: v.string(),
	period: v.string(),
	name: v.string()
});

export const getPackage = query(PackageSearchSchema, async (params) => {
	const result = await searchPackage({
		repository: params.repository as (typeof repositoryEnum.enumValues)[number],
		abiVersion: params.abiVersion as (typeof abiVersionEnum.enumValues)[number],
		abiArch: params.abiArch as (typeof abiArchEnum.enumValues)[number],
		period: params.period as (typeof periodEnum.enumValues)[number],
		name: params.name
	});

	if (!result) {
		error(404, 'Package not found');
	}

	return result;
});
