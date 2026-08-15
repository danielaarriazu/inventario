import prisma from '../config/db';
import ExcelJS from 'exceljs';

export const generarExcelInventario = async (id_cargo: number) => {
  // 1. Traemos todos los equipos activos (sin los de BAJA) con su ruta completa
  const equipos = await prisma.planilla_Equipo.findMany({
    where: { 
      NOT: { estado_equipo: 'BAJA' } ,
      oficina: {
        division: {
          departamento: {
            destino: {
              id_cargo 
            }
          }
        }
      }
    },
    include: {
      oficina: {
        include: {
          division: {
            include: {
              departamento: {
                include: { destino: true }
              }
            }
          }
        }
      }
    },
    orderBy: { fecha_creacion: 'desc' }
  });

  // 2. Agrupamos los equipos por el Nombre del Destino
  const equiposPorDestino: Record<string, any[]> = {};
  
  equipos.forEach(eq => {
    const nombreDestino = eq.oficina.division.departamento.destino.nombre_destino;
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

    // Definimos las columnas — todos los campos de la Ficha
    sheet.columns = [
      { header: 'N° Equipo', key: 'numero_equipo', width: 15 },
      { header: 'Nombre de PC', key: 'nombre_pc', width: 15 },
      { header: 'Departamento', key: 'departamento', width: 25 },
      { header: 'División', key: 'division', width: 25 },
      { header: 'Oficina', key: 'oficina', width: 15 },
      { header: 'Responsable', key: 'responsable', width: 25 },
      { header: 'Usuario de Red', key: 'usuario_red', width: 20 },
      { header: 'Dominio', key: 'dominio', width: 15 },
      { header: 'S.O.', key: 'so', width: 15 },
      { header: 'Arquitectura', key: 'arquitectura', width: 12 },
      { header: 'Procesador', key: 'procesador', width: 25 },
      { header: 'RAM', key: 'ram', width: 15 },
      { header: 'Disco', key: 'disco', width: 20 },
      { header: 'Otros (Hardware)', key: 'hardware_otros', width: 25 },
      { header: 'Monitor (modelo)', key: 'monitor_modelo', width: 20 },
      { header: 'Monitor (tamaño)', key: 'monitor_tamano', width: 15 },
      { header: 'Impresora (modelo)', key: 'impresora_modelo', width: 20 },
      { header: 'Impresora (insumos)', key: 'impresora_insumos', width: 20 },
      { header: 'Teclado', key: 'teclado', width: 10 },
      { header: 'Mouse', key: 'mouse', width: 10 },
      { header: 'Otros Periféricos', key: 'perifericos_otros', width: 25 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Fecha de Alta', key: 'fecha_alta', width: 15 },
    ];

    // Le damos estilo a la fila de títulos (Fondo azul marino, letra blanca)
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF003366' } };

    // Llenamos las filas con los últimos datos de cada computadora
    equiposPorDestino[destino].forEach(eq => {
      sheet.addRow({
        numero_equipo: eq.numero_equipo,
        nombre_pc: eq.nombre_equipo,
        departamento: eq.oficina.division.departamento.nombre_departamento,
        division: eq.oficina.division.nombre_division,
        oficina: eq.oficina.numero_oficina,
        responsable: eq.usuario_responsable,
        usuario_red: eq.nombre_usuario_red,
        dominio: eq.dominio_conexion,
        so: eq.sistema_operativo,
        arquitectura: eq.arquitectura,
        procesador: eq.procesador,
        ram: `${eq.ram_capacidad} (${eq.tipo_ram})`,
        disco: eq.disco,
        hardware_otros: eq.hardware_otros || '-',
        monitor_modelo: eq.monitor_modelo || '-',
        monitor_tamano: eq.monitor_tamano || '-',
        impresora_modelo: eq.impresora_modelo || '-',
        impresora_insumos: eq.impresora_insumos || '-',
        teclado: eq.tiene_teclado ? 'Sí' : 'No',
        mouse: eq.tiene_mouse ? 'Sí' : 'No',
        perifericos_otros: eq.perifericos_otros || '-',
        estado: eq.estado_equipo,
        fecha_alta: eq.fecha_creacion ? new Date(eq.fecha_creacion).toLocaleDateString('es-AR') : '-'
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