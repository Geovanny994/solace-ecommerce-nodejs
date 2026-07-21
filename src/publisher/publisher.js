/**
 * Publisher
 *
 * Responsabilidad:
 * Conectarse al broker Solace y publicar una orden
 * en el Topic configurado.
 *
 * El publisher no conoce la Queue ni al consumidor.
 * Solamente publica eventos en un Topic.
 */

const { solace, crearSesion } = require('../config/solaceConfig');
const { crearOrden } = require('../models/order');

// Creamos la sesión utilizando los datos del archivo .env.
const sesion = crearSesion();

/**
 * Construye y publica una orden en Solace.
 */
/**
 * Construye y publica una orden en Solace.
 */
function publicarOrden() {
  const orden = crearOrden();
  const payload = JSON.stringify(orden);
  const mensaje = solace.SolclientFactory.createMessage();

  mensaje.setDestination(
    solace.SolclientFactory.createTopicDestination(process.env.TOPIC_NAME)
  );


  mensaje.setBinaryAttachment(payload);
  mensaje.setDeliveryMode(solace.MessageDeliveryModeType.PERSISTENT);
  mensaje.setCorrelationKey(orden.order_id);
  sesion.send(mensaje);

  console.log('\nOrden publicada:');
  console.log(`ID       : ${orden.order_id}`);
  console.log(`Cliente  : ${orden.customer_name}`);
  console.log(`Correo   : ${orden.customer_email}`);
  console.log(`Total    : $${orden.total_amount.toFixed(2)}`);
  console.log(`Topic    : ${process.env.TOPIC_NAME}`);
  console.log('\nEsperando confirmación del broker...');
}

/**
 * Se ejecuta cuando la conexión con Solace fue exitosa.
 */
sesion.on(solace.SessionEventCode.UP_NOTICE, () => {
  console.log('Conexión establecida correctamente.');

  try {
    publicarOrden();
  } catch (error) {
    console.error('No fue posible publicar la orden:', error.message);
    sesion.disconnect();
  }
});

/**
 * Se ejecuta cuando el broker confirma que recibió
 * correctamente el mensaje persistente.
 */
sesion.on(solace.SessionEventCode.ACKNOWLEDGED_MESSAGE, (evento) => {
  console.log(
    `Confirmación recibida. Orden: ${evento.correlationKey}`
  );

  sesion.disconnect();
});

/**
 * Se ejecuta cuando el broker rechaza el mensaje.
 */
sesion.on(solace.SessionEventCode.REJECTED_MESSAGE_ERROR, (evento) => {
  console.error('Solace rechazó el mensaje.');
  console.error(evento.infoStr);

  sesion.disconnect();
  process.exitCode = 1;
});

/**
 * Se ejecuta cuando no fue posible establecer la conexión.
 */
sesion.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (evento) => {
  console.error('No fue posible conectarse con Solace.');
  console.error(evento.infoStr);

  sesion.dispose();
  process.exitCode = 1;
});

/**
 * Se ejecuta cuando la sesión terminó de desconectarse.
 */
sesion.on(solace.SessionEventCode.DISCONNECTED, () => {
  console.log('Sesión desconectada correctamente.');

  sesion.dispose();
});

try {
  console.log('========================================');
  console.log('          SOLACE PUBLISHER');
  console.log('========================================\n');
  console.log('Conectando con Solace...');

  sesion.connect();
} catch (error) {
  console.error('Error al iniciar la conexión:', error.message);

  sesion.dispose();
  process.exitCode = 1;
}