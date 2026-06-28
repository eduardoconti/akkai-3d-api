export abstract class ConsultaFeira {
  abstract garantirExisteFeira(id: number): Promise<void>;
}
