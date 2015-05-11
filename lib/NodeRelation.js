define(["require", "exports"], function (require, exports) {
    var NodeRelation;
    (function (NodeRelation) {
        NodeRelation[NodeRelation["Parent"] = 0] = "Parent";
        NodeRelation[NodeRelation["Nested"] = 1] = "Nested";
        NodeRelation[NodeRelation["PrecedingSibling"] = 2] = "PrecedingSibling";
        NodeRelation[NodeRelation["FollowingSibling"] = 3] = "FollowingSibling";
    })(NodeRelation || (NodeRelation = {}));
    return NodeRelation;
});
