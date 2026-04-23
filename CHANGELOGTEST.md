# Changelog - gestión-desarrollos-back

**Desarrolladores:** Victor y Eduardo
**Fecha de Entrega:** 20/03/26

## Guía de uso

Para mantener el historial ordenado, utilizaremos las siguientes categorías en cada versión:

- **Added (Nuevo)**: Para nuevas funcionalidades.
- **Changed (Cambio)**: Para cambios en funcionalidades existentes.
- **Fixed (Corrección)**: Para corrección de errores (bugs).
- **Removed (Eliminado)**: Para funcionalidades eliminadas.
- **Maintenance (Mantenimiento)**: Tareas de infraestructura, refactorización y limpieza.

## Reglas de los items del Changelog
**Cada item debe incluir la categoría (Added, Changed, Fixed, etc.) al inicio.**
**Cada item debe tener una descripción clara y concisa del cambio realizado.**
**Cada item debe finalizar con la fecha del cambio entre corchetes [YYYY-MM-DD].**
**Cada titulo del item debe tener el ruta del endpoint y el metodo (GET, POST, etc) al inicio.**

## Unreleased

#### [2026-04-22]

- **Ajustes en Stats de Clients Cobranza** GET /clients/cobranza/stats:
  *   **Changed (Cambio)**: Se actualizó `GET /clients/cobranza/stats` para usar `from/to` con fallback automático al mes en curso cuando no se envían fechas. [2026-04-22]
  *   **Changed (Cambio)**: `pendingPaymentsCount` ahora cuenta únicamente cuotas pendientes/mora dentro del período, filtrando por `installments.expirationDate`. [2026-04-22]
  *   **Fixed (Corrección)**: `totalCollected` se calcula desde `cash_flows` con `claim_type = Cuota`, `transactionType = Ingreso` y `source = cobranza`, separando montos por moneda ARS/USD. [2026-04-22]
  *   **Fixed (Corrección)**: Para incluir todos los ingresos de cuotas cargados en el período, el filtro temporal de `totalCollected` usa `cash_flows.createdAt` (fecha real de registro) en lugar de `transactionDate`. [2026-04-22]
  *   **Changed (Cambio)**: `totalDebt` se redefinió como faltante a cobrar desde `installments` pendientes/mora del período, manteniendo la separación por moneda y el contrato de respuesta existente. [2026-04-22]

- **Corrección en Adelantos para Fuente de Cobranza** GET /installments:
  *   **Fixed (Corrección)**: Se corrigió `advancePayment` en `installments.service.ts` para persistir movimientos en `cash_flows` con `source = cobranza` en ambos flujos (pago de cuotas y prorrateo de descuento), evitando que queden clasificados como administración por default. [2026-04-22]

#### [2026-04-21]

- **Corrección en Registro de Pagos en Cash Flow**:
    *   **Fixed (Corrección)**: Se corrigió el método `registerPayment` en `installments.service.ts` para crear registros en `cash_flows` con `source = 'cobranza'` en lugar del valor por defecto `'administracion'`. Esto asegura que los pagos de cuotas se reflejen correctamente en el endpoint `GET /cashflow-cobranza/stats`. [2026-04-21]
    *   **Fixed (Corrección)**: Se creó manualmente el registro faltante en `cash_flows` para el pago existente que no se había registrado correctamente. [2026-04-21]
    *   **Fixed (Corrección)**: Se agregó el parámetro `source` como filtro en `cashflow.controller.ts` para permitir filtrar movimientos de caja por fuente (cobranza, administracion, etc.). [2026-04-21]

- **Modificacion y Fix de Stock Stats**:
    *   **Fixed (Corrección)**: Se corrigio la respuesta de `getStats` de Stock en `stock.service.ts`. [2026-04-21]
    *   **Add (Nuevo)**: Nuevos tipos en `stock.types.ts` agregados. [2026-04-21]

- **Corrección en Filtros de CashFlow (claimType sin source)**:
  *   **Fixed (Corrección)**: Se corrigió `getAllMovements` en `cashflow.service.ts`, que aplicaba siempre el filtro `source` aun cuando no era enviado, provocando resultados vacíos en `GET /cashflow?claimType=Cuota`. [2026-04-21]
  *   **Changed (Cambio)**: El filtro por `source` ahora se aplica solo cuando viene informado en query params. [2026-04-21]
  *   **Changed (Cambio)**: Se normaliza el valor de `source` a minúsculas para mantener consistencia con los valores persistidos (`cobranza`, `administracion`). [2026-04-21]
  *   **Result (Resultado)**: `GET /cashflow?page=1&perPage=25&claimType=Cuota` vuelve a traer movimientos sin requerir `source`, y `source` queda como filtro opcional. [2026-04-21]

- **Ajuste en Stats de CashFlow Cobranza**:
  *   **Fixed (Corrección)**: Se mejoró la clasificación `corriente/mora` en `getStats` de `cashflow-cobranza.service.ts`, reemplazando la lógica aproximada por un mapeo más consistente por `crmBookingId` + día de pago. [2026-04-21]
  *   **Changed (Cambio)**: Se considera `mora` cuando la cuota pagada presenta recargo (`surchargePercentage > 0`) o pago fuera de término (`paymentDate > expirationDate`). [2026-04-21]
  *   **Changed (Cambio)**: Se fortaleció el parseo del parámetro `month` (`YYYY-MM` estricto), usando mes actual como fallback cuando el valor es inválido. [2026-04-21]
  *   **Result (Resultado)**: Mejora la consistencia de los indicadores de `GET /cashflow-cobranza/stats` sin modificar la estructura de respuesta existente. [2026-04-21]

- **Ajuste en Daily Movements de CashFlow Cobranza**:
  *   **Fixed (Corrección)**: Se corrigió `getDailyMovements` en `cashflow-cobranza.service.ts` para clasificar montos desde `cash_flows` (y no desde `installments.paymentMethods`), evitando cruces incorrectos en `banco`, `cajaArs` y `cajaUsd`. [2026-04-21]
  *   **Changed (Cambio)**: El rango por defecto ahora devuelve los 7 días de la semana en curso cuando no se envían `from` y `to`. [2026-04-21]
  *   **Changed (Cambio)**: El agrupamiento diario se realiza por `createdAt` para reflejar el día real de registro del movimiento. [2026-04-21]
  *   **Changed (Cambio)**: Se aplica la regla de negocio: toda `transferencia` va a `banco`; `efectivo` en ARS va a `cajaArs`; `efectivo` en USD va a `cajaUsd`. [2026-04-21]
  *   **Result (Resultado)**: `GET /cashflow-cobranza/daily-movements` mantiene la misma estructura de respuesta, con clasificación y totales diarios consistentes. [2026-04-21]

- **Fix en Registro de Medio de Pago en Cash Flow**:
  *   **Fixed (Corrección)**: Se corrigió `addMovement` en `cashflow.service.ts`, que no persistía `paymentMethod` al insertar en `cash_flows`, provocando que MySQL aplicara el valor por defecto `efectivo`. [2026-04-21]
  *   **Changed (Cambio)**: Se agregó persistencia explícita de `paymentMethod`, `installmentId` y `exchangeRate` en la inserción de movimientos. [2026-04-21]
  *   **Changed (Cambio)**: Se normaliza `paymentMethod` al guardar (`transferencia` / `efectivo`) para evitar inconsistencias de mayúsculas/minúsculas en entradas desde frontend. [2026-04-21]
  *   **Result (Resultado)**: Los pagos registrados como transferencia ya no quedan guardados como efectivo en `cash_flows`, mejorando la consistencia de reportes y dashboards. [2026-04-21]

- **Ajuste en Monthly Comparison de CashFlow Cobranza**:
  *   **Fixed (Corrección)**: Se corrigió `getMonthlyComparison` en `cashflow-cobranza.service.ts` para calcular período y mes por `createdAt` de `cash_flows`, evitando excluir movimientos del año consultado cuando `transactionDate` tiene fecha histórica. [2026-04-21]
  *   **Changed (Cambio)**: Se consolidan correctamente los importes en `ingresosArs` (caja ARS + transferencias ARS) y en `ingresosUsd` (movimientos en USD), manteniendo la estructura actual del endpoint. [2026-04-21]
  *   **Result (Resultado)**: `GET /cashflow-cobranza/monthly-comparison?year=YYYY` refleja correctamente lo registrado en el año por mes, sin cambios de contrato de respuesta. [2026-04-21]
 
#### [2026-04-20]