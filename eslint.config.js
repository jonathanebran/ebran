import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // `rules-of-hooks` continua como ERRO: é a regra que pega hook depois de
      // return condicional, a causa real de tela travada.
      //
      // As duas abaixo viram AVISO. Elas sinalizam padrões legítimos que o app
      // usa de propósito — ler o localStorage num efeito de montagem, assinar
      // um timer, gerar id com Date.now() dentro de um handler de clique.
      // Reescrever esse código correto só para calar a regra traria mais risco
      // do que benefício, mas continuam visíveis para revisão.
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  {
    // Arquivos de contexto exportam o provider junto com o hook e as constantes
    // — padrão idiomático do React. A regra só afeta a granularidade do
    // hot-reload em desenvolvimento, não o comportamento em produção.
    files: ['src/contexts/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
