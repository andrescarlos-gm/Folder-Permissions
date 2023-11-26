// Ruta de carpetas a modificar permisos
const paths = [
  "C:/Users/andre/hola1",
  "C:/Users/andre/hola2",
  "C:/Users/andre/hola3",
  "C:/Users/andre/hola4",
  "C:/Users/andre/hola5",
];
// Se itera el arreglo con las rutas
paths.forEach((path) => {
  const { execSync } = require("child_process");
  function obtenerInformacionUsuariosGrupos() {
    try {
      const comando = `powershell (Get-ACL -Path ${path}).Access.IdentityReference`;
      const resultado = execSync(comando, { encoding: "utf-8" });

      // Parsear la salida de PowerShell (formato de tabla)
      const filas = resultado.trim().split("\n");
      const headers = filas[0].trim().split(/\s+/);
      const datos = filas.slice(2).map((fila) => {
        const valores = fila.trim().split(/\s+/);
        const filaObjeto = {};
        headers.forEach((header, index) => {
          filaObjeto[header] = valores[index];
        });
        return filaObjeto;
      });

      return datos;
    } catch (error) {
      console.error(
        `Error al obtener información de usuarios y grupos: ${error.message}`
      );
      return null;
    }
  }
  // Ejecuta la función y comprueba si posee información
  const informacionUsuariosGrupos = obtenerInformacionUsuariosGrupos();
  if (informacionUsuariosGrupos) {
    console.log(informacionUsuariosGrupos);
  }
  // Una vez obtenidos los nombres de usuarios, modificamos sus permisos
  informacionUsuariosGrupos.forEach((item) => {
    // Definimos usuario
    const { exec } = require("child_process");
    // Si el usuario aparece como NT se modifica a SYSTEM
    userOrGroup = item.Value === "NT" ? "SYSTEM" : item.Value;

    // concede permisos totales

    // Para mas información sobre permisos mediante icacls consultar https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/icacls
    const comando = `icacls "${path}" /grant:r "${userOrGroup}:(OI)(CI)F"`;

    // O eliminar todos los permisos
    // const comando = `icacls "${path}" /inheritance:r /remove ${userOrGroup}`;

    exec(comando, (error, stdout) => {
      if (error) {
        console.error(`Error al cambiar los permisos: ${error.message}`);
        return;
      }
      console.log(`Permisos cambiados correctamente: ${stdout}`);
    });
  });
});