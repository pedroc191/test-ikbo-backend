## Descriptcion

Tomé la decisión de estructurar el proyecto de una forma más cercana a la realidad de un sistema de inventarios, implementando una división de variantes de productos y el uso de locations para trabajar con varios inventarios vinculados al mismo producto. De esta manera, no existe un solo grupo de productos, sino varios grupos, cada uno con su propia fecha de expiración. Esto permite un mejor control del inventario y facilita la salida de los productos que están próximos a vencerse.

Dejé implementada, aunque no activada, una configuración de seguridad con JWT mediante middlewares. Además, diseñé la estructura de la aplicación, usuarios, roles y endpoints para garantizar que solo quienes tengan acceso autorizado puedan utilizarla. Asimismo, los campos de tipo string son limpiados de cualquier código que intente inyectarse en ellos.

La estructura de datos está basada en Shopify, ya que considero que es una estructura robusta que puede escalar con el proyecto. Algunos campos se guardan como objetos que contienen el valor original del campo (name) y un handle, lo que permite realizar consultas futuras sin exponer los IDs de la base de datos.

Además, sería recomendable implementar un proceso adicional, como un cron worker, que mantenga actualizados los datos de los productos. Este proceso también podría evaluar diariamente la fecha de expiración de los productos en cada location, actualizando el inventario de cada variante y el stock general, así como la fecha de expiración más próxima de dichos productos.