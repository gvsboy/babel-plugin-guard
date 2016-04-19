export default function({ types: t }) {

  let defaultIdentifiers = [
    'window',
    'document'
    //'location' need to fix tests first
  ];

  let referencedIdentifiers = [];
  let memberExpressionPaths = [];

  const primaryWrappers = {

    IfStatement(guardNode, path) {
      let node = path.node;
      if (!node.visited) {
        path.replaceWith(
          t.ifStatement(
            buildGuardExpression(guardNode, node.test),
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

    ExpressionStatement(guardNode, path) {
      path.replaceWith(
        buildGuardExpression(guardNode, path.node.expression)
      );
      return true;
    },

    UnaryExpression(guardNode, path) {
      path.replaceWith(
        buildGuardExpression(guardNode, path.node)
      );
      return true;
    },

    VariableDeclarator(guardNode, path) {

      let id = path.node.id;
      referencedIdentifiers.push(id.name);

      path.replaceWith(
        t.variableDeclarator(
          id,
          buildReferencedGuardExpression(guardNode, path.node.init)
        )
      );

      setVisited(path.node);
      return true;
    },

    BinaryExpression(guardNode, path) {
      path.replaceWith(
        buildGuardExpression(guardNode, path.node)
      );
      return true;
    },

    ObjectProperty(guardNode, path) {

      let key = path.node.key;
      referencedIdentifiers.push(key.name);

      path.replaceWith(
        t.objectProperty(
          key,
          buildReferencedGuardExpression(guardNode, path.node.value)
        )
      );

      setVisited(path.node);
      return true;
    }

  };

  let references = [];

  /**
   * Wraps a given node in a logical expression to gate against undeclared identifiers.
   * @param {String} name The identifier name to gate against.
   * @param {Object} node The node to wrap in gating logic.
   * @return {Object} Builds a node resembling: typeof <name> !== "undefined" && <node>
   */
  function buildGuardExpression(guardNode, node) {

    return t.logicalExpression(
      '&&',
      t.binaryExpression(
        '!==',
        t.unaryExpression(
          'typeof',
          guardNode
        ),
        t.stringLiteral('undefined')
      ),
      node
    );
  }

  function buildReferencedGuardExpression(guardNode, node) {

    return t.logicalExpression(
      '||',
      buildGuardExpression(guardNode, node),
      t.identifier('undefined')
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
  function wrap(path, wrapperMap, guardNode) {
    let parent = lookup(path, Object.keys(wrapperMap));
    if (parent && !parent.node.visited) {
      setVisited(path.node);
      return wrapperMap[parent.type](guardNode, parent);
    }
    return false;
  }

  function matches(path, identifiers = defaultIdentifiers) {
    return identifiers.indexOf(path.node.name) !== -1;
  }


  function findExpression(path, prop) {

    let node = path.node;
    let obj = node.object.name;
    let type = node.type;

    let parentPath = path.parentPath;

    // If the parent is NOT a member expression, return the current node.
    if (parentPath.node.type !== 'MemberExpression') {
      return node;
    }

    // Else, if the parent's property node is NOT a referenced id, we've gone far enough.
    else if (!referencedIdentifiers.some(id => id === parentPath.node.property.name)) {
      return node;
    }

    // Otherwise, let's peek up.
    else {
      return findExpression(parentPath, prop);
    }

    // No expression was found? That can't be right.
    return null;
  }

  return {

    visitor: {

      MemberExpression(path) {
        memberExpressionPaths.push(path);
      },

      Identifier(path, state) {

        if (matches(path, state.opts.identifiers) && !path.node.visited) {

          let guardNode = buildVisitedIndentifier(path.node.name);

          if (!wrap(path, primaryWrappers, guardNode)) {
            wrap(path, secondaryWrappers, guardNode);
          }
        }
      },

      Program: {

        exit() {

          if (referencedIdentifiers.length) {

            memberExpressionPaths.forEach((path) => {

              var node = path.node;

              if (!node.visited) {

                let prop = node.property.name;

                if (referencedIdentifiers.some(id => id === prop)) {
                  let exp = findExpression(path, prop);
                  if (exp) {
                    exp = setVisited(exp);
                    if (!wrap(path, primaryWrappers, exp)) {
                      wrap(path, secondaryWrappers, exp);
                    }
                  }
                }

                else {
                  let obj = node.object.name;

                  if (referencedIdentifiers.some(id => id === obj)) {
                    
                    console.log('the object is referenced!', obj);

                    let guardNode = buildVisitedIndentifier(obj);

                    if (!wrap(path, primaryWrappers, guardNode)) {
                      wrap(path, secondaryWrappers, guardNode);
                    }                    
                  }
                }


              }


            });
          }
/*
          // If there were any references to guarded items found, we need to
          // guard against those as well. This currently only goes one level
          // deep (in other words, if a reference is made on a reference, we
          // don't catch that). Perhaps you should consider explicitly listing
          // those identifiers in the config you pass. It would have better
          // performance that way.
          if (referencedIdentifiers.length) {

            // Member expressions are the culprits, as missing properties may
            // be referenced.
            memberExpressionPaths.forEach((path) => {

              let node = path.node;

              if (!node.visited) {

                // Search for the reference within the object and property items.
                let references = [node.object.name, node.property.name];
                let ref = references.find(r => referencedIdentifiers.find(i => i === r));

                // If a reference was found, wrap it.
                if (ref) {
                  console.log(ref);
                  let name = `${node.object.name}.${node.property.name}`;
                  if (!wrap(path, primaryWrappers, name)) {
                    wrap(path, secondaryWrappers, name);
                  }
                }
              }
            });
          }
*/
        }

      }

    }

  }

}
