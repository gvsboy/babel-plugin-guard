export default function({ types: t }) {

  const wrappers = {

    ExpressionStatement(name, path) {
      path.replaceWith(
        buildGuardExpression(name, path.node.expression)
      );
    },

    UnaryExpression(name, path) {
      path.replaceWith(
        buildGuardExpression(name, path.node)
      );
    },

    VariableDeclarator(name, path) {
      path.replaceWith(
        t.variableDeclarator(
          path.node.id,
          buildGuardExpression(name, path.node.init)
        )
      );
    },

    BinaryExpression(name, path) {
      path.replaceWith(
        t.binaryExpression(
          path.node.operator,
          buildGuardExpression(name, path.node.left),
          path.node.right
        )
      );
    }

  };

  const lookupTargets = Object.keys(wrappers);

  // if logic for now, will clean up later.
  function lookup(path) {
    if (lookupTargets.indexOf(path.node.type) !== -1) {
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

        // Need to check for more than just 'window'
        if (node.name === 'window' && !node.visited) {

          let parent = lookup(path);

          if (parent && wrappers[parent.type]) {
            wrappers[parent.type](node.name, parent);
            setVisited(node);
          }
        }
      }

    }

  }

}
