import ProductsPageComponent from "@/components/ProductsPageComponent";
import { useTranslations } from 'next-intl';

export default function MenProductsPage() {
  const t = useTranslations('products');
  
  return (
    <ProductsPageComponent 
      fixedGenders={['MEN']}
      pageTitle={t('menPageTitle')}
      pageSubtitle={t('menPageSubtitle')}
    />
  );
}
