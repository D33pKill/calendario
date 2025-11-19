# 🪴 Huerto Urbano - Gestión Inteligente de Cultivos

Una aplicación web moderna y estética para gestionar el calendario de cultivo de hortalizas urbanas (tomates, pimientos, albahaca, etc.). Desarrollada con **React + Vite + TypeScript + Tailwind CSS**.

![Huerto Urbano Preview](https://raw.githubusercontent.com/D33pKill/calendario/main/public/preview.png)

## ✨ Características Principales

- **🎨 Diseño Premium & Natural**:
  - Fondo animado con ecosistema 3D (Sol, Agua, Follaje).
  - Interfaz con efecto **Glassmorphism** (vidrio esmerilado).
  - Paleta de colores inspirada en la naturaleza (Esmeralda, Ámbar, Cielo).
  
- **📅 Gestión Inteligente**:
  - Calendario semanal automatizado.
  - Seguimiento de fases: Germinación, Vegetativo, Floración, Fruto.
  - Cálculo automático de dosis de fertilizantes orgánicos.

- **📱 Notificaciones WhatsApp**:
  - Alertas automáticas para Riego y Fertilización.
  - Resúmenes semanales del estado del huerto.
  - Integración directa con API de WhatsApp.

- **🍅 Soporte Multi-Cultivo**:
  - Tomate Cherry (Maceta)
  - Tomate Raf (Suelo)
  - Albahaca Genovesa
  - Pimiento Italiano
  - Lechuga Costina

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18, TypeScript, Vite
- **Estilos**: Tailwind CSS, CSS3 Animations, Backdrop Filter
- **Lógica**: date-fns para manejo de fechas
- **Deploy**: Netlify / GitHub Pages

## 🚀 Instalación Local

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/D33pKill/calendario.git
   cd calendario
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

## ⚙️ Configuración del Huerto

### Plantas Soportadas
El sistema viene pre-configurado para las siguientes hortalizas:
- **Tomates**: Cherry y Raf
- **Hierbas**: Albahaca
- **Hortalizas**: Pimiento y Lechuga

### Personalización
Puedes editar `src/schedule.ts` para modificar:
- Fechas de inicio de temporada
- Tipos de fertilizantes orgánicos (Compost, Humus, etc.)
- Frecuencia de riego

## 📱 Uso de la Aplicación

1. **Vista Principal**: Visualiza el estado actual de todas tus plantas.
2. **Filtros**: Selecciona una planta específica (ej. "Tomate Cherry") para ver solo sus eventos.
3. **Alertas**: El sistema te avisará cuándo regar o fertilizar.
4. **Reportes**: Genera un PDF o envía un reporte por WhatsApp con un clic.

---

**Desarrollado con ❤️ y 🌿 por Tomas Brogi**
