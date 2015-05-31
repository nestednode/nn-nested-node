import NestedNodeProps = require('./NestedNodeProps');


interface NNDocumentProps<D> {

    editMode: boolean;

    node: NestedNodeProps<D>;

}


export = NNDocumentProps;
