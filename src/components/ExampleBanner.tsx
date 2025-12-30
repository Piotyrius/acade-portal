import { useTranslation } from 'react-i18next';

export function ExampleBanner() {
  const { t } = useTranslation('common');
  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm text-blue-800">
        <strong>{t('pages.exampleBannerTitle')}</strong> {t('pages.exampleBannerMessage')}
      </p>
    </div>
  );
}

