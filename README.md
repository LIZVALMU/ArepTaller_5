# Sistema CRUD de Propiedades (AREP 2025)

Autor: **Alison Valderrama**  
Asignatura: **AREP**  
Año: **2025**

---

## 1. Resumen del Proyecto

Aplicación web para gestionar propiedades inmobiliarias (bienes raíces) que soporta:

* Crear, listar, consultar, actualizar y eliminar propiedades (CRUD completo).
* Paginación y filtros (dirección, rango de precio, rango de tamaño).
* Orden dinámico por cualquier campo (parámetro `sortBy`).
* Manejo global de errores y validaciones (Bean Validation / Jakarta).
* Frontend estático moderno (HTML + CSS + JS) con tema claro/oscuro.
* Backend listo para contenedorización y despliegue en AWS junto a MySQL (RDS).

---
 
## 2. Estructura del Repositorio

```text
backend/                 Código Spring Boot (API REST)
  pom.xml
  src/main/java/com/arep/property/
    PropertyCrudApplication.java
    controller/ (REST + GlobalExceptionHandler)
    model/ (Entidad JPA)
    repository/ (JpaRepository + Specification)
    service/ (Interfaces y lógica de negocio)
frontend/                Interfaz estática (index.html, styles.css, script.js)
docker-compose.yml       Orquestación local (MySQL + backend)
backend/Dockerfile       Imagen del backend
```

---

## 3. Diseño de Clases (Backend)

| Capa | Clase | Rol |
|------|-------|-----|
| Aplicación | `PropertyCrudApplication` | Punto de entrada Spring Boot |
| Modelo | `Property` | Entidad JPA (id, address, price, size, description) |
| Repositorio | `PropertyRepository` | Extiende `JpaRepository` + `JpaSpecificationExecutor` |
| Servicio | `PropertyService` / `PropertyServiceImpl` | Lógica de negocio, filtros dinámicos (Specifications) |
| Controlador | `PropertyController` | Endpoints REST CRUD + paginación/filtros/orden |
| Manejo Errores | `GlobalExceptionHandler` | Captura validaciones y excepciones de negocio |

Diagrama simplificado (texto):

```text
Controller -> Service -> Repository -> DB (MySQL)
            ↑            ↗
   GlobalExceptionHandler (cross-cutting)
```

---

## 4. Modelo de Datos

Tabla: `properties`

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| id | BIGINT (auto) | PK, autoincrement |
| address | VARCHAR | NOT NULL |
| price | DOUBLE | > 0, NOT NULL |
| size | DOUBLE | > 0, NOT NULL |
| description | VARCHAR(1000) | Opcional |

Reglas de validación (Bean Validation):

* `@NotBlank` en `address`
* `@Positive` y `@NotNull` en `price` y `size`
* `@Size(max=1000)` en `description`

---

## 5. Endpoints REST

Base: `/api/properties`

| Método | Endpoint | Descripción | HTTP Status éxito |
|--------|----------|-------------|-------------------|
| POST | `/api/properties` | Crea una propiedad | 201 CREATED |
| GET | `/api/properties` | Lista paginada con filtros | 200 OK |
| GET | `/api/properties/{id}` | Consulta por ID | 200 / 404 |
| PUT | `/api/properties/{id}` | Actualiza una propiedad | 200 OK |
| DELETE | `/api/properties/{id}` | Elimina una propiedad | 204 NO CONTENT |

### 5.1 Parámetros de Consulta (GET /api/properties)

| Parámetro | Tipo | Opcional | Ejemplo |
|-----------|------|----------|---------|
| address | String | Sí | `address=avenida` |
| minPrice | Double | Sí | `minPrice=100000` |
| maxPrice | Double | Sí | `maxPrice=500000` |
| minSize | Double | Sí | `minSize=60` |
| maxSize | Double | Sí | `maxSize=120` |
| page | int | Sí (def=0) | `page=0` |
| size | int | Sí (def=10) | `size=5` |
| sortBy | String | Sí (def=id) | `sortBy=price` |
| direction | String | Sí (def=asc) | `direction=desc` |

### 5.2 Ejemplos de Uso (curl)

Crear:

```bash
curl -X POST http://localhost:8080/api/properties \
  -H "Content-Type: application/json" \
  -d '{"address":"Calle 123","price":150000,"size":80,"description":"Apto céntrico"}'
```
Listar filtrando y ordenando:

```bash
curl "http://localhost:8080/api/properties?address=calle&minPrice=100000&maxPrice=300000&sortBy=price&direction=desc&page=0&size=5"
```
Actualizar:

```bash
curl -X PUT http://localhost:8080/api/properties/1 \
  -H "Content-Type: application/json" \
  -d '{"address":"Calle 123A","price":160000,"size":78,"description":"Reformado"}'
```
Eliminar:

```bash
curl -X DELETE http://localhost:8080/api/properties/1
```

### 5.3 Respuestas de Error (JSON genérico)

```json
{
  "timestamp": "2025-09-25T12:00:00Z",
  "status": 400,
  "errors": {
    "price": "must be greater than 0"
  }
}
```

---

## 6. Frontend

Características principales:

* Diseño responsive con dos columnas (formulario/filtros + listado).
* Tema claro / oscuro con toggle persistente (localStorage).
* Animaciones suaves (hover, aparición de tarjetas, mensajes).
* Fetch API para CRUD asíncrono.
* Paginación dinámica y recarga parcial de tabla.

### 6.1 Flujo UI

1. El usuario crea o edita mediante el formulario.
2. Tras operación exitosa se muestra mensaje (auto-desvanecimiento).
3. Tabla se actualiza sin recargar página.
4. Filtros aplican query params a la API.

---

## 7. Manejo de Errores

`GlobalExceptionHandler` unifica:

* Validaciones (`MethodArgumentNotValidException`) ⇒ 400 con campo→mensaje.
* `ResponseStatusException` ⇒ status personalizado.
* Excepciones genéricas ⇒ 500 con mensaje simple.

---

## 8. Seguridad y Buenas Prácticas (Pendiente / Recomendado)

* Externalizar credenciales DB (`DB_USER`, `DB_PASSWORD`).
* Añadir capa de autenticación (JWT) si se expone públicamente.
* Limitar CORS a dominios confiables en producción.
* Añadir rate limiting / logging estructurado.

---

## 9. Tests (Sugeridos)

* Unit: Service con repositorio mock (Mockito).
* Integración: Controlador con `@SpringBootTest` + `TestRestTemplate`.
* E2E opcional: Cypress / Playwright para UI.

---

## 10. Despliegue Local

### 10.1 Requisitos

* Java 17
* Maven 3.9+
* MySQL 8 ó Docker

### 10.2 Ejecución con Maven

```bash
cd backend
mvn spring-boot:run
```

### 10.3 Docker Compose

```bash
docker compose build
docker compose up -d
```
API: <http://localhost:8080/api/properties>

---

## 11. Despliegue en AWS (Resumen)

1. RDS MySQL (subred privada).
2. EC2 (backend) con SG que permita 8080 y salida a 3306.
3. Construir y subir imagen a ECR.
4. Ejecutar container con variables de entorno:

```bash
docker run -d -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://<rds-endpoint>:3306/propertiesdb \
  -e SPRING_DATASOURCE_USERNAME=<user> \
  -e SPRING_DATASOURCE_PASSWORD=<pass> \
  <account>.dkr.ecr.<region>.amazonaws.com/property-crud:latest
```

5. (Opcional) S3 + CloudFront para servir `frontend/`.
6. Monitoreo: CloudWatch Logs (driver awslogs) y métricas RDS.

---

## 12. Variables de Entorno Recomendadas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| DB_USER | Usuario DB | root |
| DB_PASSWORD | Password DB | ******** |
| SPRING_DATASOURCE_URL | URL JDBC | jdbc:mysql://host:3306/propertiesdb |
| JAVA_OPTS | Ajustes JVM | -Xms256m -Xmx512m |

En `application.properties` se puede usar:

```properties
spring.datasource.username=${DB_USER:root}
spring.datasource.password=${DB_PASSWORD:changeme}
```

---

## 13. Mejoras Futuras

* Exportar listado a CSV / Excel.
* Cache de lecturas (Caffeine / Redis).
* Tests automáticos CI (GitHub Actions) + Sonar.
* Documentación OpenAPI (springdoc-openapi).
* Paginación infinita en frontend.

---

## 14. Autoría

Proyecto desarrollado por **Alison Valderrama** para la asignatura **AREP (2025)**.

---

## 15. Licencia

Uso académico. Extender a MIT u otra licencia si se publica públicamente.

