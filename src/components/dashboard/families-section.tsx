"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Plus, Pencil, Trash2, Star, X, Check, Gift, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createFamily,
  addMember,
  renameMember,
  setPrincipal,
  deleteMember,
  deleteFamily,
  chooseGiftForFamily,
  clearFamilyGiftChoice,
  setFamilyCashAmount,
} from "@/app/dashboard/families-actions";
import { formatCurrency } from "@/lib/format";

type MemberDTO = {
  id: string;
  name: string;
  isPrincipal: boolean;
};

export type GiftOption = {
  id: string;
  name: string;
  value: number;
  imageUrl: string | null;
  claimedByFamilyId: string | null;
};

export type FamilyDTO = {
  id: string;
  cashAmount: number | null;
  members: MemberDTO[];
  claimedGift: {
    id: string;
    name: string;
    value: number;
    imageUrl: string | null;
  } | null;
};

function parseAmount(raw: string): number | null {
  const trimmed = raw.trim().replace(",", ".");
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function FamiliesSection({
  families,
  gifts,
}: {
  families: FamilyDTO[];
  gifts: GiftOption[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [newPrincipalName, setNewPrincipalName] = useState("");

  const [addingToFamilyId, setAddingToFamilyId] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState("");

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const [choiceFamilyId, setChoiceFamilyId] = useState<string | null>(null);
  const [choiceMode, setChoiceMode] = useState<"gift" | "cash" | null>(null);
  const [selectedGiftId, setSelectedGiftId] = useState("");
  const [cashDraft, setCashDraft] = useState("");

  function runAction(action: () => Promise<void>, onDone?: () => void) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
        onDone?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Algo deu errado.");
      }
    });
  }

  function handleCreateFamily(event: FormEvent) {
    event.preventDefault();
    const name = newPrincipalName;
    runAction(
      () => createFamily(name),
      () => {
        setNewPrincipalName("");
        setIsCreating(false);
      },
    );
  }

  function handleAddMember(event: FormEvent, familyId: string) {
    event.preventDefault();
    const name = newMemberName;
    runAction(
      () => addMember(familyId, name),
      () => {
        setNewMemberName("");
        setAddingToFamilyId(null);
      },
    );
  }

  function startEditing(member: MemberDTO) {
    setError(null);
    setEditingMemberId(member.id);
    setEditingValue(member.name);
  }

  function handleRename(event: FormEvent, memberId: string) {
    event.preventDefault();
    const name = editingValue;
    runAction(
      () => renameMember(memberId, name),
      () => setEditingMemberId(null),
    );
  }

  function handleSetPrincipal(familyId: string, memberId: string) {
    runAction(() => setPrincipal(familyId, memberId));
  }

  function handleDeleteMember(memberId: string) {
    if (!confirm("Excluir este integrante?")) return;
    runAction(() => deleteMember(memberId));
  }

  function handleDeleteFamily(familyId: string) {
    if (!confirm("Excluir esta família e todos os seus integrantes?")) return;
    runAction(() => deleteFamily(familyId));
  }

  function startChoosingGift(familyId: string) {
    setError(null);
    setChoiceFamilyId(familyId);
    setChoiceMode("gift");
    setSelectedGiftId("");
  }

  function startChoosingCash(family: FamilyDTO) {
    setError(null);
    setChoiceFamilyId(family.id);
    setChoiceMode("cash");
    setCashDraft(family.cashAmount != null ? String(family.cashAmount) : "");
  }

  function cancelChoice() {
    setChoiceFamilyId(null);
    setChoiceMode(null);
  }

  function handleConfirmGift(event: FormEvent, familyId: string) {
    event.preventDefault();
    if (!selectedGiftId) return;
    runAction(() => chooseGiftForFamily(familyId, selectedGiftId), cancelChoice);
  }

  function handleConfirmCash(event: FormEvent, familyId: string) {
    event.preventDefault();
    const amount = parseAmount(cashDraft);
    if (amount == null) return;
    runAction(() => setFamilyCashAmount(familyId, amount), cancelChoice);
  }

  function handleRemoveChoice(family: FamilyDTO) {
    if (family.claimedGift) {
      runAction(() => clearFamilyGiftChoice(family.id));
    } else {
      runAction(() => setFamilyCashAmount(family.id, null));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold">
          Cadastrar Famílias
        </h2>
        {!isCreating && (
          <Button size="sm" onClick={() => setIsCreating(true)}>
            <Plus data-icon="inline-start" />
            Nova família
          </Button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {isCreating && (
        <Card>
          <CardContent className="pt-4">
            <form
              onSubmit={handleCreateFamily}
              className="flex flex-col gap-3 sm:flex-row sm:items-end"
            >
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="principal-name">Nome do principal</Label>
                <Input
                  id="principal-name"
                  autoFocus
                  required
                  value={newPrincipalName}
                  onChange={(event) => setNewPrincipalName(event.target.value)}
                  placeholder="Ex: Maria Silva"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isPending}>
                  Salvar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setNewPrincipalName("");
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {families.length === 0 && !isCreating && (
        <p className="text-sm text-muted-foreground">
          Nenhuma família cadastrada ainda.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {families.map((family) => {
          const principal = family.members.find((m) => m.isPrincipal);
          const availableGiftOptions = gifts.filter(
            (g) => !g.claimedByFamilyId || g.claimedByFamilyId === family.id,
          );
          const isChoosingForThisFamily = choiceFamilyId === family.id;

          return (
            <Card key={family.id}>
              <CardHeader className="flex-row items-start justify-between">
                <CardTitle>
                  {principal ? `Família de ${principal.name}` : "Família"}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Excluir família"
                  onClick={() => handleDeleteFamily(family.id)}
                  disabled={isPending}
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {isChoosingForThisFamily && choiceMode === "gift" ? (
                  <form
                    onSubmit={(event) => handleConfirmGift(event, family.id)}
                    className="flex flex-col gap-2 rounded-lg border border-border p-3"
                  >
                    <select
                      required
                      autoFocus
                      value={selectedGiftId}
                      onChange={(event) => setSelectedGiftId(event.target.value)}
                      className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <option value="" disabled>
                        Selecione um presente
                      </option>
                      {availableGiftOptions.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} · {formatCurrency(g.value)}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={isPending}>
                        Confirmar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={cancelChoice}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                ) : isChoosingForThisFamily && choiceMode === "cash" ? (
                  <form
                    onSubmit={(event) => handleConfirmCash(event, family.id)}
                    className="flex flex-col gap-2 rounded-lg border border-border p-3"
                  >
                    <Input
                      autoFocus
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={cashDraft}
                      onChange={(event) => setCashDraft(event.target.value)}
                      placeholder="Valor (R$)"
                    />
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={isPending}>
                        Confirmar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={cancelChoice}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                ) : family.claimedGift ? (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
                    <span className="flex items-center gap-2 text-sm">
                      {family.claimedGift.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={family.claimedGift.imageUrl}
                          alt={family.claimedGift.name}
                          className="size-6 shrink-0 rounded object-cover ring-1 ring-border"
                          onError={(event) => {
                            event.currentTarget.style.visibility = "hidden";
                          }}
                        />
                      ) : (
                        <Gift className="size-4 text-muted-foreground" />
                      )}
                      {family.claimedGift.name}
                      <span className="text-muted-foreground">
                        · {formatCurrency(family.claimedGift.value)}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Trocar presente"
                        title="Trocar presente"
                        onClick={() => startChoosingGift(family.id)}
                        disabled={isPending}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Remover escolha"
                        onClick={() => handleRemoveChoice(family)}
                        disabled={isPending}
                      >
                        <X />
                      </Button>
                    </span>
                  </div>
                ) : family.cashAmount != null ? (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
                    <span className="flex items-center gap-2 text-sm">
                      <Coins className="size-4 text-muted-foreground" />
                      Contribuição: {formatCurrency(family.cashAmount)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Editar contribuição"
                        onClick={() => startChoosingCash(family)}
                        disabled={isPending}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Remover contribuição"
                        onClick={() => handleRemoveChoice(family)}
                        disabled={isPending}
                      >
                        <X />
                      </Button>
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2">
                    <span className="mr-auto text-sm text-muted-foreground">
                      Nenhuma escolha ainda
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => startChoosingGift(family.id)}
                      disabled={isPending || availableGiftOptions.length === 0}
                    >
                      Escolher presente
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => startChoosingCash(family)}
                      disabled={isPending}
                    >
                      Contribuir em dinheiro
                    </Button>
                  </div>
                )}

                <ul className="flex flex-col gap-2">
                  {family.members.map((member) => (
                    <li
                      key={member.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                    >
                      {editingMemberId === member.id ? (
                        <form
                          onSubmit={(event) => handleRename(event, member.id)}
                          className="flex flex-1 items-center gap-2"
                        >
                          <Input
                            autoFocus
                            value={editingValue}
                            onChange={(event) =>
                              setEditingValue(event.target.value)
                            }
                          />
                          <Button
                            type="submit"
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Salvar"
                            disabled={isPending}
                          >
                            <Check />
                          </Button>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Cancelar"
                            onClick={() => setEditingMemberId(null)}
                          >
                            <X />
                          </Button>
                        </form>
                      ) : (
                        <>
                          <span className="flex items-center gap-2 text-sm">
                            {member.isPrincipal && (
                              <Star className="size-3.5 fill-primary text-primary" />
                            )}
                            {member.name}
                          </span>
                          <span className="flex items-center gap-1">
                            {!member.isPrincipal && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Tornar principal"
                                title="Tornar principal"
                                onClick={() =>
                                  handleSetPrincipal(family.id, member.id)
                                }
                                disabled={isPending}
                              >
                                <Star />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Editar nome"
                              onClick={() => startEditing(member)}
                              disabled={isPending}
                            >
                              <Pencil />
                            </Button>
                            {!member.isPrincipal && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Excluir integrante"
                                onClick={() => handleDeleteMember(member.id)}
                                disabled={isPending}
                              >
                                <Trash2 className="text-destructive" />
                              </Button>
                            )}
                          </span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>

                {addingToFamilyId === family.id ? (
                  <form
                    onSubmit={(event) => handleAddMember(event, family.id)}
                    className="flex items-center gap-2"
                  >
                    <Input
                      autoFocus
                      required
                      placeholder="Nome da pessoa"
                      value={newMemberName}
                      onChange={(event) => setNewMemberName(event.target.value)}
                    />
                    <Button type="submit" size="sm" disabled={isPending}>
                      Adicionar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAddingToFamilyId(null);
                        setNewMemberName("");
                      }}
                    >
                      Cancelar
                    </Button>
                  </form>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="self-start"
                    onClick={() => setAddingToFamilyId(family.id)}
                  >
                    <Plus data-icon="inline-start" />
                    Adicionar pessoa
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
