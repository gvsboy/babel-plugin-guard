export default function({ types: t }) {

  const defaultIdentifiers = [
    'window',
    'document'
  ];

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

    // Do nothing, continuing the search.
    // Blocks are complex and we don't want the search to bleed elsewhere (like an IfStatement).
    BlockStatement() {
      return false;
    }

  };

  const secondaryWrappers = {

    ExpressionStatement(name, path) {
      path.replaceWith(
        buildGuardExpression(name, path.node.expression)
      );
      return true;
    },

    UnaryExpression(name, path) {
      path.replaceWith(
        buildGuardExpression(name, path.node)
      );
      return true;
    },

    VariableDeclarator(name, path) {
      path.replaceWith(
        t.variableDeclarator(
          path.node.id,
          buildGuardExpression(name, path.node.init)
        )
      );
      return true;
    },

    BinaryExpression(name, path) {
      path.replaceWith(
        buildGuardExpression(name, path.node)
      );
      return true;
    },

    ObjectProperty(name, path) {
      path.replaceWith(
        t.objectProperty(
          path.node.key,
          buildGuardExpression(name, path.node.value)
        )
      );
      return true;
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

  /**
   * Attempts to wrap a path segment with gating logic depending on the
   * node types to check against. If the path's node matches a valid node,
   * wrap it with gating logic.
   * @param {Object} path An AST path between two nodes
   * @param {Object} wrapperMap The wrapper types to validate against.
   * @return {Boolean} Was a wrapper found and, if so, does it dictate we continue the search?
   */
  function wrap(path, wrapperMap) {
    let parent = lookup(path, Object.keys(wrapperMap));
    if (parent) {
      setVisited(path.node);
      return wrapperMap[parent.type](path.node.name, parent);
    }
    return false;
  }

  function matches(path, identifiers = defaultIdentifiers) {
    return identifiers.indexOf(path.node.name) !== -1;
  }

  return {

    visitor: {

      // Need to check for more than just 'window'
      Identifier(path, state) {
        if (matches(path, state.opts.identifiers) && !path.node.visited) {
          if (!wrap(path, primaryWrappers)) {
            wrap(path, secondaryWrappers);
          }
        }
      }

    }

  }

}
