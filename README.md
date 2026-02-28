# 🍽️ Carta Restaurante — n8n + React + Google Sheets

## Estructura de archivos

```
CartaRestaurante.jsx        → Componente React principal (pon en src/components/)
[slug]-carta-page.jsx       → Página de ejemplo (pon en src/pages/ o pages/)
n8n-workflow.json           → Flujo de n8n (importar directamente)
```

---

## 📊 Columnas del Google Sheets

| Columna             | Descripción                                        | Ejemplo                        |
|---------------------|----------------------------------------------------|--------------------------------|
| `nombre`            | Nombre del plato                                   | Croquetas de jamón             |
| `descripcion`       | Descripción corta                                  | Cremosas croquetas artesanas…  |
| `precio`            | Precio con símbolo                                 | 8,50 €                         |
| `alergenos`         | Lista separada por comas (ver leyenda abajo)       | gluten, lacteos, huevo         |
| `categoria`         | Sección del menú (opcional)                        | Entrantes                      |
| `foto`              | URL pública de la imagen (opcional)                | https://…/foto.jpg             |
| `pagina`            | Slug para la URL (solo en fila 1)                  | casa-rodrigo                   |
| `nombre_restaurante`| Nombre visible en la cabecera (solo en fila 1)     | Casa Rodrigo                   |

### Alérgenos reconocidos (escribir exactamente así):
`gluten` · `lacteos` · `huevo` · `pescado` · `mariscos` · `cacahuetes` · `frutos_secos` · `soja` · `apio` · `mostaza` · `sesamo` · `sulfitos` · `moluscos` · `altramuces`

---

## 🔧 Configuración del flujo n8n

### 1. Importar el flujo
En n8n → menú superior → **Import from file** → selecciona `n8n-workflow.json`

### 2. Configurar credenciales
| Nodo                  | Credencial necesaria                                      |
|-----------------------|-----------------------------------------------------------|
| 📋 Leer Google Sheets | Google Sheets OAuth2 (conecta tu cuenta Google)           |
| 💾 Guardar QR en Drive| Google Drive OAuth2 (la misma cuenta Google sirve)        |
| 🐙 Subir JSON a GitHub| HTTP Header Auth → `Authorization: Bearer TU_PAT_TOKEN`   |

### 3. Reemplazar placeholders
Busca y reemplaza en el JSON del flujo:
- `TU_GOOGLE_SHEETS_ID` → el ID de tu Sheets (en la URL: `.../spreadsheets/d/AQUI/edit`)
- `TU_FOLDER_ID_EN_DRIVE` → ID de la carpeta Drive donde guardar los QRs
- `TU_USUARIO/TU_REPO` → tu usuario y repositorio de GitHub
- En el nodo GitHub, si el archivo ya existe añade el `sha` actual (lo puedes obtener con un GET a la misma URL)

### 4. Obtener Personal Access Token de GitHub
1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Permisos: `Contents: Read and Write` en tu repositorio
3. Copia el token y úsalo en la credencial HTTP Header Auth

---

## ⚛️ Integración en tu proyecto React

### Opción A — JSON estático (recomendado para Hostinger)
n8n sube `public/carta-data.json` a tu repo. La página lo carga al montar:

```jsx
// En tu página [slug]-carta.jsx
import { useEffect, useState } from "react";
import CartaRestaurante from "../components/CartaRestaurante";

export default function CartaPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/carta-data.json")
      .then(r => r.json())
      .then(setData);
  }, []);

  if (!data) return <p>Cargando carta…</p>;

  return (
    <CartaRestaurante
      menuData={data.menuData}
      restaurantName={data.restaurantName}
    />
  );
}
```

### Opción B — Build en Hostinger (si usas GitHub Actions)
Añade en `.github/workflows/deploy.yml` un trigger `on: push` para que Hostinger
haga rebuild automático cada vez que n8n actualiza el JSON.

---

## 🔲 QR generado
El QR se guarda en Google Drive como `QR_{{slug}}.png` y apunta a:
```
https://coderoasters.es/{{slug}}-carta
```
Puedes imprimirlo o incrustarlo directamente en tu web.

---

## 💡 Tips
- **Varias cartas**: Añade pestañas al mismo Sheets y cambia `sheetName` en el nodo de lectura. El `slug` de cada pestaña genera una URL diferente.
- **Fotos**: Sube las imágenes a cualquier CDN (Cloudinary, ImgBB gratuito, o la propia carpeta `public/` del repo) y pon la URL en la columna `foto`.
- **Categorías**: Si no pones categoría, todos los platos van a "Platos". Con categorías aparecen los filtros de navegación automáticamente.