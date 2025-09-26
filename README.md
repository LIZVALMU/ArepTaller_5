# Sistema CRUD de Propiedades (AREP 2025)

Autor: **Alison Valderrama**  
Asignatura: **AREP**  
Año: **2025**

## Resumen del Proyecto
Aplicación web para gestionar propiedades inmobiliarias con operaciones CRUD, filtros, paginación y validaciones. Backend en Spring Boot con JPA/MySQL y frontend estático (HTML/CSS/JS) usando Fetch API. Próximamente se proveen Dockerfiles y guía de despliegue en AWS (API y base de datos en servidores separados).

## Estructura

```text
backend/        Proyecto Spring Boot (API REST)
frontend/       HTML, CSS y JavaScript (Fetch API)
```

## Estado Actual

Implementado backend (CRUD completo + filtros + paginación + validaciones) y frontend funcional. Pendiente: Docker, docker-compose y guía detallada de despliegue AWS.

## Plan de Commits

1. Inicialización del proyecto.
2. Dominio + Persistencia + API CRUD básica.
3. Frontend (HTML/JS) con Fetch API.
4. Manejo global de errores, validaciones reforzadas, actualización README. (ESTE COMMIT)
5. Docker (backend + MySQL), docker-compose y guía de despliegue en AWS.

## Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/properties | Crear propiedad |
| GET | /api/properties | Listar (paginado + filtros) |
| GET | /api/properties/{id} | Obtener por id |
| PUT | /api/properties/{id} | Actualizar |
| DELETE | /api/properties/{id} | Eliminar |

Parámetros de filtro: address, minPrice, maxPrice, minSize, maxSize, page, size, sortBy, direction.

## Ejemplo curl

```bash
curl -X POST http://localhost:8080/api/properties \
  -H "Content-Type: application/json" \
  -d '{"address":"Calle 123","price":150000,"size":80,"description":"Apto céntrico"}'
```

## Tecnologías

- Java 17
- Spring Boot 3
- Spring Data JPA / Hibernate
- MySQL
- Validación Jakarta
- Frontend estático (Fetch API)

## Despliegue Local con Docker

Compilar y levantar:

```bash
docker compose build
docker compose up -d
```

API disponible en: <http://localhost:8080/api/properties>

## Instrucciones Resumidas de Despliegue en AWS

Lista de pasos AWS:

- Crear instancia EC2 (Amazon Linux 2023 / t3.small) para backend.
- Instalar Docker y docker compose plugin.
- Crear instancia RDS MySQL (o segunda EC2 con MySQL) en subred privada.
- Configurar Security Groups: permitir 3306 solo desde backend, 8080 abierto (o detrás de ALB).
- Construir imagen y subir a Amazon ECR (o usar CI): `docker build`, `docker tag`, `docker push`.
- Ejecutar backend en EC2: comando docker run con variables de entorno de la base de datos.
- (Opcional) Servir frontend desde S3 + CloudFront o Nginx.
- Monitoreo: CloudWatch Logs (log-driver awslogs) y métricas RDS.

## Arquitectura (Resumen)

Frontend (estático) -> Backend Spring Boot (EC2 / contenedor) -> MySQL (RDS)  
Separación clara entre capa de presentación, lógica y persistencia.

## Autor

Desarrollado por Alison Valderrama para la asignatura AREP (2025).
