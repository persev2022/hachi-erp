import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ResponsavelData {
  nome: string;
  cpf: string;
  parentesco: string;
  dataNascimento?: string;
  estadoCivil?: string;
  profissao?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
}

interface PacienteUpdate {
  nomeMatch: string; // used to find patient in DB
  nome?: string; // corrected name if needed
  cpf: string;
  dataNascimento: string; // ISO
  estadoCivil: string;
  profissao?: string;
  diasTratamento: number;
  mensalidadeValor?: number;
  diaVencimento?: number;
  responsavel?: ResponsavelData;
}

const pacientesData: PacienteUpdate[] = [
  {
    nomeMatch: "Caio",
    nome: "Caio César Kitagawa",
    cpf: "38607694804",
    dataNascimento: "1988-08-02",
    estadoCivil: "SOLTEIRO",
    profissao: "Desempregado",
    diasTratamento: 90,
    mensalidadeValor: 0,
    diaVencimento: 20,
    responsavel: {
      nome: "Andrew Conrrado Sacabora",
      cpf: "11102854930",
      parentesco: "Irmão",
      dataNascimento: "1998-07-10",
      estadoCivil: "SOLTEIRO",
      profissao: "Vendedor",
      telefone: "48991038817",
      email: "saracpanasolo@gmail.com",
      endereco: "Rua Manoel Pizzolati, 244, CEP 88095-360",
    },
  },
  {
    nomeMatch: "Fabricio Waschievice",
    cpf: "09447211925",
    dataNascimento: "1994-08-06",
    estadoCivil: "SOLTEIRO",
    profissao: "Desempregado",
    diasTratamento: 90,
    mensalidadeValor: 1500,
    diaVencimento: 20,
    responsavel: {
      nome: "Loreci Waschievice",
      cpf: "03059879923",
      parentesco: "Mãe",
      dataNascimento: "1971-06-16",
      estadoCivil: "DIVORCIADO",
      profissao: "Atendente",
      telefone: "48991349430",
      email: "josycustodio588@gmail.com",
      endereco: "Rua Manoel Antonio Germano, Nova Brasilia, Imbituba, SC, CEP 88780-000",
    },
  },
  {
    nomeMatch: "Marcelo Henrique Baldi",
    cpf: "78362105968",
    dataNascimento: "1971-07-07",
    estadoCivil: "SOLTEIRO",
    profissao: "Aposentado",
    diasTratamento: 180,
    mensalidadeValor: 2100,
    diaVencimento: 20,
    responsavel: {
      nome: "Luiz Carlos Machado Baldi",
      cpf: "11461652900",
      parentesco: "Filho",
      dataNascimento: "2001-11-24",
      estadoCivil: "SOLTEIRO",
      profissao: "Autônomo",
      telefone: "4999506741",
      email: "luiizcmb@gmail.com",
      endereco: "Rua São José, São Sebastião, SC, CEP 89683-000",
    },
  },
  {
    nomeMatch: "Thiago Ferreira",
    cpf: "10942078969",
    dataNascimento: "1999-07-26",
    estadoCivil: "SOLTEIRO",
    profissao: "Desempregado",
    diasTratamento: 180,
    mensalidadeValor: 1800,
    diaVencimento: 20,
    responsavel: {
      nome: "Angela Maria Ferreira da Cruz",
      cpf: "00719168902",
      parentesco: "Mãe",
      dataNascimento: "1980-12-20",
      estadoCivil: "CASADO",
      profissao: "Vendedora",
      telefone: "49991253484",
      email: "marceloalves2170@gmail.com",
      endereco: "Rua Jorge Amado, Antonio Carlos, SC, CEP 88180-000",
    },
  },
  {
    nomeMatch: "Fernando Faria",
    nome: "Fernando Faria",
    cpf: "00485191970",
    dataNascimento: "1977-07-11",
    estadoCivil: "DIVORCIADO",
    profissao: "Advogado",
    diasTratamento: 90,
    mensalidadeValor: 3500,
    diaVencimento: 20,
    responsavel: {
      nome: "Flavia Faria",
      cpf: "04121778979",
      parentesco: "Irmã",
      dataNascimento: "1983-01-17",
      estadoCivil: "CASADO",
      profissao: "Empresária",
      telefone: "47984590400",
      endereco: "CEP 88303-420",
    },
  },
  {
    nomeMatch: "Antônio Marco",
    nome: "Antonio Marco da Silva",
    cpf: "69413690944",
    dataNascimento: "1973-11-28",
    estadoCivil: "SOLTEIRO",
    profissao: "Comerciante",
    diasTratamento: 90,
    mensalidadeValor: 4000,
    diaVencimento: 20,
    responsavel: {
      nome: "Karoline Souza e Silva",
      cpf: "10977230970",
      parentesco: "Filha",
      dataNascimento: "1997-07-20",
      estadoCivil: "SOLTEIRO",
      profissao: "Gerente Administrativo",
      telefone: "48999177874",
      endereco: "R. Jose Scotti, 367, Operária Nova, SC, CEP 88809-100",
    },
  },
  {
    nomeMatch: "Daniel Bento",
    cpf: "00761423028",
    dataNascimento: "1984-11-10",
    estadoCivil: "CASADO",
    profissao: "Vigilante",
    diasTratamento: 90,
    mensalidadeValor: 2000,
    diaVencimento: 5,
    responsavel: {
      nome: "Pamela Vieira Lopes",
      cpf: "08650601936",
      parentesco: "Esposa",
      dataNascimento: "1991-05-25",
      estadoCivil: "CASADO",
      profissao: "Serviços Gerais",
      telefone: "48984677848",
      endereco: "Rua Osnildo Leoncio Duarte 54, Armação Pant Sul, SC, CEP 88066-000",
    },
  },
  {
    nomeMatch: "Roger Daniel Padilha",
    cpf: "67447783072",
    dataNascimento: "1974-03-31",
    estadoCivil: "CASADO",
    profissao: "Empresário",
    diasTratamento: 180,
    mensalidadeValor: 2000,
    diaVencimento: 20,
    responsavel: {
      nome: "Roger Daniel Padilha",
      cpf: "67447783072",
      parentesco: "Ele mesmo",
      dataNascimento: "1974-03-31",
      estadoCivil: "CASADO",
      profissao: "Empresário",
      endereco: "Rua Lajeado, 793, Garopaba, SC, CEP 88495-000",
    },
  },
  {
    nomeMatch: "Douglas Arrais",
    cpf: "03012920196",
    dataNascimento: "1987-10-08",
    estadoCivil: "SOLTEIRO",
    profissao: "Pintor",
    diasTratamento: 180,
    mensalidadeValor: 1800,
    diaVencimento: 5,
    responsavel: {
      nome: "Jaime Ferreira Coutinho",
      cpf: "40325601100",
      parentesco: "Pai",
      dataNascimento: "1965-01-06",
      estadoCivil: "CASADO",
      profissao: "Marceneiro",
      endereco: "Servidão Pedro Manoel dos Santos, CEP 88303-420",
    },
  },
  {
    nomeMatch: "Nilson Vanderlin",
    cpf: "45485682987",
    dataNascimento: "1963-05-05",
    estadoCivil: "SOLTEIRO",
    profissao: "Aposentado",
    diasTratamento: 90,
    mensalidadeValor: 2200,
    diaVencimento: 20,
    responsavel: {
      nome: "Alison Vanderlind",
      cpf: "07794596955",
      parentesco: "Filho",
      dataNascimento: "1991-02-18",
      estadoCivil: "SOLTEIRO",
      profissao: "Comerciário",
      telefone: "48991977733",
      endereco: "Rua Nelson Inácio dos Santos, 3, CEP 88119-093",
    },
  },
  {
    nomeMatch: "Mateus Amandio",
    cpf: "10437492923",
    dataNascimento: "1996-10-02",
    estadoCivil: "SOLTEIRO",
    profissao: "Desempregado",
    diasTratamento: 90,
    mensalidadeValor: 2800,
    diaVencimento: 20,
    responsavel: {
      nome: "Sonia Borba Coelho",
      cpf: "82170894934",
      parentesco: "Mãe",
      estadoCivil: "DIVORCIADO",
      profissao: "Diarista",
      endereco: "Rua Duque de Caxias, 554, Centro de Penha, CEP 88385-000",
    },
  },
  {
    nomeMatch: "Felipe Ricardo",
    cpf: "10382468902",
    dataNascimento: "1997-04-14",
    estadoCivil: "SOLTEIRO",
    profissao: "Construção civil",
    diasTratamento: 90,
    mensalidadeValor: 2800,
    diaVencimento: 5,
    responsavel: {
      nome: "Edela Wathier da Luz",
      cpf: "77400488015",
      parentesco: "Mãe",
      dataNascimento: "1966-09-24",
      estadoCivil: "CASADO",
      profissao: "Serviços Gerais",
      telefone: "48996355169",
      email: "correamiranda9@gmail.com",
      endereco: "Rua Nereu Ramos, Centro, CEP 88270-000",
    },
  },
  {
    nomeMatch: "Marleon Coutinho",
    cpf: "05791885903",
    dataNascimento: "1987-03-11",
    estadoCivil: "SOLTEIRO",
    profissao: "Auxiliar de produção",
    diasTratamento: 90,
    mensalidadeValor: 2200,
    diaVencimento: 20,
    responsavel: {
      nome: "Maria Terezinha Minatti",
      cpf: "41772024953",
      parentesco: "Mãe",
      dataNascimento: "1961-01-11",
      estadoCivil: "SOLTEIRO",
      profissao: "Aposentada",
      telefone: "47991569308",
      endereco: "Rua Ovideo Neves 77, Balneário Piçarras, CEP 88380-000",
    },
  },
  {
    nomeMatch: "Fabio Juvencio",
    cpf: "03957182956",
    dataNascimento: "1982-07-05",
    estadoCivil: "DIVORCIADO",
    profissao: "Técnico Refrigeração",
    diasTratamento: 90,
    mensalidadeValor: 1600,
    diaVencimento: 20,
    responsavel: {
      nome: "Maureci Limas",
      cpf: "37703820997",
      parentesco: "Pai",
      dataNascimento: "1957-08-22",
      estadoCivil: "CASADO",
      profissao: "Aposentado",
      telefone: "48988171996",
      endereco: "Senador Galoti 854, Mar Grosso, SC, CEP 88790-000",
    },
  },
  {
    nomeMatch: "Rafael Frezza",
    cpf: "03921222940",
    dataNascimento: "1982-09-30",
    estadoCivil: "CASADO",
    profissao: "Motorista",
    diasTratamento: 90,
    mensalidadeValor: 1800,
    diaVencimento: 20,
    responsavel: {
      nome: "Salete Terezinha Bettiol",
      cpf: "41551516934",
      parentesco: "Mãe",
      dataNascimento: "1961-04-28",
      estadoCivil: "DIVORCIADO",
      profissao: "Aposentada",
      telefone: "48996808225",
      endereco: "Estrada Geral Rio Albina, CEP 88860-000",
    },
  },
  {
    nomeMatch: "Kaiki",
    nome: "Kaiki de Vasconcelos Barbosa",
    cpf: "12065859946",
    dataNascimento: "2004-06-13",
    estadoCivil: "SOLTEIRO",
    profissao: "Desempregado",
    diasTratamento: 90,
    mensalidadeValor: 2500,
    diaVencimento: 5,
    responsavel: {
      nome: "David Oliveira de Souza",
      cpf: "10130497487",
      parentesco: "Padrasto",
      dataNascimento: "1953-11-06",
      estadoCivil: "CASADO",
      profissao: "Aposentado",
      telefone: "48996156039",
      endereco: "Bigua 1506, Balneário Piçarras, SC, CEP 88380-000",
    },
  },
  {
    nomeMatch: "Lucas Salles",
    cpf: "10437492924",
    dataNascimento: "1996-10-02",
    estadoCivil: "SOLTEIRO",
    profissao: "Desempregado",
    diasTratamento: 90,
    mensalidadeValor: 2800,
    diaVencimento: 20,
    responsavel: {
      nome: "Sonia Borba Coelho",
      cpf: "82170894935",
      parentesco: "Mãe",
      estadoCivil: "DIVORCIADO",
      profissao: "Diarista",
      endereco: "Rua Duque de Caxias, 554, Centro de Penha, CEP 88385-000",
    },
  },
  {
    nomeMatch: "Carlos Eduardo",
    cpf: "22111725803",
    dataNascimento: "1981-02-18",
    estadoCivil: "SOLTEIRO",
    profissao: "Produtor de Eventos",
    diasTratamento: 90,
    mensalidadeValor: 2500,
    diaVencimento: 20,
    responsavel: {
      nome: "Tais Helene Machado Joly",
      cpf: "26109695890",
      parentesco: "Irmã",
      dataNascimento: "1978-03-08",
      estadoCivil: "UNIAO_ESTAVEL",
      profissao: "Produtora de eventos",
      telefone: "48999017524",
      endereco: "Travessa Lagoa Azul, 68, Rio Tavares, Florianópolis, CEP 88048-408",
    },
  },
  {
    nomeMatch: "Rafael Amadeu",
    cpf: "00000019001",
    dataNascimento: "1990-01-01",
    estadoCivil: "SOLTEIRO",
    diasTratamento: 90,
    mensalidadeValor: 1800,
    diaVencimento: 5,
  },
  {
    nomeMatch: "Pedro Rubens",
    cpf: "01042608903",
    dataNascimento: "1986-08-29",
    estadoCivil: "CASADO",
    profissao: "Tatuador",
    diasTratamento: 90,
    mensalidadeValor: 1600,
    diaVencimento: 5,
    responsavel: {
      nome: "Juliane Natalina Rauta",
      cpf: "04413650948",
      parentesco: "Esposa",
      dataNascimento: "1984-11-16",
      estadoCivil: "CASADO",
      profissao: "Psicopedagoga",
      telefone: "48991777825",
      endereco: "Rua Bento Francisco 1002, São Miguel, SC, CEP 88168-096",
    },
  },
  {
    nomeMatch: "Matheus Vitor Zardo",
    cpf: "67447783073",
    dataNascimento: "1974-03-31",
    estadoCivil: "CASADO",
    profissao: "Empresário",
    diasTratamento: 180,
    mensalidadeValor: 2000,
    diaVencimento: 20,
    responsavel: {
      nome: "Roger Daniel Padilha",
      cpf: "67447783072",
      parentesco: "Responsável",
      dataNascimento: "1974-03-31",
      estadoCivil: "CASADO",
      profissao: "Empresário",
      endereco: "Rua Lajeado, 793, Garopaba, SC, CEP 88495-000",
    },
  },
  {
    nomeMatch: "Marcelo Angelo",
    cpf: "03569320952",
    dataNascimento: "1978-05-07",
    estadoCivil: "SOLTEIRO",
    profissao: "Aposentado",
    diasTratamento: 270,
    mensalidadeValor: 1800,
    diaVencimento: 20,
    responsavel: {
      nome: "Patrícia Angelo",
      cpf: "04240808936",
      parentesco: "Irmã",
      dataNascimento: "1982-09-06",
      estadoCivil: "SOLTEIRO",
      profissao: "Prof. Ed. Infantil",
      telefone: "48988111973",
      email: "Marcosangelo22@hotmail.com",
      endereco: "Armação do Pantano do Sul, Florianópolis, SC, CEP 88055-520",
    },
  },
  {
    nomeMatch: "Jonathan Silva",
    cpf: "06567094990",
    dataNascimento: "1989-03-08",
    estadoCivil: "SOLTEIRO",
    profissao: "Mecânico de motos",
    diasTratamento: 90,
    mensalidadeValor: 1600,
    diaVencimento: 20,
    responsavel: {
      nome: "Luciana Maria da Silva",
      cpf: "59955848987",
      parentesco: "Mãe",
      dataNascimento: "1970-07-14",
      estadoCivil: "DIVORCIADO",
      profissao: "Professora",
      telefone: "43999763954",
      endereco: "Av. dos Missionários, Marilândia do Sul, PR, CEP 86825-000",
    },
  },
  {
    nomeMatch: "Adriano Xavier",
    cpf: "04241235921",
    dataNascimento: "1982-09-23",
    estadoCivil: "SOLTEIRO",
    profissao: "Desempregado",
    diasTratamento: 90,
    mensalidadeValor: 0,
    responsavel: {
      nome: "Nilze Terezinha Xavier",
      cpf: "04241235922",
      parentesco: "Mãe",
      telefone: "49999747317",
      endereco: "Av. Marechal Floriano, 1048, Centro, Lages, SC, CEP 88501-512",
    },
  },
  {
    nomeMatch: "Daniel Campos",
    cpf: "11890792918",
    dataNascimento: "2001-02-09",
    estadoCivil: "SOLTEIRO",
    profissao: "Auxiliar Administrativo",
    diasTratamento: 90,
    mensalidadeValor: 1500,
    diaVencimento: 20,
    responsavel: {
      nome: "Josiane Custodio",
      cpf: "11890792919",
      parentesco: "Mãe",
      telefone: "48991349430",
      email: "josycustodio588@gmail.com",
      endereco: "José Demo, Içara, SC, CEP 88820-000",
    },
  },
  {
    nomeMatch: "Luiggi Cristian",
    cpf: "10792808983",
    dataNascimento: "1998-08-22",
    estadoCivil: "SOLTEIRO",
    profissao: "Freelancer",
    diasTratamento: 365,
    mensalidadeValor: 2000,
    diaVencimento: 5,
    responsavel: {
      nome: "Andreia Lauffer",
      cpf: "00470963905",
      parentesco: "Mãe",
      dataNascimento: "1978-11-20",
      estadoCivil: "VIUVO",
      profissao: "Administradora",
      email: "financeiropedrinhotur@gmail.com",
      endereco: "Rua Maria Gonzaga da Cunha 121, Armação, Penha, SC",
    },
  },
];

function toEstadoCivil(val?: string) {
  if (!val) return undefined;
  const map: Record<string, string> = {
    SOLTEIRO: "SOLTEIRO",
    CASADO: "CASADO",
    DIVORCIADO: "DIVORCIADO",
    VIUVO: "VIUVO",
    UNIAO_ESTAVEL: "UNIAO_ESTAVEL",
  };
  return map[val] || "SOLTEIRO";
}

async function main() {
  console.log("📝 Atualizando dados completos dos pacientes...\n");

  let updated = 0;
  let notFound = 0;
  let responsaveisCreated = 0;

  for (const p of pacientesData) {
    // Find patient by partial name match
    const paciente = await prisma.paciente.findFirst({
      where: {
        nome: { contains: p.nomeMatch, mode: "insensitive" },
        deletedAt: null,
      },
      include: { responsaveis: true },
    });

    if (!paciente) {
      console.log(`  ⚠️ NÃO ENCONTRADO: "${p.nomeMatch}"`);
      notFound++;
      continue;
    }

    // Check CPF conflict
    if (p.cpf) {
      const cpfExists = await prisma.paciente.findFirst({
        where: { cpf: p.cpf, id: { not: paciente.id } },
      });
      if (cpfExists) {
        console.log(`  ⚠️ CPF ${p.cpf} já existe (${cpfExists.nome}), pulando CPF para ${p.nomeMatch}`);
        // Update without CPF
        await prisma.paciente.update({
          where: { id: paciente.id },
          data: {
            ...(p.nome && { nome: p.nome }),
            dataNascimento: new Date(p.dataNascimento),
            estadoCivil: p.estadoCivil as any,
            profissao: p.profissao || paciente.profissao,
            diasTratamento: p.diasTratamento,
            mensalidadeValor: p.mensalidadeValor ?? paciente.mensalidadeValor,
            diaVencimento: p.diaVencimento ?? paciente.diaVencimento,
          },
        });
        updated++;
        continue;
      }
    }

    // Update patient data
    await prisma.paciente.update({
      where: { id: paciente.id },
      data: {
        ...(p.nome && { nome: p.nome }),
        cpf: p.cpf,
        dataNascimento: new Date(p.dataNascimento),
        estadoCivil: p.estadoCivil as any,
        profissao: p.profissao || paciente.profissao,
        diasTratamento: p.diasTratamento,
        mensalidadeValor: p.mensalidadeValor ?? paciente.mensalidadeValor,
        diaVencimento: p.diaVencimento ?? paciente.diaVencimento,
      },
    });

    console.log(`  ✓ ${paciente.nome} → CPF: ${p.cpf}, Nasc: ${p.dataNascimento}`);
    updated++;

    // Create or update responsável
    if (p.responsavel) {
      const r = p.responsavel;
      // Check if responsável already exists for this patient
      const existingResp = paciente.responsaveis.find(
        (resp) => resp.cpf === r.cpf || resp.nome.toLowerCase().includes(r.nome.split(" ")[0].toLowerCase())
      );

      if (existingResp) {
        // Update existing
        await prisma.responsavel.update({
          where: { id: existingResp.id },
          data: {
            nome: r.nome,
            cpf: r.cpf,
            parentesco: r.parentesco,
            dataNascimento: r.dataNascimento ? new Date(r.dataNascimento) : undefined,
            estadoCivil: toEstadoCivil(r.estadoCivil) as any,
            profissao: r.profissao,
            telefone: r.telefone || existingResp.telefone,
            email: r.email || existingResp.email,
            endereco: r.endereco || existingResp.endereco,
          },
        });
        console.log(`    ↳ Responsável atualizado: ${r.nome}`);
      } else {
        // Create new
        await prisma.responsavel.create({
          data: {
            pacienteId: paciente.id,
            nome: r.nome,
            cpf: r.cpf,
            parentesco: r.parentesco,
            dataNascimento: r.dataNascimento ? new Date(r.dataNascimento) : undefined,
            estadoCivil: toEstadoCivil(r.estadoCivil) as any,
            profissao: r.profissao,
            telefone: r.telefone || "Não informado",
            email: r.email,
            endereco: r.endereco,
            isFinanceiro: true,
          },
        });
        console.log(`    ↳ Responsável criado: ${r.nome} (${r.parentesco})`);
        responsaveisCreated++;
      }
    }
  }

  console.log("\n═══════════════════════════════════════");
  console.log("✅ Atualização concluída!");
  console.log(`   ${updated} pacientes atualizados`);
  console.log(`   ${responsaveisCreated} responsáveis criados`);
  console.log(`   ${notFound} não encontrados`);
  console.log("═══════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
