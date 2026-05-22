import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from './locales/en/common.json'
import enConnect from './locales/en/connect.json'
import enPortfolio from './locales/en/portfolio.json'
import enRoast from './locales/en/roast.json'
import enFxPl from './locales/en/fxPl.json'
import enTrend from './locales/en/trend.json'

import zhCommon from './locales/zh-CN/common.json'
import zhConnect from './locales/zh-CN/connect.json'
import zhPortfolio from './locales/zh-CN/portfolio.json'
import zhRoast from './locales/zh-CN/roast.json'
import zhFxPl from './locales/zh-CN/fxPl.json'
import zhTrend from './locales/zh-CN/trend.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        connect: enConnect,
        portfolio: enPortfolio,
        roast: enRoast,
        fxPl: enFxPl,
        trend: enTrend,
      },
      'zh-CN': {
        common: zhCommon,
        connect: zhConnect,
        portfolio: zhPortfolio,
        roast: zhRoast,
        fxPl: zhFxPl,
        trend: zhTrend,
      },
    },
    fallbackLng: 'zh-CN',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
