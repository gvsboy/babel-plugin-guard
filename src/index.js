export default function({ types: t }) {

  // if logic for now, will clean up later.
  function lookup(path) {
    if (path.node.type === 'ExpressionStatement') {
      return path;
    }
    else if (path.node.type === 'VariableDeclarator') {
      return path;
    }
    else if (path.parentPath) {
      return lookup(path.parentPath);
    }
    return null;
  }

  function setVisited(node) {
    node.visited = true;
    return node;
  }

  function buildVisitedIndentifier(name) {
    return setVisited(
      t.identifier(name)
    );
  }

  /**
   * Wraps a given node in a logical expression to gate against undeclared identifiers.
   * @param {String} name The identifier name to gate against.
   * @param {Object} node The node to wrap in gating logic.
   * @return {Object} Builds a node resembling: typeof <name> !== "undefined" && <node>
   */
  function buildGuardExpression(name, node) {

    return t.logicalExpression(
      '&&',
      t.binaryExpression(
        '!==',
        t.unaryExpression(
          'typeof',
          buildVisitedIndentifier(name)
        ),
        t.stringLiteral('undefined')
      ),
      node
    );
  }

  return {

    visitor: {

      Identifier(path) {

        const node = path.node;

        if (node.name === 'window' && !node.visited) {
          let parent = lookup(path);

          if (parent) {

            // if logic for now, will clean up later.
            if (parent.type === 'ExpressionStatement') {
              parent.replaceWith(
                buildGuardExpression(
                  node.name,
                  parent.node.expression
                )
              );
            }
            else if (parent.type === 'VariableDeclarator') {
              parent.replaceWith(
                t.VariableDeclarator(
                  parent.node.id,
                  buildGuardExpression(
                    node.name,
                    parent.node.init
                  )
                )
              );
            }

            setVisited(node);
          }
        }
      }

    }

  }

}
