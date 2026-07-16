import { listerParents } from "@/lib/services/animaux";
import { listerEspeces } from "@/lib/services/especes";
import { PageHeader } from "@/components/ui";
import { AnimalForm } from "@/components/animal-form";

export default async function NouvelAnimalPage() {
  const [parents, especes] = await Promise.all([
    listerParents(),
    listerEspeces(),
  ]);
  return (
    <>
      <PageHeader
        titre="Nouvelle naissance"
        sousTitre="Ajouter une bête née sur l'exploitation. Pour un achat, passez par « Achat / Vente »."
      />
      <AnimalForm parents={parents} especes={especes} verrouillerNaissance />
    </>
  );
}
