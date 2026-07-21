const solace = require('solclientjs');
require('dotenv').config();

/*
 * SolclientFactory es el punto de entrada principal de la API de Solace.
 * Antes de crear sesiones, mensajes o destinos, debemos inicializarla.
 */
const propiedadesFabrica = new solace.SolclientFactoryProperties();
propiedadesFabrica.profile = solace.SolclientFactoryProfiles.version10;

// Inicializa la fábrica de Solace.
solace.SolclientFactory.init(propiedadesFabrica);

/*
 * Reduce los mensajes internos de la librería.
 * Solo mostrará advertencias y errores importantes.
 */
solace.SolclientFactory.setLogLevel(solace.LogLevel.WARN);

/**
 * Valida que existan todas las variables necesarias para conectarse.
 */
function validarConfiguracion() {
  const variablesObligatorias = [
    'SOLACE_HOST',
    'SOLACE_VPN',
    'SOLACE_USERNAME',
    'SOLACE_PASSWORD',
  ];

  const variablesFaltantes = variablesObligatorias.filter(
    (variable) => !process.env[variable]?.trim()
  );

  if (variablesFaltantes.length > 0) {
    throw new Error(
      `Faltan variables de entorno: ${variablesFaltantes.join(', ')}`
    );
  }
}

/**
 * Crea una sesión configurada para comunicarse con el broker.
 *
 * Esta función todavía no establece la conexión.
 * La conexión ocurre después cuando se ejecuta session.connect().
 */
function crearSesion() {
  validarConfiguracion();

  return solace.SolclientFactory.createSession({
    url: process.env.SOLACE_HOST,
    vpnName: process.env.SOLACE_VPN,
    userName: process.env.SOLACE_USERNAME,
    password: process.env.SOLACE_PASSWORD,
  });
}

module.exports = {
  solace,
  crearSesion,
};