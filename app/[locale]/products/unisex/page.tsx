import ProductsPageComponent from "@/components/ProductsPageComponent";
import { useTranslations } from 'next-intl';

export default function UnisexProductsPage() {
  const t = useTranslations('products');
  
  return (
    <ProductsPageComponent 
      fixedGenders={['UNISEX']}
      pageTitle={t('unisexPageTitle')}
      pageSubtitle={t('unisexPageSubtitle')}
    />
  );
}
