export default function({ types: t }) {

  const primaryWrappers = {

    IfStatement(name, path) {
      let node = path.node;
      if (!node.visited) {
        path.replaceWith(
          t.ifStatement(
            buildGuardExpression(name, node.test),
            node.consequent,
            node.alternate
          )
        );
        setVisited(path.node);
      }
      return true;
    },

    BlockStatement() {
      return false;
    }

  };

  const secondaryWrappers = {

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
        buildGuardExpression(name, path.node)
      );
    },

    ObjectProperty(name, path) {
      path.replaceWith(
        t.objectProperty(
          path.node.key,
          buildGuardExpression(name, path.node.value)
        )
      )
    }

  };

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

  // if logic for now, will clean up later.
  function lookup(path, targets) {
    if (targets.indexOf(path.node.type) !== -1) {
      return path;
    }
    else if (path.parentPath) {
      return lookup(path.parentPath, targets);
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

  return {

    visitor: {

      Identifier(path) {

        const node = path.node;

        // Need to check for more than just 'window'
        if (node.name === 'window' && !node.visited) {

          let stopParent = lookup(path, Object.keys(primaryWrappers));
          let result = null;

          if (stopParent && primaryWrappers[stopParent.type]) {
            result = primaryWrappers[stopParent.type](node.name, stopParent);
            setVisited(node);
          }

          if (!result) {
            let parent = lookup(path, Object.keys(secondaryWrappers));

            if (parent && secondaryWrappers[parent.type]) {
              secondaryWrappers[parent.type](node.name, parent);
              setVisited(node);
            }
          }
        }
      }

    }

  }

}
