# Despliegue en Neubox (cPanel + MySQL) — El Narrador de México

Esta es la **versión PHP** del sitio, pensada para correr en el hosting
compartido de Neubox (cPanel, PHP, MySQL/MariaDB). Reemplaza por completo a
Supabase: la base de datos pasa a MySQL, el login del panel usa cuentas propias
(sesiones PHP) y las imágenes/PDF se guardan en el disco del hosting.

> El código Next.js original sigue en el repo como referencia. Lo que se sube a
> Neubox es **únicamente el contenido de la carpeta `public_html/`**, más la
> base de datos de `database/`. La carpeta `tools/` se usa solo para la
> migración (no es necesario subirla al sitio público).

---

## 0. Qué vas a subir

| En el repo | En Neubox |
|---|---|
| `public_html/` (todo su contenido) | `public_html/` de tu hosting |
| `database/schema.sql` + `database/data.sql` | se importan en MySQL (phpMyAdmin) |
| `tools/` | solo en tu equipo / temporal, para migrar datos y medios |

Requisitos del plan: **PHP 8.0+** y **MySQL/MariaDB**. (El sitio usa PDO, que
viene activado por defecto en Neubox.)

---

## 1. Generar el volcado COMPLETO de datos (las 556 notas)

`database/data.sql` que viene en el repo trae las tablas pequeñas (categorías,
autores, revistas, usuarios), pero **no las 556 notas** (su contenido pesa
~6.3 MB y no se pudo descargar desde la sesión de Claude). Genera el archivo
completo desde tu equipo, donde Supabase sí es alcanzable:

```bash
# Necesitas PHP en tu equipo (o córrelo en cualquier máquina con internet)
SUPABASE_URL="https://fewwvcrfhdgnpfjyadev.supabase.co" \
SUPABASE_ANON_KEY="<TU_ANON_KEY>"  \
php tools/export-supabase-to-mysql.php
```

Tu **anon key** está en el panel de Supabase → Project Settings → API → `anon`
`public`. El script **regenera `database/data.sql`** ya con TODAS las tablas y
las 556 notas. (Si no puedes correrlo, el sitio igual funciona, pero arrancaría
sin notas hasta que las cargues.)

---

## 2. Crear la base de datos MySQL en cPanel

1. cPanel → **Bases de datos MySQL®**.
2. Crea una base, p. ej. `usuario_narrador`.
3. Crea un usuario MySQL y una contraseña.
4. **Agrega el usuario a la base** con *Todos los privilegios*.
5. Anota: nombre de BD, usuario y contraseña (los pondrás en `config.php`).

---

## 3. Importar el esquema y los datos

1. cPanel → **phpMyAdmin** → selecciona tu base.
2. Pestaña **Importar** → sube `database/schema.sql` → *Continuar*.
3. Otra vez **Importar** → sube `database/data.sql` → *Continuar*.

> Si `data.sql` (con las 556 notas) supera el límite de subida de phpMyAdmin,
> comprímelo a `.zip` (phpMyAdmin acepta zip) o impórtalo con *cPanel →
> Asistente de importación*, o pártelo en dos archivos.

---

## 4. Subir los archivos del sitio

Sube **todo el contenido de `public_html/`** del repo a la carpeta
`public_html/` de tu hosting (por **Administrador de archivos** de cPanel o por
**FTP**). Debe quedar así en el servidor:

```
public_html/
├── index.php, articulo.php, categoria.php, ...
├── .htaccess
├── admin/
├── assets/
├── images/
├── includes/
└── uploads/        (news/  magazines/  con permiso de escritura)
```

Luego:

- Da permisos de **escritura** a `uploads/` y sus subcarpetas (`755` o `775`).
  En el Administrador de archivos: clic derecho → *Permisos* → 755.

---

## 5. Configurar `config.php`

En el servidor, copia `config.example.php` a **`config.php`** (mismo folder
`public_html/`) y edítalo con tus datos reales de MySQL:

```php
'db' => [
    'host' => 'localhost',
    'name' => 'usuario_narrador',   // nombre EXACTO de tu BD
    'user' => 'usuario_narrador',   // usuario MySQL
    'pass' => 'tu_contraseña',
    'charset' => 'utf8mb4',
],
'site_url' => 'https://elnarradordemexico.com',
```

> `config.php` **no** está en el repositorio (lleva credenciales). Créalo
> directamente en el servidor.

---

## 6. Crear la primera contraseña de acceso al panel

Las contraseñas **no se migran** de Supabase Auth: tras importar, todos los
usuarios quedan sin contraseña. Para entrar la primera vez:

**Opción A (recomendada, por web):**
1. Visita `https://tudominio.com/admin/setup.php`.
2. Escribe el correo de un usuario existente (p. ej. `cesaradrianrs660@gmail.com`,
   que es `owner`) y una contraseña nueva.
3. **Borra `admin/setup.php`** del servidor (la página se bloquea sola una vez
   que existe alguna contraseña, pero conviene eliminarla).
4. Entra en `https://tudominio.com/admin/login.php`.

**Opción B (manual, por SQL):**
```bash
php tools/hash-password.php "MiContraseñaSegura"   # te imprime un hash
```
Luego en phpMyAdmin:
```sql
UPDATE admin_users SET password_hash = '<hash>' WHERE email = 'tu@correo.com';
```

Ya dentro, el **propietario** puede dar de alta al resto de usuarios y fijarles
contraseña desde **Admin → Gestión de Usuarios**.

---

## 7. (Importante) Migrar las imágenes y PDFs de Supabase Storage

Muchas notas y las 3 revistas tienen imágenes/PDF alojados en **Supabase
Storage** (`...supabase.co/storage/...`). Esos archivos **dejan de cargar en
cuanto apagues Supabase**. (Las imágenes de `i0.wp.com` sí siguen funcionando.)

Para traerlos a tu hosting, ejecuta **en Neubox** (Terminal de cPanel, o como
tarea cron de una sola vez), con la BD ya importada y `config.php` listo:

```bash
php tools/download-supabase-media.php
```

Descarga todo a `public_html/uploads/migrated/` y actualiza la base para que
apunte ahí. Es seguro re-ejecutarlo. **Haz esto ANTES de apagar Supabase.**

> Si tu plan no tiene Terminal ni acceso a `php` por consola, córrelo desde tu
> equipo apuntando `config.php` temporalmente al host MySQL remoto de Neubox
> (si lo permite tu plan), o pide a soporte de Neubox habilitar acceso SSH.

---

## 8. Verificación final

- `https://tudominio.com/` → portada con notas, ticker y revistas.
- `https://tudominio.com/mexico` → categoría.
- `https://tudominio.com/articulo/<id>` → nota con su contenido.
- `https://tudominio.com/buscar?q=...` → búsqueda.
- `https://tudominio.com/revistas` y una revista con su PDF.
- `https://tudominio.com/sitemap.xml` → XML del sitemap.
- `https://tudominio.com/admin/login.php` → entrar al panel y publicar una nota.

### Las URLs se mantienen iguales
El `.htaccess` conserva las mismas rutas que el sitio anterior
(`/articulo/{id}`, `/{categoria}`, `/revistas/{id}`, `/buscar`), así que **no se
pierde el SEO** ni los enlaces ya indexados en Google.

---

## 9. Notas y mantenimiento

- **AdSense** ya está configurado con el mismo ID (`ca-pub-7008735814072307`) en
  `config.php` y `ads.txt`. Funciona sin pasos extra.
- **Robots/Sitemap**: edita `robots.txt` si cambia el dominio. El sitemap es
  dinámico (`sitemap.php`).
- **Backups**: exporta la BD desde phpMyAdmin periódicamente y respalda
  `public_html/uploads/`.
- **Seguridad**: borra `admin/setup.php` tras el primer uso; `config.php`,
  `includes/` y la ejecución de PHP en `uploads/` ya están bloqueados por
  `.htaccess`.
- El correo `program.desarrollo.web@...` y demás de `admin_users` se importaron
  con su rol; revisa la lista en **Gestión de Usuarios** y elimina los que no
  uses.

---

## Estructura del proyecto PHP

```
public_html/
├── index.php              Portada
├── articulo.php           Detalle de nota (metadata + JSON-LD + vistas)
├── categoria.php          Listado por categoría
├── buscar.php             Búsqueda
├── revistas.php           Listado de revistas
├── revista.php            Detalle de revista (visor PDF)
├── sitemap.php            sitemap.xml dinámico
├── 404.php                Página de error
├── privacidad/terminos/etica/contacto.php
├── .htaccess              Ruteo de URLs + seguridad + caché
├── config.example.php     Plantilla de configuración (copiar a config.php)
├── includes/
│   ├── bootstrap.php       Arranque (config + db + helpers + queries)
│   ├── db.php              Conexión PDO
│   ├── helpers.php         Utilidades (fechas ES, categorías, sanitizado...)
│   ├── queries.php         Capa de datos (equivale a queries.ts)
│   ├── partials.php        Tarjetas, sidebar, share, anuncios
│   ├── header.php / footer.php   Chrome público
├── admin/
│   ├── login.php / logout.php / setup.php
│   ├── index.php           Dashboard
│   ├── notas.php           Lista (destacar / última hora / eliminar)
│   ├── nota-nueva.php      Alta con editor + medidor SEO
│   ├── nota-editar.php     Edición
│   ├── revista-nueva.php   Alta de revista (PDF)
│   ├── usuarios.php        Gestión de usuarios
│   └── includes/           auth.php, uploads.php, chrome del panel
├── assets/css|js           Estilos y JS (marca dorada editorial)
├── images/                 Logos y banners
└── uploads/                Imágenes y PDFs subidos (escritura)

database/
├── schema.sql             Tablas MySQL/MariaDB
└── data.sql               Datos (regenerar con tools/export-... para incluir notas)

tools/
├── export-supabase-to-mysql.php   Genera database/data.sql completo
├── download-supabase-media.php    Migra medios de Supabase Storage al disco
└── hash-password.php              Genera un hash de contraseña
```
