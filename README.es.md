# MBST — Smartphones

[English](README.md) · **Español**

Una tienda de smartphones hecha con Next.js 15 y React 19: recorrer y buscar en el catálogo, configurar un teléfono y guardar un carrito.

- **Listado** (`/`): los 20 primeros teléfonos, búsqueda en tiempo real que muestra todas las coincidencias con su número, y la búsqueda guardada en la URL.
- **Detalle** (`/product/[id]`): foto por color, selectores de almacenamiento y color con el precio actualizándose al elegir, especificaciones y teléfonos similares.
- **Carrito** (`/cart`): una línea por cada teléfono añadido, eliminación, total y estado vacío.

**Demo:** [https://zara.oscarsancho.dev](https://zara.oscarsancho.dev)

| Listado                                                                  | Detalle                                                                      | Carrito                                                     |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------- |
| ![Listado de teléfonos en escritorio](docs/screenshots/list-desktop.png) | ![Detalle de un teléfono en escritorio](docs/screenshots/detail-desktop.png) | ![Carrito en escritorio](docs/screenshots/cart-desktop.png) |
| ![Listado de teléfonos en móvil](docs/screenshots/list-mobile.png)       | ![Detalle de un teléfono en móvil](docs/screenshots/detail-mobile.png)       | ![Carrito en móvil](docs/screenshots/cart-mobile.png)       |

Resultados de búsqueda: [escritorio](docs/screenshots/search-desktop.png), [móvil](docs/screenshots/search-mobile.png).

## Revisarlo en 15 minutos

Cinco archivos, en este orden, enseñan todo el diseño:

1. `[src/app/page.tsx](src/app/page.tsx)`: una página de servidor, el punto de composición que entrega el adaptador real al caso de uso.
2. `[src/core/product/application/get-products.ts](src/core/product/application/get-products.ts)`: un caso de uso, el único sitio que conoce la regla del listado: los 20 primeros teléfonos únicos, o todas las coincidencias únicas de una búsqueda.
3. `[src/services/api-client.ts](src/services/api-client.ts)`: la única puerta a la API, donde viven la key, los errores, la caché y los timeouts.
4. `[src/core/cart/domain/cart-reducer.ts](src/core/cart/domain/cart-reducer.ts)`: las reglas del carrito, funciones puras sin React ni navegador.
5. `[src/components/product-detail/product-detail.tsx](src/components/product-detail/product-detail.tsx)`: una vista montada con piezas probadas.

Después, `[e2e/keyboard.spec.ts](e2e/keyboard.spec.ts)` recorre el viaje completo solo con teclado. La calidad de un vistazo: 42 archivos de tests unitarios y de componentes con una comprobación axe en cada página, 10 specs de Playwright sobre el build de producción contra un catálogo fijo (auditoría WCAG 2.2 AA en tres anchos, recorrido con teclado, consola limpia), un spec de contrato contra la API real, y CI en cada pull request.

## Más allá del enunciado, y por qué

Estas piezas cuestan tiempo de lectura, así que cada una está a propósito:

- **Arquitectura hexagonal**: las reglas del catálogo y del carrito se prueban sin Next, y una API nueva o un carrito en servidor son un adaptador más. Ver [Arquitectura](#arquitectura).
- **El carrito guardado se comprueba contra el catálogo**: un carrito puede pasar días en `localStorage` mientras los precios y el stock cambian en una API externa. Ver [Estado](#estado).
- **Fotos de producto normalizadas**: las fotos de la API son irregulares (fondos blancos, el teléfono ocupando entre el 60 % y el 100 % del encuadre); `/api/images` las lleva al encuadre de Figma. Ver [Rendimiento](#rendimiento).
- **Movimiento del prototipo de Figma**: sus springs y estados de carga, sin bloquear nunca la interacción y desactivados con `prefers-reduced-motion`. Ver [UI y movimiento](#ui-y-movimiento).
- **Node 18 de principio a fin**: el enunciado pide Node 18, así que todas las herramientas y el servidor de producción lo usan. Ver [Datos y API](#datos-y-api).

## Cobertura del enunciado

Cómo se cumple cada punto del enunciado.

| Enunciado                                                                                  | Dónde                                                                                                                          |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Rejilla con los 20 primeros teléfonos: imagen, nombre, marca y precio base                 | `ProductGrid`, `ProductCard`, caso de uso `src/core/product/application/get-products.ts`                                       |
| Búsqueda en tiempo real por nombre o marca, filtrada por la API                            | `ProductSearch` → `/api/products`                                                                                              |
| Número de resultados junto a la búsqueda                                                   | `ResultsCount` (`aria-live`)                                                                                                   |
| Navbar con enlace al inicio y el contador del carrito                                      | `Navbar`, `CartLink`                                                                                                           |
| Carrito persistente (`localStorage`)                                                       | `src/core/cart/infrastructure/local-storage-cart-repository.ts`                                                                |
| Pulsar un teléfono abre su detalle                                                         | Enlace de `ProductCard` a `/product/[id]`                                                                                      |
| Detalle: nombre, marca e imagen grande que cambia con el color                             | `ProductDetail` (nombre en el título, imagen por color), `ProductSpecs` (marca en la tabla de especificaciones, como en Figma) |
| Selectores de almacenamiento y color con precio en tiempo real; precio base y variaciones  | `StorageSelector`, `ColorSelector`, `ProductDetail`                                                                            |
| Especificaciones detalladas                                                                | `ProductSpecs`                                                                                                                 |
| "Añadir" activo solo cuando se han elegido almacenamiento y color                          | `ProductDetail`                                                                                                                |
| Productos similares al final                                                               | `SimilarProducts`                                                                                                              |
| Carrito: imagen, nombre, almacenamiento y color, precio; eliminar; total; seguir comprando | `Cart`, `CartItem`                                                                                                             |
| Responsive y fiel a Figma, Helvetica, Arial, sans-serif                                    | `src/styles/variables.css` y el CSS de cada componente                                                                         |
| Modos de desarrollo (sin minificar) y producción (concatenado y minificado)                | `pnpm dev`, `pnpm build && pnpm start`                                                                                         |
| React ≥ 17, CSS, Node 18, Context API, `x-api-key`                                         | React 19.1, CSS plano, Node 18.20.8, `CartContext`, `src/services/api-client.ts`                                               |
| Tests, accesibilidad, linters y formateadores, consola limpia                              | [Calidad](#calidad), [Accesibilidad](#accesibilidad)                                                                           |
| Opcional: SSR con Next.js y variables CSS                                                  | Server components en el listado y el detalle; tokens en `variables.css`                                                        |
| Opcional: despliegue                                                                       | VPS propio con Node 18: [https://zara.oscarsancho.dev](https://zara.oscarsancho.dev)                                           |

## Puesta en marcha

Requisitos: **Node 18.20.8** (`.nvmrc`) y **pnpm 10.34.6**.

```bash
nvm use
corepack enable                  # una vez por instalación de Node: proporciona el pnpm fijado
pnpm install --frozen-lockfile
cp .env.example .env.local       # después, rellena API_KEY
```

Cómo se imponen las versiones

pnpm 10.34.6 es la última versión mayor de pnpm que funciona con Node 18. `package.json` fija pnpm en `packageManager`, así que Corepack (incluido en Node) proporciona esa versión exacta sin instalar nada global. También declara `"engines": { "node": ">=18.18.0 <19" }`, y `.npmrc` activa `engine-strict=true`, así que la instalación falla con otra versión mayor de Node.

pnpm 10 no ejecuta los scripts de instalación de las dependencias salvo que se permitan: `pnpm.onlyBuiltDependencies` incluye los tres que preparan binarios nativos (`esbuild`, `sharp`, `unrs-resolver`).

| Variable       | Para qué sirve                                                                                 |
| -------------- | ---------------------------------------------------------------------------------------------- |
| `API_BASE_URL` | URL base de la API de productos, ya definida en `.env.example`.                                |
| `API_KEY`      | Se envía en la cabecera `x-api-key`. Solo en el servidor: nunca con el prefijo `NEXT_PUBLIC_`. |
| `SITE_URL`     | Dirección pública del sitio desplegado, definida antes de `pnpm build`. Vacía en local.        |

## Desarrollo y producción

```bash
pnpm dev                  # desarrollo: recursos sin minificar, fast refresh
pnpm build && pnpm start  # producción: recursos concatenados y minificados en el puerto 3000
```

## Scripts

| Script                         | Qué hace                                                                               |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| `pnpm dev`                     | Servidor de desarrollo.                                                                |
| `pnpm build`                   | Build de producción.                                                                   |
| `pnpm start`                   | Sirve el build de producción.                                                          |
| `pnpm lint`                    | ESLint (Next core web vitals, TypeScript, compatibilidad con Prettier).                |
| `pnpm typecheck`               | `tsc --noEmit`.                                                                        |
| `pnpm format` / `format:check` | Prettier, escribiendo o solo comprobando.                                              |
| `pnpm test`                    | Tests unitarios y de componentes con Vitest.                                           |
| `pnpm test:coverage`           | Lo mismo con cobertura V8 en `coverage/`.                                              |
| `pnpm test:e2e`                | Tests end-to-end de Playwright sobre el build de producción (ver [Calidad](#calidad)). |
| `pnpm test:e2e:contract`       | Los specs de Playwright que comprueban la app contra la API real.                      |

## Arquitectura

Hexagonal: las reglas de negocio no saben nada de Next, de la API ni del navegador; cada mundo exterior se conecta a través de un puerto.

El catálogo y el carrito cambian por motivos distintos que el framework, así que cada parte puede evolucionar por su cuenta: el navegador ya accede al catálogo con un segundo adaptador (`http-product-repository`), un carrito en servidor u otra API serían un adaptador más, y tanto los casos de uso como la capa de React se prueban con dobles simples que reciben como argumentos o props, no con rutas de módulos mockeadas.

La regla de dependencias la comprueba ESLint (`import/no-restricted-paths`), así que un import indebido hace fallar `pnpm lint`: el dominio solo importa del dominio, los casos de uso solo del dominio, los adaptadores solo del core y de `services`, y ningún componente, hook o contexto importa un adaptador.

```
src/
  app/                  rutas y puntos de composición: el único código que nombra un adaptador
    providers.tsx       el punto de composición del navegador: entrega al carrito su almacenamiento y su catálogo
    api/products        Route Handler de la búsqueda en el navegador
    api/products/[id]   un teléfono para la comprobación del carrito, sin que la key salga del servidor
    api/images          proxy de imágenes que normaliza las fotos de producto
  core/
    product/
      domain/           tipos de Product, el puerto ProductRepository (teléfonos válidos, cada id una vez), la regla del precio "From"
      application/      get-products: los 20 primeros teléfonos, o todas las coincidencias de una búsqueda
      infrastructure/   api-product-repository: llama a la API, valida, quita los ids repetidos y construye las URLs de imagen;
                        http-product-repository: la entrada del navegador, a través de nuestro Route Handler
    cart/
      domain/           líneas del carrito, total, reducer, los cambios que puede traer la comprobación, puerto CartRepository
      application/      revalidate-cart: comprueba las líneas guardadas contra el catálogo
      infrastructure/   local-storage-cart-repository
  services/             clientes técnicos que no implementan ningún puerto: cliente y errores de la API, configuración del servidor, normalización de imágenes
  lib/                  helpers puros y hooks de UI para la parte de React; el core nunca lo importa
  context/cart/         contexto de React que conecta el carrito con los repositorios que recibe por props
  components/           una carpeta en kebab-case por componente: component.tsx, .css, __tests__/
  styles/               variables.css (tokens de diseño) y globals.css
e2e/                    specs de Playwright, la API falsa y su catálogo fijo (fixtures/), y los
                        specs contra la API real (contract/)
```

Los tests viven en `__tests__/`, junto al código que cubren, y los fixtures compartidos en `__mocks__/`. Los casos de uso, los componentes y el contexto del carrito se prueban con repositorios en memoria; los adaptadores, con un cliente de API o un `fetch` simulados; y el punto de composición del navegador, con el `localStorage` real.

Solo el servidor habla con la API:

1. Las páginas de listado y detalle son server components que tienen `apiProductRepository`: el listado ejecuta con él el caso de uso `get-products`, y el detalle, que no tiene regla propia, le pide el teléfono. El carrito vive en el navegador y no necesita llamar a la API para mostrarse.
2. El repositorio valida los datos de la API, quita los ids repetidos y apunta las imágenes a nuestro dominio; solo hay caso de uso donde hay una regla de negocio.
3. `apiClient` (`import 'server-only'`) es el único sitio que conoce la URL y la key de la API. Traduce un 404 a "no encontrado" y fija la caché y los timeouts.
4. En el navegador, la búsqueda llama a nuestro Route Handler `/api/products`, que ejecuta el mismo caso de uso.
5. Las fotos de producto se cargan desde `/api/images/[file]`, que pide el original al host de la API y lo normaliza.

## Decisiones

### Datos y API

- **La key de la API nunca llega al navegador.** Las páginas piden los datos en el servidor y la búsqueda pasa por `/api/products`.
- **Node 18 de principio a fin**, también en producción: la app corre en un VPS propio porque Vercel ya no ofrece Node 18. Las herramientas se mantienen en versiones mayores compatibles con Node 18, con versiones exactas donde importa (Next 15.5.27, Playwright 1.61.1, vitest-axe 0.1.0).
- **Respuestas validadas.** Los type guards comprueban los datos en la frontera: un teléfono mal formado se queda fuera del listado, y un producto mal formado muestra la página de error en lugar de un falso "no encontrado". Una especificación que la API no envía no es un dato mal formado: el teléfono se abre, y la tabla de especificaciones y la meta descripción la omiten.
- **Una sola llamada a la API por página de producto.** La página y sus metadatos comparten la petición con `cache()` de React, así que una API lenta o caída se espera una sola vez.
- **Los precios siguen el enunciado.** Pide el "precio base" en cada tarjeta, y el "precio base y variaciones según almacenamiento" en el detalle. Las tarjetas muestran `basePrice`, que es lo que devuelve el endpoint del listado. El detalle empieza con "From" y el precio del almacenamiento más barato, como en Figma, y después muestra el precio del almacenamiento elegido. Pueden no coincidir: el `basePrice` de la API no siempre es el almacenamiento más barato (Galaxy S24 Ultra: 1329 EUR en la tarjeta, desde 1229 EUR en el detalle). Igualarlos costaría una petición de detalle por tarjeta, así que cada vista muestra el precio que da su endpoint.

### Estado

- **Carrito con Context y** `useReducer`**.** Cuatro acciones (añadir, eliminar, restaurar y aplicar la comprobación del catálogo) no necesitan ninguna librería.
- **Una línea por cada "Añadir"**, porque Figma no tiene control de cantidad. Un id aleatorio de `crypto.getRandomValues()`, que también funciona por HTTP sin cifrar, permite que "Eliminar" quite exactamente esa línea.
- **El carrito guardado se lee después del montaje y se valida**, para que el servidor y el primer render del cliente coincidan y se ignoren datos editados o antiguos. El total se suma en céntimos.
- **Sin contador del carrito antes de leer el carrito guardado.** Hasta entonces la cantidad es desconocida, así que el header no muestra la bolsa en lugar de un "0" que sería falso para un carrito con productos, un estado que Figma nunca dibuja. El HTML del servidor tampoco lleva contador.
- **Un solo carrito entre pestañas.** Cada cambio se aplica al carrito tal como está guardado en ese momento, no a la copia que una pestaña leyó antes, así que dos pestañas nunca se pisan; las pestañas abiertas siguen al carrito guardado, también cuando una página vuelve de la caché de atrás/adelante. Solo dos escrituras separadas por menos de un milisegundo podrían chocar. Si el navegador bloquea el almacenamiento, el carrito vive en memoria durante la visita.
- **El carrito guardado se comprueba contra el catálogo al abrirlo.** Puede llevar días en `localStorage`, mientras que el catálogo pertenece a una API externa que cambia por su cuenta; así, un teléfono que ya no se vende o un precio nuevo se ven antes de pagar, no después. Cada teléfono se pide una sola vez a `/api/products/[id]`, que lee el catálogo sin pasar por la caché de una hora y envía su respuesta con `no-store`, así que la comprobación ve el precio de hoy: una línea cuyo teléfono, almacenamiento o color ya no se vende se quita, una línea cuyo almacenamiento ha cambiado de precio recibe el actual, y un mensaje breve lo cuenta. Un teléfono que no se puede comprobar (error de red, API caída) se deja como está, así que una petición fallida nunca vacía un carrito. Los cambios se aplican por línea, así que una línea eliminada mientras tanto sigue eliminada.
- **Un teléfono que ya no está en el catálogo responde** `null`**, no 404**, desde `/api/products/[id]`: para el carrito es una respuesta esperada, y un 404 escribiría un error en la consola del navegador.
- **El almacenamiento, el color y la búsqueda viven en la URL**, así que un teléfono configurado o una búsqueda se pueden compartir. `replaceState` evita que Atrás deshaga cada elección.
- **La búsqueda se reintenta sin UI nueva.** Un error de red o un 5xx se reintenta una vez; pulsar Enter repite una búsqueda fallida. Figma no tiene botón de reintentar.

### UI y movimiento

- **CSS plano, BEM y tokens.** Cada valor visual vive una sola vez en `src/styles/variables.css`; los breakpoints sobrescriben el token, no cada componente.
- **Movimiento sacado del prototipo.** Sus springs se convierten en easings CSS `linear()` y tokens de duración, y se ejecutan con transiciones CSS y la Web Animations API sobre el DOM real. Nunca bloquean un clic, un hover ni una tecla, y `prefers-reduced-motion` las desactiva.
- **Similares**: una lista con scroll nativo que se extiende hasta el borde derecho de la ventana, como el carrusel de Figma. Con el ratón se puede arrastrar la lista o su barra decorativa, como en el prototipo; en táctil se mantiene el scroll nativo.
- **"Añadir" abre el carrito**, que aparece con un fundido con el spring "Slow" del prototipo.

Puntos ambiguos de Figma, y cómo se resolvió cada uno

- Las medidas salen de la página Design; la página Proto se usa para el comportamiento y el movimiento. Algunos frames de Proto están desplazados unos píxeles respecto a Design (el buscador a 51 px del header en lugar de 60; "Specifications" a 140 px del botón de añadir en lugar de 154): se usan los valores de Design.
- Los colores de las muestras y sus nombres vienen de la API (`hexCode`, `name`). Los frames de Figma usan colores de ejemplo y nombres de ejemplo en español ("Violeta Titanium") que no corresponden a ningún producto.
- Un carrito con varios teléfonos los apila en móvil y tablet, y usa columnas de 548 px (el cart item de Figma) en escritorio.
- La bolsa del header se oculta en la página del carrito, salvo en tablet, donde los frames la muestran con o sin productos (bolsa vacía y "0" cuando el carrito está vacío).
- "Continue shopping" lleva al listado completo, como en el prototipo.
- Primera carga: el prototipo pasa de "Unloaded" (solo el header) a "Loading" (la barra negra crece hasta el ancho completo) y después muestra el listado, con retardos fijos que simulan la red. La app conserva los estados y los springs, pero no los retardos, porque la espera real la pone la red: en una carga de página del listado, el header aparece con la barra de carga llenándose debajo (un solo elemento en el layout, así que nunca vuelve a empezar) mientras el servidor prepara el listado, y en cuanto el listado está en la página entra con el spring de entrada mientras la barra se desvanece con él. Con el catálogo en caché el listado llega unas decenas de milisegundos después del header, así que la barra apenas ha empezado cuando se desvanece; un listado que llega con el primer pintado no muestra barra alguna. Es una desviación deliberada del timing del prototipo: reproducir su pausa de 300 ms y el llenado completo de la barra mantendría oculto entre 0,7 s y 0,9 s un listado que ya ha llegado. Volver al listado navegando dentro de la app lo muestra al instante.
- El prototipo hace un fundido cruzado directamente de una tarjeta al detalle. La app muestra la barra de carga solo mientras llega el producto y después el detalle entra con el spring del prototipo.

### Rendimiento

- **Fotos de producto normalizadas.** Las fotos de la API son irregulares: algunas tienen el fondo blanco opaco y el teléfono ocupa entre el 60 % y el 100 % del encuadre. Lo correcto sería que el backend las entregara ya estandarizadas; hasta entonces, `/api/images` las normaliza con sharp al encuadre de Figma (fondo transparente, teléfono al 73,2 % de un cuadrado).
- **Cada foto se descarga al tamaño que necesita su hueco.** `/api/images` redimensiona al normalizar, a uno de cinco anchos (360, 520, 648, 832 y 1260 px; el mayor es el detalle de escritorio, 630 px, a 2x); las fotos originales pequeñas nunca se amplían. `next/image` los pide con un loader propio y cada foto declara en `sizes` su tamaño en pantalla, así que el navegador elige la más pequeña que se ve nítida. `sizes` no puede leer propiedades personalizadas de CSS, así que los cuatro valores viven en `src/lib/product-image-sizes.ts` y un test los recalcula a partir de los tokens: cambiar el tamaño de una tarjeta o de una foto sin ellos hace fallar el test. Las 20 fotos del listado pasan de 1,16 MB a 203 kB a 1440 px en una pantalla 2x, y a 330 kB en un móvil 2x.
- **Las imágenes normalizadas se guardan en memoria, una por ancho,** y se sirven como `immutable`, porque sus URLs llevan versión. Cualquier otro ancho se rechaza, así que la caché queda acotada por el catálogo (menos de 8 MB).
- **El catálogo se cachea una hora; las búsquedas y la comprobación del carrito no.** Cada término de búsqueda sería una entrada nueva de caché en disco, y la comprobación del carrito tiene que ver un precio que cambió en la última hora. La lectura cacheada y la lectura en vivo son dos instancias del mismo adaptador, elegidas donde se conecta cada ruta.
- **Sin prefetch en el enlace del carrito.** El prefetch de `/cart` precargaba su hoja de estilos en todas las páginas, y Chrome lo marcaba como precarga sin usar.

## Peculiaridades de la API

| Problema                                                                                  | Cómo se resuelve                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ids repetidos en el listado y en los similares                                            | Se piden 40 (la API tiene 24) y se quitan los duplicados; solo el listado sin búsqueda se recorta a 20.                                                                                                       |
| Imágenes servidas por `http` e irregulares                                                | Pasan por `/api/images` en nuestro dominio, que las normaliza.                                                                                                                                                |
| `basePrice` distinto de los precios por almacenamiento                                    | Las tarjetas muestran `basePrice` y el detalle los precios por almacenamiento; ver [Datos y API](#datos-y-api).                                                                                               |
| Un id desconocido responde 404 `NOT-FOUND`                                                | `apiClient` lanza `NotFoundError` y la página llama a `notFound()`.                                                                                                                                           |
| Plan gratuito de Render: la primera petición puede tardar casi un minuto                  | Timeout de 60 s en las cargas de página; la búsqueda da 4 s a la API y se reintenta una vez, así que falla en segundos; los estados de carga del prototipo y un calentamiento antes de los specs de contrato. |
| Un producto sin alguna de sus especificaciones (el iPhone 13 no trae `screenRefreshRate`) | Todas las especificaciones son opcionales: el teléfono se abre, y la tabla de especificaciones y la meta descripción la omiten.                                                                               |
| Respuestas que no tienen la forma documentada                                             | Los type guards descartan los elementos no válidos y convierten un producto no válido en un error.                                                                                                            |

## Calidad

- **Tests unitarios y de componentes** (Vitest, Testing Library), con nombres que describen lo que vive el usuario.
- **Comprobaciones de accesibilidad** con vitest-axe en todas las páginas. jsdom no carga CSS, así que el contraste lo comprueba la auditoría axe end-to-end.
- **Tests end-to-end** (Playwright, solo Chromium) sobre el build de producción, contra una API falsa con un catálogo fijo (`e2e/fake-api.mjs`), así que una ejecución nunca depende de la red y da siempre el mismo resultado. El catálogo es una grabación del real (`e2e/fixtures/catalog.json`): 24 entradas con un id repetido, una búsqueda que encuentra más de 20 teléfonos, un teléfono al que le falta una especificación y precios de almacenamiento por debajo de `basePrice`. La API falsa dibuja las fotos, con el fondo blanco opaco incluido, así que el normalizador de imágenes hace su trabajo real:
  - catálogo y búsqueda, detalle y añadir al carrito, y el carrito;
  - el carrito compartido entre dos pestañas, antes y después de recargar;
  - un header que nunca muestra un contador distinto del guardado, y ninguno sin JavaScript;
  - una auditoría axe (WCAG 2.2 AA y buenas prácticas, contraste incluido) de ocho pantallas a 393, 834 y 1920 px;
  - el recorrido completo solo con teclado, desde la búsqueda hasta quitar el teléfono del carrito;
  - la comprobación del carrito contra el catálogo, con consola limpia;
  - una comprobación que falla ante cualquier aviso o error en consola, o cualquier precarga de estilos sin usar, en el listado, un producto, el carrito y un 404;
  - un teléfono para el que la API falsa está caída, que demuestra que una página de producto pide la API una sola vez, y otro cuyo precio cambia en cada petición, que demuestra que la comprobación del carrito lee el catálogo en vivo.
  - La primera vez: `pnpm exec playwright install chromium`. Los puertos 3151 y 3199 tienen que estar libres; no hace falta `.env.local`.
- **Specs de contrato** (`pnpm test:e2e:contract`) sobre el build de producción contra la API real, sin ningún teléfono, precio o recuento escrito en ellos: todos los teléfonos del catálogo abren su detalle con su foto (los 20 del listado y los que solo enlaza "Similar items", así que un producto que la app no sabe mostrar falla aquí), una búsqueda por marca encuentra teléfonos de esa marca y un id desconocido muestra la página de no encontrado. Necesitan `.env.local` y el puerto 3150, y despiertan la API antes de empezar.
- **Pre-commit**: Husky ejecuta lint-staged (ESLint y Prettier sobre los archivos preparados).
- **CI** (GitHub Actions, cada acción fijada a un SHA de commit): comprobación de formato, lint, typecheck, tests con cobertura, build y SonarCloud; después, dos jobs independientes que suben el informe de Playwright si fallan: la suite end-to-end, sin secretos, y los specs de contrato, con los secretos de la API. Una API lenta o que haya cambiado solo puede hacer fallar el segundo.
- **Flujo de Git**: una rama por cambio, Conventional Commits, y cada cambio fusionado mediante una [pull request](https://github.com/osancho/prueba-tecnica/pulls?q=is%3Apr) cuando pasa la CI.

## Accesibilidad

- El almacenamiento y el color son grupos de radios nativos dentro de un `fieldset` con `legend`: listos para teclado y anunciados como grupo.
- El número de resultados es una región `aria-live`; el enlace del carrito se lee "3 products in the cart".
- Después de "Eliminar", el foco pasa al título del carrito, que lee la nueva cantidad.
- Los textos en español de Figma ("Añadir", "Eliminar") llevan `lang="es"` dentro de una página en inglés.
- Las fotos de las tarjetas mantienen un `alt` descriptivo por si no cargan; el enlace de la tarjeta toma su nombre solo del texto visible, así que el teléfono se anuncia una vez.
- El aviso de cambios del carrito es una región `role="status"`, presente desde el principio para que se anuncie al rellenarse.
- Los tamaños de letra y los interlineados son los valores en píxeles de Figma escritos en `rem`, así que el texto sigue el tamaño que el lector elige en el navegador; con la configuración por defecto las páginas son idénticas píxel a píxel a la versión en px, y al doble de tamaño nada se corta ni provoca scroll horizontal.
- Dos decisiones deliberadas de Figma: el campo de búsqueda no tiene outline, porque el cursor de texto es su indicador de foco (el frame "Input active"), y el placeholder mantiene el gris del diseño.

## SEO

- El layout raíz define una plantilla de título (`%s | MBST`, por defecto "Smartphones | MBST") y una descripción.
- Cada página de producto construye su título con la marca y el nombre, y su descripción con el precio "From", la pantalla, el procesador y la batería (`generateMetadata`).
- Una búsqueda tiene su propio título ("Results for “galaxy” | MBST"); las páginas de búsqueda y el carrito son `noindex, follow`.
- Un `h1` por página (oculto visualmente en el listado, donde Figma no muestra título), encabezados en orden, `lang="en"`.
- Cada página indexable indica su dirección canónica: un producto compartido con `?storage=` y `?color=` apunta a `/product/[id]`.
- Los enlaces compartidos llevan datos de Open Graph y de Twitter card; un producto añade su foto.
- `robots.txt` deja abiertas las páginas y las fotos y mantiene a los rastreadores fuera del proxy de búsqueda; `sitemap.xml` lista la página del catálogo y todos los teléfonos, leídos de la API en cada petición.
- Las direcciones absolutas salen de `SITE_URL`, definida solo en el servidor desplegado, así que una ejecución local o la CI nunca se atribuyen el dominio público.
- La cabecera `X-Powered-By` está desactivada.

## Limitaciones conocidas

- Un producto que no existe muestra la página "no encontrado" con HTTP 200 y `noindex`: la ruta tiene estado de carga, así que Next ya ha enviado el 200 cuando se ejecuta `notFound()`. Las rutas desconocidas devuelven 404.
- Algunas fotos originales tienen un reflejo opaco en el suelo bajo el teléfono (por ejemplo, el Pixel 8a) que no se puede separar del dispositivo con seguridad. Se deja tal cual; la corrección corresponde a la imagen original.
- La suite end-to-end corre sobre una grabación del catálogo (4 de octubre de 2026) con fotos dibujadas. Un cambio en la API real o en sus fotos solo lo ven los specs de contrato, que dependen de que la API real esté accesible.
- La caché de imágenes normalizadas vive en el proceso del servidor y se vacía al reiniciarlo.
- No hay diseño para los estados de 404, error y búsqueda fallida, ni para el mensaje de cambios del carrito: usan los tokens existentes con estilos mínimos.
- Avisos de seguridad aceptados:
  - 2 moderados en Vitest 3 (GHSA-82fw-gwwq-j7x9): solo en desarrollo; corregidos en Vitest 4.1.11, que requiere Node 20.
  - 2 altos en las libvips y libheif que incluye sharp (GHSA-f88m-g3jw-g9cj, GHSA-rgj7-g3m4-5g8c): la app solo procesa imágenes del host de la API, y sharp 0.35.4, que corrige los dos, necesita Node 20.
