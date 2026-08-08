# VIGÍA
### *"Siempre al día, siempre en operación."*
Control de capacitaciones y certificaciones — **MVP (demo funcional)**

---

## 0. Para quién es este documento

Es la especificación para que **Claude Code** construya el MVP de VIGÍA. Es un **demo comercial**: el objetivo es mostrar un producto funcional para cerrar el negocio con TDCO. **No** es la app de producción — es la vitrina que la vende.

Regla de oro: todo lo **funcional** está definido acá y no debe cambiarse. Todo lo **visual** (paleta exacta, tipografía, componentes, micro-interacciones) queda a criterio de Claude Code y su skill de UX/UI, dentro de la dirección de la sección 13.

---

## 1. Identidad

| Campo | Valor |
|---|---|
| **Nombre** | VIGÍA |
| **Tagline** | "Siempre al día, siempre en operación." |
| **Empresa** | Kairos (DLS Group S.A.S.) |
| **Familia** | Corporativa/sectorial de Kairos, junto a **SEÑAL** y **FLUJO** |
| **Tipo de producto** | SaaS B2B (control de certificaciones para HSE / talento humano) |
| **Piloto / demo dirigido a** | Top Drilling Company (TDCO) — hidrocarburos, Colombia. Área: Gestión Humana › Entrenamiento externo |

> **Importante:** VIGÍA es un producto **de Kairos**, no de TDCO. **No** llevar logo, colores ni encabezado del cliente. La marca visible es VIGÍA/Kairos.

**Concepto del nombre:** en el mundo HSE/petrolero el *vigía* es un rol real (vigía de espacios confinados, vigía de trabajo en caliente). VIGÍA es el que observa para que nadie salga lastimado: vigila cada certificación, avisa antes de que venza y no deja entrar al taladro a quien no está apto.

---

## 2. Qué hace la app

Controla las certificaciones que debe tener cada trabajador **según su cargo**, calcula la vigencia de cada una, avisa antes de que venza (30 y 15 días), marca visualmente las vencidas y levanta la bandera **"No apto para taladro"** cuando a un trabajador operativo le falta o se le venció un requisito de ingreso.

Tiene dos caras:
- **Vista pública** (sin login): dashboard de métricas, tipo vitrina.
- **Panel admin** (con login): parametrización, registro de trabajadores y gestión de certificaciones.

---

## 3. Alcance del MVP (y lo que NO es)

**Sí:**
- 100% **front-end**, sin backend, sin API real, sin base de datos.
- Persistencia con **localStorage** (datos sembrados al iniciar + los cambios del demo sobreviven a un refresh).
- **PWA instalable** (desktop y mobile).
- Responsive.
- Un **admin hardcodeado**.

**No (queda simulado / fuera de alcance — ver sección 16):**
- Sin Cloudinary. Adjuntar certificado = **simulado** (preview/chip en memoria; no sube nada real).
- Sin envío real de notificaciones (nada de email/WhatsApp/cron). Se resuelven **en front**.
- Sin gestión de usuarios ni multi-empresa.
- Sin backend, sin borrado real de archivos.

---

## 4. Stack técnico

- **React 18 + Vite + TypeScript**.
- **react-router-dom** para el ruteo.
- Estado global: Context API o Zustand (a criterio de Claude Code; algo ligero).
- Gráficas: **Recharts**.
- Estilos: a criterio del skill de UX/UI (Tailwind recomendado, no obligatorio).
- Fechas: **date-fns** o dayjs.
- PWA: **vite-plugin-pwa** (manifest + service worker + íconos; instalable; shell offline).
- Nada de dependencias de backend.

---

## 5. Modelo de datos (en memoria / localStorage)

### 5.1 Certificación (catálogo)
| id | nombre | tipo | vigenciaMeses |
|---|---|---|---|
| c1 | Alturas trabajador autorizado | ingreso | 18 |
| c2 | Espacios confinados entrante | ingreso | 36 |
| c3 | Espacios confinados nivel supervisor | ingreso | 36 |
| c4 | Well control combinado | ingreso | 24 |
| c5 | Brigadas integrales | permanencia | 12 |
| c6 | Certificación de winches y manrider | permanencia | 12 |

- `tipo`: **`ingreso`** (requisito antes de entrar al taladro — si falta o se vence en un operativo, **bloquea** — No apto) o **`permanencia`** (formación durante el tiempo en la empresa — **alerta pero no bloquea**).

### 5.2 Cargo (catálogo — aplica a operativos)
| id | nombre | certificaciones requeridas |
|---|---|---|
| g1 | Soldador | c1, c2, c5 |
| g2 | Jefe de equipo | c1, c4, c3, c5, c6 |

### 5.3 Taladro (hardcodeado)
`Rig 2501`, `Rig 3001`, `Rig 3003`.

### 5.4 Trabajador
```
Trabajador {
  id
  nombre
  documento
  tipo: "operativo" | "administrativo"
  cargoId?        // solo operativo
  taladroId?      // solo operativo
  certificaciones: CertTrabajador[]   // vacío en administrativo (MVP)
}

CertTrabajador {
  certId
  fechaInicioVigencia: Date
  archivo: { nombre: string, preview?: string }  // SIMULADO, no sube nada
  // derivados (no se guardan): fechaVencimiento, diasRestantes, estado
}
```

- `fechaVencimiento = fechaInicioVigencia + vigenciaMeses`.
- Una certificación requerida por el cargo que **no** tenga `CertTrabajador` = **faltante**.

### 5.5 Admin (hardcodeado)
- Usuario: `admin@vigia.co` · Clave: `Vigia2026`
- Mostrar estas credenciales como pista en la pantalla de login (es un demo, quien lo presenta no es el desarrollador).

---

## 6. El tiempo (vigencias)

Existe una **"fecha de hoy" simulada** global (por defecto = fecha real del sistema, editable desde la barra de demo, sección 9). **Todos** los cálculos de días restantes y estado usan esa fecha, no la real.

`diasRestantes = fechaVencimiento − hoySimulada`

---

## 7. Estados y semáforo

| Estado | Condición | Color conceptual |
|---|---|---|
| Vigente | diasRestantes > 30 | verde |
| Por vencer | 15 < diasRestantes ≤ 30 | amarillo |
| Crítico | 0 < diasRestantes ≤ 15 | naranja |
| Vencido | diasRestantes ≤ 0 | rojo |
| Faltante | requerida por el cargo pero sin registrar | gris / rojo |

**Bandera "No apto para taladro"** (solo operativos): `true` si el trabajador tiene **alguna certificación de tipo `ingreso`** en estado **vencido** o **faltante**. (Por vencer y crítico **no** vuelven no-apto, solo alertan.) Debe mostrarse de forma muy visible.

(Los HEX exactos los define el skill de UX/UI; lo que importa es que el semáforo sea legible a distancia, tipo tablero.)

---

## 8. Notificaciones (todo en front)

- **Centro de notificaciones:** campana con contador (badge) en el header del admin. Lista, agrupado y con enlace al trabajador: certificaciones **a 30 días**, **a 15 días** y **vencidas**.
- **Pop-up al iniciar sesión:** modal-resumen de lo urgente (por vencer + vencidas) al entrar al panel. Descartable.
- Todo se recalcula con la **fecha simulada**: al mover el tiempo, las notificaciones cambian en vivo.

---

## 9. Barra de demo (visible, etiquetada como "modo demo")

Para que **quien presente** (no es el desarrollador) controle la demo y siempre arranque limpio:
- **Fecha de hoy simulada:** date picker + accesos rápidos `+15 días`, `+30 días`, `+1 mes`, `Volver a hoy`.
- **Restablecer demo:** re-siembra los datos originales y limpia localStorage.

---

## 10. Vistas y rutas

### 10.1 Vista pública — Dashboard (`/`, sin login)
Vitrina de métricas, **inspirada en el dashboard que Kairos hizo para el ICCU** (tarjetas KPI grandes, gráficas limpias, filtros claros), re-tematizada a VIGÍA. Responsive.

**Filtros:** Todos · por Taladro · por Trabajador.

**Global / por taladro muestra:**
- Nº de trabajadores.
- Certificaciones **requeridas** (esperadas).
- Certificaciones **cumplidas** (registradas y vigentes).
- **% de cumplimiento** = cumplidas / requeridas.
- **% de personas certificadas** = trabajadores con el 100% de sus requeridas al día.
- Nº de **"No aptos para taladro"**.
- Próximas a vencer (≤30) y vencidas.
- Gráficas: barras de % de cumplimiento por taladro; dona de distribución de estados (vigente / por vencer / crítico / vencido / faltante).

**Por trabajador (drill-down) muestra:**
- Certificaciones que **debería** tener vs. las que **tiene**.
- Próximas a vencer y **vencidas sin actualizar**.
- **% de cumplimiento** del trabajador.
- Lista de sus certificaciones con estado y días restantes.

### 10.2 Panel admin (`/admin`, tras login)
- **Login** (hardcodeado, sección 5.5).
- **Resumen admin** (opcional): tarjetas rápidas + centro de notificaciones.
- **Parametrización:**
  - **Cargos:** ver / crear / editar; asignar certificaciones requeridas. (Vienen sembrados Soldador y Jefe de equipo, pero debe poder verse y editarse para demostrar que es parametrizable.)
  - **Certificaciones (catálogo):** nombre, tipo (ingreso/permanencia), vigencia en meses.
  - **Taladros:** lista (hardcodeada; lectura o edición simple).
- **Trabajadores:**
  - **Lista** con estado por trabajador: apto / **No apto**, % de cumplimiento, alertas.
  - **Registro de trabajador en vivo** — ver sección 11 (feature estrella).
  - **Detalle de trabajador:** sus certificaciones con estado y días restantes; acción **"Renovar"** por certificación (modal: nuevo certificado simulado + nueva fecha de inicio) — vuelve a **vigente**. Si estaba **No apto** y se renueva el requisito de ingreso, pasa a **apto** en vivo.
- Responsive (mobile + desktop).

---

## 11. ⭐ Registro de trabajador en vivo (feature estrella del demo)

Asistente por pasos, pensado para mostrarse en vivo frente al cliente:

1. **Datos básicos:** nombre, documento + **tipo** (operativo / administrativo).
   - Si **administrativo** → sin catálogo de certificaciones en el MVP; termina y se guarda.
2. Si **operativo** → seleccionar **cargo** (Soldador / Jefe de equipo) y **taladro** (Rig 2501 / 3001 / 3003).
3. Al elegir el cargo, **las certificaciones requeridas aparecen solas** (con un pequeño reveal/animación — el "automático" tiene que **verse**).
4. Por cada certificación: **fecha de inicio de vigencia** + **adjuntar certificado** (simulado: chip/preview).
5. **Resumen — Guardar.**

Al guardar: el trabajador **aparece de inmediato en la lista** y **las métricas del dashboard se recalculan al instante**. Mostrar esa cadena completa en vivo es lo más vendible de la demo.

---

## 12. Métrica principal (definición exacta)

- **requeridas(trabajador)** = nº de certificaciones que exige su cargo (operativo). Administrativo = 0 en el MVP.
- **cumplidas(trabajador)** = nº de esas requeridas que están **registradas y vigentes**, es decir estado ∈ {vigente, por vencer, crítico}. **No** cuentan vencido ni faltante (una vencida no suma — ese es justo el punto de la app).
- **% cumplimiento (trabajador)** = cumplidas / requeridas × 100.
- **Agregado (taladro / global)** = Σ cumplidas / Σ requeridas × 100.
- **Personas certificadas** = trabajadores con cumplidas == requeridas (100%).

Ejemplo: un taladro con varias personas cuya suma de requeridas es 30 y con 20 cumplidas → **66,7%**.

---

## 13. Dirección visual (para el skill de UX/UI)

No hay tokens de marca fijos de Kairos: **libertad creativa** dentro de esta dirección.

- Registro **corporativo** (familia SEÑAL/FLUJO) pero **moderno y app-like** (es PWA).
- Debe **evocar**: vigilancia, seguridad industrial, control, "estar al día". Mundo de taladros/hidrocarburos (acero, profundidad, señalética de seguridad) **sin caer en cliché**.
- **Semáforo de estados** claro y legible a distancia (es una herramienta de tablero).
- Dashboard público con impacto de **vitrina** (como el del ICCU): KPIs grandes, gráficas limpias, filtros evidentes.
- **Alto contraste / accesible** (se va a mostrar en pantallas y proyectores).
- Header público con wordmark **VIGÍA** + tagline *"Siempre al día, siempre en operación."*
- Claude Code decide paleta, tipografía y componentes.

---

## 14. Datos sembrados (seed)

Sembrar el catálogo completo (secciones 5.1–5.3) y **6 trabajadores ficticios** repartidos por taladro y cargo, en distintos estados, para que el dashboard se vea **vivo desde el arranque**. Calcular cada `fechaInicioVigencia` **relativa a la fecha simulada del momento del seed**, de modo que cada certificación caiga en el estado objetivo.

| # | Nombre (ficticio) | Tipo | Cargo | Taladro | Estado objetivo |
|---|---|---|---|---|---|
| 1 | Carlos Mendoza | operativo | Soldador | Rig 2501 | Todo al día (apto, 100%) |
| 2 | Andrés Gaviria | operativo | Jefe de equipo | Rig 2501 | Una **por vencer** (Brigadas ~25 días); resto vigente (apto) |
| 3 | Julián Torres | operativo | Soldador | Rig 3001 | Una **crítica** (Alturas ~10 días); resto vigente (apto) |
| 4 | Óscar Ramírez | operativo | Jefe de equipo | Rig 3001 | **Well control VENCIDA** (ingreso) — **No apto** |
| 5 | Diego Cárdenas | operativo | Soldador | Rig 3003 | **Falta** Espacios confinados entrante (ingreso) — **No apto** |
| 6 | Laura Ríos | administrativo | — | — | Sin catálogo de certificaciones (demuestra el tipo administrativo) |

Con esta mezcla se pueden mostrar en vivo todos los estados, la bandera No apto, y el flujo de renovar.

---

## 15. Checklist / guion de demo (para quien presenta)

1. Entrar (login) → aparece el pop-up de alertas.
2. **Registrar un trabajador nuevo en vivo** → mostrar el reveal automático de las certificaciones.
3. Ver el dashboard **recalcular** al instante.
4. **Mover la fecha simulada** para que una certificación pase de por vencer → crítica → vencida (y salte **No apto**).
5. **Renovar** esa certificación → vuelve a apto en vivo.
6. Filtrar el dashboard por taladro y por trabajador.
7. **Restablecer demo** para dejarlo limpio.

---

## 16. Fuera de alcance (para la fase de producción, post-venta)

Dejar mencionado para el cliente, **sin construir** en el MVP:
- Backend real (NestJS + PostgreSQL + Prisma), como el del ICCU.
- Cloudinary real + **borrado automático de la imagen al vencer**.
- Notificaciones reales por correo/WhatsApp + job diario (cron).
- Gestión de usuarios y roles; catálogo de certificaciones para cargos administrativos.
- Multi-empresa.

---

## 17. Deploy (Render + PWA)

- Build de Vite → `dist/`.
- **Render → Static Site:** build command `npm run build`, publish dir `dist`.
- **Rewrite rule** para el SPA: `/*` → `/index.html` (200), para que las rutas del router funcionen en enlaces directos.
- **PWA:** manifest (`name: "VIGÍA"`, short_name, theme_color, íconos 192 y 512), service worker con precache del shell. Instalable en desktop y mobile.

---

*VIGÍA — un producto de Kairos. Hecho con orgullo en Colombia 🇨🇴*
