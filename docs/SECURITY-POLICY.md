# 🔒 Hachi ERP — Política de Segurança

> Documento de referência para práticas de segurança do projeto.
> Última atualização: 02/07/2026

---

## 1. Rotação de Credenciais (a cada 90 dias)

### Credenciais que DEVEM ser rotacionadas:

| Credencial | Local | Frequência | Próxima Rotação |
|-----------|-------|------------|-----------------|
| `NEXTAUTH_SECRET` | Vercel Env + .env | 90 dias | 01/10/2026 |
| `DATABASE_URL` | Vercel Env + .env | 90 dias | 01/10/2026 |
| `BOTCONVERSA_API_KEY` | Vercel Env | 90 dias | 01/10/2026 |
| `PIX_CLIENT_SECRET` | Vercel Env | 90 dias | 01/10/2026 |
| `NFE_API_KEY` | Vercel Env | 90 dias | 01/10/2026 |
| `ENCRYPTION_KEY` | Vercel Env + .env | Nunca rotacionar sem re-criptografar dados* | — |

> *A `ENCRYPTION_KEY` não pode ser rotacionada sem decriptar e re-criptar todos os campos sensíveis no banco.

### Processo de rotação:

1. Gerar nova secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Atualizar no Vercel: `vercel env rm NEXTAUTH_SECRET production && vercel env add NEXTAUTH_SECRET production`
3. Atualizar `.env` local
4. Redeploy: `vercel --prod`
5. Verificar que o login funciona após rotação

---

## 2. Supply Chain Protection

### Regras de instalação de pacotes:

- **CI/CD**: Sempre usar `npm ci --ignore-scripts` + `npx prisma generate` depois
- **Dev local**: O `.npmrc` já tem `ignore-scripts=true`
- **Antes de atualizar @tanstack/***: Verificar changelog no GitHub oficial
- **Antes de adicionar nova dependência**: Verificar no [Socket.dev](https://socket.dev/) ou [Snyk](https://snyk.io/)

### Pacotes monitorados (supply chain risk):

| Pacote | Versão Atual | Última Verificação | Status |
|--------|:---:|:---:|--------|
| `@tanstack/react-query` | 5.62.0 | 02/07/2026 | ✅ Seguro |
| `@tanstack/react-table` | 8.20.0 | 02/07/2026 | ✅ Seguro |
| `docxtemplater` | 3.69.0 | 02/07/2026 | ✅ Seguro |
| `exceljs` | 4.4.0 | 02/07/2026 | ⚠️ Dep `uuid` vulnerável (não afeta em runtime) |
| `next` | 15.5.20 | 02/07/2026 | ⚠️ PostCSS XSS (server-side only, não afeta usuários) |

---

## 3. Vulnerabilidades Conhecidas (Aceitas)

| CVE/Advisory | Pacote | Severidade | Justificativa para aceitar |
|-------------|--------|:---:|---------------------------|
| GHSA-qx2v-qp2m-jg93 | postcss (via next) | Moderate | PostCSS é usado server-side para build. XSS não é explorável porque CSS não é gerado a partir de input do usuário. Fix requer downgrade para Next 9 (inviável). |

---

## 4. Headers de Segurança (Aplicados)

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; frame-ancestors 'none'; ...
```

---

## 5. Rate Limiting

| Endpoint | Limite | Window |
|----------|:---:|:---:|
| `POST /api/auth/login` | 5 req | 60s por IP |
| Todos APIs | 120 req | 60s por IP |

---

## 6. Autenticação & Sessão

- JWT (jose) com expiração de 7 dias
- Cookie: `httpOnly`, `secure` (em prod), `sameSite=strict`
- Token blacklist no logout (in-memory; Redis em produção)
- 2FA TOTP disponível para todos os usuários
- Política de senhas: 8+ chars, maiúscula, minúscula, número, caractere especial

---

## 7. Checklist de Deploy (antes de cada release)

- [ ] `npm audit` sem vulnerabilidades high/critical
- [ ] Testes passando (`npm test`)
- [ ] Build limpo (`npm run build`)
- [ ] Credenciais não expostas no commit (`git diff --cached -- '*.env*'`)
- [ ] Rate limiting ativo
- [ ] CORS allowlist correto
- [ ] Headers de segurança presentes
