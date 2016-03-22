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
        if (path.node.name === 'window') {
          let parent = lookup(path);
          parent.insertBefore(
            t.binaryExpression(
              '!==',
              t.unaryExpression(
                'typeof',
                t.identifier('wefewf')
              ),
              t.stringLiteral('undefined')
            )
          );
/*
          path.parentPath.replaceWith(
            t.expressionStatement(
              t.logicalExpression(
                '&&',
                t.stringLiteral('worms'),
                t.stringLiteral('cans')
              )
            )
          );

          /*
          path.replaceWith(
            t.expressionStatement(
              t.logicalExpression(
                '&&',
                t.stringLiteral('worms'),
                t.identifier('cans')
              )
            )
          )
          */
          
          /*
          path.replaceWith(
            t.binaryExpression(
              '!==',
              t.unaryExpression(
                'typeof',
                t.identifier(path.node.name)
              ),
              t.stringLiteral('undefined')
            )
          );
          path.stop();
          */
        }
      }

    }

  }

}
