"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NovoPacientePage() {
  return (
    <div className="p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/pacientes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Novo Paciente</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Preencha os dados para admissão
          </p>
        </div>
      </div>

      <form className="space-y-6">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados Pessoais</CardTitle>
            <CardDescription>
              Informações de identificação do paciente
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-foreground">
                Nome Completo
              </label>
              <Input placeholder="Nome completo do paciente" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">CPF</label>
              <Input placeholder="000.000.000-00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Data de Nascimento
              </label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Sexo
              </label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Estado Civil
              </label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="">Selecione</option>
                <option value="solteiro">Solteiro(a)</option>
                <option value="casado">Casado(a)</option>
                <option value="divorciado">Divorciado(a)</option>
                <option value="viuvo">Viúvo(a)</option>
                <option value="uniao_estavel">União Estável</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Profissão
              </label>
              <Input placeholder="Profissão" />
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Endereço</CardTitle>
            <CardDescription>Endereço residencial do paciente</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-foreground">Rua</label>
              <Input placeholder="Rua, número, complemento" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Bairro
              </label>
              <Input placeholder="Bairro" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Cidade
              </label>
              <Input placeholder="Cidade" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">UF</label>
              <Input placeholder="UF" maxLength={2} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">CEP</label>
              <Input placeholder="00000-000" />
            </div>
          </CardContent>
        </Card>

        {/* Dados Clínicos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados Clínicos</CardTitle>
            <CardDescription>
              Histórico clínico e informações de saúde
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Substância Principal
              </label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="">Selecione</option>
                <option value="alcool">Álcool</option>
                <option value="cocaina">Cocaína</option>
                <option value="crack">Crack</option>
                <option value="maconha">Maconha</option>
                <option value="multiplas">Múltiplas Substâncias</option>
                <option value="outros">Outros</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Tempo de Uso
              </label>
              <Input placeholder="Ex: 5 anos" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Internações Prévias
              </label>
              <Input type="number" placeholder="0" min={0} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Comorbidades
              </label>
              <Input placeholder="Ex: Depressão, Ansiedade" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-foreground">
                Alergias
              </label>
              <Input placeholder="Alergias conhecidas" />
            </div>
          </CardContent>
        </Card>

        {/* Tratamento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tratamento</CardTitle>
            <CardDescription>Dados da internação atual</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Data de Admissão
              </label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Dias de Tratamento
              </label>
              <Input type="number" placeholder="90" min={1} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Quarto
              </label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="">Selecione</option>
                <option value="Q-101">Q-101</option>
                <option value="Q-102">Q-102</option>
                <option value="Q-103">Q-103</option>
                <option value="Q-201">Q-201</option>
                <option value="Q-202">Q-202</option>
                <option value="Q-203">Q-203</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Responsável */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Responsável</CardTitle>
            <CardDescription>
              Dados do responsável legal ou familiar de referência
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-foreground">
                Nome do Responsável
              </label>
              <Input placeholder="Nome completo" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                CPF do Responsável
              </label>
              <Input placeholder="000.000.000-00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Parentesco
              </label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="">Selecione</option>
                <option value="pai">Pai</option>
                <option value="mae">Mãe</option>
                <option value="conjuge">Cônjuge</option>
                <option value="irmao">Irmão(ã)</option>
                <option value="filho">Filho(a)</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Telefone
              </label>
              <Input placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input type="email" placeholder="email@exemplo.com" />
            </div>
          </CardContent>
        </Card>

        {/* Financeiro */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Financeiro</CardTitle>
            <CardDescription>Dados de cobrança e pagamento</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Matrícula
              </label>
              <Input placeholder="Gerada automaticamente" disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Mensalidade (R$)
              </label>
              <Input type="number" placeholder="0,00" min={0} step={0.01} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Dia de Vencimento
              </label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="">Selecione</option>
                <option value="5">Dia 5</option>
                <option value="20">Dia 20</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Botão Salvar */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" asChild>
            <Link href="/pacientes">Cancelar</Link>
          </Button>
          <Button type="submit">Salvar Paciente</Button>
        </div>
      </form>
    </div>
  );
}
