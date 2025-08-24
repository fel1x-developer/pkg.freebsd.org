import { db } from './index.js';
import { packages, abi as abiEnum, arch as archEnum } from './schema.js';
import { count, ilike, or, and, desc, eq } from 'drizzle-orm';

export interface SearchParams {
	query?: string;
	repository?: string;
	abi?: (typeof abiEnum.enumValues)[number];
	architecture?: (typeof archEnum.enumValues)[number];
	page?: number;
	limit?: number;
}

export async function searchPackages({
	query = '',
	repository,
	abi,
	architecture,
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

	if (abi) {
		conditions.push(eq(packages.abi, abi));
	}

	if (architecture) {
		conditions.push(eq(packages.arch, architecture));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const [items, totalCount] = await Promise.all([
		db
			.select({
				id: packages.id,
				name: packages.name,
				version: packages.version,
				comment: packages.comment,
				origin: packages.origin,
				repository: packages.repository,
				maintainer: packages.maintainer,
				abi: packages.abi,
				arch: packages.arch,
				categories: packages.categories,
				www: packages.www,
				flatSize: packages.flatSize
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

export async function getDistinctRepositories() {
	const result = await db
		.selectDistinct({ repository: packages.repository })
		.from(packages)
		.orderBy(packages.repository);

	return result.map((r) => r.repository);
}
