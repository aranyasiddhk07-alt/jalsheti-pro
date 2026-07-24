import productDoc from '../../assets/docs/PRODUCT.md?raw';
import DocViewer from './DocViewer';

export default function ProductDoc() {
  return <DocViewer title="Product Documentation" content={productDoc} />;
}
