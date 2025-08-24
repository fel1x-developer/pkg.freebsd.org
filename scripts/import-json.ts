#!/usr/bin/env bun
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { packages } from '../src/lib/server/db/schema.js';
import type { NewPackage, Package } from '../src/lib/server/db/schema.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL environment variable is required');
}

const client = neon(process.env.DATABASE_URL);
const db = drizzle(client);

function transformPackage(jsonPackage: Package): NewPackage {
	return {
		name: jsonPackage.name,
		origin: jsonPackage.origin,
		version: jsonPackage.version,
		comment: jsonPackage.comment,
		maintainer: jsonPackage.maintainer,
		www: jsonPackage.www || null,
		repository: jsonPackage.repository || 'latest',
		abi: jsonPackage.abi,
		arch: jsonPackage.arch,
		prefix: jsonPackage.prefix,
		sum: jsonPackage.sum,
		flatSize: jsonPackage.flatSize,
		path: jsonPackage.path,
		repoPath: jsonPackage.repoPath,
		licenseLogic: jsonPackage.licenseLogic,
		licenses: jsonPackage.licenses || null,
		pkgSize: jsonPackage.pkgSize,
		description: jsonPackage.description,
		categories: jsonPackage.categories,
		shlibsRequired: jsonPackage.shlibsRequired || [],
		annotations: jsonPackage.annotations,
		dependencies: jsonPackage.dependencies || null,
		options: jsonPackage.options || null,
		messages: jsonPackage.messages || null,
		shlibsProvided: jsonPackage.shlibsProvided || null,
		users: jsonPackage.users || null,
		groups: jsonPackage.groups || null
	};
}

async function importPackages(filePath: string, batchSize: number = 1000) {
	console.log(`Reading JSON file: ${filePath}`);

	const fileContent = readFileSync(filePath, 'utf-8');
	const jsonData = JSON.parse(fileContent);

	let packagesToImport: Package[];

	if (Array.isArray(jsonData)) {
		packagesToImport = jsonData;
	} else if (jsonData.packages && Array.isArray(jsonData.packages)) {
		packagesToImport = jsonData.packages;
	} else {
		throw new Error(
			'Invalid JSON format. Expected array of packages or object with "packages" property.'
		);
	}

	console.log(`Found ${packagesToImport.length} packages to import`);

	let imported = 0;
	let errors = 0;

	for (let i = 0; i < packagesToImport.length; i += batchSize) {
		const batch = packagesToImport.slice(i, i + batchSize);
		const transformedBatch = batch.map(transformPackage);

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

	if (args.length === 0) {
		console.error('Usage: bun run scripts/import-json.ts <json-file-path> [batch-size]');
		process.exit(1);
	}

	const filePath = resolve(args[0]);
	const batchSize = args[1] ? parseInt(args[1]) : 1000;

	if (isNaN(batchSize) || batchSize <= 0) {
		console.error('Batch size must be a positive integer');
		process.exit(1);
	}

	try {
		await importPackages(filePath, batchSize);
	} catch (error) {
		console.error('Import failed:', error);
		process.exit(1);
	}
}

main().catch(console.error);
