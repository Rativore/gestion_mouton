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

  // Champs scalaires uniquement : on ne sérialise pas les relations
  // (mère/père/enfants) vers le composant client.
  const initial = {
    id: animal.id,
    numero: animal.numero,
    espece: animal.espece,
    sexe: animal.sexe,
    race: animal.race,
    dateNaissance: animal.dateNaissance,
    couleur: animal.couleur,
    signes: animal.signes,
    origine: animal.origine,
    dateEntree: animal.dateEntree,
    coutAchat: animal.coutAchat,
    mereId: animal.mereId,
    pereId: animal.pereId,
    pereExterieur: animal.pereExterieur,
    note: animal.note,
    photoUrl: animal.photoUrl,
  };

  return (
    <>
      <PageHeader titre={`Modifier n°${animal.numero}`} />
      <AnimalForm parents={parents} especes={especes} initial={initial} />
    </>
  );
}
