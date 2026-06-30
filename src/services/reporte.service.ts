import prisma from '../config/db';
import ExcelJS from 'exceljs';

export const generarExcelInventario = async (id_cargo: number) => {
  // 1. Traemos todos los equipos activos (sin los de BAJA) con su ruta completa
  const equipos = await prisma.planilla_Equipo.findMany({
    where: { 
      NOT: { estado_equipo: 'BAJA' } ,
      division: {
        departamento: {
          destino: {
            id_cargo 
          }
        }
      }
    },
    include: {
      division: {
        include: {
          departamento: {
            include: { destino: true }
          }
        }
      }
    },
    orderBy: { fecha_creacion: 'desc' }
  });

  // 2. Agrupamos los equipos por el Nombre del Destino
  const equiposPorDestino: Record<string, any[]> = {};
  
  equipos.forEach(eq => {
    const nombreDestino = eq.division.departamento.destino.nombre_destino;
    if (!equiposPorDestino[nombreDestino]) {
      equiposPorDestino[nombreDestino] = [];
    }
    equiposPorDestino[nombreDestino].push(eq);
  });

  // 3. Creamos el archivo Excel
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sistema de Inventario';

  // 4. Creamos una pestaña (Worksheet) por cada Destino
  for (const destino in equiposPorDestino) {
    // Excel solo permite 31 caracteres en el nombre de la pestaña
    const nombrePestana = destino.substring(0, 31).replace(/[/*?:\[\]]/g, ''); 
    const sheet = workbook.addWorksheet(nombrePestana);

    // Definimos las columnas
    sheet.columns = [
      { header: 'N° Equipo', key: 'numero_equipo', width: 15 },
      { header: 'Departamento', key: 'departamento', width: 25 },
      { header: 'División', key: 'division', width: 25 },
      { header: 'Oficina', key: 'oficina', width: 15 },
      { header: 'Responsable', key: 'responsable', width: 25 },
      { header: 'Nombre en Red', key: 'nombre_red', width: 20 },
      { header: 'Dominio', key: 'dominio', width: 15 },
      { header: 'S.O.', key: 'so', width: 15 },
      { header: 'Procesador', key: 'procesador', width: 25 },
      { header: 'RAM', key: 'ram', width: 15 },
      { header: 'Disco', key: 'disco', width: 20 },
      { header: 'Estado', key: 'estado', width: 15 },
    ];

    // Le damos estilo a la fila de títulos (Fondo azul marino, letra blanca)
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003366' } };

    // Llenamos las filas con los últimos datos de cada computadora
    equiposPorDestino[destino].forEach(eq => {
      sheet.addRow({
        numero_equipo: eq.numero_equipo,
        departamento: eq.division.departamento.nombre_departamento,
        division: eq.division.nombre_division,
        oficina: eq.numero_oficina,
        responsable: eq.usuario_responsable,
        nombre_red: eq.nombre_equipo,
        dominio: eq.dominio_conexion,
        so: eq.sistema_operativo,
        procesador: eq.procesador,
        ram: `${eq.ram_capacidad} (${eq.tipo_ram})`,
        disco: eq.disco,
        estado: eq.estado_equipo
      });
    });
  }

  // Si la base de datos está vacía, creamos una hoja en blanco para que no falle
  if (Object.keys(equiposPorDestino).length === 0) {
    workbook.addWorksheet('Sin Datos');
  }

  // Convertimos el archivo a un formato que se pueda enviar por internet (Buffer)
  return await workbook.xlsx.writeBuffer();
};