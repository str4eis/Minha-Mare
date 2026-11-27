import { parseMoneyInput } from "./format";

export interface ProfileFormValues {
  fullName: string;
  retirementGoal: string;
  retirementSaved: string;
}

export function validateProfileForm(values: ProfileFormValues): string | null {
  if (!values.fullName.trim()) return "Informe seu nome.";
  if (parseMoneyInput(values.retirementGoal, true) === null) {
    return "Informe uma meta válida, maior ou igual a zero.";
  }
  if (parseMoneyInput(values.retirementSaved, true) === null) {
    return "Informe um valor guardado válido, maior ou igual a zero.";
  }
  return null;
}
