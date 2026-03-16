module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'babel-plugin-transform-import-meta',
      // Zustand の devtools middleware が import.meta.env を使用しているため、
      // Metro バンドル時（node_modules 含む）に process.env へ変換するインラインプラグイン。
      // babel-plugin-transform-import-meta は import.meta.url のみ対象のため、
      // import.meta.env は別途このプラグインで対応する。
      function transformImportMetaEnv({ types: t }) {
        return {
          name: 'transform-import-meta-env',
          visitor: {
            MetaProperty(path) {
              if (
                path.node.meta.name === 'import' &&
                path.node.property.name === 'meta'
              ) {
                const parent = path.parent;
                if (
                  parent.type === 'MemberExpression' &&
                  !parent.computed &&
                  parent.property.name === 'env'
                ) {
                  // import.meta.env → process.env
                  // (import.meta.env.MODE → process.env.MODE に連鎖で変換される)
                  path.parentPath.replaceWith(
                    t.memberExpression(
                      t.identifier('process'),
                      t.identifier('env'),
                    ),
                  );
                }
              }
            },
          },
        };
      },
    ],
  };
};
