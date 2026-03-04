# OtoReport — Informe de Otoscopía Digital

## Descripción

Aplicación de escritorio para la creación, gestión y exportación de informes de otoscopía clínica. Combina esquemas timpánicos interactivos, captura de imágenes desde otoscopios digitales con anotación sobre canvas y rotación, un checklist de hallazgos clínicos y exportación a PDF.

Sin base de datos. Todo se almacena en una carpeta de trabajo elegida por el usuario, organizada en carpetas por paciente y sesión, con archivos JSON, fotos e informes PDF.

Desarrollada con Tauri 2.0 para distribución multiplataforma (Linux, Windows, macOS).

---

## Stack Tecnológico

| Capa | Tecnología | Versión | Justificación |
|------|------------|---------|---------------|
| Framework desktop | Tauri | 2.x | Binarios livianos, acceso nativo al FS |
| Frontend bundler | Vite | 6.x | HMR rápido, build optimizado |
| UI framework | React | 19.x | Ecosistema maduro |
| Lenguaje frontend | TypeScript | 5.x | Tipado estricto para datos clínicos |
| Estilos | Tailwind CSS | 4.x | Utility-first |
| Canvas/SVG | React + SVG nativo + Canvas API | — | Esquemas interactivos y anotación de fotos |
| Almacenamiento | Filesystem (JSON + archivos) | — | Sin base de datos, portable, backupeable con copiar carpeta |
| Exportación PDF | @react-pdf/renderer | latest | PDF desde componentes React |
| Backend (Rust) | Tauri core + comandos | 2.x | Manejo de archivos, thumbnails, exportación |
| Iconos | Lucide React | latest | Set limpio |
| Formularios | React Hook Form + Zod | latest | Validación de datos clínicos |
| Procesamiento imagen (Rust) | image crate | 0.25 | Thumbnails y rotación |
| IDs únicos (Rust) | uuid crate | 1.x | Nombres de archivo |

---

## Almacenamiento — Carpeta de Trabajo

### Primer inicio

La primera vez que se abre la app, muestra una pantalla de bienvenida que pide seleccionar una carpeta de trabajo. Se abre el diálogo nativo del SO para elegir o crear una carpeta. Esa ruta se guarda en un archivo de configuración en el directorio estándar de la app ($XDG_CONFIG_HOME en Linux, %APPDATA% en Windows).

Si la carpeta ya tiene datos de OtoReport (tiene el archivo otoreport.json adentro), los carga. Si está vacía, la inicializa.

En inicios posteriores, la app abre directo con la carpeta ya configurada. En Settings se puede cambiar la carpeta de trabajo en cualquier momento.

### Estructura de la carpeta de trabajo

```
carpeta-de-trabajo/
├── otoreport.json                       ← Config global (examinador, equipo, preferencias)
├── pacientes/
│   ├── 12345678-9/                     ← Carpeta por RUT (sin puntos)
│   │   ├── paciente.json               ← Datos del paciente
│   │   ├── sesiones/
│   │   │   ├── 2026-03-03_001/         ← Fecha + correlativo
│   │   │   │   ├── informe.json        ← Hallazgos, marcas, notas, conclusión
│   │   │   │   ├── informe.pdf         ← PDF exportado (si se generó)
│   │   │   │   ├── od/                 ← Fotos oído derecho
│   │   │   │   │   ├── a1b2c3d4.jpg    ← Foto original
│   │   │   │   │   ├── a1b2c3d4_anotado.png  ← Foto con anotaciones
│   │   │   │   │   └── a1b2c3d4_thumb.jpg    ← Thumbnail 150x150
│   │   │   │   ├── oi/                 ← Fotos oído izquierdo
│   │   │   │   │   ├── e5f6g7h8.jpg
│   │   │   │   │   ├── e5f6g7h8_anotado.png
│   │   │   │   │   └── e5f6g7h8_thumb.jpg
│   │   │   │   └── esquemas/           ← Esquemas timpánicos renderizados
│   │   │   │       ├── od.png
│   │   │   │       └── oi.png
│   │   │   ├── 2026-03-10_001/
│   │   │   │   └── ...
│   │   │   └── 2026-03-10_002/         ← Segunda sesión del mismo día
│   │   │       └── ...
│   │   └── ...
│   ├── 98765432-1/
│   │   ├── paciente.json
│   │   └── sesiones/
│   │       └── ...
│   └── ...
```

### otoreport.json (config global)

Contiene: nombre del examinador por defecto, equipo por defecto, ruta al logo institucional (opcional), preferencias de interfaz.

### paciente.json

Contiene: rut, nombre completo, fecha de nacimiento, edad, teléfono, email, notas generales, timestamps de creación y última actualización.

### informe.json

Contiene todo el informe de una sesión:
- Metadata: fecha examen, examinador, equipo
- Hallazgos OD: checklist (campos booleanos), marcas visuales por cuadrante, observaciones
- Hallazgos OI: lo mismo
- Lista de imágenes por oído: para cada imagen el nombre de archivo, si está seleccionada para PDF, orden, notas, ángulo de rotación aplicado
- Anotaciones por imagen: lista de símbolos dibujados con posición, tipo, color, tamaño
- Conclusión / impresión diagnóstica

### Ventajas de este enfoque

- **Cero dependencias de DB**: no hay SQLite, no hay migraciones, no hay corrupción de base de datos.
- **Backup trivial**: copiar la carpeta y listo. Sincronizable con Dropbox, Google Drive, OneDrive, etc.
- **Portable**: mover la carpeta a otro PC y funciona igual.
- **Legible**: los JSON son editables a mano si es necesario.
- **Organizado**: estructura predecible por paciente y fecha.

---

## Estructura del Proyecto

```
otoreport/
├── src/
│   ├── assets/fonts/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MainLayout.tsx
│   │   ├── setup/
│   │   │   └── WorkspaceSetup.tsx        ← Pantalla primer inicio
│   │   ├── patients/
│   │   │   ├── PatientForm.tsx
│   │   │   ├── PatientList.tsx
│   │   │   └── PatientCard.tsx
│   │   ├── otoscopy/
│   │   │   ├── TympanicDiagram.tsx
│   │   │   ├── EarPanel.tsx
│   │   │   ├── FindingsChecklist.tsx
│   │   │   ├── SymbolPalette.tsx
│   │   │   ├── ReportForm.tsx
│   │   │   └── ReportPreview.tsx
│   │   ├── capture/
│   │   │   ├── ImageActions.tsx
│   │   │   ├── CameraCapture.tsx
│   │   │   ├── DeviceSelector.tsx
│   │   │   ├── PhotoGallery.tsx
│   │   │   └── PhotoPreview.tsx
│   │   ├── annotation/
│   │   │   ├── ImageAnnotator.tsx        ← Canvas de anotación sobre foto
│   │   │   ├── AnnotationToolbar.tsx     ← Barra de herramientas de marcado
│   │   │   ├── RotationControl.tsx       ← Control de rotación con pivote
│   │   │   └── SymbolStamps.tsx          ← Símbolos clínicos arrastrables
│   │   ├── export/
│   │   │   └── PdfReport.tsx
│   │   └── ui/
│   │       ├── Button, Input, Select, Checkbox, Dialog, Toast
│   ├── hooks/
│   │   ├── useWorkspace.ts               ← Lectura/escritura carpeta de trabajo
│   │   ├── usePatients.ts
│   │   ├── useReports.ts
│   │   ├── useCamera.ts
│   │   ├── useEarImages.ts
│   │   └── useAnnotation.ts             ← Estado del canvas de anotación
│   ├── lib/
│   │   ├── filesystem.ts                ← Operaciones de lectura/escritura JSON
│   │   ├── paths.ts                     ← Resolución de rutas dentro del workspace
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Patients.tsx
│   │   ├── NewReport.tsx
│   │   ├── ReportHistory.tsx
│   │   └── Settings.tsx
│   ├── types/
│   │   ├── patient.ts
│   │   ├── report.ts
│   │   ├── findings.ts
│   │   ├── image.ts
│   │   └── annotation.ts
│   ├── App.tsx, main.tsx, index.css
├── src-tauri/
│   ├── src/
│   │   ├── main.rs, lib.rs
│   │   ├── commands/
│   │   │   ├── workspace.rs              ← Selección y validación de carpeta
│   │   │   ├── patients.rs
│   │   │   ├── reports.rs
│   │   │   ├── images.rs                 ← Guardar, rotar, thumbnails
│   │   │   └── export.rs
│   │   └── storage/
│   │       ├── mod.rs
│   │       ├── json_store.rs             ← Lectura/escritura de JSON
│   │       └── file_manager.rs           ← Manejo de carpetas y archivos
│   ├── Cargo.toml, tauri.conf.json
│   ├── capabilities/default.json
│   └── icons/
├── scripts/
│   ├── build-linux.sh
│   ├── build-dev.sh
│   └── setup-dev.sh
├── .github/workflows/
│   ├── build-windows.yml
│   └── build-linux.yml
├── package.json, vite.config.ts, tsconfig.json
├── tailwind.config.ts
├── PROJECT.md, README.md
```

---

## Modelo de Datos (archivos JSON)

### paciente.json

| Campo | Tipo | Descripción |
|-------|------|-------------|
| rut | string | RUT sin puntos con guión (ej: "12345678-9") |
| name | string | Nombre completo |
| birth_date | string | Fecha de nacimiento ISO 8601 |
| age | number | Edad |
| phone | string | Teléfono |
| email | string | Correo |
| notes | string | Notas generales |
| created_at | string | Timestamp |
| updated_at | string | Timestamp |

### informe.json

| Campo | Tipo | Descripción |
|-------|------|-------------|
| exam_date | string | Fecha del examen ISO 8601 |
| examiner | string | Nombre del examinador |
| equipment | string | Equipo utilizado |
| right_ear.findings | object | Checklist OD (booleanos) |
| right_ear.marks | object | Marcas visuales por cuadrante OD |
| right_ear.notes | string | Observaciones OD |
| right_ear.images | array | Lista de imágenes OD |
| left_ear.findings | object | Checklist OI |
| left_ear.marks | object | Marcas visuales por cuadrante OI |
| left_ear.notes | string | Observaciones OI |
| left_ear.images | array | Lista de imágenes OI |
| conclusion | string | Impresión diagnóstica |
| created_at | string | Timestamp |

### Estructura de cada imagen en el array

| Campo | Tipo | Descripción |
|-------|------|-------------|
| filename | string | Nombre del archivo (UUID.jpg) |
| source | string | "camera" o "file" |
| original_name | string | Nombre original si fue cargado |
| selected | boolean | Incluir en PDF |
| sort_order | number | Orden en el informe |
| rotation | number | Grados de rotación aplicados (0, 90, 180, 270 o libre) |
| notes | string | Nota de la imagen |
| annotations | array | Lista de anotaciones dibujadas sobre la imagen |

### Estructura de cada anotación

| Campo | Tipo | Descripción |
|-------|------|-------------|
| type | string | Tipo de símbolo (ver tabla de símbolos) |
| x | number | Posición X relativa (0-1, proporción del ancho) |
| y | number | Posición Y relativa (0-1, proporción del alto) |
| color | string | Color hex del símbolo |
| size | number | Tamaño del símbolo (escala relativa) |
| rotation | number | Rotación del símbolo individual (grados) |

Las posiciones se guardan como proporciones (0 a 1) en vez de pixeles, así las anotaciones escalan correctamente si la imagen se muestra en distintos tamaños.

### Findings (checklist por oído)

Campos: normal, tapon_semi_oclusivo, tapon_oclusivo, perforacion_timpanica, otorrea, hiperemia (con subcampo detail), membrana_monomerica, exostosis_cae.

### Marks (esquema visual por oído)

Cuadrantes: AS, AI, PS, PI, PF, CAE. Cada uno con finding (tipo de hallazgo) y notes.

Valores de finding: none, cerumen, perforation, retraction, effusion, inflammation, myringosclerosis, cholesteatoma, tube, bulging, normal.

---

## Funcionalidades

### MVP (v1.0)

1. **Carpeta de trabajo** — Al primer inicio pide elegir carpeta. Toda la data vive ahí como archivos y carpetas. Backup = copiar carpeta. Se puede cambiar en Settings.

2. **Registro de pacientes** — CRUD. Se busca por nombre o RUT. Cada paciente es una carpeta con su paciente.json.

3. **Creación de informe** — Seleccionar paciente, se crea carpeta de sesión con fecha + correlativo. Fecha y examinador se autocomplementan desde config.

4. **Esquema timpánico SVG interactivo** — OD (rojo) y OI (azul) con cuadrantes clickeables, marcado por hallazgo. Superiores arriba, inferiores abajo.

5. **Checklist clínico** — Normal, tapón semi-oclusivo, tapón oclusivo, perforación timpánica, otorrea, hiperemia (con detalle), membrana monomérica, exostosis CAE.

6. **Captura de imágenes por oído**:
   - **Cargar imagen**: diálogo nativo, JPG/PNG, selección múltiple.
   - **Tomar foto**: enumera dispositivos de video, elige el correcto, fullscreen con stream, captura con botón o Espacio, múltiples fotos, "Listo" para cerrar.
   - **Galería**: thumbnails, eliminar, seleccionar para PDF, reordenar.

7. **Rotación de imágenes** — Al visualizar una foto se puede rotar libremente con pivote en el centro. Necesario porque los video-otoscopios muchas veces capturan la imagen rotada al entrar al oído. La rotación se guarda en el informe.json y se aplica al exportar PDF.

8. **Anotación sobre imágenes** — Al hacer click en una foto de la galería se abre un canvas de anotación donde se pueden estampar símbolos clínicos directamente sobre la imagen para marcar hallazgos. Los símbolos se colocan con click, se pueden mover, redimensionar y eliminar.

9. **Exportación a PDF** — Informe completo con esquemas, hallazgos, fotos seleccionadas (con rotación y anotaciones aplicadas) y datos del paciente. Se guarda en la carpeta de la sesión.

10. **Historial** — Ver sesiones anteriores de cada paciente con sus fotos e informes.

### v1.1

- Exportación a DOCX editable
- Logo institucional configurable
- Impresión directa
- Plantillas de informe personalizables

### v2.0

- Comparación temporal de sesiones (lado a lado con fotos)
- Estadísticas de hallazgos
- Multi-usuario con perfiles
- Video clips cortos del otoscopio
- Integración con DICOM

---

## Componente: Esquema Timpánico

### Anatomía

- **Annulus** — círculo principal (borde del tímpano)
- **CAE** — anillo exterior
- **4 cuadrantes** — AS, AI, PS, PI con líneas punteadas
- **Pars flácida (PF)** — zona superior
- **Mango del martillo** — línea curva apófisis corta → umbo
- **Umbo** — punto central
- **Apófisis corta** — punto superior
- **Cono luminoso** — triángulo en cuadrante anteroinferior

### Orientación

- **OD**: anterior a la IZQUIERDA, posterior a la DERECHA
- **OI**: anterior a la DERECHA, posterior a la IZQUIERDA
- Superiores (AS, PS) siempre ARRIBA, inferiores (AI, PI) siempre ABAJO

### Interacción

- Click en cuadrante → aplica hallazgo de la paleta
- Segundo click mismo hallazgo → limpia
- Hover → tooltip con nombre del cuadrante

### Colores y patrones

| Hallazgo | Color | Patrón |
|----------|-------|--------|
| Tapón cerumen | #d97706 amber | Líneas diagonales |
| Perforación | #ef4444 red | Círculo abierto |
| Retracción | #7c3aed violet | Flechas hacia adentro |
| Efusión/derrame | #0ea5e9 sky | Líneas onduladas |
| Inflamación | #f97316 orange | Puntos dispersos |
| Miringoesclerosis | #94a3b8 gray | Círculos abiertos |
| Colesteatoma | #fbbf24 yellow | Cruces |
| Tubo timpanost. | #06b6d4 cyan | Círculo con punto |
| Abombamiento | #a855f7 purple | Triángulo |
| Normal | #4ade80 green | Check |

---

## Componente: Rotación de Imágenes

### Problema

Los video-otoscopios frecuentemente capturan la imagen rotada porque la punta del instrumento no entra perfectamente alineada al conducto auditivo. La imagen del tímpano puede aparecer girada respecto a la orientación anatómica esperada.

### Solución

Cada imagen tiene un control de rotación con pivote central. El usuario puede:

- **Rotar libre**: arrastrar con el mouse en un gesto circular alrededor de la imagen, o usar un slider de 0° a 360°.
- **Rotar en pasos**: botones de +90°, -90° para rotaciones rápidas.
- **Reset**: volver a 0°.

La rotación usa el centro de la imagen como pivote fijo. El ángulo se guarda en el campo rotation del informe.json (en grados, valor libre de 0 a 359). Se aplica visualmente en la galería, en el canvas de anotación y en la exportación PDF.

### Control visual

Aparece debajo de la imagen cuando se selecciona para ver. Un aro circular alrededor de la foto o un slider angular. Los botones de ±90° están siempre visibles para acceso rápido.

---

## Componente: Anotación sobre Imágenes (ImageAnnotator)

### Concepto

Al hacer click en una foto de la galería, en vez de solo verla grande, se abre un canvas de anotación fullscreen. La foto (ya rotada según su ángulo guardado) es el fondo del canvas, y sobre ella el usuario puede estampar símbolos clínicos para marcar hallazgos directamente sobre la imagen real del tímpano.

### Interfaz del canvas

```
┌──────────────────────────────────────────────┐
│ [Toolbar de símbolos]              [Guardar] │
│ [Cerrar]                            [Limpiar]│
├──────────────────────────────────────────────┤
│                                              │
│                                              │
│          Foto del tímpano (rotada)           │
│                                              │
│              ✕ ← colesteatoma marcado        │
│                                              │
│         /// ← cerumen marcado                │
│                                              │
│                                              │
├──────────────────────────────────────────────┤
│  [Rotación: slider ← ○ →]  [+90°] [-90°]   │
└──────────────────────────────────────────────┘
```

### Toolbar de símbolos (AnnotationToolbar)

Barra horizontal arriba del canvas con los mismos símbolos del esquema timpánico, cada uno como un "stamp" clickeable:

| Símbolo | Representación en canvas | Color |
|---------|-------------------------|-------|
| Tapón cerumen | Área achurada con líneas diagonales | amber |
| Perforación | Círculo abierto | red |
| Retracción | Flechas convergentes | violet |
| Efusión | Líneas onduladas | sky |
| Inflamación | Grupo de puntos | orange |
| Miringoesclerosis | Círculos abiertos pequeños | gray |
| Colesteatoma | Cruz (X) | yellow |
| Tubo | Círculo con punto central | cyan |
| Abombamiento | Triángulo | purple |

Además de los símbolos, la toolbar tiene:
- **Flecha indicadora**: para señalar un punto específico (flecha roja con punta)
- **Texto libre**: agregar una etiqueta de texto en cualquier posición
- **Borrador**: click sobre un símbolo ya colocado para eliminarlo

### Flujo de anotación

1. El usuario selecciona un símbolo de la toolbar (queda "activo" y resaltado).
2. Hace click sobre la foto en la posición donde quiere colocarlo.
3. El símbolo aparece en esa posición, semi-transparente sobre la imagen.
4. Puede moverlo arrastrando.
5. Puede cambiar su tamaño con scroll o handles de esquina.
6. Puede eliminarlo haciendo click con el borrador activo, o seleccionándolo y presionando Delete.
7. Puede colocar múltiples símbolos del mismo tipo o diferentes.
8. Al guardar, se almacenan las anotaciones en el informe.json Y se genera una imagen compuesta (foto + anotaciones) como archivo separado (filename_anotado.png).

### Guardado de anotaciones

Las anotaciones se guardan de dos formas:
- **Como datos**: en el array annotations del informe.json con posición relativa (0-1), tipo, color, tamaño. Esto permite re-editar las anotaciones después.
- **Como imagen**: se renderiza la foto + anotaciones a un PNG separado (filename_anotado.png). Este es el que se usa en el PDF.

---

## Componente: Captura de Imágenes

### ImageActions

Dos botones debajo del esquema timpánico:

**"Cargar imagen"** — Diálogo nativo del SO, filtrado a JPG/JPEG/PNG. Selección múltiple. Se copian a la carpeta od/ o oi/ de la sesión.

**"Tomar foto"** — Abre CameraCapture fullscreen.

### CameraCapture — Flujo

**Paso 1**: Enumera dispositivos de video del sistema. Muestra nombres legibles.

**Paso 2**: Si hay más de uno, dropdown para elegir. Si hay uno, se usa directo.

**Paso 3**: Stream a pantalla completa (fondo negro, object-fit contain). Mayor resolución posible.

**Paso 4**: Barra inferior con tres zonas:

```
┌─────────────────────────────────────────┐
│                                         │
│           [stream de video]             │
│                                         │
├─────────────────────────────────────────┤
│ [Cambiar    [  ◉ CAPTURAR  ]   [Listo  │
│  cámara]                         (N)]   │
│                                         │
│ Fotos tomadas: [thumb] [thumb] [thumb]  │
└─────────────────────────────────────────┘
```

Al capturar: frame a JPEG, flash blanco, thumbnail en tira inferior. Stream sigue activo.

**Paso 5**: "Listo" o Escape cierra, guarda fotos en carpeta de sesión, actualiza galería.

### Atajos de teclado

| Tecla | Acción |
|-------|--------|
| Espacio | Capturar |
| Escape | Listo |
| Tab | Cambiar dispositivo |
| Delete | Eliminar última foto de esta sesión |

### PhotoGallery

Grid horizontal de thumbnails por oído. Cada thumbnail:
- Miniatura 150x150 (ya rotada según el ángulo guardado)
- Checkbox: incluir/excluir del PDF
- Botón eliminar (X)
- Click → abre ImageAnnotator (canvas de anotación + rotación)
- Drag & drop para reordenar
- Indicador visual si tiene anotaciones (pequeño ícono de lápiz)

Placeholder sin fotos: "Sin imágenes".

### Permisos de cámara

- **Linux**: WebKitGTK maneja permisos automáticamente.
- **Windows**: WebView2 pide permiso la primera vez.
- **macOS**: Requiere NSCameraUsageDescription en Info.plist.

---

## Backend Rust — Comandos

### Workspace
- **select_workspace**: Abre diálogo de selección de carpeta, valida o inicializa, guarda la ruta en config.
- **get_workspace**: Retorna la ruta actual de la carpeta de trabajo.

### Pacientes
- **list_patients**: Lee todas las carpetas dentro de pacientes/, carga cada paciente.json.
- **save_patient**: Crea o actualiza paciente.json en la carpeta correspondiente al RUT.
- **delete_patient**: Elimina la carpeta completa del paciente.

### Sesiones/Informes
- **create_session**: Crea carpeta de sesión (fecha + correlativo) con subcarpetas od/, oi/, esquemas/.
- **save_report**: Escribe informe.json en la carpeta de sesión.
- **load_report**: Lee informe.json.
- **list_sessions**: Lista carpetas de sesiones de un paciente, ordena por fecha.

### Imágenes
- **save_image**: Recibe bytes, genera UUID, escribe en od/ o oi/, genera thumbnail, retorna metadata.
- **load_image**: Lee bytes completos de una imagen del disco.
- **delete_image**: Elimina archivo original + anotado + thumbnail.
- **rotate_image**: Aplica rotación y regenera thumbnail rotado.
- **save_annotated**: Recibe los bytes de la imagen compuesta (foto + anotaciones) y los escribe como filename_anotado.png.

### Exportación
- **export_pdf**: Lee informe.json, carga imágenes anotadas (o las originales rotadas si no hay anotaciones), genera y guarda el PDF en la carpeta de sesión.

---

## Integración en el PDF

```
┌─── Informe PDF ──────────────────┐
│  Datos paciente                  │
│  ─────────────                   │
│  OD - Esquema        OI - Esq.  │
│  OD - Hallazgos      OI - Hall. │
│                                  │
│  ── Imágenes OD ──               │
│  ┌────────┐ ┌────────┐          │
│  │ foto1  │ │ foto2  │          │  ← rotadas y con anotaciones
│  │(anotad)│ │        │          │
│  └────────┘ └────────┘          │
│                                  │
│  ── Imágenes OI ──               │
│  ┌────────┐ ┌────────┐          │
│  │ foto1  │ │ foto2  │          │
│  └────────┘ └────────┘          │
│                                  │
│  Conclusión                      │
│  Firma examinador                │
└──────────────────────────────────┘
```

Fotos en grid de 2 columnas, máximo 4 por página. Se usa la versión anotada si existe, si no la original con rotación aplicada. El PDF se guarda como informe.pdf en la carpeta de la sesión.

---

## Configuración Tauri

### tauri.conf.json — Resumen

**Identificación**: productName "OtoReport", version "1.0.0", identifier "cl.otoreport.app".

**Build**: frontendDist ../dist, devUrl http://localhost:5173.

**Ventana principal**: 1280x800 px, mínimo 1024x700, redimensionable.

**Bundle Linux**: deb (libwebkit2gtk-4.1-0, libssl3), rpm (webkit2gtk4.1, openssl), AppImage.

**Bundle Windows**: NSIS, installMode "currentUser".

**Bundle macOS**: NSCameraUsageDescription en infoPlist.

### Capabilities

Permisos: core:default, dialog (allow-save, allow-open), fs (allow-write, allow-read, allow-mkdir, allow-remove, allow-rename, allow-exists). Scope abierto para leer/escribir en la carpeta de trabajo seleccionada por el usuario.

No se necesita plugin de SQL (no hay base de datos).

---

## Scripts de Build

### build-linux.sh

Acepta argumento: all (default), appimage, deb, o rpm. Verifica Rust, Node, npm. Ejecuta npm ci. Luego npx tauri build --bundles {target}. Muestra ruta y tamaño de los generados.

### setup-dev.sh

Detecta distro Linux (apt/dnf/pacman). Instala: build-essential, libwebkit2gtk-4.1-dev, libssl-dev, libayatana-appindicator3-dev, librsvg2-dev, patchelf. Instala Rust, Node 22 LTS, Tauri CLI. npm install.

### build-dev.sh

Ejecuta npx tauri dev.

---

## GitHub Actions

### build-windows.yml

Tags v* o dispatch manual. windows-latest. Node 22 + Rust + cache. npm ci. tauri-apps/tauri-action. Publica como GitHub Release draft. Genera .exe NSIS.

### build-linux.yml

Mismo gatillo. ubuntu-22.04. Instala dependencias de sistema. Genera AppImage y .deb.

---

## Dependencias

### Frontend

**Producción**: @react-pdf/renderer, @tauri-apps/api, @tauri-apps/plugin-dialog, @tauri-apps/plugin-fs, lucide-react, react 19, react-dom, react-hook-form, react-router-dom 7, zod, @hookform/resolvers.

**Desarrollo**: @tauri-apps/cli, @types/react, @types/react-dom, @vitejs/plugin-react, autoprefixer, postcss, tailwindcss 4, typescript 5, vite 6.

### Backend Rust

tauri 2, tauri-plugin-dialog 2, tauri-plugin-fs 2, serde 1 (derive), serde_json 1, image 0.25 (jpeg + png), uuid 1 (v4).

No se usa tauri-plugin-sql.

---

## Flujo de Uso Principal

```
1. Primer inicio → Elegir carpeta de trabajo

2. Crear/buscar paciente → RUT, nombre, edad

3. Nuevo informe (nueva sesión)
   ├─ Esquema visual: click cuadrante → hallazgo
   ├─ Imágenes por oído:
   │   ├─ Cargar imagen → diálogo nativo
   │   └─ Tomar foto → fullscreen:
   │       ├─ Elegir dispositivo de video
   │       ├─ Stream en vivo
   │       ├─ Capturar (Espacio)
   │       └─ Listo → galería
   ├─ Rotar imágenes (pivote central)
   ├─ Anotar imágenes (canvas con símbolos)
   ├─ Checklist: marcar hallazgos
   ├─ Observaciones por oído
   └─ Conclusión

4. Guardar → JSON + archivos en carpeta de sesión

5. Exportar PDF → se guarda en la misma carpeta

6. Historial → ver sesiones anteriores con fotos
```

---

## Convenciones

- Archivos: PascalCase.tsx componentes, camelCase.ts utilidades
- Commits: Conventional Commits (feat:, fix:, docs:, chore:)
- Branching: main, dev, feature/*
- Idioma del código: variables en inglés, interfaz en español
- Formateo: Prettier + ESLint

---

## Notas Técnicas

**Almacenamiento**: Todo en filesystem. JSON para datos estructurados, archivos para imágenes y PDFs. La carpeta de trabajo es completamente autónoma y portable. No hay base de datos.

**Acceso a cámara**: API estándar navigator.mediaDevices del WebView. No necesita plugin Tauri. Un getUserMedia() inicial para permisos, luego enumerateDevices() retorna labels. Se captura a JPEG 92% a la mayor resolución disponible.

**Rotación de imágenes**: Se aplica con CSS transform en la interfaz y con el crate image de Rust al generar thumbnails y exportar PDF. Rotación libre (0-359°) con pivote central.

**Canvas de anotación**: Canvas HTML5 sobre la imagen rotada. Los símbolos se renderizan como SVG sobre el canvas. Las posiciones se guardan como proporciones (0-1) para independencia de resolución. Al guardar se exporta como PNG compuesto.

**Esquemas SVG**: SVG inline en React. Interactivos, escalables. Solo se rasterizan para PDF.

**Exportación PDF**: @react-pdf/renderer. Esquemas como componentes Svg. Fotos como Image (la versión anotada si existe, si no la original rotada).

---

## Licencia

Por definir. MIT si será código abierto, o propietaria si es para uso institucional.