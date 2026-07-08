"use client";
/* eslint-disable @next/next/no-img-element */
export default function GuiaPage() {
  return (
    <>
      <style jsx global>{`
        @page {
          size: A4;
          margin: 20mm 18mm 25mm 18mm;
        }
        @media print {
          body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-document { padding: 0 !important; }
          .no-print { display: none !important; }
          table { page-break-inside: avoid; }
          tr { page-break-inside: avoid; }
          .page-break { break-before: page; }
          .cover-page { break-after: page; }
          .toc { break-after: page; }
          a { color: inherit !important; text-decoration: none !important; }
          .footer-print { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 9px; color: #666; padding: 8px; border-top: 1px solid #ddd; }
        }
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; line-height: 1.6; }
        .print-document { max-width: 210mm; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #0D9488; margin-top: 0; }
        h1 { font-size: 28px; border-bottom: 3px solid #0D9488; padding-bottom: 8px; }
        h2 { font-size: 22px; border-bottom: 2px solid #0D9488; padding-bottom: 6px; margin-top: 24px; }
        h3 { font-size: 16px; margin-top: 16px; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0 20px 0; font-size: 13px; }
        th { background: #0D9488; color: #fff; padding: 10px 12px; text-align: left; font-weight: 600; }
        td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) td { background: #f0fdfa; }
        .code-block { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px 16px; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12.5px; white-space: pre-wrap; margin: 12px 0; line-height: 1.5; }
        blockquote { border-left: 4px solid #0D9488; margin: 16px 0; padding: 10px 16px; background: #f0fdfa; font-style: italic; color: #374151; }
        .cover-page { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; text-align: center; }
        .toc a { color: #0D9488; text-decoration: none; }
        .toc a:hover { text-decoration: underline; }
        .toc li { margin: 6px 0; font-size: 15px; }
        .page-break { break-before: page; }
        .section { margin-bottom: 32px; }
      `}</style>

      <div className="print-document">
        {/* Footer for print */}
        <div className="footer-print">
          Hachi Platform — Documento Interno — Julho 2026
        </div>

        {/* ==================== COVER PAGE ==================== */}
        <div className="cover-page">
          <img src="/images/hachi-logo.png" alt="Hachi Logo" style={{ width: 120, height: 120, marginBottom: 24 }} />
          <h1 style={{ fontSize: 36, border: 'none', color: '#0D9488', marginBottom: 8 }}>Hachi Platform</h1>
          <p style={{ fontSize: 24, color: '#374151', marginBottom: 4, fontWeight: 600 }}>Guia Completo</p>
          <p style={{ fontSize: 18, color: '#6b7280', marginBottom: 24 }}>Para: <strong>Marquinhos</strong></p>
          <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 8 }}>CS, Onboarding, Suporte &amp; Apresentações</p>
          <div style={{ marginTop: 40, padding: '12px 24px', border: '2px solid #0D9488', borderRadius: 8 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#0D9488' }}>Última atualização: Julho 2026</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Este documento é seu mapa completo do sistema. Use como referência diária.</p>
          </div>
        </div>

        {/* ==================== TABLE OF CONTENTS ==================== */}
        <div className="toc page-break">
          <h1>Índice</h1>
          <ol style={{ fontSize: 15, lineHeight: 2.2, paddingLeft: 20 }}>
            <li><a href="#oqueeh">O Que É a Hachi Platform</a></li>
            <li><a href="#como-funciona">Como Funciona</a></li>
            <li><a href="#acesso">Acesso ao Sistema</a></li>
            <li><a href="#modulos">Módulos do Sistema</a></li>
            <li><a href="#fluxos">Fluxos Principais</a></li>
            <li><a href="#perfis">Perfis de Acesso (RBAC)</a></li>
            <li><a href="#super-admin">Super Admin</a></li>
            <li><a href="#integracoes">Integrações</a></li>
            <li><a href="#planos">Planos e Pricing</a></li>
            <li><a href="#script">Script de Apresentação</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#glossario">Glossário</a></li>
          </ol>
        </div>

        {/* ==================== SECTION 1: O QUE É ==================== */}
        <div className="page-break section" id="oqueeh">
          <h1>1. O Que É a Hachi Platform</h1>
          <p>A Hachi é um <strong>Business Operating System</strong> — um sistema operacional de negócios que serve <strong>8 verticais de mercado</strong> a partir de uma única base tecnológica:</p>
          <table>
            <thead>
              <tr><th>Vertical</th><th>Para quem</th><th>Exemplo de cliente</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Recovery</strong></td><td>Comunidades Terapêuticas, clínicas de reabilitação</td><td>CT Persev (nosso primeiro)</td></tr>
              <tr><td><strong>Clinic</strong></td><td>Clínicas médicas, odonto, fisio, psicologia</td><td>Clínica São Lucas</td></tr>
              <tr><td><strong>Senior</strong></td><td>Casas de repouso, ILPIs</td><td>Residencial Vida Plena</td></tr>
              <tr><td><strong>Hotel</strong></td><td>Hotéis, pousadas, hostels</td><td>Pousada Mar Azul</td></tr>
              <tr><td><strong>Restaurant</strong></td><td>Restaurantes, bares, pizzarias, dark kitchens</td><td>Bistrô da Praça</td></tr>
              <tr><td><strong>Education</strong></td><td>Escolas, cursos, instituições</td><td>Colégio Futuro</td></tr>
              <tr><td><strong>Vet</strong></td><td>Clínicas veterinárias, pet shops</td><td>PetVida Clínica</td></tr>
              <tr><td><strong>Services</strong></td><td>Agências, consultorias, escritórios</td><td>Agência Digital XYZ</td></tr>
            </tbody>
          </table>

          <h3>Frase-chave para apresentações:</h3>
          <blockquote>&ldquo;Uma plataforma. Infinitas verticais de negócio.&rdquo;</blockquote>
        </div>

        {/* ==================== SECTION 2: COMO FUNCIONA ==================== */}
        <div className="page-break section" id="como-funciona">
          <h1>2. Como Funciona</h1>
          <p style={{ color: '#6b7280', fontStyle: 'italic' }}>(para explicar ao cliente)</p>

          <h2>Os 4 Pilares</h2>
          <ol style={{ fontSize: 15, lineHeight: 2 }}>
            <li><strong>Operar</strong> — Organiza o dia a dia (agenda, cadastros, prontuário)</li>
            <li><strong>Controlar</strong> — Visibilidade total (financeiro, estoque, relatórios)</li>
            <li><strong>Integrar</strong> — Conecta tudo (WhatsApp, Pix, NFS-e, portal)</li>
            <li><strong>Evoluir</strong> — A mesma base serve vários mercados</li>
          </ol>

          <h2>Arquitetura em Camadas</h2>
          <p style={{ color: '#6b7280', fontSize: 13 }}>(para apresentações técnicas)</p>
          <div className="code-block">{`HACHI PLATFORM
├── Core Engine (segurança, auth, multi-tenant, API, audit)
├── Business OS (financeiro, CRM, agenda, docs, automação, BI)
├── Vertical Packs (módulos específicos por mercado)
└── Portais (admin, equipe, cliente/família, mobile)`}</div>
        </div>

        {/* ==================== SECTION 3: ACESSO AO SISTEMA ==================== */}
        <div className="page-break section" id="acesso">
          <h1>3. Acesso ao Sistema</h1>

          <h2>URLs Importantes</h2>
          <table>
            <thead>
              <tr><th>O quê</th><th>URL</th></tr>
            </thead>
            <tbody>
              <tr><td>Sistema (produção)</td><td>https://hachi-erp.vercel.app</td></tr>
              <tr><td>Login</td><td>https://hachi-erp.vercel.app/login</td></tr>
              <tr><td>Onboarding (criar conta)</td><td>https://hachi-erp.vercel.app/onboarding</td></tr>
              <tr><td>Super Admin</td><td>https://hachi-erp.vercel.app/admin-platform</td></tr>
              <tr><td>Landing Principal</td><td>https://hachi-erp.vercel.app/landing</td></tr>
              <tr><td>API Docs</td><td>https://hachi-erp.vercel.app/api/platform/docs</td></tr>
              <tr><td>Portal da Família</td><td>https://hachi-erp.vercel.app/portal-familia</td></tr>
            </tbody>
          </table>

          <h2>Credenciais de Demo</h2>
          <table>
            <thead>
              <tr><th>Vertical</th><th>Email</th><th>Senha</th><th>O que vê</th></tr>
            </thead>
            <tbody>
              <tr><td>Recovery (produção)</td><td>admin@hachi.com</td><td>Admin@2026</td><td>Tudo + Platform</td></tr>
              <tr><td>Clinic Demo</td><td>admin@clinic-demo.com</td><td>Clinic@2026</td><td>Módulos clínica</td></tr>
              <tr><td>Senior Demo</td><td>admin@senior-demo.com</td><td>Admin@Senior2026</td><td>Módulos ILPI</td></tr>
              <tr><td>Hotel Demo</td><td>admin@hotel-demo.com</td><td>Admin@Hotel2026</td><td>Módulos hotelaria</td></tr>
              <tr><td>Restaurant Demo</td><td>admin@restaurant-demo.com</td><td>Admin@Rest2026</td><td>Módulos restaurante</td></tr>
              <tr><td>Education Demo</td><td>admin@education-demo.com</td><td>Admin@Edu2026</td><td>Módulos escola</td></tr>
              <tr><td>Vet Demo</td><td>admin@vet-demo.com</td><td>Admin@Vet2026</td><td>Módulos veterinária</td></tr>
              <tr><td>Services Demo</td><td>admin@services-demo.com</td><td>Admin@Svc2026</td><td>Módulos prestador</td></tr>
            </tbody>
          </table>
        </div>

        {/* ==================== SECTION 4: MÓDULOS ==================== */}
        <div className="page-break section" id="modulos">
          <h1>4. Módulos do Sistema</h1>

          <h2>Módulos Compartilhados (todas as verticais têm)</h2>
          <table>
            <thead>
              <tr><th>Módulo</th><th>O que faz</th><th>Onde fica</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Dashboard</strong></td><td>KPIs em tempo real, alertas</td><td><code>/dashboard</code></td></tr>
              <tr><td><strong>Financeiro</strong></td><td>Mensalidades, contas, DRE, Pix</td><td><code>/financeiro</code></td></tr>
              <tr><td><strong>Agenda</strong></td><td>Agendamentos, profissionais, salas</td><td><code>/agenda</code></td></tr>
              <tr><td><strong>Documentos</strong></td><td>Contratos, receitas, recibos (geração automática)</td><td><code>/documentos</code></td></tr>
              <tr><td><strong>Estoque</strong></td><td>Itens, alertas de mínimo, validade</td><td><code>/estoque</code></td></tr>
              <tr><td><strong>Comunicação</strong></td><td>WhatsApp via BotConversa, fluxos</td><td><code>/comunicacao</code></td></tr>
              <tr><td><strong>Relatórios</strong></td><td>Ocupação, financeiro, clínico, exportação</td><td><code>/relatorios</code></td></tr>
              <tr><td><strong>Configurações</strong></td><td>Integrações, usuários, clínica</td><td><code>/configuracoes</code></td></tr>
            </tbody>
          </table>

          <h2>Módulos Específicos por Vertical</h2>
          <table>
            <thead>
              <tr><th>Módulo</th><th>Verticais que usam</th></tr>
            </thead>
            <tbody>
              <tr><td>Prontuário/Evoluções</td><td>Recovery, Clinic, Senior, Vet</td></tr>
              <tr><td>Prescrições</td><td>Recovery, Clinic</td></tr>
              <tr><td>Quartos/Leitos</td><td>Recovery, Senior, Hotel</td></tr>
              <tr><td>Portal da Família</td><td>Recovery, Senior, Education</td></tr>
              <tr><td>CRM</td><td>Clinic, Services, Restaurant</td></tr>
              <tr><td>Anamnese</td><td>Clinic</td></tr>
              <tr><td>Convênios TISS</td><td>Clinic</td></tr>
              <tr><td>PDV/Comandas</td><td>Restaurant</td></tr>
              <tr><td>Reservas</td><td>Hotel</td></tr>
            </tbody>
          </table>
        </div>

        {/* ==================== SECTION 5: FLUXOS PRINCIPAIS ==================== */}
        <div className="page-break section" id="fluxos">
          <h1>5. Fluxos Principais</h1>
          <p style={{ color: '#6b7280', fontStyle: 'italic' }}>(passo a passo)</p>

          <h2>Onboarding de Novo Cliente</h2>
          <div className="code-block">{`1. Cliente acessa /onboarding
2. Escolhe a vertical do negócio (8 opções)
3. Preenche nome da organização + nome do admin
4. Cria email e senha
5. Sistema cria: tenant + user + session (auto-login)
6. Cliente cai direto no dashboard com features da vertical ativas`}</div>
          <p><strong>Tempo total: &lt; 30 segundos</strong></p>

          <h2>Cadastro de Paciente/Cliente (Recovery como exemplo)</h2>
          <div className="code-block">{`1. Menu: Pacientes → Novo
2. Preencher: nome, CPF, nascimento, sexo, estado civil
3. Dados clínicos: substância, tempo de uso, comorbidades
4. Financeiro: valor mensalidade, dia vencimento
5. Responsável: nome, CPF, parentesco, telefone
6. Salvar → paciente criado`}</div>

          <h2>Gerar Contrato</h2>
          <div className="code-block">{`1. Ficha do paciente → aba Documentos
2. Clicar "Gerar Documento"
3. Selecionar "Contrato"
4. Sistema preenche automaticamente com dados do paciente
5. Download .docx (pronto para imprimir/assinar)`}</div>

          <h2>Registrar Evolução</h2>
          <div className="code-block">{`1. Menu: Prontuário → Nova Evolução
2. Selecionar paciente
3. Escolher tipo (Médica, Psicológica, Enfermagem, etc.)
4. Escrever conteúdo
5. Registrar sinais vitais (opcional)
6. Salvar → depois Assinar (irreversível)`}</div>

          <h2>Transferir Paciente de Quarto</h2>
          <div className="code-block">{`1. Ficha do paciente → aba Resumo
2. Na linha "Quarto", clicar "Mudar"
3. Modal mostra todos os quartos com ocupação
4. Selecionar quarto com vaga
5. Confirmar transferência`}</div>

          <h2>Enviar Mensagem WhatsApp</h2>
          <div className="code-block">{`1. Menu: Comunicação
2. Selecionar destinatário (telefone ou paciente)
3. Escolher: mensagem avulsa OU fluxo automatizado
4. Enviar
5. Status aparece: ENVIADA → ENTREGUE → LIDA`}</div>

          <h2>Portal da Família (para responsáveis)</h2>
          <div className="code-block">{`1. Admin gera token em Configurações → Portal da Família
2. Envia token ao responsável
3. Responsável acessa /portal-familia e insere o token
4. Vê: resumo do tratamento, evoluções, agenda, financeiro
5. Pode pagar mensalidade via QR Code Pix`}</div>
        </div>

        {/* ==================== SECTION 6: PERFIS DE ACESSO ==================== */}
        <div className="page-break section" id="perfis">
          <h1>6. Perfis de Acesso (RBAC)</h1>
          <table>
            <thead>
              <tr><th>Perfil</th><th>O que vê</th><th>O que NÃO vê</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>ADMIN</strong></td><td>Tudo + Platform + Configurações</td><td>—</td></tr>
              <tr><td><strong>Coordenador Terapêutico</strong></td><td>Pacientes, prontuário, agenda, estoque, quartos, documentos, comunicação</td><td>Financeiro, relatórios, configurações</td></tr>
              <tr><td><strong>Médico</strong></td><td>Pacientes, prontuário, prescrições, agenda, documentos</td><td>Financeiro, estoque, quartos</td></tr>
              <tr><td><strong>Psicólogo</strong></td><td>Pacientes, prontuário, agenda</td><td>Financeiro, estoque, documentos</td></tr>
              <tr><td><strong>Enfermeiro</strong></td><td>Pacientes, prontuário, agenda, estoque, quartos</td><td>Financeiro</td></tr>
              <tr><td><strong>Terapeuta</strong></td><td>Pacientes, prontuário, agenda</td><td>Financeiro, estoque</td></tr>
              <tr><td><strong>Secretária</strong></td><td>Pacientes, agenda, quartos, documentos, comunicação</td><td>Prontuário, financeiro</td></tr>
              <tr><td><strong>Financeiro</strong></td><td>Financeiro, relatórios, documentos</td><td>Prontuário</td></tr>
              <tr><td><strong>Monitor</strong></td><td>Agenda, estoque, quartos</td><td>Financeiro, prontuário</td></tr>
              <tr><td><strong>Apoio</strong></td><td>Agenda, estoque</td><td>Financeiro, prontuário, quartos</td></tr>
            </tbody>
          </table>
        </div>

        {/* ==================== SECTION 7: SUPER ADMIN ==================== */}
        <div className="page-break section" id="super-admin">
          <h1>7. Super Admin (só para nós)</h1>
          <p>Acesse: <code>/admin-platform</code> (apenas ADMIN vê esse menu na sidebar como &ldquo;Platform&rdquo;)</p>

          <h2>O que tem:</h2>
          <ul style={{ fontSize: 14, lineHeight: 2 }}>
            <li><strong>Dashboard:</strong> Total de tenants, ativos, usuários, verticais</li>
            <li><strong>Lista de organizações:</strong> cada tenant com vertical, plano, status</li>
            <li><strong>Detalhe do tenant:</strong> feature flags (ligar/desligar módulos), users, ativar/desativar</li>
            <li><strong>Health:</strong> status do banco, memória, uptime</li>
            <li><strong>Criar tenant:</strong> nome, slug, vertical, plano</li>
            <li><strong>Convidar user:</strong> gera credenciais temporárias</li>
          </ul>

          <h2>Criar um novo tenant manualmente</h2>
          <p style={{ color: '#6b7280', fontSize: 13 }}>(para cliente que não usa onboarding)</p>
          <div className="code-block">{`1. Acessar /admin-platform
2. Clicar "Novo Tenant"
3. Preencher: nome, slug, vertical, plano
4. Depois clicar no tenant criado → "Invite" para criar user admin`}</div>
        </div>

        {/* ==================== SECTION 8: INTEGRAÇÕES ==================== */}
        <div className="page-break section" id="integracoes">
          <h1>8. Integrações</h1>

          <h2>WhatsApp (BotConversa)</h2>
          <ul style={{ fontSize: 14, lineHeight: 1.8 }}>
            <li>Configuração: Configurações → Integrações → BotConversa</li>
            <li>Inserir API Key → Testar Conexão → Salvar</li>
            <li>Funciona para: mensagens avulsas e fluxos automatizados</li>
          </ul>

          <h2>Pix (Sicredi)</h2>
          <ul style={{ fontSize: 14, lineHeight: 1.8 }}>
            <li>Status: código pronto, aguardando certificado da cooperativa</li>
            <li>Portal da Família já gera QR Code Pix estático (funciona sem API)</li>
          </ul>

          <h2>NFS-e</h2>
          <ul style={{ fontSize: 14, lineHeight: 1.8 }}>
            <li>Dual mode: manual (dados para nfse.gov.br) ou via intermediador (nfe.io)</li>
            <li>Configuração: Configurações → Integrações → NFS-e</li>
          </ul>

          <h2>e-SUS / SISNAD</h2>
          <ul style={{ fontSize: 14, lineHeight: 1.8 }}>
            <li>Página de configuração com passo a passo</li>
            <li>Exportação de dados para upload governamental</li>
          </ul>
        </div>

        {/* ==================== SECTION 9: PLANOS ==================== */}
        <div className="page-break section" id="planos">
          <h1>9. Planos e Pricing</h1>
          <table>
            <thead>
              <tr><th>Plano</th><th>Preço/mês</th><th>Users</th><th>Pacientes</th><th>Para quem</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Starter</strong></td><td>R$ 299</td><td>5</td><td>50</td><td>Pequenos negócios</td></tr>
              <tr><td><strong>Professional</strong></td><td>R$ 599</td><td>15</td><td>200</td><td>Médios negócios</td></tr>
              <tr><td><strong>Enterprise</strong></td><td>R$ 1.499</td><td>Ilimitado</td><td>Ilimitado</td><td>Grandes operações</td></tr>
            </tbody>
          </table>
        </div>

        {/* ==================== SECTION 10: SCRIPT DE APRESENTAÇÃO ==================== */}
        <div className="page-break section" id="script">
          <h1>10. Script de Apresentação</h1>
          <p style={{ color: '#6b7280', fontStyle: 'italic' }}>(para demos)</p>

          <h2>Abertura (30s)</h2>
          <blockquote>
            &ldquo;A Hachi Platform é um Business Operating System — uma única plataforma que serve 8 mercados diferentes. De clínicas médicas a restaurantes, cada vertical recebe um sistema completo com financeiro, agenda, documentos, WhatsApp integrado e portal para clientes.&rdquo;
          </blockquote>

          <h2>Demo (5-10 min)</h2>
          <ol style={{ fontSize: 14, lineHeight: 2 }}>
            <li>Mostrar o <strong>onboarding</strong> (criar conta em 30s)</li>
            <li>Mostrar o <strong>dashboard</strong> com KPIs</li>
            <li>Mostrar o <strong>cadastro</strong> (paciente/cliente/hóspede — depende da vertical)</li>
            <li>Mostrar a <strong>geração de documento</strong> (contrato em 30s)</li>
            <li>Mostrar o <strong>portal externo</strong> (família/cliente)</li>
            <li>Mostrar o <strong>Super Admin</strong> (feature flags, multi-tenant)</li>
          </ol>

          <h2>Fechamento</h2>
          <blockquote>
            &ldquo;O sistema já está em produção com o CT Persev, nosso primeiro cliente. Temos 25 mil linhas de código, 105 páginas funcionais, e a plataforma suporta múltiplos tenants simultâneos com dados isolados.&rdquo;
          </blockquote>
        </div>

        {/* ==================== SECTION 11: FAQ ==================== */}
        <div className="page-break section" id="faq">
          <h1>11. FAQ</h1>
          <p style={{ color: '#6b7280', fontStyle: 'italic' }}>(perguntas que vão surgir)</p>
          <table>
            <thead>
              <tr><th>Pergunta</th><th>Resposta</th></tr>
            </thead>
            <tbody>
              <tr><td>&ldquo;Funciona no celular?&rdquo;</td><td>Sim, 100% responsivo. Sidebar vira drawer no mobile.</td></tr>
              <tr><td>&ldquo;Os dados são seguros?&rdquo;</td><td>Sim. Criptografia AES-256, LGPD compliance, audit log completo.</td></tr>
              <tr><td>&ldquo;Posso customizar?&rdquo;</td><td>Sim. Feature flags permitem ligar/desligar módulos. White-label futuro.</td></tr>
              <tr><td>&ldquo;Quantos usuários?&rdquo;</td><td>Depende do plano. Starter=5, Professional=15, Enterprise=ilimitado.</td></tr>
              <tr><td>&ldquo;Tem app?&rdquo;</td><td>Não ainda. É web responsivo (funciona como app via navegador).</td></tr>
              <tr><td>&ldquo;Integra com o quê?&rdquo;</td><td>WhatsApp (BotConversa), Pix (Sicredi), NFS-e, e-SUS.</td></tr>
              <tr><td>&ldquo;Quanto custa?&rdquo;</td><td>A partir de R$299/mês (Starter). Enterprise sob consulta.</td></tr>
              <tr><td>&ldquo;Tem contrato de fidelidade?&rdquo;</td><td>Não. Mensal, cancela quando quiser.</td></tr>
              <tr><td>&ldquo;Quanto tempo pra implantar?&rdquo;</td><td>Self-service: 30 segundos. Com migração de dados: 1-2 semanas.</td></tr>
            </tbody>
          </table>
        </div>

        {/* ==================== SECTION 12: GLOSSÁRIO ==================== */}
        <div className="page-break section" id="glossario">
          <h1>12. Glossário</h1>
          <table>
            <thead>
              <tr><th>Termo</th><th>Significado</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Tenant</strong></td><td>Uma organização/cliente dentro da plataforma</td></tr>
              <tr><td><strong>Vertical</strong></td><td>O tipo de negócio (clinic, hotel, restaurant, etc.)</td></tr>
              <tr><td><strong>Feature flag</strong></td><td>Chave liga/desliga para módulos</td></tr>
              <tr><td><strong>RBAC</strong></td><td>Role-Based Access Control (permissões por perfil)</td></tr>
              <tr><td><strong>Multi-tenant</strong></td><td>Vários clientes na mesma infra com dados isolados</td></tr>
              <tr><td><strong>JWT</strong></td><td>Token de autenticação (JSON Web Token)</td></tr>
              <tr><td><strong>Onboarding</strong></td><td>Processo de criar conta e começar a usar</td></tr>
              <tr><td><strong>LGPD</strong></td><td>Lei Geral de Proteção de Dados</td></tr>
              <tr><td><strong>Audit log</strong></td><td>Registro de toda ação no sistema</td></tr>
              <tr><td><strong>API</strong></td><td>Interface de programação (como os módulos conversam)</td></tr>
            </tbody>
          </table>

          <div style={{ marginTop: 40, padding: 20, background: '#f0fdfa', borderRadius: 8, border: '1px solid #99f6e4' }}>
            <p style={{ margin: 0, fontSize: 14, color: '#374151' }}>
              <em>Marquinhos, se tiver dúvida que não está aqui, me procure. Este guia será atualizado conforme o produto evolui.</em>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
