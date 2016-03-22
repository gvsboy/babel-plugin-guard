export default function({ types: t }) {

  function lookup(path) {
    if (path.node.type === 'ExpressionStatement') {
      return path;
    }
    else if (path.parentPath) {
      return lookup(path.parentPath);
    }
    return null;
  }

  return {

    visitor: {

      Identifier(path) {

        const node = path.node;

        if (node.name === 'window' && !node.visited) {
          let parent = lookup(path);
          if (parent) {
            let identifier = t.identifier(node.name);
            identifier.visited = true;
            parent.replaceWith(
              t.logicalExpression(
                '&&',
                t.binaryExpression(
                  '!==',
                  t.unaryExpression(
                    'typeof',
                    identifier
                  ),
                  t.stringLiteral('undefined')
                ),
                parent.node.expression
              )
            );
            node.visited = true;
          }
        }
      }

    }

  }

}
