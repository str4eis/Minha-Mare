"use client";

import { useLayoutEffect, useRef, type InputHTMLAttributes } from "react";
import { formatMoneyInput } from "@/lib/format";

type MoneyInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "inputMode" | "onChange" | "type" | "value"
> & {
  onValueChange: (value: string) => void;
  value: string;
};

export default function MoneyInput({
  onValueChange,
  value,
  ...props
}: MoneyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldMoveCaret = useRef(false);

  useLayoutEffect(() => {
    if (!shouldMoveCaret.current) return;
    const input = inputRef.current;
    if (input && document.activeElement === input) {
      input.setSelectionRange(input.value.length, input.value.length);
    }
    shouldMoveCaret.current = false;
  }, [value]);

  return (
    <input
      {...props}
      ref={inputRef}
      type="text"
      inputMode="decimal"
      value={value}
      onChange={(event) => {
        shouldMoveCaret.current = true;
        const inputValue = event.currentTarget.value;
        const nativeEvent = event.nativeEvent;
        const isDeleting =
          "inputType" in nativeEvent &&
          typeof nativeEvent.inputType === "string" &&
          nativeEvent.inputType.startsWith("delete");
        const digits = inputValue.replace(/\D/g, "");
        onValueChange(
          isDeleting && !/[1-9]/.test(digits)
            ? ""
            : formatMoneyInput(inputValue)
        );
      }}
    />
  );
}
