import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { languageDetector } from './detector'

// EN modules
import enNav from './locales/en/nav.json'
import enHero from './locales/en/hero.json'
import enAbout from './locales/en/about.json'
import enSkills from './locales/en/skills.json'
import enExperience from './locales/en/experience.json'
import enProjects from './locales/en/projects.json'
import enEducation from './locales/en/education.json'
import enContact from './locales/en/contact.json'

// ES modules
import esNav from './locales/es/nav.json'
import esHero from './locales/es/hero.json'
import esAbout from './locales/es/about.json'
import esSkills from './locales/es/skills.json'
import esExperience from './locales/es/experience.json'
import esProjects from './locales/es/projects.json'
import esEducation from './locales/es/education.json'
import esContact from './locales/es/contact.json'

const en = { ...enNav, ...enHero, ...enAbout, ...enSkills, ...enExperience, ...enProjects, ...enEducation, ...enContact }
const es = { ...esNav, ...esHero, ...esAbout, ...esSkills, ...esExperience, ...esProjects, ...esEducation, ...esContact }

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    interpolation: { escapeValue: false },
  })

export default i18n
