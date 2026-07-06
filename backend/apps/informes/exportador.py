from io import BytesIO

from django.http import HttpResponse
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def exportar_excel(nombre_archivo, hojas):
    """
    Genera un archivo .xlsx con una o más hojas.

    hojas: lista de tuplas (nombre_hoja, encabezados, filas)
    nombre_hoja: str
    encabezados: lista de str (una por columna)
    filas: lista de listas/tuplas con los valores, en el mismo orden que 'encabezados'
    """
    wb = Workbook()
    wb.remove(wb.active)  # Django/openpyxl crea una hoja vacía por defecto

    for nombre_hoja, encabezados, filas in hojas:
        ws = wb.create_sheet(title=nombre_hoja[:31])  # Excel limita el nombre a 31 caracteres
        ws.append(encabezados)

        for celda in ws[1]:
            celda.font = Font(bold=True, color='FFFFFF')
            celda.fill = PatternFill(start_color='1F2937', end_color='1F2937', fill_type='solid')

        for fila in filas:
            ws.append(fila)

        for columna in ws.columns:
            longitud = max((len(str(c.value)) for c in columna if c.value is not None), default=0)
            ws.column_dimensions[columna[0].column_letter].width = longitud + 4

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    response = HttpResponse(
        buffer.read(),
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    response['Content-Disposition'] = f'attachment; filename="{nombre_archivo}.xlsx"'
    return response


def exportar_pdf(nombre_archivo, titulo, secciones):
    """
    Genera un PDF con una o más tablas.

    secciones: lista de tuplas (subtitulo, encabezados, filas)
    subtitulo: str, se muestra como encabezado de sección arriba de la tabla
    encabezados: lista de str
    filas: lista de listas/tuplas con los valores
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=landscape(letter), topMargin=1.5 * cm, bottomMargin=1.5 * cm
    )
    estilos = getSampleStyleSheet()
    elementos = [Paragraph(titulo, estilos['Title']), Spacer(1, 12)]

    for subtitulo, encabezados, filas in secciones:
        elementos.append(Paragraph(subtitulo, estilos['Heading2']))
        elementos.append(Spacer(1, 6))

        data = [encabezados] + [
            [str(valor) if valor is not None else '' for valor in fila] for fila in filas
        ]
        tabla = Table(data, repeatRows=1)
        tabla.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F2937')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F3F4F6')]),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elementos.append(tabla)
        elementos.append(Spacer(1, 20))

    doc.build(elementos)
    buffer.seek(0)

    response = HttpResponse(buffer.read(), content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{nombre_archivo}.pdf"'
    return response