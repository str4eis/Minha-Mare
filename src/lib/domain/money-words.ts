const ones = [
  "zero",
  "um",
  "dois",
  "três",
  "quatro",
  "cinco",
  "seis",
  "sete",
  "oito",
  "nove",
];

const teens = [
  "dez",
  "onze",
  "doze",
  "treze",
  "quatorze",
  "quinze",
  "dezesseis",
  "dezessete",
  "dezoito",
  "dezenove",
];

const tens = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const hundreds = [
  "",
  "cento",
  "duzentos",
  "trezentos",
  "quatrocentos",
  "quinhentos",
  "seiscentos",
  "setecentos",
  "oitocentos",
  "novecentos",
];

const scales = [
  { value: 1_000_000_000_000, singular: "trilhão", plural: "trilhões" },
  { value: 1_000_000_000, singular: "bilhão", plural: "bilhões" },
  { value: 1_000_000, singular: "milhão", plural: "milhões" },
  { value: 1_000, singular: "mil", plural: "mil" },
];

function underOneThousand(value: number): string {
  if (value < 10) return ones[value];
  if (value < 20) return teens[value - 10];
  if (value < 100) {
    const unit = value % 10;
    return unit ? `${tens[Math.floor(value / 10)]} e ${ones[unit]}` : tens[value / 10];
  }
  if (value === 100) return "cem";

  const remainder = value % 100;
  return remainder
    ? `${hundreds[Math.floor(value / 100)]} e ${underOneThousand(remainder)}`
    : hundreds[value / 100];
}

function integerInWords(value: number): string {
  if (value === 0) return "zero";

  let remainder = value;
  const parts: Array<{ text: string; value: number }> = [];

  for (const scale of scales) {
    const group = Math.floor(remainder / scale.value);
    if (group === 0) continue;

    const text =
      scale.value === 1_000 && group === 1
        ? "mil"
        : `${underOneThousand(group)} ${
            group === 1 ? scale.singular : scale.plural
          }`;
    const groupValue = group * scale.value;
    parts.push({ text, value: groupValue });
    remainder -= groupValue;
  }

  if (remainder > 0) {
    parts.push({ text: underOneThousand(remainder), value: remainder });
  }

  if (parts.length === 1) return parts[0].text;

  const last = parts.pop();
  if (!last) return "";
  const connector = last.value < 100 || last.value % 100 === 0 ? " e " : " ";
  return `${parts.map((part) => part.text).join(" ")}${connector}${last.text}`;
}

export function moneyInWords(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "";

  const totalCents = Math.round(value * 100);
  if (!Number.isSafeInteger(totalCents)) {
    return "Valor muito alto para escrever por extenso.";
  }

  const reais = Math.floor(totalCents / 100);
  const cents = totalCents % 100;

  if (reais === 0 && cents === 0) return "zero reais";
  if (reais === 0) {
    return `${underOneThousand(cents)} ${
      cents === 1 ? "centavo" : "centavos"
    }`;
  }

  const realText = `${integerInWords(reais)} ${reais === 1 ? "real" : "reais"}`;
  if (cents === 0) return realText;

  return `${realText} e ${underOneThousand(cents)} ${
    cents === 1 ? "centavo" : "centavos"
  }`;
}
