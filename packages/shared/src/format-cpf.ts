export function limparCpf(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

export function formatarCpf(cpf: string): string {
  const digits = limparCpf(cpf);
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function mascararCpf(cpf: string): string {
  const digits = limparCpf(cpf);
  if (digits.length !== 11) return "***";
  return `***.***.${digits.slice(6, 9)}-**`;
}
