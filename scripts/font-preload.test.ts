import { describe, expect, it } from 'vitest'
import { preloadTags } from './font-preload'

describe('preloadTags', () => {
  const bundle = [
    'assets/index-abc.js',
    'assets/space-grotesk-latin-ext-700-normal-Aa1.woff2',
    'assets/space-grotesk-latin-700-normal-RjhwGPKo.woff2',
    'assets/space-grotesk-latin-700-normal-RjhwGPKo.woff',
    'assets/inter-latin-wght-normal-Dx4kXJAl.woff2',
    'assets/inter-cyrillic-wght-normal-Zz9.woff2',
  ]

  it('preloads only the Latin hero faces, with the base path and CORS mode fonts need', () => {
    expect(preloadTags(bundle, '/carreerV2/')).toEqual([
      {
        tag: 'link',
        attrs: { rel: 'preload', href: '/carreerV2/assets/space-grotesk-latin-700-normal-RjhwGPKo.woff2', as: 'font', type: 'font/woff2', crossorigin: '' },
        injectTo: 'head-prepend',
      },
      {
        tag: 'link',
        attrs: { rel: 'preload', href: '/carreerV2/assets/inter-latin-wght-normal-Dx4kXJAl.woff2', as: 'font', type: 'font/woff2', crossorigin: '' },
        injectTo: 'head-prepend',
      },
    ])
  })

  it('emits nothing for faces that are not in the bundle', () => {
    expect(preloadTags(['assets/index-abc.js'], '/')).toEqual([])
  })
})
