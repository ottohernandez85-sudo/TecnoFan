# LULA — E-commerce Tecnofan

Monorepo: **React + Vite** (`apps/web`), **Node + Express + Prisma** (`apps/api`), **PostgreSQL**.

## Requisitos

- Node.js 20+
- PostgreSQL local, usuario `postgres`, contraseña `root`
- Base de datos `lula_ecommerce` (se crea con Prisma migrate o manualmente)

## Configuración de la base de datos

```bash
# Opción A: dejar que Prisma cree la DB (si tu Postgres lo permite)
createdb -h localhost -U postgres lula_ecommerce
# contraseña: root

# Opción B: crear desde psql
# CREATE DATABASE lula_ecommerce;
```

Copia variables de entorno del API:

```bash
cp apps/api/.env.example apps/api/.env
# Ajusta DATABASE_URL si tu host/puerto difieren
```

Migraciones y seed:

```bash
cd /Users/ottohernandez/Desktop/LULA
npm install
npm run db:migrate -w @lula/api
npm run db:seed -w @lula/api
```

**Usuario administrador (seed):** `admin@lula.dev` / `admin123`

## Desarrollo

En una terminal (levanta API :4000 y web :5173):

```bash
npm run dev
```

- Tienda: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:4000/api/health](http://localhost:4000/api/health)

El front usa `VITE_API_URL=/api` y el **proxy de Vite** reenvía `/api` y `/uploads` al backend.

## Funcionalidades

- Registro / login (JWT), roles `USER` y `ADMIN`
- Catálogo, detalle de producto, carrito (localStorage), checkout simulado (crea orden en Postgres)
- Admin: productos, categorías, usuarios (cambio de rol), **tema** (colores CSS variables, logo, nombre de marca, ítems de menú, plantilla de cards: standard / compact / detailed)

## Estructura

- `apps/api` — Express, Prisma, uploads en `apps/api/uploads` (equivalente a “backend” en despliegue)
- `apps/web` — Vite, React Router, CSS Modules por componente (equivalente a “frontend”)

En **Vercel** y **Render** configura la carpeta raíz del servicio como `apps/web` y `apps/api` respectivamente (no hace falta renombrar a `/frontend` y `/backend`).

### GitHub [TecnoFan](https://github.com/ottohernandez85-sudo/TecnoFan)

Este código puede publicarse en ese remoto. Ramas útiles:

| Rama | Contenido | Uso típico |
|------|-----------|------------|
| **main** | Monorepo completo (`apps/web`, `apps/api`, `package.json` raíz) | Desarrollo local; despliegue con Root Directory `apps/web` / `apps/api` |
| **frontend** | Solo la app Vite (contenido de `apps/web` en la **raíz**) | Vercel: rama `frontend`, raíz `.`, build `npm run build`, output `dist` |
| **backend** | Solo el API (contenido de `apps/api` en la **raíz**) | Render: rama `backend`, build `npm install && npm run db:deploy`, start `npm start` |
| **database** | Solo `schema.prisma`, `migrations/`, `seed.js` (carpeta `prisma` en la **raíz**) | Referencia de SQL / migraciones; Supabase sigue siendo configuración + `DATABASE_URL` en Render |

Tras `git push`, Vercel y Render redeployan si tienes **auto deploy** activado en esa rama. La base de datos en Supabase no se actualiza sola: las migraciones las ejecuta el build de Render o `npm run db:deploy` en local contra la URI de Supabase.

**Push con PAT sin subir el token:** copia `.github-push.env.example` a `.github-push.env`, pega tu `GITHUB_TOKEN` solo en `.github-push.env` (nunca en el `.example`) y ejecuta `./scripts/push-tecnofan.sh`.

## Despliegue (Supabase + Render + Vercel)

Orden recomendado: **Supabase → Render (API) → Vercel (web)**.

### Supabase (PostgreSQL)

1. Crea un proyecto en [Supabase](https://supabase.com/dashboard).
2. Ve a **Settings → Database** y copia la **Connection string** (URI), sustituyendo la contraseña.
3. Si Prisma falla al conectar, prueba a añadir `?sslmode=require` (o los parámetros que indique Supabase) al final de la URI.
4. Con esa `DATABASE_URL`, aplica migraciones desde tu máquina (una vez):

   ```bash
   cd /ruta/al/repo
   export DATABASE_URL="postgresql://..."   # la URI de Supabase
   npm install
   npm run db:deploy -w @lula/api
   ```

   También puedes ejecutar `npm run db:deploy` en el **build** de Render (ver abajo).

5. **Seed (opcional):** con la misma `DATABASE_URL`, `npm run db:seed -w @lula/api` para datos iniciales (revisa credenciales en `prisma/seed.js` / documentación del proyecto).

### Render (API Express)

1. **New → Web Service**, conecta el mismo repositorio que en Vercel.
2. **Root Directory:** `apps/api`
3. **Build command:** `npm install && npm run db:deploy`
4. **Start command:** `npm start`
5. **Variables de entorno:**

   | Variable        | Descripción |
   |----------------|-------------|
   | `DATABASE_URL` | URI de Supabase |
   | `JWT_SECRET`   | Cadena larga y aleatoria |
   | `CLIENT_URL`   | URL del front en Vercel (ej. `https://tu-app.vercel.app`), sin barra final |
   | `CLIENT_URLS`  | (Opcional) más orígenes separados por coma, p. ej. previews de Vercel |
   | `UPLOAD_DIR`   | `uploads` |
   | `NODE_ENV`     | `production` |

   `PORT` la define Render automáticamente.

6. Tras el deploy, comprueba `https://<tu-servicio>.onrender.com/api/health`.

**Free tier:** el servicio puede “dormirse”; la primera petición tras inactividad tarda más (cold start).

**Archivos subidos (logos, imágenes de productos, hero):** en Render el disco del contenedor es **efímero**. Las rutas bajo `uploads/` pueden perderse al redeploy o en reinicios. Para persistencia real conviene **Supabase Storage** (u otro almacenamiento de objetos); no está incluido en este flujo mínimo.

### Vercel (React + Vite)

1. **Add New Project** e importa el repositorio.
2. **Root Directory:** `apps/web`
3. **Build command:** `npm run build`
4. **Output directory:** `dist`
5. **Environment variables:**

   | Variable         | Valor |
   |------------------|--------|
   | `VITE_API_URL`   | `https://<tu-servicio>.onrender.com/api` (debe terminar en **`/api`**) |

6. Despliega. Las variables `VITE_*` se inyectan en **build time**; si cambias la URL del API, haz un redeploy del front.

**Previews:** cada preview de Vercel tiene su propia URL. Añade esas URLs en `CLIENT_URLS` en Render (separadas por comas) o usa un patrón que cubras con varias entradas, para que CORS no bloquee el preview.

### CORS y secretos

- El API solo acepta peticiones desde navegador si el header `Origin` coincide con `CLIENT_URL` / `CLIENT_URLS` (y en desarrollo, `http://localhost:5173`).
- No pongas `JWT_SECRET` ni `DATABASE_URL` en el frontend; solo `VITE_API_URL` apuntando al API público.

### Checklist final

- [ ] `DATABASE_URL` en Render apunta a Supabase y las migraciones corrieron sin error.
- [ ] `GET …/api/health` responde `{ "ok": true }`.
- [ ] `CLIENT_URL` en Render coincide exactamente con la URL del sitio en Vercel (esquema `https://`, sin `/` final).
- [ ] `VITE_API_URL` en Vercel es `https://<render>.onrender.com/api`.
- [ ] Login y catálogo funcionan desde el dominio de Vercel.
- [ ] Tienes claro que las subidas a disco en Render pueden no persistir (ver arriba).

### Build local (verificación)

```bash
npm install
npm run build -w @lula/web
NODE_ENV=production npm start -w @lula/api   # requiere .env en apps/api
```
