import { useTheme } from '../../../context/ThemeContext.jsx';
import StandardCard from './templates/StandardCard.jsx';
import CompactCard from './templates/CompactCard.jsx';
import DetailedCard from './templates/DetailedCard.jsx';

export default function ProductCard({ product, onAddToCart }) {
  const { settings } = useTheme();
  const tpl = settings?.productTemplate || 'standard';

  if (tpl === 'compact') {
    return <CompactCard product={product} onAddToCart={onAddToCart} />;
  }
  if (tpl === 'detailed') {
    return <DetailedCard product={product} onAddToCart={onAddToCart} />;
  }
  return <StandardCard product={product} onAddToCart={onAddToCart} />;
}
