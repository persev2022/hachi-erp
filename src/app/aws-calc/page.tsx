"use client";
/* eslint-disable @next/next/no-img-element */
export default function AwsCalcPage() {
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
        .page-break { break-before: page; }
        .section { margin-bottom: 32px; }
      `}</style>

      <div className="print-document">
        {/* Footer for print */}
        <div className="footer-print">
          Hachi Platform — AWS Infrastructure Analysis — Julho 2026
        </div>

        {/* ==================== COVER PAGE ==================== */}
        <div className="cover-page">
          <img src="/images/hachi-logo.png" alt="Hachi Logo" style={{ width: 120, height: 120, marginBottom: 24 }} />
          <h1 style={{ fontSize: 36, border: 'none', color: '#0D9488', marginBottom: 8 }}>AWS Infrastructure Analysis</h1>
          <p style={{ fontSize: 22, color: '#374151', marginBottom: 4, fontWeight: 600 }}>Hachi Platform — Cost Estimation Guide</p>
          <p style={{ fontSize: 16, color: '#6b7280', marginBottom: 24 }}>Análise de custos e dimensionamento AWS</p>
          <div style={{ marginTop: 40, padding: '12px 24px', border: '2px solid #0D9488', borderRadius: 8 }}>
            <p style={{ margin: 0, fontSize: 13, color: '#0D9488' }}>Julho 2026</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>Documento para planejamento de infraestrutura cloud</p>
          </div>
        </div>

        {/* ==================== SECTION 1 ==================== */}
        <div className="page-break section">
          <h1>1. Perfil da Aplicação</h1>
          <table>
            <thead>
              <tr><th>Parâmetro</th><th>Valor</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Tipo</strong></td><td>Web app SaaS (Next.js SSR)</td></tr>
              <tr><td><strong>Framework</strong></td><td>Next.js 15</td></tr>
              <tr><td><strong>Linguagem</strong></td><td>TypeScript / Node.js 18+</td></tr>
              <tr><td><strong>Banco de Dados</strong></td><td>PostgreSQL 16</td></tr>
              <tr><td><strong>Build size</strong></td><td>~50 MB</td></tr>
              <tr><td><strong>Pages</strong></td><td>126</td></tr>
              <tr><td><strong>API Routes</strong></td><td>95</td></tr>
            </tbody>
          </table>
        </div>

        {/* ==================== SECTION 2 ==================== */}
        <div className="page-break section">
          <h1>2. Estimativa de Tráfego (10–50 tenants)</h1>
          <table>
            <thead>
              <tr><th>Métrica</th><th>Valor</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Requests/mês</strong></td><td>500k – 2M</td></tr>
              <tr><td><strong>Requests/seg (pico)</strong></td><td>20 – 50</td></tr>
              <tr><td><strong>Requests/seg (média)</strong></td><td>5 – 10</td></tr>
              <tr><td><strong>Bandwidth</strong></td><td>50 – 200 GB</td></tr>
              <tr><td><strong>Response avg</strong></td><td>5–15 KB (API) / 50–100 KB (pages)</td></tr>
              <tr><td><strong>Concurrent (pico)</strong></td><td>50 – 200</td></tr>
              <tr><td><strong>Concurrent (média)</strong></td><td>10 – 30</td></tr>
            </tbody>
          </table>
        </div>

        {/* ==================== SECTION 3 ==================== */}
        <div className="page-break section">
          <h1>3. Banco de Dados (PostgreSQL)</h1>
          <table>
            <thead>
              <tr><th>Parâmetro</th><th>Valor</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Tamanho atual</strong></td><td>~50 MB</td></tr>
              <tr><td><strong>50 tenants</strong></td><td>500 MB – 2 GB</td></tr>
              <tr><td><strong>200 tenants</strong></td><td>5 – 10 GB</td></tr>
              <tr><td><strong>Queries/seg (média)</strong></td><td>10 – 30</td></tr>
              <tr><td><strong>Queries/seg (pico)</strong></td><td>50 – 100</td></tr>
              <tr><td><strong>Connections</strong></td><td>20 – 50</td></tr>
              <tr><td><strong>Workload</strong></td><td>OLTP 80/20 read/write</td></tr>
              <tr><td><strong>Backup</strong></td><td>Diário, 7 dias retenção</td></tr>
              <tr><td><strong>Tabelas</strong></td><td>16</td></tr>
              <tr><td><strong>Registros atuais</strong></td><td>~500</td></tr>
              <tr><td><strong>Projeção</strong></td><td>~50k (50 tenants / 1 ano)</td></tr>
            </tbody>
          </table>
        </div>

        {/* ==================== SECTION 4 ==================== */}
        <div className="page-break section">
          <h1>4. Compute</h1>
          <table>
            <thead>
              <tr><th>Parâmetro</th><th>Valor</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Runtime</strong></td><td>Node.js 18+</td></tr>
              <tr><td><strong>RAM mínima</strong></td><td>512 MB</td></tr>
              <tr><td><strong>RAM recomendada</strong></td><td>1 – 2 GB</td></tr>
              <tr><td><strong>CPU</strong></td><td>1–2 vCPUs (start) → 4 (growth)</td></tr>
              <tr><td><strong>Build time</strong></td><td>~5s</td></tr>
              <tr><td><strong>Cold start</strong></td><td>3 – 5s</td></tr>
              <tr><td><strong>Warm response</strong></td><td>50 – 200ms</td></tr>
              <tr><td><strong>Processos</strong></td><td>1 ou PM2 cluster 2–4</td></tr>
            </tbody>
          </table>
        </div>

        {/* ==================== SECTION 5 ==================== */}
        <div className="page-break section">
          <h1>5. Storage</h1>
          <table>
            <thead>
              <tr><th>Parâmetro</th><th>Valor</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Docs gerados</strong></td><td>~100 KB cada</td></tr>
              <tr><td><strong>Docs/mês</strong></td><td>200 – 1.000</td></tr>
              <tr><td><strong>Storage year 1</strong></td><td>1 – 5 GB</td></tr>
              <tr><td><strong>Assets</strong></td><td>~10 MB</td></tr>
              <tr><td><strong>Logs</strong></td><td>1 – 5 GB/mês</td></tr>
            </tbody>
          </table>
        </div>

        {/* ==================== SECTION 6 ==================== */}
        <div className="page-break section">
          <h1>6. Serviços AWS Recomendados</h1>
          <table>
            <thead>
              <tr><th>Função</th><th>Serviço AWS</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>App</strong></td><td>ECS Fargate ou EC2 t3.small</td></tr>
              <tr><td><strong>Banco de Dados</strong></td><td>RDS PostgreSQL ou Aurora Serverless v2</td></tr>
              <tr><td><strong>CDN</strong></td><td>CloudFront</td></tr>
              <tr><td><strong>Load Balancer</strong></td><td>ALB</td></tr>
              <tr><td><strong>DNS</strong></td><td>Route 53</td></tr>
              <tr><td><strong>SSL</strong></td><td>ACM (grátis)</td></tr>
              <tr><td><strong>Storage</strong></td><td>S3</td></tr>
              <tr><td><strong>Cache</strong></td><td>ElastiCache Redis</td></tr>
              <tr><td><strong>Logs</strong></td><td>CloudWatch</td></tr>
              <tr><td><strong>Secrets</strong></td><td>Secrets Manager</td></tr>
              <tr><td><strong>Email</strong></td><td>SES</td></tr>
              <tr><td><strong>Registry</strong></td><td>ECR</td></tr>
            </tbody>
          </table>
        </div>

        {/* ==================== SECTION 7 ==================== */}
        <div className="page-break section">
          <h1>7. Cenário 1: Startup (10 tenants, ~100 users)</h1>
          <table>
            <thead>
              <tr><th>Serviço</th><th>Config</th><th>USD/mês</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>EC2</strong></td><td>t3.small</td><td>~$15</td></tr>
              <tr><td><strong>RDS</strong></td><td>db.t3.micro</td><td>~$15</td></tr>
              <tr><td><strong>ALB</strong></td><td>Application Load Balancer</td><td>~$16</td></tr>
              <tr><td><strong>S3</strong></td><td>Standard</td><td>~$1</td></tr>
              <tr><td><strong>CloudFront</strong></td><td>CDN</td><td>~$5</td></tr>
              <tr><td><strong>Route 53</strong></td><td>DNS</td><td>~$1</td></tr>
              <tr><td><strong>CloudWatch</strong></td><td>Logs + Metrics</td><td>~$3</td></tr>
              <tr><td colSpan={2} style={{ fontWeight: 700, background: '#f0fdfa' }}>TOTAL</td><td style={{ fontWeight: 700, background: '#f0fdfa' }}>~$56</td></tr>
            </tbody>
          </table>
        </div>

        {/* ==================== SECTION 8 ==================== */}
        <div className="page-break section">
          <h1>8. Cenário 2: Growth (50 tenants, ~500 users)</h1>
          <table>
            <thead>
              <tr><th>Serviço</th><th>Config</th><th>USD/mês</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>ECS Fargate</strong></td><td>2 tasks</td><td>~$30</td></tr>
              <tr><td><strong>RDS</strong></td><td>db.t3.small</td><td>~$30</td></tr>
              <tr><td><strong>ALB</strong></td><td>Application Load Balancer</td><td>~$20</td></tr>
              <tr><td><strong>S3</strong></td><td>Standard</td><td>~$3</td></tr>
              <tr><td><strong>CloudFront</strong></td><td>CDN</td><td>~$17</td></tr>
              <tr><td><strong>ElastiCache</strong></td><td>Redis</td><td>~$13</td></tr>
              <tr><td><strong>Route 53</strong></td><td>DNS</td><td>~$1</td></tr>
              <tr><td><strong>CloudWatch</strong></td><td>Logs + Metrics</td><td>~$10</td></tr>
              <tr><td><strong>SES</strong></td><td>Email</td><td>~$1</td></tr>
              <tr><td colSpan={2} style={{ fontWeight: 700, background: '#f0fdfa' }}>TOTAL</td><td style={{ fontWeight: 700, background: '#f0fdfa' }}>~$125</td></tr>
            </tbody>
          </table>
        </div>

        {/* ==================== SECTION 9 ==================== */}
        <div className="page-break section">
          <h1>9. Cenário 3: Scale (200 tenants, ~2000 users)</h1>
          <table>
            <thead>
              <tr><th>Serviço</th><th>Config</th><th>USD/mês</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>ECS Fargate</strong></td><td>4 tasks</td><td>~$120</td></tr>
              <tr><td><strong>Aurora Serverless v2</strong></td><td>PostgreSQL</td><td>~$100</td></tr>
              <tr><td><strong>ALB + Auto Scaling</strong></td><td>Load Balancer</td><td>~$35</td></tr>
              <tr><td><strong>S3</strong></td><td>Standard</td><td>~$5</td></tr>
              <tr><td><strong>CloudFront</strong></td><td>CDN</td><td>~$85</td></tr>
              <tr><td><strong>ElastiCache</strong></td><td>Redis</td><td>~$25</td></tr>
              <tr><td><strong>Route 53</strong></td><td>DNS</td><td>~$2</td></tr>
              <tr><td><strong>CloudWatch</strong></td><td>Logs + Metrics</td><td>~$25</td></tr>
              <tr><td><strong>SES</strong></td><td>Email</td><td>~$3</td></tr>
              <tr><td colSpan={2} style={{ fontWeight: 700, background: '#f0fdfa' }}>TOTAL</td><td style={{ fontWeight: 700, background: '#f0fdfa' }}>~$400</td></tr>
            </tbody>
          </table>
        </div>

        {/* ==================== SECTION 10 ==================== */}
        <div className="page-break section">
          <h1>10. Parâmetros para o AWS Calculator</h1>
          <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Use estes valores no <strong>calculator.aws</strong> para simular os cenários acima.</p>

          <h2>EC2 / Fargate</h2>
          <div className="code-block">{`Region:          sa-east-1 (São Paulo)
OS:              Linux
Instance type:   t3.small (2 vCPU, 2 GB RAM)
Tenancy:         Shared
Utilization:     730 hrs/mês (24/7)`}</div>

          <h2>RDS (PostgreSQL)</h2>
          <div className="code-block">{`Engine:          PostgreSQL 16
Instance:        db.t3.micro → db.t3.small (growth)
Storage:         20–100 GB gp3
Multi-AZ:        No (startup) → Yes (scale)
Backup:          7 days retention`}</div>

          <h2>S3</h2>
          <div className="code-block">{`Storage class:   Standard
Storage:         5–100 GB
GET requests:    100k–1M/mês
PUT requests:    10k–100k/mês`}</div>

          <h2>CloudFront</h2>
          <div className="code-block">{`Origin:          ALB
Data out:        50 GB–1 TB/mês
Requests:        1M–10M/mês
Price class:     South America`}</div>

          <h2>ALB</h2>
          <div className="code-block">{`LCU hours:       10–200/mês
New connections: 10–100/sec
Active connections: 100–2000`}</div>
        </div>

      </div>
    </>
  );
}
