import ProductsPageComponent from "@/components/ProductsPageComponent";
import { useTranslations } from 'next-intl';

export default function WomenProductsPage() {
  const t = useTranslations('products');
  
  return (
    <ProductsPageComponent 
      fixedGenders={['WOMEN']}
      pageTitle={t('womenPageTitle')}
      pageSubtitle={t('womenPageSubtitle')}
    />
  );
}
