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
module.exports = async (phase) => {
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
        API_DOMAIN: (() => {
            const nonLocalDomain = 'https://good-influencer-be-fk8d-6sjybhv89-taewa.vercel.app';
            if (isLocal) return 'http://localhost:8888'
            if (isTestNet) return nonLocalDomain
            if (isAcceptance) return nonLocalDomain
            if (isProd) return nonLocalDomain
            return 'MODE:not (isLocal,isProd && !isAcceptance,isProd && isAcceptance)'
        })(),
        INFLUENCER_CONTRACT_ADDRESS: (() => {
            if (isLocal) return '0x9A676e781A523b5d0C0e43731313A708CB607508'
            if (isTestNet) return '0x6609ECB6a0fa994a42d23ee8AB06E60B555c29Ba'
            if (isAcceptance) return '0x6609ECB6a0fa994a42d23ee8AB06E60B555c29Ba'
            if (isProd) return ''
            return 'INFLUENCER_CONTRACT_ADDRESS:not (isLocal,isProd && !isAcceptance,isProd && isAcceptance)'
        })(),
        INFLUENCER_MANAGER_CONTRACT_ADDRESS: (() => {
            if (isLocal) return '0x0B306BF915C4d645ff596e518fAf3F9669b97016'
            if (isTestNet) return '0x69363b08DcE61B6Be2479130DF8D7293a6BD1A06'
            if (isAcceptance) return '0x69363b08DcE61B6Be2479130DF8D7293a6BD1A06'
            if (isProd) return ''
            return 'INFLUENCER_MANAGER_CONTRACT_ADDRESS:not (isLocal,isProd && !isAcceptance,isProd && isAcceptance)'
        })(),
    }

    // headers = async () => {
    //     return [
    //       {
    //         // matching all API routes
    //         source:  "/(.*?)",
    //         // headers: [
    //         //     {
    //         //       key: 'x-custom-header',
    //         //       value: 'my custom header value',
    //         //     },
    //         //     {
    //         //       key: 'x-another-custom-header',
    //         //       value: 'my other custom header value',
    //         //     },
    //         // ],
    //         headers: [
    //           { key: "Access-Control-Allow-Credentials", value: "true" },
    //           { key: "Access-Control-Allow-Origin", value: "*" },
    //           { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
    //           { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
    //         ]
    //       }
    //     ]
    // }

    // next.config.js object
    return {
        env,
        // async headers () {
        //     return [
        //       {
        //         // matching all API routes
        //         // source:  "/(.*)",
        //         source:  "/:path*",
        //         // headers: [
        //         //     {
        //         //       key: 'x-custom-header',
        //         //       value: 'my custom header value',
        //         //     },
        //         //     {
        //         //       key: 'x-another-custom-header',
        //         //       value: 'my other custom header value',
        //         //     },
        //         // ],
        //         headers: [
        //           { key: "Access-Control-Allow-Credentials", value: "true" },
        //           { key: "Access-Control-Allow-Origin", value: "*" },
        //           { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        //           { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        //         ]
        //       }
        //     ]
        // },
    }
}
