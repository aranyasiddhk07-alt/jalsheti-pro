import implDoc from '../../assets/docs/IMPLEMENTATION.md?raw';
import DocViewer from './DocViewer';

export default function ImplementationDoc() {
  return <DocViewer title="Technical Implementation" content={implDoc} />;
}
