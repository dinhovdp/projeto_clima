/**
 * Configuração do Babel exclusiva para os testes (Jest).
 *
 * O navegador carrega assets/js/*.js diretamente como ES Modules
 * nativos (<script type="module">) e não passa por este arquivo.
 *
 * O Jest, por outro lado, roda em Node no modo CommonJS
 * ("type": "commonjs" no package.json). Esta configuração instrui
 * o babel-jest a transformar `import`/`export` em `require`/
 * `module.exports` apenas durante a execução dos testes, sem
 * alterar em nada o código-fonte nem o comportamento no navegador.
 */

module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current'
                }
            }
        ]
    ]
};
