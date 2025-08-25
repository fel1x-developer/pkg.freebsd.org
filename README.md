# FreeBSD Package Registry

Inspired by [CachyOS Packages Search](https://packages.cachyos.org), this is a simple package registry search portal for FreeBSD.

## Features

- Search for packages by name and description
- View package details
- View package dependencies
- Filter by repository, period, ABI version, and ABI architecture

## Developing

Once you've created a project and installed dependencies with `bun install`, start a development server:

```sh
bun run dev

# or start the server and open the app in a new browser tab
bun run dev -- --open
```

## Building

To create a production version of your app:

```sh
bun run build
```

You can preview the production build with `bun run preview`.

## License

As a part of the FreeBSD project, this project is licensed under the FreeBSD license (a.k.a. the 2-Clause BSD license or the Simplified BSD license).

## Frequently Asked Questions

**Q:** Did you copy the code from [CachyOS packages search](https://packages.cachyos.org)?

**A:** Although I referenced the design from CachyOS packages search, I entirely wrote the code myself. The original uses Next.js on Docker while retrieving package information from its dedicated api endpoint, whereas this project uses SvelteKit with Vercel for hosting and Neon for database.

**Q:** Did you use AI coding tools to help you build this? Is this another _vibe coding_ project?

**A:** Yes, I used Claude Code to help me build this. However, I am quite experienced with SvelteKit and have been using it for a while, so I knew what I was doing unlike vibe coders who blindly command and accept the code. I use AI like a completion tool, and I reject code if it doesn't fit my criteria. Around 50% of the generated code was rejected during the development process.

**Q:** Why did you use SvelteKit?

**A:** Because I'm familiar with it. After using different frameworks, I found SvelteKit to be the most intuitive and easy to use. _To me_, it's the best framework for building web applications.

**Q:** Why did you use experimental features from SvelteKit?

**A:** I used experimental features (remote functions and async) from SvelteKit because it improves developer experience and it is stable enough at least for this project. Again, I intended to use these experimental features and I had to manually instruct Claude Code to use them.

**Q:** Why did you use Vercel for hosting and Neon for the database? Why not host on FreeBSD?

**A:** Currently, I'm using free tier of Vercel and Neon since I cannot afford to host this on FreeBSD, whether it is self hosted or on a cloud provider. I'm not even sure if I can host it on FreeBSD since Node.js and NPM ecosystem support is not good enough on FreeBSD. Using Vercel and Neon removes the need to worry about hosting configuration and database management. Also, they use serverless architecture, which is a good fit for this project.

**Q:** Why the current website only host latest packages on FreeBSD 14 (amd64)?

**A:** Again, this is a cost issue. Neon's free tier provides 500MB of storage, which is not enough for this project. On amd64, ports takes ~57MB, base takes ~0.4MB, and kmods takes ~0.3MB. Providing other architectures, ABI versions, and periods would require more storage, and the current limit of 500MB is not enough.
