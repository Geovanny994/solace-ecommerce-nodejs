/**
 * Consumer
 *
 * Responsabilidad:
 * Conectarse al broker Solace, enlazarse a una Queue durable
 * y procesar las órdenes recibidas.
 *
 * El consumer no se suscribe directamente al Topic.
 * Consume desde la Queue configurada en Solace.
 */

const { solace, crearSesion } = require('../config/solaceConfig');
const sesion = crearSesion();

let consumidor;

function imprimirOrden(orden) {
  console.log('\n========================================');
  console.log('          NUEVA ORDEN RECIBIDA');
  console.log('========================================');
  console.log(`Orden: ${orden.order_id}`);
  console.log(`Cliente: ${orden.customer_name}`);
  console.log(`Correo: ${orden.customer_email}`);
  console.log(`Fecha: ${orden.purchase_date}`);
  console.log('\nProductos:');

  orden.items.forEach((item) => {
    console.log(
      `- ${item.name} | SKU: ${item.sku} | Cantidad: ${item.qty} | Precio: $${item.price.toFixed(2)}`
    );
  });

  console.log(`\nTotal: $${orden.total_amount.toFixed(2)}`);
  console.log('========================================\n');
}

/**
 * Crea el consumidor y lo conecta a la Queue durable.
 */
function iniciarConsumidor() {
  consumidor = sesion.createMessageConsumer({
    queueDescriptor: {
      name: process.env.QUEUE_NAME,
      type: solace.QueueType.QUEUE,
      durable: true,
    },

    acknowledgeMode: solace.MessageConsumerAcknowledgeMode.CLIENT,
  });

  /**
   * Se ejecuta cuando el consumer quedó conectado a la Queue.
   */
  consumidor.on(solace.MessageConsumerEventName.UP, () => {
    console.log(`Consumer conectado a la Queue: ${process.env.QUEUE_NAME}`);
    console.log('Esperando órdenes...\n');
  });

  /**
   * Se ejecuta cada vez que llega un mensaje.
   */
  consumidor.on(solace.MessageConsumerEventName.MESSAGE, (mensaje) => {
    try {
      const payload = mensaje.getBinaryAttachment();
      const orden = JSON.parse(payload);

      imprimirOrden(orden);
      mensaje.acknowledge();

      console.log('Mensaje procesado y confirmado correctamente.');
    } catch (error) {
      console.error('No fue posible procesar el mensaje:', error.message);
    }
  });

  /**
   * Se ejecuta si el consumer no pudo enlazarse a la Queue.
   */
  consumidor.on(
    solace.MessageConsumerEventName.CONNECT_FAILED_ERROR,
    (evento) => {
      console.error('No fue posible conectar el consumer a la Queue.');
      console.error(evento.infoStr);

      sesion.disconnect();
      process.exitCode = 1;
    }
  );

  /**
   * Se ejecuta cuando el consumer queda desconectado.
   */
  consumidor.on(solace.MessageConsumerEventName.DOWN, () => {
    console.log('Consumer desconectado.');
  });

  consumidor.connect();
}

/**
 * Cuando la sesión se conecta al broker,
 * iniciamos el consumidor de la Queue.
 */
sesion.on(solace.SessionEventCode.UP_NOTICE, () => {
  console.log('Conexión con Solace establecida correctamente.');

  try {
    iniciarConsumidor();
  } catch (error) {
    console.error('Error al crear el consumer:', error.message);

    sesion.disconnect();
    process.exitCode = 1;
  }
});

/**
 * Maneja errores al conectar la sesión principal.
 */
sesion.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, (evento) => {
  console.error('No fue posible conectarse con Solace.');
  console.error(evento.infoStr);

  sesion.dispose();
  process.exitCode = 1;
});

/**
 * Libera los recursos cuando la sesión se desconecta.
 */
sesion.on(solace.SessionEventCode.DISCONNECTED, () => {
  console.log('Sesión desconectada correctamente.');

  sesion.dispose();
});

/**
 * Permite detener correctamente la aplicación con Ctrl + C.
 */
process.on('SIGINT', () => {
  console.log('\nCerrando consumer...');

  if (consumidor) {
    consumidor.disconnect();
  }

  sesion.disconnect();
});

try {
  console.log('Conectando con Solace...');
  sesion.connect();
} catch (error) {
  console.error('Error al iniciar la conexión:', error.message);

  sesion.dispose();
  process.exitCode = 1;
}