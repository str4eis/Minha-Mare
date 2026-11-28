export interface ProfileFormValues {
  fullName: string;
}

export function validateProfileForm(values: ProfileFormValues): string | null {
  if (!values.fullName.trim()) return "Informe seu nome.";
  return null;
}
