import NestedData = require('./NestedData');
interface NestedText extends NestedData<NestedText> {
    text: string;
}
export = NestedText;
