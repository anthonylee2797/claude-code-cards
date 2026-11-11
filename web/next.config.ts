import path from 'node:path'
import type { NextConfig } from 'next'

// The app imports ../shared and ../data, so the build root is the repo.
const config: NextConfig = { turbopack: { root: path.join(__dirname, '..') } }
export default config
