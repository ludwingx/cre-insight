import jsPDF from "jspdf";

import type { Post } from "@/types/Post";

export async function generarBoletinPDF({
  posts,
  titularesDestacados = ["Jorge Tuto Quiroga", "Juan Pablo Velazco"],
  titularidades = [],
  sinActividad = [],
  fechaHoy,
  logoUrl = "/logos/librePDF.png", // Cambia aquí la URL de tu logo
  departamentoNombre,
  desde,
  hasta
}: {
  posts: Post[];
  titularesDestacados?: string[];
  titularidades: string[];
  sinActividad: {
    candidato: string;
    titularidad: string;
    departamento: string;
    redsocial: string;
  }[];
  fechaHoy: string;
  logoUrl?: string;
  departamentoNombre: string;
  desde?: string;
  hasta?: string;
}) {
  const doc = new jsPDF();
  let y = 8;

  // Cabecera
  // Convertir logoUrl a base64 y mostrar el logo centrado
  const logoBase64 = await urlToBase64(logoUrl);
  if (logoBase64) {
    // Imagen ocupa todo el ancho del PDF (A4: 210mm)
    doc.addImage(logoBase64, 'PNG', 0, 0, 210, 30); // x=0, y=0, width=210mm, height=30mm
    y = 34; // deja un pequeño margen debajo del logo
  } else {
    y = 20;
  }

  // Fondo azul para el título
  doc.setFillColor(0, 70, 140); // azul oscuro
  doc.rect(0, y - 5, 210, 10, 'F'); // x, y, width=210mm, height=12mm

  // Texto blanco y negrita
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  let rangoTexto = '';
  if (desde && hasta) {
    if (desde === hasta) {
      rangoTexto = ` (${formatearFecha(desde)})`;
    } else {
      rangoTexto = ` (${formatearFecha(desde)} a ${formatearFecha(hasta)})`;
    }
  } else if (desde) {
    rangoTexto = ` (desde ${formatearFecha(desde)})`;
  } else if (hasta) {
    rangoTexto = ` (hasta ${formatearFecha(hasta)})`;
  }
  doc.text(`BOLETIN${rangoTexto} DE REDES SOCIALES - ${departamentoNombre}`, 105, y + 1, { align: "center" });
  y += 13;

  // volver a texto normal
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  // Publicaciones de Presidente
  doc.setFontSize(16);
  doc.text("Publicaciones de Presidente: Jorge Tuto Quiroga", 15, y);
  y += 8;
  const postsPresidente = posts.filter(p => p.perfil.toLowerCase().includes("jorge tuto quiroga"));
  if (postsPresidente.length > 0) {
    postsPresidente.forEach(post => {
      doc.setFontSize(12);
      doc.text("Perfil: " + post.perfil + " | Red social: " + (post.redsocial || ""), 20, y);
      y += 6;
      doc.text("Texto: " + (post.texto?.slice(0, 90) || ""), 20, y);
      y += 6;
      doc.setTextColor(0, 0, 255);
      doc.textWithLink("Ver Más", 20, y, { url: post.posturl });
      doc.setTextColor(0, 0, 0);
      y += 10;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    y += 4;
  } else {
    doc.setFontSize(12);
    doc.text("Sin publicaciones", 20, y);
    y += 10;
  }

  // Publicaciones de Vicepresidente
  doc.setFontSize(16);
  doc.text("Publicaciones de Vicepresidente: Juan Pablo Velazco", 15, y);
  y += 8;
  const postsVice = posts.filter(p => p.perfil.toLowerCase().includes("juan pablo velazco") || p.perfil.toLowerCase().includes("juan pablo velasco"));
  if (postsVice.length > 0) {
    postsVice.forEach(post => {
      doc.setFontSize(12);
      doc.text("Perfil: " + post.perfil + " | Red social: " + (post.redsocial || ""), 20, y);
      y += 6;
      doc.text("Texto: " + (post.texto?.slice(0, 90) || ""), 20, y);
      y += 6;
      doc.setTextColor(0, 0, 255);
      doc.textWithLink("Ver Más", 20, y, { url: post.posturl });
      doc.setTextColor(0, 0, 0);
      y += 10;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    y += 4;
  } else {
    doc.setFontSize(12);
    doc.text("Sin publicaciones", 20, y);
    y += 10;
  }

  // Publicaciones en el departamento
  doc.setFontSize(12);
  doc.text(`Publicaciones en ${departamentoNombre}:`, 15, y);
  y += 8;
  const titularidadOrden = [
    'PRESIDENTE',
    'VICEPRESIDENTE',
    'SENADOR',
    'DIPUTADO PLURINOMINAL',
    'DIPUTADO UNINOMINAL URBANO',
    'DIPUTADO UNINOMINAL RURAL',
    'DIPUTADO SUPRAESTATAL',
    'DIPUTADO CIRCUNSCRIPCIÓN ESPECIAL',
    'OTRO'
  ];
  titularidadOrden.forEach((tit) => {
    const postsTit = posts.filter(p =>
      (p.titularidad || "").toUpperCase() === tit &&
      (p.departamento || '').toUpperCase() !== 'PAIS'
    );
    if (postsTit.length > 0) {
      doc.setFontSize(12);
      doc.text(tit, 20, y);
      y += 8;
      postsTit.forEach(post => {
        doc.setFontSize(12);
        doc.text("Perfil: " + post.perfil + " | Red social: " + (post.redsocial || ""), 25, y);
        y += 6;
        // Ajustar texto de la publicación al ancho de la hoja
        let texto = post.texto || "";
        let textoLines = doc.splitTextToSize("Texto: " + texto, 155); // 155 es el ancho máximo
        // Limitar a 2 líneas
        if (textoLines.length > 2) {
          textoLines = textoLines.slice(0, 2);
          // Añadir '...' al final de la última línea
          textoLines[1] = textoLines[1].slice(0, -3) + '...';
        }
        textoLines.forEach((line: string | string[]) => {
          doc.text(line, 25, y);
          y += 6;
        });
        doc.setTextColor(0, 0, 255);
        doc.textWithLink("Ver Más", 25, y, { url: post.posturl });
        doc.setTextColor(0, 0, 0);
        y += 10;
        if (y > 270) { doc.addPage(); y = 20; }
      });
      y += 4;
    }
  });

  // Sin Actividad en RRSS
  if (sinActividad.length) {
    // Incluir los que tienen el departamento actual o 'PAIS', igual que en la app
    const sinActividadDepartamento = sinActividad.filter(item => {
      const dep = (item.departamento || '').toUpperCase();
      return dep === departamentoNombre.toUpperCase() || dep === 'PAIS';
    });

    // Orden personalizado de titularidad
    const titularidadOrden = [
      'PRESIDENTE',
      'VICEPRESIDENTE',
      'SENADOR',
      'DIPUTADO PLURINOMINAL',
      'DIPUTADO UNINOMINAL URBANO',
      'DIPUTADO UNINOMINAL RURAL',
      'DIPUTADO SUPRAESTATAL',
      'DIPUTADO CIRCUNSCRIPCIÓN ESPECIAL',
      'OTRO'
    ];
    // Ordenar por redsocial y luego por titularidad
    sinActividadDepartamento.sort((a: any, b: any) => {
      const redA = (a.redsocial || '').toUpperCase();
      const redB = (b.redsocial || '').toUpperCase();
      if (redA < redB) return -1;
      if (redA > redB) return 1;
      const titA = titularidadOrden.indexOf((a.titularidad || '').toUpperCase());
      const titB = titularidadOrden.indexOf((b.titularidad || '').toUpperCase());
      return (titA === -1 ? 999 : titA) - (titB === -1 ? 999 : titB);
    });

    y += 10;
    doc.setFontSize(12);
    doc.text("Sin actividad en RRSS", 105, y, { align: "center" });
    y += 10;
    doc.setFontSize(12);
    // Encabezado tabla (más separación entre columnas y alineación a la izquierda)
    const colX = [24, 130]; // X para Nombre y Titularidad
    doc.setFontSize(13);
    doc.setTextColor(40,40,40);
    doc.text("Nombre", colX[0], y, { align: "left" });
    doc.text("Titularidad", colX[1], y, { align: "left" });
    y += 5;
    doc.setLineWidth(0.4);
    doc.line(18, y, 190, y);
    y += 9;
    // Filas
    sinActividadDepartamento.forEach((item: { candidato: string; titularidad: string; redsocial: string; }, idx: number) => {
      // Recortar cada campo si es necesario
      function crop(text: string, maxLen: number) {
        return text.length > maxLen ? text.slice(0, maxLen - 3) + '...' : text;
      }
      // Fondo alterno para filas
      if (idx % 2 === 1) {
        doc.setFillColor(245,245,245);
        doc.rect(19, y-6, 172, 10, 'F');
      }
      doc.setFontSize(12);
      doc.setTextColor(30,30,30);
      // Más espacio para el nombre; ambas columnas alineadas a la izquierda para evitar colisiones visuales
      doc.text(crop(item.candidato || '', 42), colX[0], y, { align: "left" });
      doc.text(crop(item.titularidad || '', 28), colX[1], y, { align: "left" });
      // Línea horizontal por fila
      doc.setDrawColor(220,220,220);
      doc.line(18, y+3, 190, y+3);
      y += 10;
      if (y > 270) { doc.addPage(); y = 20; }
    });
  }

  let nombreArchivo = `boletin`;
  if (desde && hasta) {
    if (desde === hasta) {
      nombreArchivo += `_${formatearFecha(desde)}`;
    } else {
      nombreArchivo += `_${formatearFecha(desde)}_a_${formatearFecha(hasta)}`;
    }
  } else if (desde) {
    nombreArchivo += `_desde_${formatearFecha(desde)}`;
  } else if (hasta) {
    nombreArchivo += `_hasta_${formatearFecha(hasta)}`;
  }
  nombreArchivo = nombreArchivo.replace(/\//g, '-'); // Evitar caracteres inválidos
  doc.save(`${nombreArchivo}.pdf`);
}

function formatearFecha(fecha: string) {
  // Forzar la fecha como local (zona -04:00) para evitar desfase
  const d = new Date(fecha + 'T00:00:00-04:00');
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

// Utilidad para convertir una imagen de URL a base64
async function urlToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('No se pudo convertir la imagen a base64:', e);
    return null;
  }
}

