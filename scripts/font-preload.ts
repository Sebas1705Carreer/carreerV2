import type { HtmlTagDescriptor, Plugin } from 'vite'

/*
 * Self-hosted fonts (@fontsource, imported in src/main.tsx) are emitted by Vite with hashed names,
 * so index.html cannot reference them by hand. This plugin finds the hero's faces in the final
 * bundle and preloads them: Space Grotesk 700 (the <h1>, the LCP element) and the Inter variable
 * face (role, tagline and buttons). Only the Latin subsets are preloaded; the other unicode ranges
 * stay on demand.
 */
export const PRELOAD_FONTS = [/^space-grotesk-latin-700-normal-[\w-]+\.woff2$/, /^inter-latin-wght-normal-[\w-]+\.woff2$/]

export function preloadTags(fileNames: string[], base: string, patterns: RegExp[] = PRELOAD_FONTS): HtmlTagDescriptor[] {
  return patterns
    .map(re => fileNames.find(f => re.test(f.split('/').pop() ?? '')))
    .filter((f): f is string => !!f)
    .map(f => ({
      tag: 'link',
      attrs: { rel: 'preload', href: `${base}${f}`, as: 'font', type: 'font/woff2', crossorigin: '' },
      injectTo: 'head-prepend' as const,
    }))
}

export function fontPreload(): Plugin {
  let base = '/'
  return {
    name: 'font-preload',
    apply: 'build',
    configResolved(config) { base = config.base },
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        if (!ctx.bundle) return []
        return preloadTags(Object.keys(ctx.bundle), base)
      },
    },
  }
}
