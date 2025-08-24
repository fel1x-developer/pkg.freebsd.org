import { db } from './index.js';
import {
	packages,
	abiVersion as abiVersionEnum,
	abiArch as abiArchEnum,
	repository as repositoryEnum,
	period as periodEnum
} from './schema.js';
import { count, ilike, or, and, desc, eq } from 'drizzle-orm';

export interface SearchParams {
	query?: string;
	repository?: (typeof repositoryEnum.enumValues)[number];
	abiVersion?: (typeof abiVersionEnum.enumValues)[number];
	abiArch?: (typeof abiArchEnum.enumValues)[number];
	period?: (typeof periodEnum.enumValues)[number];
	page?: number;
	limit?: number;
}

export async function searchPackages({
	query = '',
	repository,
	abiVersion,
	abiArch,
	period,
	page = 1,
	limit = 50
}: SearchParams) {
	const offset = (page - 1) * limit;

	const conditions = [];

	if (query) {
		conditions.push(
			or(ilike(packages.name, `%${query}%`), ilike(packages.description, `%${query}%`))
		);
	}

	if (repository) {
		conditions.push(eq(packages.repository, repository));
	}

	if (abiVersion) {
		conditions.push(eq(packages.abiVersion, abiVersion));
	}

	if (abiArch) {
		conditions.push(eq(packages.abiArch, abiArch));
	}

	if (period) {
		conditions.push(eq(packages.period, period));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const [items, totalCount] = await Promise.all([
		db
			.select({
				id: packages.id,
				name: packages.name,
				abiVersion: packages.abiVersion,
				abiArch: packages.abiArch,
				repository: packages.repository,
				period: packages.period,
				version: packages.version,
				comment: packages.comment
			})
			.from(packages)
			.where(whereClause)
			.orderBy(desc(packages.name))
			.limit(limit)
			.offset(offset),
		db
			.select({ count: count() })
			.from(packages)
			.where(whereClause)
			.then((result) => result[0]?.count ?? 0)
	]);

	return {
		items,
		totalCount,
		totalPages: Math.ceil(totalCount / limit),
		currentPage: page
	};
}

export async function getPackageById(id: number) {
	const result = await db.select().from(packages).where(eq(packages.id, id)).limit(1);

	return result[0];
}
