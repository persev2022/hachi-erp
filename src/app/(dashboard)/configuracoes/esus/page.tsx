"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, FileText, Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast-simple";

export default function ESusConfigPage() {
  const { show } = useToast();

  const handleExportSISNAD = async () => {
    try {
      const res = await fetch("/api/relatorios/sisnad");
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `sisnad_${new Date().getFullYear()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        show("Dados SISNAD exportados!", "success");
      } else { show("Erro ao exportar", "error"); }
    } catch { show("Erro de conexão", "error"); }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/configuracoes"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">e-SUS / SISAB</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Integração com o Sistema de Informação em Saúde
          </p>
        </div>
      </div>

      {/* Status */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium">Sobre a integração e-SUS</p>
            <p className="mt-1">
              O e-SUS APS não possui API REST aberta para integração direta. O envio de dados
              para comunidades terapêuticas é feito via <strong>RAAS</strong> (Registro de Ações
              Ambulatoriais de Saúde) ou <strong>fichas CDS</strong>, transmitidas pelo sistema
              e-SUS PEC ou por exportação de arquivos.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Passo a passo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Passo a Passo — Envio de Dados ao e-SUS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-3">
            <div className="flex gap-3">
              <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 bg-primary text-primary-foreground">1</Badge>
              <div>
                <p className="font-medium">Acesse o e-SUS APS PEC</p>
                <p className="text-muted-foreground mt-0.5">
                  O sistema e-SUS PEC é instalado na secretaria de saúde do município.
                  Solicite acesso ao coordenador de saúde mental da sua região.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 bg-primary text-primary-foreground">2</Badge>
              <div>
                <p className="font-medium">Cadastre o CNES da unidade</p>
                <p className="text-muted-foreground mt-0.5">
                  Sua comunidade terapêutica precisa ter um <strong>CNES</strong> (Cadastro Nacional
                  de Estabelecimentos de Saúde) ativo. Verifique em cnes.datasus.gov.br
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 bg-primary text-primary-foreground">3</Badge>
              <div>
                <p className="font-medium">Preencha a RAAS (mensal)</p>
                <p className="text-muted-foreground mt-0.5">
                  A RAAS registra os atendimentos realizados. Para comunidades terapêuticas,
                  preencher:
                </p>
                <ul className="list-disc list-inside mt-1 text-muted-foreground space-y-0.5">
                  <li>Procedimento: <strong>03.01.08.019-0</strong> (Acolhimento diurno/noturno em CT)</li>
                  <li>CID-10: F10-F19 (Transtornos mentais por uso de substâncias)</li>
                  <li>Quantidade: dias de permanência no mês</li>
                  <li>CNS do paciente (Cartão Nacional de Saúde)</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 bg-primary text-primary-foreground">4</Badge>
              <div>
                <p className="font-medium">Exporte dados do Hachi para preencher</p>
                <p className="text-muted-foreground mt-0.5">
                  Use o relatório SISNAD do Hachi para gerar os dados dos pacientes
                  no formato necessário para preenchimento da RAAS.
                </p>
                <Button variant="outline" size="sm" className="mt-2" onClick={handleExportSISNAD}>
                  <Download className="h-3 w-3 mr-1" /> Exportar Dados SISNAD
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 bg-primary text-primary-foreground">5</Badge>
              <div>
                <p className="font-medium">Transmita pelo e-SUS PEC</p>
                <p className="text-muted-foreground mt-0.5">
                  Após preencher a RAAS no e-SUS PEC, o sistema transmite automaticamente
                  para o SISAB (Sistema de Informação em Saúde para a Atenção Básica).
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Badge className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 bg-primary text-primary-foreground">6</Badge>
              <div>
                <p className="font-medium">Acompanhe no SISAB</p>
                <p className="text-muted-foreground mt-0.5">
                  Verifique se os dados foram recebidos em sisab.saude.gov.br
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links úteis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Links Úteis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { label: "CNES — Consulta de Estabelecimentos", url: "https://cnes.datasus.gov.br" },
            { label: "SISAB — Painel de Indicadores", url: "https://sisab.saude.gov.br" },
            { label: "e-SUS APS — Download do PEC", url: "https://sisaps.saude.gov.br/esus" },
            { label: "Manual RAAS — Comunidades Terapêuticas", url: "https://www.gov.br/saude/pt-br/composicao/saps" },
            { label: "Tabela de Procedimentos SUS (SIGTAP)", url: "http://sigtap.datasus.gov.br" },
          ].map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition text-sm"
            >
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span>{link.label}</span>
            </a>
          ))}
        </CardContent>
      </Card>

      {/* Dados necessários */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados Necessários para o e-SUS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Campo</th>
                  <th className="text-left py-2 font-medium">Onde encontrar</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b"><td className="py-2">CNES da unidade</td><td>cnes.datasus.gov.br</td></tr>
                <tr className="border-b"><td className="py-2">CNS do paciente</td><td>Cartão SUS (físico ou digital via ConecteSUS)</td></tr>
                <tr className="border-b"><td className="py-2">CBO do profissional</td><td>Código Brasileiro de Ocupações (site MTE)</td></tr>
                <tr className="border-b"><td className="py-2">Procedimento (SIGTAP)</td><td>03.01.08.019-0 (Acolhimento em CT)</td></tr>
                <tr className="border-b"><td className="py-2">CID-10</td><td>F10-F19 (Dependência química)</td></tr>
                <tr><td className="py-2">Dias de permanência</td><td>Sistema Hachi → Relatório de Ocupação</td></tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
