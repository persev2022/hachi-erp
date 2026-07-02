declare module "numero-por-extenso" {
  export function porExtenso(numero: number, estilo: any): string;
  export const estilo: {
    monetario: any;
    porcentagem: any;
    ordinal: any;
  };
}

declare module "pizzip" {
  class PizZip {
    constructor(data?: string | Buffer | ArrayBuffer, options?: any);
    generate(options?: any): any;
  }
  export = PizZip;
}

declare module "docxtemplater" {
  import PizZip from "pizzip";
  class Docxtemplater {
    constructor(zip: PizZip, options?: any);
    render(data: Record<string, any>): void;
    getZip(): PizZip;
  }
  export = Docxtemplater;
}
