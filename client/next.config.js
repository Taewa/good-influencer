const {
    PHASE_DEVELOPMENT_SERVER,
    PHASE_PRODUCTION_BUILD,
} = require('next/constants')

/**
 * When your run next dev or npm run dev, you will always use the environmental variables assigned when isDev is true in the example.
 * When you run next build then next start, assuming you set externally the environmental variable STAGING to anything but 1, you will get the results assuming isProd is true.
 * When your run next build or npm run build in production, if the environmental variable STAGING is set to 1, isStaging will be set and you will get those values returned.
 */
/** @type {import('next').NextConfig} */
module.exports = (phase) => {
    // when started in development mode `next dev` or `npm run dev` regardless of the value of STAGING environment variable
    const isDev = phase === PHASE_DEVELOPMENT_SERVER
    // when `next build` or `npm run build` is used
    const isProd = phase === PHASE_PRODUCTION_BUILD && process.env.STAGING !== '1'  // Check .env.* files for 'STAGING'
    // when `next build` or `npm run build` is used
    const isStaging =
        phase === PHASE_PRODUCTION_BUILD && process.env.STAGING === '1'

    console.log(`isDev:${isDev}  isProd:${isProd}   isStaging:${isStaging}`)

    const env = {
        INFLUENCER_CONTRACT_ADDRESS: (() => {
            if (isDev) return '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c'
            if (isProd) return ''
            if (isStaging) return ''
            return 'INFLUENCER_CONTRACT_ADDRESS:not (isDev,isProd && !isStaging,isProd && isStaging)'
        })(),
        INFLUENCER_MANAGER_CONTRACT_ADDRESS: (() => {
            if (isDev) return '0xc6e7DF5E7b4f2A278906862b61205850344D4e7d'
            if (isProd) return ''
            if (isStaging) return ''
            return 'INFLUENCER_MANAGER_CONTRACT_ADDRESS:not (isDev,isProd && !isStaging,isProd && isStaging)'
        })(),
    }

    // next.config.js object
    return {
        env,
    }
}
