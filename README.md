# Calendario de Cultivo - Santiago de Chile

Una aplicación web para gestionar el calendario de cultivo de cannabis exterior en Santiago de Chile. Desarrollada con React + Vite + TypeScript + Tailwind CSS.

## 🌱 Características

- **Calendario semanal** desde septiembre 2025 hasta marzo 2026
- **5 plantas configuradas**: 1 Fresh Candy (suelo) + 4 Cream Mandarine F1 Fast (1 suelo + 3 macetas)
- **Fases de cultivo** desde germinación hasta cosecha
- **Eventos automáticos**: fertilización semanal + riegos de agua
- **Filtros por planta** para ver eventos específicos
- **Panel de detalles** con dosis exactas por tipo de planta
- **Semáforo visual** que resalta la semana actual y próximo fertilizante
- **Funcionalidad de impresión/PDF**
- **Diseño responsive** optimizado para móviles y desktop

## 🚀 Instalación Local

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repo>
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

## 📦 Deploy en Netlify

### Opción 1: Deploy automático desde GitHub

1. **Subir el código a GitHub**
   - Crear un nuevo repositorio en GitHub
   - Subir todos los archivos del proyecto

2. **Conectar con Netlify**
   - Ir a [netlify.com](https://netlify.com)
   - Hacer clic en "New site from Git"
   - Conectar con GitHub y seleccionar el repositorio

3. **Configurar build settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18 (en Variables de entorno)

4. **Deploy**
   - Hacer clic en "Deploy site"
   - Netlify construirá y desplegará automáticamente

### Opción 2: Deploy manual

1. **Construir el proyecto**
   ```bash
   npm run build
   ```

2. **Subir carpeta dist**
   - Ir a [netlify.com](https://netlify.com)
   - Arrastrar la carpeta `dist` a la zona de deploy
   - O usar Netlify CLI: `npx netlify-cli deploy --dir=dist --prod`

## ⚙️ Configuración del Cultivo

### Plantas Configuradas

- **Fresh Candy** (Sweet Seeds) - Suelo directo
- **Cream Mandarine F1 Fast #1** (Sweet Seeds) - Suelo directo  
- **Cream Mandarine F1 Fast #2-4** (Sweet Seeds) - Macetas

### Fases del Cultivo

1. **Germinación** (Semanas 0-1): Solo agua pH 6.3-6.7
2. **Crecimiento Inicial** (Semanas 2-3): Deeper Underground 1 ml/L
3. **Crecimiento Vegetativo Temprano** (Semanas 4-5): Deeper Underground + Top Veg
4. **Crecimiento Vegetativo Intenso** (Semanas 6-11): Solo Top Veg
5. **Pre-floración** (Semanas 12-17): Top Veg máximo
6. **Transición a Floración** (Semanas 18-19): Top Veg + Top Bloom
7. **Floración Intensa** (Semanas 20-25): Solo Top Bloom
8. **Lavado y Cosecha** (Semanas 26-30): Solo agua pH

### Fechas de Cosecha

- **Cream Mandarine**: Lavado 17-24 feb, Cosecha 24 feb - 10 mar
- **Fresh Candy**: Lavado 23 feb - 2 mar, Cosecha 2-16 mar

## 🛠️ Personalización

### Modificar Reglas de Cultivo

Edita el archivo `src/schedule.ts` para cambiar:

- Fechas de inicio y fin del cultivo
- Productos y dosis de fertilización
- Cantidades de agua por tipo de planta
- Fechas de lavado y cosecha
- Información de las plantas

### Añadir Nuevas Plantas

En `src/schedule.ts`, añade nuevas entradas al array `PLANTAS`:

```typescript
{
  id: 'nueva-planta',
  nombre: 'Nombre de la Planta',
  banco: 'Banco de Semillas',
  tipo: 'suelo' | 'maceta',
  notas: 'Notas adicionales'
}
```

## 📱 Uso de la Aplicación

1. **Vista Principal**: Calendario semanal con todos los eventos
2. **Filtros**: Usa la barra lateral para filtrar por planta específica
3. **Eventos**: Haz clic en cualquier evento para ver detalles y dosis
4. **Semáforo**: 
   - 🚦 **HOY**: Semana actual resaltada en verde
   - ⏰ **Próximo fertilizante**: Semana con próximo evento de fertilización
5. **Imprimir**: Botón para generar PDF de la vista actual

## 🎨 Tecnologías

- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **date-fns** - Manipulación de fechas
- **Netlify** - Hosting y deploy

## 📄 Estructura del Proyecto

```
calendario/
├── public/
├── src/
│   ├── App.tsx          # Componente principal
│   ├── main.tsx         # Punto de entrada
│   ├── schedule.ts      # Datos y reglas del cultivo
│   └── index.css        # Estilos globales
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Previsualizar build de producción
- `npm run lint` - Ejecutar linter

## 📞 Soporte

Para dudas o problemas con la aplicación, revisa:

1. La consola del navegador para errores
2. Los logs de build en Netlify
3. La configuración de `schedule.ts` para reglas del cultivo

---

**¡Cultiva con responsabilidad y respeta las leyes locales!** 🌿
