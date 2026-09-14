var m={name:"@supabase/mcp-server-supabase",mcpName:"com.supabase/mcp",version:"0.12.0",description:"MCP server for interacting with Supabase",license:"Apache-2.0",repository:{type:"git",url:"https://github.com/supabase/mcp.git"},type:"module",main:"dist/index.cjs",types:"dist/index.d.ts",sideEffects:!1,scripts:{build:"tsup --clean",dev:"tsup --watch",typecheck:"tsc --noEmit",prebuild:"pnpm typecheck",prepublishOnly:"pnpm build","registry:update":"tsx scripts/registry/update-version.ts && biome format --write server.json","registry:login":"scripts/registry/login.sh","registry:publish":"mcp-publisher publish",test:"vitest","test:unit":"vitest --project unit","test:e2e":"vitest --project e2e","test:integration":"vitest --project integration","test:coverage":"vitest --coverage","generate:management-api-types":"node scripts/generate-management-api-types.mjs"},files:["dist/**/*"],bin:{"mcp-server-supabase":"./dist/transports/stdio.js"},exports:{".":{types:"./dist/index.d.ts",import:"./dist/index.js",default:"./dist/index.cjs"},"./platform":{types:"./dist/platform/index.d.ts",import:"./dist/platform/index.js",default:"./dist/platform/index.cjs"},"./platform/api":{types:"./dist/platform/api-platform.d.ts",import:"./dist/platform/api-platform.js",default:"./dist/platform/api-platform.cjs"}},dependencies:{"@mjackson/multipart-parser":"^0.10.1","@supabase/mcp-utils":"workspace:^","common-tags":"^1.8.2",gqlmin:"^0.3.1",graphql:"^16.11.0","openapi-fetch":"^0.13.5"},peerDependencies:{"@modelcontextprotocol/server":"catalog:",zod:"catalog:"},devDependencies:{"@ai-sdk/anthropic":"catalog:","@ai-sdk/mcp":"catalog:","@electric-sql/pglite":"^0.2.17","@modelcontextprotocol/client":"catalog:","@modelcontextprotocol/server":"catalog:","@total-typescript/tsconfig":"^1.0.4","@types/common-tags":"^1.8.4","@types/node":"^22.8.6","@vitest/coverage-v8":"^2.1.9",ai:"catalog:","date-fns":"^4.1.0",dotenv:"^16.5.0",msw:"^2.7.3",nanoid:"^5.1.5","openapi-typescript":"^7.5.0","openapi-typescript-helpers":"^0.0.15",prettier:"^3.3.3",tsup:"^8.3.5",tsx:"^4.19.2",typescript:"^5.6.3",vite:"^5.4.19",vitest:"^2.1.9",zod:"catalog:"}};import{codeBlock as o}from"common-tags";import{resolve as n}from"path";function u(e,t,i){return`${e}_${t}_${i}`}function a(e){return`/tmp/user_fn_${e}/`}function r(e,t){return e.startsWith(t)?e.slice(t.length):e}function f({deploymentId:e,filename:t}){let i=a(e),s=n(i,t);return s=r(s,i),s=r(s,"source/"),s}var y=o`
  import "jsr:@supabase/functions-js/edge-runtime.d.ts";

  Deno.serve(async (req: Request) => {
    const data = {
      message: "Hello there!"
    };
    
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive'
      }
    });
  });
`;export{m as a,u as b,f as c,y as d};
//# sourceMappingURL=chunk-GZNCDKYI.js.map