import { Request, Response } from 'express';
import * as reporteService from '../services/reporte.service';

export const exportarExcel = async (req: Request, res: Response) => {
  try {
    const id_cargo = req.usuario!.id_cargo;
    const buffer = await reporteService.generarExcelInventario(id_cargo);
    
    // Le decimos al navegador que esto es un archivo de Microsoft Excel
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    // Le ponemos el nombre por defecto al archivo que se va a descargar
    res.setHeader('Content-Disposition', 'attachment; filename="Inventario_Equipos_Actualizado.xlsx"');
    
    res.send(buffer);
  } catch (error) {
    console.error('🚨 Error al exportar Excel:', error);
    res.status(500).json({ error: 'Error interno al generar el archivo Excel' });
  }
};