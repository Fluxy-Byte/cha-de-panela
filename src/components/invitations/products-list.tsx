"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Gift as GiftIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { calculateContributionValue } from "@/lib/pricing";
import {
  createProductPayment,
  getPaymentStatus,
  resetFamilySelection,
} from "@/app/invitations/actions";

type GiftDTO = {
  id: string;
  name: string;
  value: number;
  minValue: number;
  raisedAmount: number;
  imageUrl: string | null;
};

type PaymentResult = {
  paymentId: string;
  amount: number;
  qrCodeImage: string;
  qrCodePayload: string;
};

function fundedPercentage(gift: GiftDTO) {
  if (gift.minValue <= 0) return 0;
  return Math.min(100, Math.round((gift.raisedAmount / gift.minValue) * 100));
}

export function ProductsList({
  familyName,
  peopleCount,
  gifts,
}: {
  familyName: string;
  peopleCount: number;
  gifts: GiftDTO[];
}) {
  const router = useRouter();
  const [isSwitching, startSwitching] = useTransition();

  function handleSwitchFamily() {
    startSwitching(async () => {
      await resetFamilySelection();
      router.refresh();
    });
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <div className="text-center">
        <h1 className="font-heading text-2xl italic text-amber-900 dark:text-amber-100 sm:text-3xl">
          Olá, família de {familyName}!
        </h1>
        <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
          Escolha um produto para nos ajudar a comprar. O valor sugerido já
          considera quantas pessoas fazem parte da sua família.
        </p>
        <button
          type="button"
          onClick={handleSwitchFamily}
          disabled={isSwitching}
          className="mt-2 text-xs text-amber-600 underline-offset-2 hover:underline dark:text-amber-400"
        >
          Essa família está errada? Trocar família
        </button>
      </div>

      {gifts.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          Nenhum produto disponível no momento.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {gifts.map((gift) => (
            <ProductCard key={gift.id} gift={gift} peopleCount={peopleCount} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({
  gift,
  peopleCount,
}: {
  gift: GiftDTO;
  peopleCount: number;
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [cpf, setCpf] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [payment, setPayment] = useState<PaymentResult | null>(null);
  const [status, setStatus] = useState<"PENDING" | "CONFIRMED" | "FAILED" | null>(
    null,
  );

  const suggestedValue = calculateContributionValue(gift.minValue, peopleCount);
  const percentage = fundedPercentage(gift);

  useEffect(() => {
    if (!payment || status !== "PENDING") return;

    const interval = setInterval(async () => {
      try {
        const current = await getPaymentStatus(payment.paymentId);
        setStatus(current);
      } catch {
        // ignora falhas pontuais de rede e tenta de novo no próximo tick
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [payment, status]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await createProductPayment(gift.id, cpf);
        setPayment(result);
        setStatus("PENDING");
        setIsFormOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Algo deu errado.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {gift.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gift.imageUrl}
              alt={gift.name}
              className="size-10 shrink-0 rounded-md object-cover ring-1 ring-border"
              onError={(event) => {
                event.currentTarget.style.visibility = "hidden";
              }}
            />
          ) : (
            <GiftIcon className="size-6 text-muted-foreground" />
          )}
          {gift.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-amber-500 transition-[width]"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {formatCurrency(gift.raisedAmount)} arrecadados de{" "}
            {formatCurrency(gift.minValue)} · {percentage}%
          </span>
        </div>

        {status === "CONFIRMED" ? (
          <p className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-medium text-amber-700 dark:text-amber-300">
            Pago! Obrigado 💛
          </p>
        ) : payment ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-border px-3 py-3 text-center">
            <p className="text-sm text-muted-foreground">
              Escaneie o QR Code ou copie o código Pix para pagar{" "}
              {formatCurrency(payment.amount)}.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`data:image/png;base64,${payment.qrCodeImage}`}
              alt="QR Code Pix"
              className="size-40"
            />
            <Input
              readOnly
              value={payment.qrCodePayload}
              onFocus={(event) => event.currentTarget.select()}
              className="text-center text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Assim que o pagamento for confirmado, o valor é atualizado aqui
              automaticamente.
            </p>
          </div>
        ) : isFormOpen ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <p className="text-sm">
              Valor sugerido para a sua família:{" "}
              <span className="font-semibold">
                {formatCurrency(suggestedValue)}
              </span>
            </p>
            <Input
              required
              inputMode="numeric"
              placeholder="CPF (somente números)"
              value={cpf}
              onChange={(event) => setCpf(event.target.value)}
            />
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? "Gerando Pix..." : "Gerar Pix"}
                {!isPending && <Check data-icon="inline-end" />}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              Sugestão: {formatCurrency(suggestedValue)}
            </span>
            <Button size="sm" onClick={() => setIsFormOpen(true)}>
              Contribuir
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
