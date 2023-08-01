const {
    PHASE_DEVELOPMENT_SERVER,
    PHASE_PRODUCTION_BUILD,
} = require('next/constants')

/**
 * When your run next dev or npm run dev, you will always use the environmental variables assigned when isLocal is true in the example.
 * When you run next build then next start, assuming you set externally the environmental variable ACCEPTANCE to anything but 1, you will get the results assuming isProd is true.
 * When your run next build or npm run build in production, if the environmental variable ACCEPTANCE is set to 1, isAcceptance will be set and you will get those values returned.
 */
/** @type {import('next').NextConfig} */
module.exports = (phase) => {
    // when started in development mode `next dev` or `npm run dev` regardless of the value of ACCEPTANCE environment variable
    const isLocal = phase === PHASE_DEVELOPMENT_SERVER && process.env.TESTNET !== '1'
    const isTestNet = phase === PHASE_DEVELOPMENT_SERVER && process.env.TESTNET === '1'
    // when `next build` or `npm run build` is used
    const isProd = phase === PHASE_PRODUCTION_BUILD && process.env.ACCEPTANCE !== '1'  // Check .env.* files for 'ACCEPTANCE'
    // when `next build` or `npm run build` is used
    const isAcceptance = phase === PHASE_PRODUCTION_BUILD && process.env.ACCEPTANCE === '1'

    console.log(`isLocal:${isLocal}  isTestNet:${isTestNet}   isAcceptance:${isAcceptance}   isProd:${isProd}`)

    const env = {
        MODE: (() => {
            if (isLocal) return 'dev'
            if (isTestNet) return 'test'
            if (isAcceptance) return 'accp'
            if (isProd) return 'prod'
            return 'MODE:not (isLocal,isProd && !isAcceptance,isProd && isAcceptance)'
        })(),
        INFLUENCER_CONTRACT_ADDRESS: (() => {
            if (isLocal) return '0x3Aa5ebB10DC797CAC828524e59A333d0A371443c'
            if (isTestNet) return '0xf780dB1caeE620a61a337b4F744A76D5ccD28575'
            if (isAcceptance) return '0xf780dB1caeE620a61a337b4F744A76D5ccD28575'
            if (isProd) return ''
            return 'INFLUENCER_CONTRACT_ADDRESS:not (isLocal,isProd && !isAcceptance,isProd && isAcceptance)'
        })(),
        INFLUENCER_MANAGER_CONTRACT_ADDRESS: (() => {
            if (isLocal) return '0xc6e7DF5E7b4f2A278906862b61205850344D4e7d'
            if (isTestNet) return '0x03F791D5F396D4c4D04bBC046daf26380c1BaB40'
            if (isAcceptance) return '0x03F791D5F396D4c4D04bBC046daf26380c1BaB40'
            if (isProd) return ''
            return 'INFLUENCER_MANAGER_CONTRACT_ADDRESS:not (isLocal,isProd && !isAcceptance,isProd && isAcceptance)'
        })(),
    }

    // next.config.js object
    return {
        env,
    }
}
