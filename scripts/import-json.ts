#!/usr/bin/env bun
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { packages } from '../src/lib/server/db/schema.js';
import type {
	NewPackage,
	annotations,
	dependency,
	message,
	abiVersion,
	abiArch,
	licenseLogic,
	repository,
	period
} from '../src/lib/server/db/schema.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import type { Registry } from '../src/lib/registry.js';

interface JsonPackage {
	name: string;
	origin: string;
	version: string;
	comment: string;
	maintainer: string;
	www?: string;
	repository?: string;
	abi: string;
	arch: string;
	prefix: string;
	sum: string;
	flatsize: number;
	path: string;
	repopath: string;
	licenselogic: (typeof licenseLogic.enumValues)[number];
	licenses?: string[] | null;
	pkgsize: number;
	desc: string;
	categories: string[];
	shlibs_required?: string[];
	annotations: annotations;
	deps?: Record<string, dependency> | null;
	options?: Record<string, string> | null;
	messages?: message[] | null;
	shlibs_provided?: string[] | null;
	users?: string[] | null;
	groups?: string[] | null;
}

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL environment variable is required');
}

const client = neon(process.env.DATABASE_URL);
const db = drizzle(client);

function transformPackage(jsonPackage: JsonPackage, registry: Registry): NewPackage {
	return {
		...registry,
		name: jsonPackage.name,
		origin: jsonPackage.origin,
		version: jsonPackage.version,
		comment: jsonPackage.comment,
		maintainer: jsonPackage.maintainer,
		www: jsonPackage.www || null,
		abi: jsonPackage.abi,
		arch: jsonPackage.arch,
		prefix: jsonPackage.prefix,
		sum: jsonPackage.sum,
		flatSize: jsonPackage.flatsize,
		path: jsonPackage.path,
		repoPath: jsonPackage.repopath,
		licenseLogic: jsonPackage.licenselogic,
		licenses: jsonPackage.licenses || null,
		pkgSize: jsonPackage.pkgsize,
		description: jsonPackage.desc.replace(/[\n\r]+/g, ' '),
		categories: jsonPackage.categories,
		shlibsRequired: jsonPackage.shlibs_required || [],
		annotations: jsonPackage.annotations,
		dependencies: jsonPackage.deps || null,
		options: jsonPackage.options || null,
		messages: jsonPackage.messages || null,
		shlibsProvided: jsonPackage.shlibs_provided || null,
		users: jsonPackage.users || null,
		groups: jsonPackage.groups || null
	};
}

async function importPackages(filePath: string, batchSize: number = 1000, registry: Registry) {
	console.log(`Reading JSON file: ${filePath}`);

	const fileContent = readFileSync(filePath, 'utf-8');
	const lines = fileContent.split('\n').filter((line) => line.trim());

	const packagesToImport: JsonPackage[] = [];

	for (const line of lines) {
		try {
			const jsonObj = JSON.parse(line);
			packagesToImport.push(jsonObj);
		} catch (error) {
			console.error(`Error parsing line: ${line.substring(0, 100)}...`);
			console.error(error);
		}
	}

	console.log(`Found ${packagesToImport.length} packages to import`);

	let imported = 0;
	let errors = 0;

	for (let i = 0; i < packagesToImport.length; i += batchSize) {
		const batch = packagesToImport.slice(i, i + batchSize);
		const transformedBatch = batch.map((jsonPackage) => transformPackage(jsonPackage, registry));

		try {
			await db.insert(packages).values(transformedBatch);
			imported += batch.length;
			console.log(
				`Imported batch ${Math.floor(i / batchSize) + 1}: ${imported}/${packagesToImport.length} packages`
			);
		} catch (error) {
			console.error(`Error importing batch ${Math.floor(i / batchSize) + 1}:`, error);
			errors += batch.length;
		}
	}

	console.log(`Import complete: ${imported} packages imported, ${errors} errors`);
}

async function main() {
	const args = process.argv.slice(2);

	if (args.length < 5) {
		console.error(
			'Usage: bun run scripts/import-json.ts <json-file-path> <abiversion> <abiarch> <repository> <period> [batch-size]'
		);
		console.error('Example: bun run scripts/import-json.ts data.json 14 amd64 ports latest 1000');
		process.exit(1);
	}

	const filePath = resolve(args[0]);
	const registry: Registry = {
		abiVersion: args[1] as (typeof abiVersion.enumValues)[number],
		abiArch: args[2] as (typeof abiArch.enumValues)[number],
		repository: args[3] as (typeof repository.enumValues)[number],
		period: args[4] as (typeof period.enumValues)[number]
	};
	const batchSize = args[5] ? parseInt(args[5]) : 1000;

	if (isNaN(batchSize) || batchSize <= 0) {
		console.error('Batch size must be a positive integer');
		process.exit(1);
	}

	try {
		await importPackages(filePath, batchSize, registry);
	} catch (error) {
		console.error('Import failed:', error);
		process.exit(1);
	}
}

main().catch(console.error);
