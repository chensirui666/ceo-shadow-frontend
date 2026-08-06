import { Button } from '@heroui/react'
import type { Locale } from '../appState.ts'
import type { Translation } from '../content/translations.ts'

type LanguageToggleProps = {
  locale: Locale
  onChange: (locale: Locale) => void
  copy: Translation
}

export default function LanguageToggle({ locale, onChange, copy }: LanguageToggleProps) {
  return (
    <Button aria-label={copy.language.switchToChinese} className="language-toggle" onPress={() => onChange(locale === 'en' ? 'zh' : 'en')} type="button">
      <span className={locale === 'en' ? 'language-option language-option-active' : 'language-option'}>EN</span>
      <span aria-hidden="true" className="language-separator">/</span>
      <span className={locale === 'zh' ? 'language-option language-option-active' : 'language-option'}>中文</span>
    </Button>
  )
}
