import { pgTable, serial, text, jsonb, pgEnum, bigint } from 'drizzle-orm/pg-core';

export const abiVersion = pgEnum('abi_version', ['13', '14', '15']);
export const abiArch = pgEnum('abi_arch', [
	'amd64',
	'aarch64',
	'i386',
	'armv6',
	'armv7',
	'powerpc',
	'powerpc64',
	'powerpc64le'
]);
export const repository = pgEnum('repository', ['base', 'kmod', 'ports']);
export const period = pgEnum('period', [
	'latest',
	'weekly',
	'quarterly',
	'release-0',
	'release-1',
	'release-2',
	'release-3',
	'release-4',
	'release-5'
]);
export const licenseLogic = pgEnum('license_logic', ['single', 'or', 'and']);

export interface annotations {
	FreeBSD_version: string;
	build_timestamp: string;
	built_by: string;
	port_checkout_unclean: string;
	port_git_hash: string;
	ports_top_checkout_unclean: string;
	ports_top_git_hash: string;
	cpe: string | null;
	flavor: string | null;
	deprecated: string | null;
	expiration_date: string | null;
	no_provide_shlib: string | null;
	subpackage: string | null;
}

export interface dependency {
	origin: string;
	version: string;
}

export interface message {
	message: string;
	type: string;
	maximum_version: string;
	minimum_version: string;
}

export const packages = pgTable('packages', {
	id: serial('id').primaryKey(),
	abiVersion: abiVersion('abi_version').notNull(),
	abiArch: abiArch('abi_arch').notNull(),
	repository: repository('repository').notNull(),
	period: period('period').notNull(),
	name: text('name').notNull(),
	origin: text('origin').notNull(),
	version: text('version').notNull(),
	comment: text('comment').notNull(),
	maintainer: text('maintainer').notNull(),
	www: text('www'),
	abi: text('abi').notNull(),
	arch: text('arch').notNull(),
	prefix: text('prefix').notNull(),
	sum: text('sum').notNull(),
	flatSize: bigint('flat_size', { mode: 'number' }),
	path: text('path').notNull(),
	repoPath: text('repo_path'),
	licenseLogic: licenseLogic('license_logic'),
	licenses: jsonb('licenses').$type<string[]>(),
	pkgSize: bigint('pkg_size', { mode: 'number' }),
	description: text('description').notNull(),
	categories: text('categories').$type<string[]>().notNull(),
	shlibsRequired: text('shlibs_required').$type<string[]>().notNull(),
	annotations: jsonb('annotations').$type<annotations>().notNull(),
	dependencies: jsonb('dependencies').$type<Record<string, dependency>>(),
	options: jsonb('options').$type<Record<string, string>>(),
	messages: jsonb('messages').$type<message[]>(),
	shlibsProvided: jsonb('shlibs_provided').$type<string[]>(),
	users: jsonb('users').$type<string[]>(),
	groups: jsonb('groups').$type<string[]>()
});

export type Package = typeof packages.$inferSelect;
export type NewPackage = typeof packages.$inferInsert;
