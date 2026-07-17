/**
 * Illustration de l'icône de l'app (mouton stylisé sur fond vert), rendue par
 * `ImageResponse` (Satori) pour `app/icon.tsx` et `app/apple-icon.tsx`.
 *
 * 100 % auto-suffisant : uniquement des formes (pas d'emoji, donc aucune
 * dépendance réseau au build). Tout est en pourcentages → une seule définition
 * fonctionne pour toutes les tailles (192, 512, 180…).
 */
export function SheepTile() {
  const eye = {
    width: "9%",
    height: "9%",
    background: "#1c2419",
    borderRadius: "50%",
  } as const;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#3f7d3a",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "76%",
          height: "76%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Oreilles (derrière la laine) */}
        <div
          style={{
            position: "absolute",
            left: "-2%",
            top: "34%",
            width: "32%",
            height: "26%",
            background: "#e6ddcc",
            borderRadius: "50%",
            transform: "rotate(-28deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "-2%",
            top: "34%",
            width: "32%",
            height: "26%",
            background: "#e6ddcc",
            borderRadius: "50%",
            transform: "rotate(28deg)",
          }}
        />

        {/* Laine (tête blanche) */}
        <div
          style={{
            position: "absolute",
            top: "2%",
            left: "8%",
            width: "84%",
            height: "84%",
            background: "#ffffff",
            borderRadius: "50%",
          }}
        />

        {/* Museau */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "26%",
            width: "48%",
            height: "50%",
            background: "#efe7d8",
            borderRadius: "50%",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: "12%",
          }}
        >
          {/* Truffe */}
          <div
            style={{
              width: "20%",
              height: "14%",
              background: "#5a5348",
              borderRadius: "40%",
            }}
          />
        </div>

        {/* Yeux */}
        <div
          style={{
            position: "absolute",
            top: "48%",
            left: "34%",
            ...eye,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "48%",
            right: "34%",
            ...eye,
          }}
        />
      </div>
    </div>
  );
}
