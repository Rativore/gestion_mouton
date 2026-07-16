import { notFound } from "next/navigation";
import { getAnimal, listerParents } from "@/lib/services/animaux";
import { listerEspeces } from "@/lib/services/especes";
import { PageHeader } from "@/components/ui";
import { AnimalForm } from "@/components/animal-form";

export default async function ModifierAnimalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [animal, parents, especes] = await Promise.all([
    getAnimal(id),
    listerParents(id),
    listerEspeces(),
  ]);
  if (!animal) notFound();

  return (
    <>
      <PageHeader titre={`Modifier n°${animal.numero}`} />
      <AnimalForm parents={parents} especes={especes} initial={animal} />
    </>
  );
}
