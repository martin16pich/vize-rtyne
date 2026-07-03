# Vize Rtyně 2035

Statický web pro prezentaci vizí veřejných prostor ve Rtyni.

## Jak měnit fotky bez úprav kódu

Fotky jsou nově ve složce `images/`.

Stačí v GitHubu nahrát nový obrázek se stejným názvem a stejnou cestou.

### Úvodní mapa

`images/mapa/rtyne-letecky.jpg`

### Žabárna

- současnost: `images/zabarna/soucasnost.jpg`
- vize: `images/zabarna/vize.jpg`
- hotspoty:
  - `images/zabarna/hotspots/hriste.jpg`
  - `images/zabarna/hotspots/ohniste.jpg`
  - `images/zabarna/hotspots/privoz.jpg`
  - `images/zabarna/hotspots/molo.jpg`

### Park před Kampeličkou

- současnost: `images/kampelicka/soucasnost.jpg`
- vize: `images/kampelicka/vize.jpg`
- hotspoty:
  - `images/kampelicka/hotspots/kulickova-draha.jpg`
  - `images/kampelicka/hotspots/zastavka.jpg`
  - `images/kampelicka/hotspots/pruzinova-houpacka.jpg`

### Další místa

- `images/hornicka/soucasnost.jpg`
- `images/hornicka/vize.jpg`
- `images/namesti/soucasnost.jpg`
- `images/namesti/vize.jpg`
- `images/centrum/soucasnost.jpg`
- `images/centrum/vize.jpg`
- `images/odpady/soucasnost.jpg`
- `images/odpady/vize.jpg`

## Jak měnit texty a fotky u hotspotů

Texty, pozice a cesty k fotkám jsou v JSON souborech:

- Žabárna: `data/hotspots.json`
- Park před Kampeličkou: `data/kampelicka-hotspots.json`

Například:

```json
{
  "id": "pruzinova-houpacka",
  "title": "Pružinová houpačka",
  "text": "Houpačka pro malé děti.",
  "image": "images/kampelicka/hotspots/pruzinova-houpacka.jpg",
  "x": 47.5,
  "y": 66
}
```

## Editory

- `editor.html` – editor bodů na hlavní mapě města.
- `hotspot-editor.html` – editor hotspotů pro Žabárnu a Park před Kampeličkou.

Editor nic neukládá automaticky. Po úpravě stáhneš nový JSON a nahraješ ho do GitHubu do složky `data/`.
