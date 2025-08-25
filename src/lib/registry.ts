export const repositories = ['base', 'kmods', 'ports'] as const;
export const periods = [
	'latest',
	'latest-2',
	'latest-3',
	'weekly',
	'quarterly',
	'quarterly-2',
	'quarterly-3',
	'release-0',
	'release-1',
	'release-2',
	'release-3',
	'release-4',
	'release-5'
] as const;
export const abiVersions = ['13', '14', '15'] as const;
export const abiArchs = [
	'amd64',
	'aarch64',
	'i386',
	'armv6',
	'armv7',
	'powerpc',
	'powerpc64',
	'powerpc64le'
] as const;

export type Repository = (typeof repositories)[number];
export type Period = (typeof periods)[number];
export type AbiVersion = (typeof abiVersions)[number];
export type AbiArch = (typeof abiArchs)[number];

export interface Registry {
	repository: Repository;
	period: Period;
	abiVersion: AbiVersion;
	abiArch: AbiArch;
}
