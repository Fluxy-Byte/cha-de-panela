import { prisma } from "@/lib/prisma";
import { getSessionFamilyId } from "@/lib/family-session";
import { FamilySelectForm } from "@/components/invitations/family-select-form";
import { ProductsList } from "@/components/invitations/products-list";

export default async function InvitationsPage() {
  const familyId = await getSessionFamilyId();

  if (familyId) {
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: { members: { orderBy: [{ isPrincipal: "desc" }, { createdAt: "asc" }] } },
    });

    if (family) {
      const gifts = await prisma.gift.findMany({
        orderBy: { createdAt: "desc" },
      });

      const principal = family.members.find((member) => member.isPrincipal);
      const peopleCount = family.members.filter((member) => !member.isChild).length;

      return (
        <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-amber-50 via-yellow-50 to-amber-100 px-4 pb-16 pt-24 dark:from-neutral-950 dark:via-neutral-900 dark:to-black">
          <ProductsList
            familyName={principal?.name ?? "sua família"}
            peopleCount={peopleCount}
            gifts={gifts.map((gift) => ({
              id: gift.id,
              name: gift.name,
              value: gift.value,
              minValue: gift.minValue,
              raisedAmount: gift.raisedAmount,
              imageUrl: gift.imageUrl,
            }))}
          />
        </main>
      );
    }
  }

  const families = await prisma.family.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      members: { where: { isPrincipal: true }, take: 1 },
    },
  });

  const familyOptions = families
    .filter((family) => family.members[0])
    .map((family) => ({
      id: family.id,
      principalName: family.members[0].name,
    }));

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-amber-50 via-yellow-50 to-amber-100 px-4 pt-24 pb-12 dark:from-neutral-950 dark:via-neutral-900 dark:to-black">
      <FamilySelectForm families={familyOptions} />
    </main>
  );
}
