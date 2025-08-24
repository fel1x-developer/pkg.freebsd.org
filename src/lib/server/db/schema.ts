import { pgTable, serial, integer, text, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const abi = pgEnum('abi', ['FreeBSD:14:amd64']);
export const arch = pgEnum('arch', ['freebsd:14:x86:64']);
export const licenseLogic = pgEnum('license_logic', ['single', 'or', 'and']);

interface annotations {
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

interface dependency {
	origin: string;
	version: string;
}

interface message {
	message: string;
	type: string;
	maximum_version: string;
	minimum_version: string;
}

export const packages = pgTable('packages', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	origin: text('origin').notNull(),
	version: text('version').notNull(),
	comment: text('comment').notNull(),
	maintainer: text('maintainer').notNull(),
	www: text('www'),
	abi: abi('abi').notNull(),
	arch: arch('arch').notNull(),
	prefix: text('prefix').notNull(),
	sum: text('sum').notNull(),
	flatsize: integer('flatsize').notNull(),
	path: text('path').notNull(),
	repoPath: text('repo_path').notNull(),
	licenseLogic: licenseLogic('license_logic').notNull(),
	licenses: jsonb('licenses').$type<string[]>().notNull(),
	pkgsize: integer('pkgsize').notNull(),
	description: text('description').notNull(),
	categories: text('categories').$type<string[]>().notNull(),
	shlibsRequired: text('shlibs_required').$type<string[]>().notNull(),
	annotations: jsonb('annotations').$type<annotations>().notNull(),
	dependences: jsonb('dependences').$type<Record<string, dependency>>().notNull(),
	options: jsonb('options').$type<Record<string, string>>().notNull(),
	messages: jsonb('messages').$type<message[]>().notNull(),
	shlibsProvided: jsonb('shlibs_provided').$type<string[]>().notNull(),
	users: jsonb('users').$type<string[]>().notNull(),
	groups: jsonb('groups').$type<string[]>().notNull()
});
