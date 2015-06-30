import NNDocument = require('./NestedNode/NNDocument');
import NNDocumentView = require('./NestedNodeView/NNDocumentView');
declare var lib: {
    NNDocument: typeof NNDocument;
    NNDocumentView: typeof NNDocumentView;
};
export = lib;
