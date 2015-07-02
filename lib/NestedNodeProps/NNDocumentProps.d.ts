import NestedNodeProps = require('./NestedNodeProps');
interface NNDocumentProps<D> {
    editMode: boolean;
    content: NestedNodeProps<D>;
}
export = NNDocumentProps;
