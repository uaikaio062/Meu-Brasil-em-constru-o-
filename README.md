# Meu Brasil em Construção — primeira versão

## O que está implementado
- Cadastro: nome, @ do Instagram, cidade e estado.
- Mapa interativo do Brasil com marcadores por estado.
- Busca de participantes e ranking.
- Pontuação inicial de 10 pontos.
- Estrutura para conectar Supabase e compartilhar os cadastros entre visitantes.
- Layout responsivo para celular e computador.

## Rodar localmente
1. Instale Node.js 18 ou superior.
2. Descompacte o projeto e abra um terminal nesta pasta.
3. Execute `npm install`.
4. Execute `npm run dev`.
5. Abra o endereço indicado pelo Vite.

## Publicar online (Vercel + Supabase)
1. Crie um projeto no Supabase.
2. Abra SQL Editor e execute `supabase/schema.sql`.
3. Copie Project URL e anon/public key para um arquivo `.env` baseado em `.env.example`.
4. Publique esta pasta em um repositório GitHub.
5. Importe o repositório na Vercel e configure as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
6. Faça Deploy. A Vercel fornece um endereço público gratuito inicial; domínio próprio pode ser comprado e conectado depois.

## Avisos importantes antes de abrir ao público
- Sem variáveis Supabase, a aplicação roda em modo demonstração e grava somente no navegador atual.
- Com Supabase, cadastros ficam compartilhados. As políticas RLS do SQL permitem leitura pública e cadastro público, mas não atualização pública de pontos/nível.
- O ranking e a evolução precisam de autenticação e funções seguras antes de permitir que participantes alterem seus próprios dados.
- O @ do Instagram é informado pelo usuário; esta versão não confirma a propriedade da conta nem usa API do Instagram.
- O marcador é aproximado na capital do estado selecionado, não representa o endereço da pessoa.
- Adicione moderação, proteção contra spam/rate limits, política de privacidade e termos antes de divulgar amplamente.
- O mapa usa OpenStreetMap. Respeite a política de uso dos tiles ou configure um provedor adequado para tráfego maior.
- Esta versão usa marcadores de casa no mapa; modelos 3D reais são a próxima etapa, não estão incluídos ainda.
